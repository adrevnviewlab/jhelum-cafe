import { adminClient } from '../_shared/admin.ts';
import { corsHeaders, json } from '../_shared/cors.ts';

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { kind, slug, patch, rules } = await req.json();
    const supabase = adminClient();
    if (kind === 'item') {
      const { error } = await supabase.from('items').update(patch).eq('slug', slug);
      if (error) throw error;
    } else if (kind === 'settings') {
      const { error } = await supabase.from('cafe_settings').update(patch).eq('id', 1);
      if (error) throw error;
    } else if (kind === 'rules') {
      await supabase.from('delivery_rules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      const { error } = await supabase.from('delivery_rules').insert(rules);
      if (error) throw error;
    } else {
      throw new Error('Unknown write');
    }
    return json({ ok: true });
  } catch (error) {
    return json({ error: error.message }, 400);
  }
});
