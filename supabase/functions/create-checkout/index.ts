import { adminClient, quoteTotals } from '../_shared/admin.ts';
import { corsHeaders, json } from '../_shared/cors.ts';

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const body = await req.json();
    const supabase = adminClient();
    const { data: items } = await supabase.from('items').select('*, item_variants(*), modifiers(*)');
    const { data: settings } = await supabase.from('cafe_settings').select('*').eq('id', 1).single();
    const catalog = new Map((items || []).map(item => [item.slug, item]));
    let subtotal = 0;
    const snapshots = [];
    for (const line of body.lines || []) {
      const item = catalog.get(line.itemId);
      if (!item || item.sold_out) throw new Error('An item is unavailable.');
      const variant = item.item_variants?.[line.variantIndex || 0];
      const base = variant?.cents ?? item.cents;
      if (base == null) throw new Error(`${item.name} is not priced for online ordering.`);
      const extras = (item.modifiers || []).filter((modifier: { slug: string }) => (line.modifierIds || []).includes(modifier.slug));
      const unit = base + extras.reduce((sum: number, modifier: { cents: number }) => sum + modifier.cents, 0);
      const total = unit * line.quantity;
      subtotal += total;
      snapshots.push({
        item_id: item.slug,
        name: item.name,
        quantity: line.quantity,
        unit_cents: unit,
        total_cents: total,
        variant: variant?.label || null,
        modifiers: extras.map((modifier: { label: string }) => modifier.label),
      });
    }
    if (!snapshots.length) throw new Error('Cart is empty.');
    let deliveryFee = 0;
    if (body.fulfillment === 'delivery') {
      if (!body.delivery?.eligible) throw new Error('Delivery is not available for this address.');
      deliveryFee = Number(body.delivery.fee_cents || 0);
    }
    const totals = quoteTotals(subtotal, settings?.tax_bps ?? 8875, Number(body.tipCents || 0), deliveryFee);
    const { data: numberRow } = await supabase.rpc('next_order_number');
    const access = crypto.randomUUID().replace(/-/g, '');
    const order = {
      number: numberRow || `JC-${Date.now()}`,
      access_token: access,
      source: 'direct',
      fulfillment: body.fulfillment,
      status: 'new',
      paid: false,
      customer_name: body.customer.name,
      customer_phone: body.customer.phone,
      customer_email: body.customer.email,
      pickup_time: body.pickupTime || null,
      delivery_address: body.delivery?.address || null,
      delivery_unit: body.delivery?.unit || null,
      delivery_notes: body.delivery?.notes || null,
      delivery_miles: body.delivery?.miles ?? null,
      delivery_lat: body.delivery?.lat ?? null,
      delivery_lng: body.delivery?.lng ?? null,
      attribution: body.attribution || {},
      ...totals,
    };
    const { data: created, error } = await supabase.from('orders').insert(order).select('*').single();
    if (error) throw error;
    await supabase.from('order_items').insert(snapshots.map(item => ({ ...item, order_id: created.id })));
    await supabase.from('order_events').insert({ order_id: created.id, type: 'created', actor: 'customer' });

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (stripeKey) {
      const success = String(body.successUrl || '').replace('SESSION_TOKEN', access);
      const params = new URLSearchParams({
        mode: 'payment',
        success_url: success,
        cancel_url: body.cancelUrl || success,
        customer_email: body.customer.email,
        'line_items[0][price_data][currency]': 'usd',
        'line_items[0][price_data][product_data][name]': `Jhelum Direct ${created.number}`,
        'line_items[0][price_data][unit_amount]': String(totals.total_cents),
        'line_items[0][quantity]': '1',
        'metadata[order_id]': created.id,
        'metadata[access_token]': access,
      });
      const stripe = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      });
      const session = await stripe.json();
      if (!stripe.ok) throw new Error(session.error?.message || 'Stripe session failed');
      await supabase.from('orders').update({ stripe_session_id: session.id }).eq('id', created.id);
      return json({ url: session.url, trackToken: access, orderId: created.id, number: created.number });
    }

    await supabase.from('orders').update({ paid: true, status: 'confirmed' }).eq('id', created.id);
    await supabase.from('order_events').insert({ order_id: created.id, type: 'paid', note: 'Marked paid without Stripe (configure STRIPE_SECRET_KEY)', actor: 'system' });
    return json({ demo: true, trackToken: access, orderId: created.id, number: created.number });
  } catch (error) {
    return json({ error: error.message }, 400);
  }
});
