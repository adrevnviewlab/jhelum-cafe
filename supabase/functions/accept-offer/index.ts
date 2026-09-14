import { adminClient } from '../_shared/admin.ts';
import { corsHeaders, json } from '../_shared/cors.ts';

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { orderId, driverId, driverName } = await req.json();
    const supabase = adminClient();
    const { data, error } = await supabase.rpc('accept_delivery_offer', {
      p_order_id: orderId,
      p_driver_id: driverId,
      p_driver_name: driverName,
    });
    if (error) throw error;
    return json(data);
  } catch (error) {
    return json({ error: error.message || 'This delivery was already accepted.' }, 409);
  }
});
