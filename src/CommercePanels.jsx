import { useEffect, useMemo, useRef, useState } from 'react';
import { cartTotals, orderSummary, pickupSlots } from './cart';
import Icon from './Icon';
import { cafe, crepeToppings, itemPrice, menuItems, menuSections, money } from './menuData';
import { menuPhotos } from './menuPhotos';

function useModalDialog(ref, onClose) {
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    if (!dialog.open) dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      if (dialog.open) dialog.close();
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [ref]);

  return event => {
    if (event.target === ref.current) onClose();
  };
}

function DrawerHeader({ eyebrow, title, close, titleId }) {
  return <header className="drawer-header">
    <div><p className="label">{eyebrow}</p><h2 id={titleId}>{title}</h2></div>
    <button type="button" className="drawer-close" onClick={close} aria-label={`Close ${title.toLowerCase()}`}>
      <Icon name="close" />
    </button>
  </header>;
}

export function MenuDrawer({ close, selectCategory }) {
  const ref = useRef(null);
  const onBackdrop = useModalDialog(ref, close);
  return <dialog ref={ref} id="menu-drawer" className="top-drawer" aria-labelledby="menu-drawer-title" onCancel={close} onClick={onBackdrop}>
    <div className="top-drawer-panel">
      <DrawerHeader eyebrow="Jehlum Cafe / Brooklyn" title="From our kitchen" titleId="menu-drawer-title" close={close} />
      <nav className="drawer-categories" aria-label="Choose a menu category">
        {menuSections.map(section => {
          const firstItem = section.items[0];
          return <button type="button" key={section.id} onClick={() => selectCategory(section.id)}>
            <img src={`/menu/${firstItem.id}.webp`} alt="" width="180" height="180" decoding="async" />
            <span><small>{String(section.items.length).padStart(2, '0')} dishes</small><strong>{section.title}</strong><em>{section.subtitle}</em></span>
            <Icon />
          </button>;
        })}
      </nav>
      <button type="button" className="drawer-all" onClick={() => selectCategory('all')}>See the full menu <Icon /></button>
    </div>
  </dialog>;
}

export function ItemDialog({ itemId, close, add }) {
  const ref = useRef(null);
  const onBackdrop = useModalDialog(ref, close);
  const item = menuItems.find(entry => entry.id === itemId);
  const [variantIndex, setVariantIndex] = useState(0);
  const [modifierIds, setModifierIds] = useState([]);
  const [quantity, setQuantity] = useState(1);
  if (!item) return null;
  const unitCents = itemPrice(item, variantIndex, modifierIds);
  const toggleModifier = id => setModifierIds(current => current.includes(id)
    ? current.filter(entry => entry !== id)
    : [...current, id]);

  return <dialog ref={ref} className="item-dialog" aria-labelledby="item-dialog-title" onCancel={close} onClick={onBackdrop}>
    <div className="item-dialog-panel">
      <button type="button" className="drawer-close item-dialog-close" onClick={close} aria-label="Close item options"><Icon name="close" /></button>
      <img className="item-dialog-photo" src={`/menu/${item.id}.webp`} alt={menuPhotos[item.id]} width="700" height="700" />
      <div className="item-dialog-copy">
        <p className="label">Add to your order</p>
        <h2 id="item-dialog-title">{item.name}</h2>
        {item.description && <p>{item.description}</p>}
        {item.id === 'crepes' && <p className="item-dialog-note">{crepeToppings}</p>}
        {item.variants && <fieldset><legend>Choose one</legend>{item.variants.map((variant, index) => <label className="choice-row" key={variant.label}>
          <input type="radio" name="variant" checked={variantIndex === index} onChange={() => setVariantIndex(index)} />
          <span>{variant.label}</span><strong>{money(variant.cents)}</strong>
        </label>)}</fieldset>}
        {item.modifiers.length > 0 && <fieldset><legend>Optional extras</legend>{item.modifiers.map(modifier => <label className="choice-row" key={modifier.id}>
          <input type="checkbox" checked={modifierIds.includes(modifier.id)} onChange={() => toggleModifier(modifier.id)} />
          <span>{modifier.label}</span><strong>+ {money(modifier.cents)}</strong>
        </label>)}</fieldset>}
        <div className="item-dialog-actions">
          <label>Quantity<select value={quantity} onChange={event => setQuantity(Number(event.target.value))}>{[1, 2, 3, 4, 5, 6].map(value => <option key={value}>{value}</option>)}</select></label>
          <button type="button" className="add-order-button" onClick={() => { add(item.id, variantIndex, modifierIds, quantity); close(); }}>
            Add to order · {money(unitCents * quantity)}
          </button>
        </div>
      </div>
    </div>
  </dialog>;
}

export function CartDrawer({ cart, close, browseMenu }) {
  const ref = useRef(null);
  const onBackdrop = useModalDialog(ref, close);
  const [pickupTime, setPickupTime] = useState('');
  const [copied, setCopied] = useState(false);
  const slots = useMemo(() => pickupSlots(), []);
  const { details, itemCount, subtotalCents } = cartTotals(cart.lines);

  const copyOrder = async () => {
    try {
      await navigator.clipboard.writeText(orderSummary(cart.lines, pickupTime));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return <dialog ref={ref} className="cart-drawer" aria-labelledby="cart-title" onCancel={close} onClick={onBackdrop}>
    <div className="cart-panel">
      <DrawerHeader eyebrow={`${itemCount} ${itemCount === 1 ? 'item' : 'items'}`} title="Your order" titleId="cart-title" close={close} />
      {details.length === 0 ? <div className="empty-cart">
        <Icon name="bag" />
        <h3>Your table is waiting.</h3>
        <p>Choose a breakfast favourite, something desi, or chai for the road.</p>
        <button type="button" className="primary-action" onClick={browseMenu}>Browse the menu</button>
      </div> : <>
        <div className="cart-lines">{details.map(line => <article className="cart-line" key={line.key}>
          <img src={`/menu/${line.item.id}.webp`} alt="" width="112" height="112" />
          <div className="cart-line-copy">
            <h3>{line.item.name}</h3>
            {(line.variant || line.modifiers.length > 0) && <p>{[line.variant?.label, ...line.modifiers.map(modifier => modifier.label)].filter(Boolean).join(' · ')}</p>}
            <strong>{money(line.totalCents)}</strong>
            <div className="quantity-stepper" aria-label={`Quantity for ${line.item.name}`}>
              <button type="button" onClick={() => cart.setQuantity(line.key, line.quantity - 1)} aria-label={`Remove one ${line.item.name}`}><Icon name="minus" /></button>
              <span aria-live="polite">{line.quantity}</span>
              <button type="button" onClick={() => cart.setQuantity(line.key, line.quantity + 1)} aria-label={`Add one ${line.item.name}`}><Icon name="plus" /></button>
            </div>
          </div>
          <button type="button" className="cart-remove" onClick={() => cart.remove(line.key)}>Remove</button>
        </article>)}</div>
        <div className="cart-order-details">
          <label>Preferred pickup time<select value={pickupTime} onChange={event => setPickupTime(event.target.value)}>
            <option value="">Confirm by phone</option>{slots.map(slot => <option key={slot}>{slot}</option>)}
          </select></label>
          <div className="cart-total"><span>Food subtotal</span><strong>{money(subtotalCents)}</strong></div>
          <p>Saved on this device. Availability, pickup time, tax and final total must be confirmed with the cafe.</p>
          <button type="button" className="secondary-action" onClick={copyOrder}>{copied ? <><Icon name="check" /> Order copied</> : 'Copy order summary'}</button>
          <a className="primary-action call-order" href={cafe.phoneHref}>Call to place order · {cafe.phone}</a>
          <button type="button" className="clear-order" onClick={cart.clear}>Clear order</button>
        </div>
      </>}
    </div>
  </dialog>;
}
