import { useId, useRef, useState } from 'react';
import { cafe, crepeToppings, filterMenu, menuSections, money } from './menuData';

export default function MenuCatalog({ compact = false }) {
  const [category, setCategory] = useState('breakfast');
  const [query, setQuery] = useState('');
  const fieldId = useId();
  const resultsId = useId();
  const statusId = useId();
  const searchRef = useRef(null);
  const search = query.trim().toLowerCase();
  const visible = filterMenu(category, query);
  const activeCategory = search ? 'all' : category;
  return <section id={compact ? undefined : 'menu'} tabIndex={compact ? undefined : -1} className={`menu-catalog ${compact ? 'menu-catalog--compact' : ''}`} aria-label="Cafe menu">
    {!compact && <header className="catalog-heading"><div><p className="label">At the table / the menu</p><h2>Morning favourites.<br /><em>Flavours of home.</em></h2></div><p>From a Brooklyn breakfast to desi chaat and a cup of chai. Find your usual, or try something new.</p></header>}
    <div className="catalog-toolbar">
      <nav aria-label="Menu categories">{[{ id: 'all', title: 'All' }, ...menuSections].map(section => <button key={section.id} type="button" aria-controls={resultsId} aria-pressed={activeCategory === section.id} onClick={() => { setCategory(section.id); setQuery(''); }}>{section.title}</button>)}</nav>
      <label htmlFor={fieldId}>Find a dish or drink</label>
      <div className="catalog-search"><input ref={searchRef} id={fieldId} type="search" aria-controls={resultsId} aria-describedby={statusId} value={query} onChange={e => setQuery(e.target.value)} placeholder="Try chai, waffles, mango…" />{query && <button type="button" className="search-clear" aria-label="Clear menu search" onClick={() => { setQuery(''); searchRef.current?.focus({ preventScroll: true }); }}>Clear</button>}</div>
    </div>
    <p id={statusId} className="catalog-count" role="status" aria-atomic="true">{visible.reduce((n,s) => n+s.items.length,0)} menu items{search ? ` matching “${query.trim()}” · All categories` : ` · ${category === 'all' ? 'Full menu' : menuSections.find(section => section.id === category)?.title}`} · Prices in USD</p>
    <div id={resultsId} className="catalog-results"><div key={activeCategory} className="catalog-results-content">
    {visible.length ? visible.map(section => <section className="catalog-section" key={section.id} aria-label={section.title}>
      <div className="catalog-section-heading"><h3>{section.title}</h3><p>{section.subtitle}</p></div>
      {section.note && <p className="catalog-note">{section.note}</p>}
      <div className="catalog-items">{section.items.map(item => <article key={item.id} className="catalog-item">
        <div className="catalog-item-title"><h4>{item.name}</h4>{!item.variants && <span>{money(item.cents)}{item.unit && <small>{item.unit}</small>}</span>}</div>
        {item.description && <p>{item.description}</p>}
        {item.variants && <dl className="catalog-variants">{item.variants.map(v => <div key={v.label}><dt>{v.label}</dt><dd>{money(v.cents)}</dd></div>)}</dl>}
        {item.id === 'crepes' && <p className="catalog-note">{crepeToppings}</p>}
        {(item.modifiers || section.modifiers)?.length > 0 && <div className="catalog-modifiers"><p>Optional extras · per item</p><dl>{(item.modifiers || section.modifiers).map(modifier => <div key={modifier.id}><dt>{modifier.label}</dt><dd>+ {money(modifier.cents)}</dd></div>)}</dl></div>}
        {item.cents == null && <p className="catalog-note">Price not supplied on the printed menu. Confirm with the cafe before ordering.</p>}
      </article>)}</div>
    </section>) : <div className="catalog-empty"><p>No matching items. Try a different name or choose a category.</p><button type="button" className="primary-action" onClick={() => { setCategory('all'); setQuery(''); }}>Show full menu</button></div>}
    </div></div>
    <footer className="catalog-footer"><p>Prices are from the supplied printed menu. Variants show the full item price; optional extras are additional. Tax and any other fees are not included in the estimate. Confirm current prices and availability with the cafe.</p><a href={cafe.phoneHref}>{cafe.phone} ↗</a></footer>
  </section>;
}
