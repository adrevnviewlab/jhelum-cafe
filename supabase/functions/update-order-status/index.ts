import { adminClient, sendSms } from '../_shared/admin.ts';
import { corsHeaders, json } from '../_shared/cors.ts';

const messages: Record<string, string> = {
  confirmed: 'Your Jhelum Direct order is confirmed.',
  preparing: 'The kitchen has started your order.',
  ready: 'Your order is ready.',
  ready_for_pickup: 'Your order is ready for pickup.',
  driver_assigned: 'A driver is assigned to your delivery.',
  out_for_delivery: 'Your order is out for delivery.',
  delivered: 'Your order has been delivered.',
  cancelled: 'Your order was cancelled. Call the cafe if you have questions.',
};

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { orderId, status, actor } = await req.json();
    const supabase = adminClient();
    const { data, error } = await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId).select('*').single();
    if (error) throw error;
    await supabase.from('order_events').insert({ order_id: orderId, type: 'status', note: status, actor: actor || 'staff' });
    if (data.customer_phone && messages[status]) {
      const site = Deno.env.get('PUBLIC_SITE_URL') || '';
      await sendSms(data.customer_phone, `${messages[status]} ${data.number}${site ? ` ${site}/#track/${data.access_token}` : ''}`);
    }
    return json(data);
  } catch (error) {
    return json({ error: error.message }, 400);
  }
});
