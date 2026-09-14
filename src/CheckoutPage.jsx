import { useMemo, useState } from 'react';
import Copyright from './Copyright';
import DeliveryChecker from './DeliveryChecker';
import Icon from './Icon';
import { track } from './lib/analytics';
import { readAttribution } from './lib/attribution';
import { getDeliveryQuote, getFulfillment, setFulfillment } from './lib/fulfillment';
import { createCheckout } from './lib/ordersApi';
import { quoteTotals, tipFromPercent } from './lib/pricing';
import { cafe, money } from './menuData';
import { pickupSlots } from './cart';
import { SpringButton } from './Spring';

export default function CheckoutPage({ cart, settings }) {
  const [fulfillment, setMode] = useState(getFulfillment());
  const [pickupTime, setPickupTime] = useState('');
  const [tipPercent, setTipPercent] = useState(15);
  const [customTip, setCustomTip] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [unit, setUnit] = useState('');
  const [notes, setNotes] = useState('');
  const [quote, setQuote] = useState(getDeliveryQuote());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const slots = useMemo(() => pickupSlots(), []);

  const deliveryFee = fulfillment === 'delivery' && quote?.eligible ? quote.fee_cents || 0 : 0;
  const tipCents = customTip !== '' ? Math.round(Number(customTip) * 100) || 0 : tipFromPercent(cart.subtotalCents, tipPercent);
  const totals = quoteTotals({
    subtotalCents: cart.subtotalCents,
    taxBps: settings?.tax_bps,
    tipCents,
    deliveryFeeCents: deliveryFee,
  });

  const choose = mode => {
    setMode(setFulfillment(mode));
  };

  const submit = async event => {
    event.preventDefault();
    setError('');
    if (!cart.details.length) {
      setError('Your cart is empty.');
      return;
    }
    if (fulfillment === 'delivery' && !quote?.eligible) {
      setError('Check that we deliver to your address before paying.');
      return;
    }
    setBusy(true);
    track('begin_checkout', { fulfillment, value: totals.totalCents / 100, currency: 'USD' });
    try {
      const result = await createCheckout({
        details: cart.details,
        fulfillment,
        customer: { name, phone, email },
        pickupTime,
        delivery: fulfillment === 'delivery' ? { ...quote, unit, notes, eligible: true } : null,
        quotes: totals,
        attribution: readAttribution(),
        origin: window.location.origin,
      });
      cart.clear();
      track('purchase', { transaction_id: result.orderId || result.trackToken, value: totals.totalCents / 100, currency: 'USD' });
      if (result.url) {
        window.location.href = result.url;
        return;
      }
      window.location.hash = `track/${result.trackToken}`;
    } catch (err) {
      setError(err.message || 'Checkout failed.');
    } finally {
      setBusy(false);
    }
  };

  return <>
    <header className="page-masthead">
      <p className="label">Jhelum Direct</p>
      <h1 id="checkout">Checkout</h1>
      <div className="page-masthead-meta">
        <p>Guest checkout. We only ask for what the kitchen and driver need. Cards are taken by Stripe — never stored here.</p>
        <a className="page-masthead-link" href="#cart">Back to cart <Icon /></a>
      </div>
    </header>

    {!cart.itemCount ? <section className="order-empty">
      <h2>Nothing to pay for yet.</h2>
      <SpringButton as="a" className="primary-action" href="#menu">Open the menu</SpringButton>
    </section> : <form className="order-layout checkout-form" onSubmit={submit}>
      <section className="order-lines">
        <h2>How should we get this to you?</h2>
        <div className="direct-fulfillment" role="radiogroup" aria-label="Fulfillment">
          {[['pickup', 'Pickup'], ['delivery', 'Delivery']].map(([value, label]) => (
            <label key={value} className={`choice-row ${fulfillment === value ? 'is-on' : ''}`}>
              <input type="radio" name="fulfillment" checked={fulfillment === value} onChange={() => choose(value)} />
              <span>{label}</span>
            </label>
          ))}
        </div>
        {fulfillment === 'pickup' && <label>Preferred pickup time
          <select value={pickupTime} onChange={event => setPickupTime(event.target.value)}>
            <option value="">First available — confirm in the kitchen</option>
            {slots.map(slot => <option key={slot}>{slot}</option>)}
          </select>
        </label>}
        {fulfillment === 'delivery' && <>
          <DeliveryChecker compact onQuote={setQuote} />
          <label>Apartment / unit<input value={unit} onChange={event => setUnit(event.target.value)} autoComplete="address-line2" /></label>
          <label>Delivery notes<textarea value={notes} maxLength={240} onChange={event => setNotes(event.target.value)} rows="3" /></label>
        </>}

        <h2>Your details</h2>
        <label>Name<input required value={name} onChange={event => setName(event.target.value)} autoComplete="name" /></label>
        <label>Phone<input required type="tel" value={phone} onChange={event => setPhone(event.target.value)} autoComplete="tel" /></label>
        <label>Email<input required type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" /></label>
        <p className="catalog-note">Transactional order updates use this phone and email. Marketing consent is separate and not collected here.</p>
      </section>

      <aside className="order-summary">
        <h2>Pay now</h2>
        {cart.details.map(line => <p key={line.key}>{line.quantity} × {line.item.name}<strong> {money(line.totalCents)}</strong></p>)}
        <div className="cart-lines">
          <div className="cart-total"><span>Food</span><strong>{money(totals.subtotalCents)}</strong></div>
          <div className="cart-total"><span>Tax</span><strong>{money(totals.taxCents)}</strong></div>
          {fulfillment === 'delivery' && <div className="cart-total"><span>Delivery</span><strong>{quote?.eligible ? money(totals.deliveryFeeCents) : '—'}</strong></div>}
        </div>
        <fieldset className="tip-fieldset">
          <legend>Tip</legend>
          {[0, 15, 18, 20].map(percent => (
            <label className="choice" key={percent}>
              <input type="radio" name="tip" checked={customTip === '' && tipPercent === percent} onChange={() => { setTipPercent(percent); setCustomTip(''); }} />
              {percent === 0 ? 'No tip' : `${percent}%`}
            </label>
          ))}
          <label>Custom tip ($)
            <input type="number" min="0" step="0.25" value={customTip} onChange={event => setCustomTip(event.target.value)} />
          </label>
        </fieldset>
        <div className="cart-total"><span>Total</span><strong>{money(totals.totalCents)}</strong></div>
        {error && <p className="service-notice" role="alert">{error}</p>}
        <SpringButton className="primary-action" disabled={busy}>{busy ? 'Starting payment…' : `Pay ${money(totals.totalCents)}`}</SpringButton>
        <p>If Stripe is not connected, this demo confirms the order and opens tracking so the kitchen board can run.</p>
        <SpringButton as="a" className="secondary-action" href={cafe.phoneHref}>Call the cafe instead · {cafe.phone}</SpringButton>
      </aside>
    </form>}

    <footer className="page-footer">
      <p>{cafe.address} · <a href={cafe.phoneHref}>{cafe.phone}</a></p>
      <Copyright />
    </footer>
  </>;
}
