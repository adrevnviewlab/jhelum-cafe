import { useId, useState } from 'react';
import { cafe, crepeToppings, menuSections, money } from './menuData';

export default function MenuCatalog({ compact = false }) {
  const [category, setCategory] = useState('breakfast');
  const [query, setQuery] = useState('');
  const fieldId = useId();
  const search = query.trim().toLowerCase();
  const visible = menuSections.filter(section => search || category === 'all' || section.id === category)
    .map(section => ({ ...section, items: section.items.filter(item => !search || `${item.name} ${item.description} ${section.title}`.toLowerCase().includes(search)) }))
    .filter(section => section.items.length);
  return <section id={compact ? undefined : 'menu'} className={`menu-catalog ${compact ? 'menu-catalog--compact' : ''}`} aria-label="Cafe menu">
    {!compact && <header className="catalog-heading"><div><p className="label">At the table / the menu</p><h2>Morning favourites.<br /><em>Flavours of home.</em></h2></div><p>From a Brooklyn breakfast to desi chaat and a cup of chai. Find your usual, or try something new.</p></header>}
    <div className="catalog-toolbar"><nav aria-label="Menu categories">{[{ id: 'all', title: 'All' }, ...menuSections].map(section => <button key={section.id} type="button" aria-pressed={!search && category === section.id} onClick={() => { setCategory(section.id); setQuery(''); }}>{section.title}</button>)}</nav><label htmlFor={fieldId}>Find a dish or drink<input id={fieldId} type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Try chai, waffles, mango…" /></label></div>
    <p className="catalog-count" aria-live="polite">{visible.reduce((n,s) => n+s.items.length,0)} menu items · Prices in USD</p>
    {visible.length ? visible.map(section => <div className="catalog-section" key={section.id}><div className="catalog-section-heading"><h3>{section.title}</h3><p>{section.subtitle}</p></div>{section.note && <p className="catalog-note">{section.note}</p>}<div className="catalog-items">{section.items.map(item => <article key={item.id} className="catalog-item"><div className="catalog-item-title"><h4>{item.name}</h4>{!item.variants && <span>{money(item.cents)}{item.unit && <small>{item.unit}</small>}</span>}</div>{item.description && <p>{item.description}</p>}{item.variants && <dl className="catalog-variants">{item.variants.map(v => <div key={v.label}><dt>{v.label}</dt><dd>{money(v.cents)}</dd></div>)}</dl>}{item.id === 'crepes' && <p className="catalog-note">{crepeToppings}</p>}</article>)}</div></div>) : <p className="catalog-empty">No matching items. Try a different name or choose a category.</p>}
    <footer className="catalog-footer"><p>For availability, unlisted prices or questions about ingredients, call the cafe.</p><a href={cafe.phoneHref}>{cafe.phone} ↗</a></footer>
  </section>;
}
