import { useEffect } from 'react';
import Copyright from './Copyright';
import Icon from './Icon';
import { track } from './lib/analytics';
import MenuCatalog from './MenuCatalog';
import { cafe, money } from './menuData';
import { FEATURED_ITEM_IDS } from './lib/constants';
import { canSellOnline } from './lib/pricing';
import { useMenu } from './MenuProvider';
import { menuPhotos } from './menuPhotos';
import { SpringButton, SpringCard } from './Spring';

export function MenuInvite({ onAdd }) {
  const { items } = useMenu();
  const featured = FEATURED_ITEM_IDS.map(id => items.find(item => item.id === id)).filter(Boolean);
  return <section className="menu-invite" aria-labelledby="menu-invite-title">
    <div className="menu-invite-copy">
      <p className="label">Jhelum Direct</p>
      <h2 id="menu-invite-title">Morning favourites.<br /><em>Flavours of home.</em></h2>
      <p>Breakfast sandwiches, desi chaat and a cup of chai. Add from here, or open the full menu.</p>
      <SpringButton as="a" className="menu-anchor" href="#menu">Open the full menu <Icon /></SpringButton>
    </div>
    <ul className="menu-invite-list">
      {featured.map(item => <li key={item.id}>
        <SpringCard>
          <img src={`/menu/${item.id}.webp`} alt={menuPhotos[item.id]} width="220" height="160" loading="lazy" decoding="async" />
          <span>
            <strong>{item.name}</strong>
            <em>{money(item.cents)}</em>
            {canSellOnline(item)
              ? <SpringButton type="button" onClick={() => onAdd?.(item, Boolean(item.variants || item.modifiers?.length))}>Add <Icon name="plus" /></SpringButton>
              : <SpringButton as="a" href="#menu">View</SpringButton>}
          </span>
        </SpringCard>
      </li>)}
    </ul>
  </section>;
}

export default function MenuPage({ category, setCategory, onAddItem, cartCount }) {
  useEffect(() => { track('menu_view', { category: category || 'all' }); }, [category]);
  return <>
    <header className="page-masthead">
      <p className="label">Jehlum Cafe / Brooklyn</p>
      <h1 id="menu">The menu</h1>
      <div className="page-masthead-meta">
        <p><strong>{cafe.hoursLabel}</strong><br />{cafe.address}</p>
        <a className="page-masthead-link" href={cartCount ? '#checkout' : '#visit'}>
          {cartCount ? `Checkout · ${cartCount}` : 'Plan your visit'} <Icon name={cartCount ? 'bag' : 'arrow'} />
        </a>
      </div>
    </header>
    <MenuCatalog category={category} setCategory={setCategory} onAddItem={onAddItem} />
    <footer className="page-footer">
      <p>{cafe.address} · <a href={cafe.phoneHref}>{cafe.phone}</a></p>
      <p><a href="#visit">Visit & hours</a></p>
      <Copyright />
    </footer>
  </>;
}
