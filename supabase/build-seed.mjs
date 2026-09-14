import { writeFileSync } from 'node:fs';
import { menuSections } from '../src/menuData.js';
import { FEATURED_ITEM_IDS } from '../src/lib/constants.js';

const sql = value => value == null ? 'null' : `'${String(value).replace(/'/g, "''")}'`;

const lines = ['-- Generated from src/menuData.js', 'begin;'];
menuSections.forEach((section, index) => {
  lines.push(`insert into public.categories (slug, title, subtitle, note, sort_order) values (${sql(section.id)}, ${sql(section.title)}, ${sql(section.subtitle || '')}, ${sql(section.note || '')}, ${index});`);
});
menuSections.forEach(section => {
  section.items.forEach((item, index) => {
    lines.push(`insert into public.items (category_id, slug, name, description, cents, unit, featured, sold_out, sort_order) select id, ${sql(item.id)}, ${sql(item.name)}, ${sql(item.description || '')}, ${item.cents == null ? 'null' : item.cents}, ${sql(item.unit || null)}, ${FEATURED_ITEM_IDS.includes(item.id)}, false, ${index} from public.categories where slug = ${sql(section.id)};`);
    (item.variants || []).forEach((variant, vIndex) => {
      lines.push(`insert into public.item_variants (item_id, label, cents, sort_order) select id, ${sql(variant.label)}, ${variant.cents}, ${vIndex} from public.items where slug = ${sql(item.id)};`);
    });
    const modifiers = item.modifiers || section.modifiers || [];
    modifiers.forEach((modifier, mIndex) => {
      lines.push(`insert into public.modifiers (item_id, slug, label, cents, sort_order) select id, ${sql(modifier.id)}, ${sql(modifier.label)}, ${modifier.cents}, ${mIndex} from public.items where slug = ${sql(item.id)};`);
    });
  });
});
lines.push('commit;');
writeFileSync(new URL('./seed.sql', import.meta.url), `${lines.join('\n')}\n`);
console.log(`wrote ${lines.length} statements`);
