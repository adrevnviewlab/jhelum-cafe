import { useMemo, useState } from 'react';
import { orderSummary, pickupSlots } from './cart';
import Copyright from './Copyright';
import Icon from './Icon';
import { getFulfillment, getDeliveryQuote } from './lib/fulfillment';
import { quoteTotals } from './lib/pricing';
import { useMenu } from './MenuProvider';
import { cafe, money } from './menuData';
import { SpringButton, SpringCard } from './Spring';

export default function CartPage({ cart, onClear }) {
  const { settings } = useMenu();
  const [pickupTime, setPickupTime] = useState('');
  const [copied, setCopied] = useState(false);
  const slots = useMemo(() => pickupSlots(), []);
  const { details, itemCount, subtotalCents } = cart;
  const fulfillment = getFulfillment();
  const delivery = getDeliveryQuote();
  const totals = quoteTotals({
    subtotalCents,
    taxBps: settings?.tax_bps,
    deliveryFeeCents: fulfillment === 'delivery' && delivery?.eligible ? delivery.fee_cents || 0 : 0,
  });

  const copyOrder = async () => {
    try {
      await navigator.clipboard.writeText(orderSummary(cart.lines, pickupTime));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return <>
    <header className="page-masthead">
      <p className="label">Pickup / Brooklyn</p>
      <h1 id="cart">Your order</h1>
      <div className="page-masthead-meta">
        <p>{itemCount ? `${itemCount} ${itemCount === 1 ? 'item' : 'items'} ready to confirm with the cafe.` : 'Nothing in the order yet. The kitchen is still open.'}</p>
        <a className="page-masthead-link" href="#menu">Continue browsing the menu <Icon /></a>
      </div>
    </header>

    {details.length === 0 ? <section className="order-empty" aria-labelledby="empty-order-title">
      <Icon name="bag" />
      <h2 id="empty-order-title">Your table is waiting.</h2>
      <p>Choose a breakfast favourite, something desi, or chai for the road. Your order is saved on this device until you are ready to call.</p>
      <SpringButton as="a" className="primary-action" href="#menu">Open the menu</SpringButton>
    </section> : <div className="order-layout">
      <section className="order-lines" aria-labelledby="order-lines-title">
        <h2 id="order-lines-title">At your table</h2>
        {details.map(line => <SpringCard className="order-line" key={line.key} hover={{ y: -3, scale: 1.006 }} tap={{ scale: 0.995 }}>
          <img src={`/menu/${line.item.id}.webp`} alt="" width="160" height="160" />
          <div className="order-line-copy">
            <h3>{line.item.name}</h3>
            {(line.variant || line.modifiers.length > 0) && <p>{[line.variant?.label, ...line.modifiers.map(modifier => modifier.label)].filter(Boolean).join(' · ')}</p>}
            <strong>{money(line.totalCents)}</strong>
            <div className="quantity-stepper" aria-label={`Quantity for ${line.item.name}`}>
              <SpringButton type="button" onClick={() => cart.setQuantity(line.key, line.quantity - 1)} aria-label={`Remove one ${line.item.name}`} hover={{ scale: 1.08 }} tap={{ scale: 0.88 }}><Icon name="minus" /></SpringButton>
              <span aria-live="polite">{line.quantity}</span>
              <SpringButton type="button" onClick={() => cart.setQuantity(line.key, line.quantity + 1)} aria-label={`Add one ${line.item.name}`} hover={{ scale: 1.08 }} tap={{ scale: 0.88 }}><Icon name="plus" /></SpringButton>
            </div>
          </div>
          <button type="button" className="order-remove" onClick={() => cart.remove(line.key)}>Remove</button>
        </SpringCard>)}
      </section>

      <aside className="order-summary" aria-labelledby="order-summary-title">
        <h2 id="order-summary-title">Confirm pickup</h2>
        <label>Preferred pickup time<select value={pickupTime} onChange={event => setPickupTime(event.target.value)}>
          <option value="">Confirm by phone</option>{slots.map(slot => <option key={slot}>{slot}</option>)}
        </select></label>
        <div className="cart-total"><span>Food</span><strong>{money(totals.subtotalCents)}</strong></div>
        <div className="cart-total"><span>Tax</span><strong>{money(totals.taxCents)}</strong></div>
        {fulfillment === 'delivery' && <div className="cart-total"><span>Delivery</span><strong>{delivery?.eligible ? money(totals.deliveryFeeCents) : 'Check address'}</strong></div>}
        <div className="cart-total"><span>Estimated total</span><strong>{money(totals.totalCents)}</strong></div>
        <p>Tip is chosen at checkout. Call remains a fallback if a dish has no price.</p>
        <SpringButton as="a" className="primary-action" href="#checkout">Continue to Jhelum Direct checkout</SpringButton>
        <SpringButton type="button" className="secondary-action" onClick={copyOrder}>{copied ? <><Icon name="check" /> Order copied</> : 'Copy order summary'}</SpringButton>
        <SpringButton as="a" className="secondary-action call-order" href={cafe.phoneHref}>Call the cafe · {cafe.phone}</SpringButton>
        <button type="button" className="clear-order" onClick={onClear}>Clear order</button>
      </aside>
    </div>}

    <footer className="page-footer">
      <p>{cafe.address} · <a href={cafe.phoneHref}>{cafe.phone}</a></p>
      <p><a href="#visit">Visit & hours</a></p>
      <Copyright />
    </footer>
  </>;
}
