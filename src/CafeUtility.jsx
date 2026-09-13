import { useEffect, useMemo, useRef, useState } from 'react';
import MenuCatalog from './MenuCatalog';
import { cafe, crepeToppings, itemPrice, menuItems, money } from './menuData';
import ExternalLink from './ExternalLink';

const mapQuery = encodeURIComponent(cafe.address);
const mapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
const directionsUrl = mode => `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}&travelmode=${mode}`;
const parkingUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`parking near ${cafe.address}`)}`;

export function Visit({ open }) {
  const [showMap, setShowMap] = useState(false);
  return <section className="visit-strip" id="visit" tabIndex={-1} aria-labelledby="visit-title">
    <div><p className="label">A little closer to your table</p><h2 id="visit-title">Visit & hours</h2><p><strong>{cafe.hoursLabel}</strong><br />Brooklyn local time</p></div>
    <div><h3>Find us in Brooklyn</h3><p>{cafe.address}</p><a href={cafe.phoneHref}>{cafe.phone}</a><br /><ExternalLink href={mapUrl}>Get directions</ExternalLink></div>
    <div className="arrival-guide"><h3>Plan your arrival</h3>
      <details><summary>Transit & walking directions</summary><p>Choose your starting point to see current transit routes, stops and walking directions to the cafe.</p><div className="arrival-links"><ExternalLink href={directionsUrl('transit')}>Plan a transit trip</ExternalLink><ExternalLink href={directionsUrl('walking')}>Walking directions</ExternalLink></div></details>
      <details><summary>Step-free travel & cafe access</summary><p>Check accessible stations and elevator status with the MTA before travelling. A walking route is not a guarantee of step-free access.</p><div className="arrival-links"><ExternalLink href="https://www.mta.info/accessibility">MTA accessible travel</ExternalLink><a href={cafe.phoneHref}>Call about entrance, seating & restroom access</a></div></details>
      <details><summary>Parking & drop-off</summary><p>Search nearby parking and check posted restrictions before leaving your car. Call the cafe to confirm any dedicated parking or a suitable drop-off point before relying on it.</p><div className="arrival-links"><ExternalLink href={parkingUrl}>Find nearby parking</ExternalLink><a href={cafe.phoneHref}>Ask about parking & drop-off</a></div></details>
      <div className="utility-actions"><button onClick={() => open('menu')}>View menu</button><button onClick={() => setShowMap(!showMap)} aria-controls="visit-map" aria-expanded={showMap}>{showMap ? 'Hide map' : 'Explore map'}</button></div>
    </div>
    {showMap && <iframe id="visit-map" className="visit-map" title="937 Coney Island Avenue, Brooklyn — cafe address" src={`https://maps.google.com/maps?q=${mapQuery}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />}
  </section>;
}

// These are time-based suggestions, never a claim about kitchen capacity.
const pickupClock = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hourCycle: 'h23', hour: '2-digit', minute: '2-digit' });
export function pickupSlots(now = new Date()) {
  const parts = Object.fromEntries(pickupClock.formatToParts(now).map(p => [p.type, p.value]));
  const start = Math.max(600, Math.ceil((Number(parts.hour) * 60 + Number(parts.minute) + 30) / 15) * 15);
  return Array.from({ length: Math.max(0, Math.floor((1365 - start) / 15) + 1) }, (_, i) => {
    const minutes = start + i * 15;
    return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
  });
}

export function CafeDialog({ mode, close, changeMode }) {
  const ref = useRef(null);
  const [quantity, setQuantity] = useState(1);
  const [itemId, setItemId] = useState('brooklyn');
  const [variantIndex, setVariantIndex] = useState(0);
  const [modifierIds, setModifierIds] = useState([]);
  const selectedItem = menuItems.find(item => item.id === itemId);
  const selectedVariant = selectedItem.variants?.[variantIndex];
  const priceCents = itemPrice(selectedItem, variantIndex, modifierIds);
  const selectedModifiers = selectedItem.modifiers.filter(modifier => modifierIds.includes(modifier.id));
  const [slot, setSlot] = useState('');
  const [now, setNow] = useState(() => new Date());
  const [channel, setChannel] = useState('email');
  const [contact, setContact] = useState('');
  const [consent, setConsent] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const slots = useMemo(() => mode === 'pickup' ? pickupSlots(now) : [], [mode, now]);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    if (!dialog.open) dialog.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = overflow; if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, []);
  useEffect(() => {
    if (mode !== 'pickup') return;
    const refresh = () => { if (!document.hidden) setNow(new Date()); };
    const timer = setInterval(refresh, 30000);
    document.addEventListener('visibilitychange', refresh);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', refresh); };
  }, [mode]);
  useEffect(() => { if (slot && !slots.includes(slot)) { setSlot(''); setReviewed(false); } }, [slots, slot]);
  const title = { menu: 'From our kitchen', pickup: 'Plan your pickup', delivery: 'Bring the table home', club: 'A place in the Jehlum Club', share: 'Good company, good chai' }[mode];
  return <dialog ref={ref} className="cafe-dialog" aria-labelledby="dialog-title" onCancel={close} onClick={e => { if (e.target === ref.current) close(); }}>
    <div className="dialog-shell"><button className="dialog-close" onClick={close} aria-label="Close dialog">×</button><p className="label">Jehlum Cafe / Brooklyn</p><h2 id="dialog-title">{title}</h2>
    {mode === 'menu' && <><MenuCatalog compact /><button className="primary-action" onClick={() => changeMode('pickup')}>Plan a pickup ↗</button></>}
    {mode === 'pickup' && <form onSubmit={e => { e.preventDefault(); const current = new Date(); setNow(current); setReviewed(pickupSlots(current).includes(slot) && Number.isInteger(quantity) && quantity >= 1 && quantity <= 6); }} onChange={() => setReviewed(false)}>
      <p className="service-notice">Plan your order below, then call the cafe to confirm availability and pickup. This form does not send an order or reserve a time.</p>
      <label>Choose an item<select value={itemId} onChange={e => { setItemId(e.target.value); setVariantIndex(0); setModifierIds([]); }}>{menuItems.filter(item => item.cents != null).map(item => <option key={item.id} value={item.id}>{item.name} — {item.variants ? 'from ' : ''}{money(item.cents)}{item.unit ? ` ${item.unit}` : ''}</option>)}</select></label>
      {selectedItem.description && <p className="utility-note">{selectedItem.description}</p>}
      {selectedItem.id === 'crepes' && <p className="utility-note">{crepeToppings} Tell the cafe your included topping choices when you call.</p>}
      {selectedItem.variants && <label>Size or preparation · full item price<select value={variantIndex} onChange={e => setVariantIndex(Number(e.target.value))}>{selectedItem.variants.map((v,i) => <option key={v.label} value={i}>{v.label} — {money(v.cents)}</option>)}</select></label>}
      {selectedItem.modifiers.length > 0 && <fieldset><legend>Optional extras · added to each item</legend>{selectedItem.modifiers.map(modifier => <label className="choice" key={modifier.id}><input type="checkbox" checked={modifierIds.includes(modifier.id)} onChange={e => setModifierIds(ids => e.target.checked ? [...ids, modifier.id] : ids.filter(id => id !== modifier.id))} />{modifier.label} +{money(modifier.cents)}</label>)}</fieldset>}
      <div className="basket-line"><div><h3>{selectedItem.name}</h3><p>{money(priceCents)} {selectedItem.unit || 'each'}{selectedModifiers.length > 0 && ' · includes selected extras'}</p></div><label>{selectedItem.unit === 'per lb' ? 'Pounds' : 'Quantity'}<select value={quantity} onChange={e => setQuantity(Number(e.target.value))}>{[1,2,3,4,5,6].map(n => <option key={n}>{n}</option>)}</select></label></div>
      <label>Suggested pickup today · New York time<select required value={slot} onChange={e => setSlot(e.target.value)}><option value="">Choose a time</option>{slots.map(s => <option key={s}>{s}</option>)}</select></label>
      <p className="utility-note">Suggestions refresh every 30 seconds and allow 30 minutes for preparation. Kitchen availability is not verified.{!slots.length && ' No times remain today. Please return tomorrow.'}</p>
      <div className="basket-total" role="status" aria-live="polite" aria-atomic="true"><span>Food subtotal · {quantity} × {money(priceCents)}</span><strong>{money(quantity * priceCents)}</strong></div><p className="utility-note">Estimate includes selected extras. Tax and any other fees are excluded; confirm the final total with the cafe before ordering. Items with unlisted prices are available to discuss by phone.</p>
      <button className="primary-action" disabled={!slots.length}>Review pickup plan</button>{reviewed && <p role="status" className="service-notice">Your plan: {quantity}{selectedItem.unit === 'per lb' ? ' lb of' : ' ×'} {selectedItem.name}{selectedVariant ? ` (${selectedVariant.label})` : ''}{selectedModifiers.length > 0 ? ` with ${selectedModifiers.map(modifier => modifier.label.toLowerCase()).join(' and ')} on each item` : ''}, today at {slot}. Food subtotal: {money(quantity * priceCents)}, before tax and any fees. No order has been sent and no payment has been taken.</p>}<a className="primary-action call-order" href={cafe.phoneHref}>Call to order · {cafe.phone}</a>
    </form>}
    {mode === 'delivery' && <><p>Your cafe favourites, wherever you are.</p><p className="service-notice">Delivery is not available online yet. Delivery area, fees and ordering partner are awaiting confirmation.</p><button className="primary-action" onClick={() => changeMode('menu')}>Browse the menu</button></>}
    {mode === 'club' && <form onSubmit={e => { e.preventDefault(); setReviewed(true); }} onChange={() => setReviewed(false)}><p>Every sixth chai, ours. A small thank-you for making us part of your day.</p><p className="service-notice">Signup preview. Membership enrollment is not connected yet. Your details stay in this open form and are not saved or sent.</p><fieldset><legend>Preferred contact</legend>{['email', 'sms'].map(c => <label className="choice" key={c}><input type="radio" name="channel" checked={channel === c} onChange={() => { setChannel(c); setContact(''); }} />{c === 'email' ? 'Email' : 'SMS'}</label>)}</fieldset><label>{channel === 'email' ? 'Email address' : 'Mobile number'}<input required type={channel === 'email' ? 'email' : 'tel'} autoComplete={channel === 'email' ? 'email' : 'tel'} value={contact} pattern={channel === 'sms' ? '[+0-9 ()-]{7,20}' : undefined} onChange={e => setContact(e.target.value)} /></label><label className="choice"><input required type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />I would like Jehlum Club updates by {channel === 'sms' ? 'SMS' : 'email'}.</label><button className="primary-action">Review signup details</button>{reviewed && <p role="status" className="service-notice">Details checked. Enrollment is not yet available; you have not been subscribed.</p>}</form>}
    {mode === 'share' && <><p>Send someone an invitation to slow down with you.</p><button className="primary-action" onClick={async () => { try { await navigator.clipboard.writeText(window.location.origin); setCopied(true); setError(''); } catch { setError('Copy the address below to share the cafe.'); } }}>{copied ? 'Link copied' : 'Copy cafe link'}</button><p role="status">{copied ? 'Ready to share with someone you love.' : error}</p><input aria-label="Cafe link" readOnly value={window.location.origin} onFocus={e => e.target.select()} /></>}
    </div></dialog>;
}

export function MobileNav({ open }) {
  return <nav className="mobile-nav" aria-label="Quick cafe actions"><button onClick={() => open('menu')}>Menu</button><button onClick={() => open('pickup')}>Order online</button><a href="#visit">Get directions</a></nav>;
}
