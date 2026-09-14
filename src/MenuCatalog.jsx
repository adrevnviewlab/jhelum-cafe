import { useId, useRef, useState } from 'react';
import { cafe, crepeToppings, money } from './menuData';
import { filterCatalog } from './lib/catalog';
import { canSellOnline } from './lib/pricing';
import { useMenu } from './MenuProvider';
import { menuPhotos } from './menuPhotos';
import Icon from './Icon';
import { SpringButton, SpringCard } from './Spring';

export default function MenuCatalog({ category, setCategory, onAddItem }) {
  const { sections } = useMenu();
  const [query, setQuery] = useState('');
  const fieldId = useId();
  const resultsId = useId();
  const statusId = useId();
  const searchRef = useRef(null);
  const search = query.trim().toLowerCase();
  const visible = filterCatalog(sections, category, query);
  const resultCount = visible.reduce((total, section) => total + section.items.length, 0);
  const activeCategory = search ? 'all' : category;
  return <section className="menu-catalog" aria-label="Cafe menu">
    <div className="catalog-toolbar">
      <nav aria-label="Menu categories">{[{ id: 'all', title: 'All' }, ...sections].map(section => <SpringButton key={section.id} type="button" aria-controls={resultsId} aria-pressed={activeCategory === section.id} onClick={() => { setCategory(section.id); setQuery(''); }} hover={{ scale: 1.05, y: -2 }}>{section.title}</SpringButton>)}</nav>
      <label htmlFor={fieldId}>Find a dish or drink</label>
      <div className="catalog-search"><input ref={searchRef} id={fieldId} type="search" aria-controls={resultsId} aria-describedby={statusId} value={query} onChange={e => setQuery(e.target.value)} placeholder="Try chai, waffles, mango…" />{query && <button type="button" className="search-clear" aria-label="Clear menu search" onClick={() => { setQuery(''); searchRef.current?.focus({ preventScroll: true }); }}>Clear</button>}</div>
    </div>
    <p id={statusId} className="catalog-count" role="status" aria-atomic="true">{resultCount} menu {resultCount === 1 ? 'item' : 'items'}{search ? ` matching “${query.trim()}” · All categories` : ` · ${category === 'all' ? 'Full menu' : sections.find(section => section.id === category)?.title}`} · Prices in USD</p>
    <div id={resultsId} className="catalog-results"><div key={activeCategory} className="catalog-results-content">
    {visible.length ? visible.map(section => <section className="catalog-section" key={section.id} aria-label={section.title}>
      <div className="catalog-section-heading"><h2>{section.title}</h2><p>{section.subtitle}</p></div>
      {section.note && <p className="catalog-note">{section.note}</p>}
      <div className={`catalog-items catalog-items--photographic ${['breakfast', 'bakery'].includes(section.id) ? '' : 'catalog-items--portrait'}`}>
        {section.items.map(item => {
          const cartItem = { ...item, modifiers: item.modifiers || section.modifiers || [] };
          const needsOptions = Boolean(item.variants || cartItem.modifiers.length);
          return <SpringCard key={item.id} className="catalog-item catalog-item--photographic" hover={{ y: -6, scale: 1.012 }}>
            <div className="catalog-photo"><img src={`/menu/${item.id}.webp`} alt={menuPhotos[item.id]} width="540" height="360" loading="lazy" decoding="async" /></div>
            <div className="catalog-item-body">
              <div className="catalog-item-title"><h3>{item.name}</h3>{!item.variants && <span>{money(item.cents)}{item.unit && <small>{item.unit}</small>}</span>}</div>
              {item.description && <p>{item.description}</p>}
              {item.variants && <dl className="catalog-variants">{item.variants.map(variant => <div key={variant.label}><dt>{variant.label}</dt><dd>{money(variant.cents)}</dd></div>)}</dl>}
              {item.id === 'crepes' && <p className="catalog-note">{crepeToppings}</p>}
              {cartItem.modifiers.length > 0 && <div className="catalog-modifiers"><p>Optional extras · per item</p><dl>{cartItem.modifiers.map(modifier => <div key={modifier.id}><dt>{modifier.label}</dt><dd>+ {money(modifier.cents)}</dd></div>)}</dl></div>}
              {item.cents == null && !section.note && <p className="catalog-note">Price not supplied on the printed menu. Confirm with the cafe before ordering.</p>}
              <div className="catalog-item-action">
                {!canSellOnline(cartItem)
                  ? <SpringButton as="a" href={cafe.phoneHref}>{item.sold_out ? 'Sold out — call' : 'Call for price'} <Icon /></SpringButton>
                  : <SpringButton type="button" onClick={() => onAddItem(cartItem, needsOptions)}>{needsOptions ? 'Choose options' : 'Add to order'} <Icon name="plus" /></SpringButton>}
              </div>
            </div>
          </SpringCard>;
        })}
      </div>
    </section>) : <div className="catalog-empty"><p>No matching items. Try a different name or choose a category.</p><SpringButton type="button" className="primary-action" onClick={() => { setCategory('all'); setQuery(''); }}>Show full menu</SpringButton></div>}
    </div></div>
    <footer className="catalog-footer"><p>Photos show serving suggestions; accompaniments may vary. Prices are from the supplied printed menu. Variants show the full item price; optional extras are additional. Tax and any other fees are not included in the estimate. Confirm current prices and availability with the cafe.</p><div className="catalog-footer-actions"><SpringButton as="a" className="primary-action" href="#cart">Review your order <Icon name="bag" /></SpringButton><SpringButton as="a" href={cafe.phoneHref}>Call {cafe.phone}<Icon /></SpringButton></div></footer>
  </section>;
}
