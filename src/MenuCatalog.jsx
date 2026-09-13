import { useId, useRef, useState } from 'react';
import { cafe, crepeToppings, filterMenu, menuSections, money } from './menuData';
import { menuPhotos } from './menuPhotos';
import Icon from './Icon';

export default function MenuCatalog({ onPickup }) {
  const [category, setCategory] = useState('breakfast');
  const [query, setQuery] = useState('');
  const fieldId = useId();
  const resultsId = useId();
  const statusId = useId();
  const searchRef = useRef(null);
  const search = query.trim().toLowerCase();
  const visible = filterMenu(category, query);
  const resultCount = visible.reduce((total, section) => total + section.items.length, 0);
  const activeCategory = search ? 'all' : category;
  return <section id="menu" tabIndex={-1} className="menu-catalog" aria-label="Cafe menu">
    <header className="catalog-heading"><div><p className="label">At the table / the menu</p><h2>Morning favourites.<br /><em>Flavours of home.</em></h2></div><p>From a Brooklyn breakfast to desi chaat and a cup of chai. Find your usual, or try something new.</p></header>
    <div className="catalog-toolbar">
      <nav aria-label="Menu categories">{[{ id: 'all', title: 'All' }, ...menuSections].map(section => <button key={section.id} type="button" aria-controls={resultsId} aria-pressed={activeCategory === section.id} onClick={() => { setCategory(section.id); setQuery(''); }}>{section.title}</button>)}</nav>
      <label htmlFor={fieldId}>Find a dish or drink</label>
      <div className="catalog-search"><input ref={searchRef} id={fieldId} type="search" aria-controls={resultsId} aria-describedby={statusId} value={query} onChange={e => setQuery(e.target.value)} placeholder="Try chai, waffles, mango…" />{query && <button type="button" className="search-clear" aria-label="Clear menu search" onClick={() => { setQuery(''); searchRef.current?.focus({ preventScroll: true }); }}>Clear</button>}</div>
    </div>
    <p id={statusId} className="catalog-count" role="status" aria-atomic="true">{resultCount} menu {resultCount === 1 ? 'item' : 'items'}{search ? ` matching “${query.trim()}” · All categories` : ` · ${category === 'all' ? 'Full menu' : menuSections.find(section => section.id === category)?.title}`} · Prices in USD</p>
    <div id={resultsId} className="catalog-results"><div key={activeCategory} className="catalog-results-content">
    {visible.length ? visible.map(section => <section className="catalog-section" key={section.id} aria-label={section.title}>
      <div className="catalog-section-heading"><h3>{section.title}</h3><p>{section.subtitle}</p></div>
      {section.note && <p className="catalog-note">{section.note}</p>}
      <div className={`catalog-items catalog-items--photographic ${['breakfast', 'bakery'].includes(section.id) ? '' : 'catalog-items--portrait'}`}>{section.items.map(item => <article key={item.id} className={`catalog-item ${menuPhotos[item.id] ? 'catalog-item--photographic' : ''}`}>
        {menuPhotos[item.id] && <div className="catalog-photo"><img src={`/menu/${item.id}.webp`} alt={menuPhotos[item.id]} width="540" height="360" loading="lazy" decoding="async" /></div>}
        <div className="catalog-item-body">
        <div className="catalog-item-title"><h4>{item.name}</h4>{!item.variants && <span>{money(item.cents)}{item.unit && <small>{item.unit}</small>}</span>}</div>
        {item.description && <p>{item.description}</p>}
        {item.variants && <dl className="catalog-variants">{item.variants.map(v => <div key={v.label}><dt>{v.label}</dt><dd>{money(v.cents)}</dd></div>)}</dl>}
        {item.id === 'crepes' && <p className="catalog-note">{crepeToppings}</p>}
        {(item.modifiers || section.modifiers)?.length > 0 && <div className="catalog-modifiers"><p>Optional extras · per item</p><dl>{(item.modifiers || section.modifiers).map(modifier => <div key={modifier.id}><dt>{modifier.label}</dt><dd>+ {money(modifier.cents)}</dd></div>)}</dl></div>}
        {item.cents == null && <p className="catalog-note">Price not supplied on the printed menu. Confirm with the cafe before ordering.</p>}
        </div>
      </article>)}</div>
    </section>) : <div className="catalog-empty"><p>No matching items. Try a different name or choose a category.</p><button type="button" className="primary-action" onClick={() => { setCategory('all'); setQuery(''); }}>Show full menu</button></div>}
    </div></div>
    <footer className="catalog-footer"><p>Photos show serving suggestions; accompaniments may vary. Prices are from the supplied printed menu. Variants show the full item price; optional extras are additional. Tax and any other fees are not included in the estimate. Confirm current prices and availability with the cafe.</p><div className="catalog-footer-actions"><button type="button" className="primary-action" onClick={onPickup}>Plan a pickup <Icon /></button><a href={cafe.phoneHref}>Call {cafe.phone}<Icon /></a></div></footer>
  </section>;
}
