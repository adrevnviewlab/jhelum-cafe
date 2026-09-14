import { adminClient, applyRules, haversineMiles } from '../_shared/admin.ts';
import { corsHeaders, json } from '../_shared/cors.ts';

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { address, placeId, lat, lng } = await req.json();
    const supabase = adminClient();
    const { data: settings } = await supabase.from('cafe_settings').select('*').eq('id', 1).single();
    const { data: rules } = await supabase.from('delivery_rules').select('*').order('min_miles');
    const key = Deno.env.get('GOOGLE_MAPS_API_KEY');
    let miles: number | null = null;
    let dest = { lat, lng, address };
    if (key && (placeId || address)) {
      const destParam = placeId ? `place_id:${placeId}` : address;
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${settings.lat},${settings.lng}&destination=${encodeURIComponent(destParam)}&key=${key}`;
      const route = await fetch(url).then(response => response.json());
      const meters = route.routes?.[0]?.legs?.[0]?.distance?.value;
      if (meters != null) miles = meters / 1609.344;
      const loc = route.routes?.[0]?.legs?.[0]?.end_location;
      if (loc) dest = { ...dest, lat: loc.lat, lng: loc.lng, address: route.routes[0].legs[0].end_address || address };
    }
    if (miles == null) {
      if (lat == null || lng == null) return json({ eligible: false, reason: 'need_coordinates', message: 'Choose a suggested address so we can measure the route.' });
      miles = haversineMiles({ lat: settings.lat, lng: settings.lng }, { lat, lng });
    }
    const quote = applyRules(miles, rules || []);
    const message = quote.eligible
      ? quote.fee_cents === 0
        ? `You qualify for FREE local delivery (${quote.miles} miles).`
        : `${quote.miles} miles away.`
      : `${quote.miles} miles is outside our delivery area.`;
    return json({ ...quote, ...dest, message, method: key ? 'google_routes' : 'haversine_fallback' });
  } catch (error) {
    return json({ error: error.message }, 400);
  }
});
