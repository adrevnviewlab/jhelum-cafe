import { menuSections as seedSections } from '../menuData.js';
import { FEATURED_ITEM_IDS } from './constants.js';

export function withCatalogFlags(sections, flags = {}) {
  return sections.map(section => ({
    ...section,
    items: section.items.map(item => {
      const flag = flags[item.id] || {};
      return {
        ...item,
        featured: flag.featured ?? FEATURED_ITEM_IDS.includes(item.id),
        sold_out: Boolean(flag.sold_out),
        cents: flag.cents !== undefined ? flag.cents : item.cents,
        modifiers: item.modifiers || section.modifiers || [],
      };
    }),
  }));
}

export function flattenItems(sections) {
  return sections.flatMap(section => section.items.map(item => ({
    ...item,
    categoryId: section.id,
    modifiers: item.modifiers || section.modifiers || [],
  })));
}

export function filterCatalog(sections, category = 'all', query = '') {
  const search = query.trim().toLowerCase();
  return sections
    .filter(section => search || category === 'all' || section.id === category)
    .map(section => ({
      ...section,
      items: section.items.filter(item => !search || `${item.name} ${item.description || ''} ${section.title}`.toLowerCase().includes(search)),
    }))
    .filter(section => section.items.length);
}

export function seedCatalog(flags = {}) {
  return withCatalogFlags(seedSections, flags);
}

export function rowsToSections(categories = [], items = [], variants = [], modifiers = []) {
  const variantsByItem = new Map();
  for (const variant of variants) {
    const list = variantsByItem.get(variant.item_id) || [];
    list.push({ label: variant.label, cents: variant.cents, sort: variant.sort_order });
    variantsByItem.set(variant.item_id, list);
  }
  const modifiersByItem = new Map();
  for (const modifier of modifiers) {
    const list = modifiersByItem.get(modifier.item_id) || [];
    list.push({ id: modifier.slug, label: modifier.label, cents: modifier.cents });
    modifiersByItem.set(modifier.item_id, list);
  }
  return [...categories]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(category => ({
      id: category.slug,
      title: category.title,
      subtitle: category.subtitle || '',
      note: category.note || '',
      items: items
        .filter(item => item.category_id === category.id)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(item => {
          const itemVariants = (variantsByItem.get(item.id) || []).sort((a, b) => a.sort - b.sort);
          return {
            id: item.slug,
            name: item.name,
            cents: item.cents,
            description: item.description || '',
            unit: item.unit || undefined,
            sold_out: Boolean(item.sold_out),
            featured: Boolean(item.featured),
            variants: itemVariants.length ? itemVariants.map(({ label, cents }) => ({ label, cents })) : undefined,
            modifiers: modifiersByItem.get(item.id) || [],
          };
        }),
    }))
    .filter(section => section.items.length);
}
