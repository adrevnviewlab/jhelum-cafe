import DeliveryChecker from './DeliveryChecker';
import { FEATURED_ITEM_IDS } from './lib/constants';
import { canSellOnline } from './lib/pricing';
import { menuPhotos } from './menuPhotos';
import { money } from './menuData';
import { SpringButton, SpringCard } from './Spring';
import Icon from './Icon';

export function CravingSelector({ sections }) {
  return (
    <section className="direct-craving" aria-labelledby="craving-title">
      <p className="label">Jhelum Direct</p>
      <h2 id="craving-title">What are you craving?</h2>
      <div className="direct-craving-list">
        {sections.map(section => (
          <SpringButton key={section.id} as="a" href={`#menu/${section.id}`}>{section.title}</SpringButton>
        ))}
      </div>
    </section>
  );
}

export function PopularItems({ items, onAdd }) {
  const featured = FEATURED_ITEM_IDS.map(id => items.find(item => item.id === id)).filter(Boolean);
  return (
    <section className="direct-popular" aria-labelledby="popular-title">
      <p className="label">Popular tonight</p>
      <h2 id="popular-title">Order these from Jhelum Direct</h2>
      <ul className="menu-invite-list">
        {featured.map(item => (
          <li key={item.id}>
            <SpringCard className="direct-popular-card">
              <img src={`/menu/${item.id}.webp`} alt={menuPhotos[item.id] || item.name} width="220" height="160" loading="lazy" decoding="async" />
              <span>
                <strong>{item.name}</strong>
                <em>{item.description || money(item.cents)}</em>
                {canSellOnline(item)
                  ? <SpringButton type="button" onClick={() => onAdd(item, Boolean(item.variants || item.modifiers?.length))}>Add · {money(item.cents)} <Icon name="plus" /></SpringButton>
                  : <SpringButton as="a" href="#menu">View on menu</SpringButton>}
              </span>
            </SpringCard>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function DirectBenefits() {
  return (
    <section className="direct-benefits" aria-labelledby="direct-benefits-title">
      <p className="label">Jhelum Direct</p>
      <h2 id="direct-benefits-title">Order from us, not a marketplace.</h2>
      <ul>
        <li><strong>Free qualifying local delivery</strong> within the cafe’s configured radius — 5 miles to start.</li>
        <li><strong>Direct support</strong> from Jehlum Cafe if something is missing or late.</li>
        <li><strong>Your order, our kitchen</strong> — no third-party handoff for website orders.</li>
      </ul>
    </section>
  );
}

export function HomeDirect({ sections, items, onAdd }) {
  return (
    <div className="direct-home">
      <CravingSelector sections={sections} />
      <DeliveryChecker />
      <PopularItems items={items} onAdd={onAdd} />
      <DirectBenefits />
    </div>
  );
}
