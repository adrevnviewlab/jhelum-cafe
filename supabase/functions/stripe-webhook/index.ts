import { adminClient, sendSms } from '../_shared/admin.ts';
import { json } from '../_shared/cors.ts';

Deno.serve(async req => {
  const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const raw = await req.text();
  if (secret) {
    const stripe = Deno.env.get('STRIPE_SECRET_KEY');
    const response = await fetch('https://api.stripe.com/v1/events/' + (JSON.parse(raw).id || ''), {
      headers: { Authorization: `Bearer ${stripe}` },
    });
    if (!response.ok) return json({ error: 'invalid webhook' }, 400);
  }
  const event = JSON.parse(raw);
  if (event.type !== 'checkout.session.completed') return json({ received: true });
  const orderId = event.data?.object?.metadata?.order_id;
  if (!orderId) return json({ received: true });
  const supabase = adminClient();
  const { data: order } = await supabase.from('orders').update({ paid: true, status: 'confirmed' }).eq('id', orderId).select('*').single();
  await supabase.from('order_events').insert({ order_id: orderId, type: 'paid', actor: 'stripe' });
  if (order?.customer_phone) await sendSms(order.customer_phone, `Jehlum Cafe ${order.number} is confirmed. Track: ${Deno.env.get('PUBLIC_SITE_URL') || ''}/#track/${order.access_token}`);
  return json({ received: true });
});
