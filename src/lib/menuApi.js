import { CAFE, DEFAULT_DELIVERY_RULES, DEFAULT_TAX_BPS } from './constants.js';
import { flattenItems, rowsToSections, seedCatalog } from './catalog.js';
import { readStore } from './localStore.js';
import { invokeFunction, supabase, supabaseConfigured } from './supabase.js';

export function fallbackSnapshot() {
  const store = readStore();
  const sections = seedCatalog(store.itemFlags);
  return {
    source: 'fallback',
    sections,
    items: flattenItems(sections),
    settings: store.settings,
    rules: store.rules,
  };
}

export async function fetchMenuSnapshot() {
  if (!supabaseConfigured) return fallbackSnapshot();
  try {
    const [categories, items, variants, modifiers, settings, rules] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('items').select('*').order('sort_order'),
      supabase.from('item_variants').select('*').order('sort_order'),
      supabase.from('modifiers').select('*').order('sort_order'),
      supabase.from('cafe_settings').select('*').eq('id', 1).maybeSingle(),
      supabase.from('delivery_rules').select('*').order('min_miles'),
    ]);
    const failed = [categories, items, variants, modifiers].find(result => result.error);
    if (failed) throw failed.error;
    const sections = rowsToSections(categories.data, items.data, variants.data, modifiers.data);
    if (!sections.length) return fallbackSnapshot();
    return {
      source: 'live',
      sections,
      items: flattenItems(sections),
      settings: settings.data || {
        address: CAFE.address,
        phone: CAFE.phone,
        hours_label: CAFE.hoursLabel,
        lat: CAFE.lat,
        lng: CAFE.lng,
        tax_bps: DEFAULT_TAX_BPS,
      },
      rules: rules.data?.length ? rules.data : DEFAULT_DELIVERY_RULES,
    };
  } catch {
    return fallbackSnapshot();
  }
}

export async function saveItemFlags(slug, patch) {
  if (supabaseConfigured) {
    try {
      await invokeFunction('admin-write', { kind: 'item', slug, patch });
      return;
    } catch (error) {
      if (error.code !== 'no_functions' && error.status !== 404) throw error;
    }
  }
  const { writeStore, readStore } = await import('./localStore.js');
  writeStore(store => ({
    ...store,
    itemFlags: { ...store.itemFlags, [slug]: { ...store.itemFlags[slug], ...patch } },
  }));
  return readStore().itemFlags[slug];
}

export async function saveSettings(patch) {
  if (supabaseConfigured) {
    try {
      await invokeFunction('admin-write', { kind: 'settings', patch });
      return;
    } catch (error) {
      if (error.code !== 'no_functions' && error.status !== 404) throw error;
    }
  }
  const { writeStore } = await import('./localStore.js');
  writeStore(store => ({ ...store, settings: { ...store.settings, ...patch } }));
}

export async function saveDeliveryRules(rules) {
  if (supabaseConfigured) {
    try {
      await invokeFunction('admin-write', {
        kind: 'rules',
        rules: rules.map((rule, index) => ({
          min_miles: Number(rule.min_miles),
          max_miles: Number(rule.max_miles),
          fee_cents: Number(rule.fee_cents),
          label: rule.label,
          sort_order: index,
        })),
      });
      return;
    } catch (error) {
      if (error.code !== 'no_functions' && error.status !== 404) throw error;
    }
  }
  const { writeStore } = await import('./localStore.js');
  writeStore(store => ({ ...store, rules }));
}
