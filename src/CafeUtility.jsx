import { useEffect, useRef, useState } from 'react';

const mapQuery = encodeURIComponent('Coney Island Avenue, Brooklyn, NY');
const mapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
export const menu = [
  { name: 'Chicken karahi', description: 'Tomato, ginger and green chili. Made for sharing.', price: 18, image: '/karahi.jpg' },
  { name: 'Cardamom chai', description: 'Warm milk, tea and fragrant cardamom.', price: null, image: '/chai.jpg' },
  { name: 'Paratha', description: 'Flaky bread for tearing, dipping and sharing.', price: null, image: '/chai.jpg' },
];

export function Visit({ open }) {
  const [showMap, setShowMap] = useState(false);
  return <section className="visit-strip" id="visit" aria-labelledby="visit-title">
    <div><p className="label">A little closer to your table</p><h2 id="visit-title">Visit & hours</h2><p><strong>Open daily · 10 AM – 11 PM</strong><br />Brooklyn local time</p></div>
    <div><h3>Find us in Brooklyn</h3><p>Coney Island Avenue, Brooklyn, NY</p><p className="utility-note">Exact street number to be confirmed. Map shows the avenue.</p><a href={mapUrl} target="_blank" rel="noreferrer">Explore the area ↗</a></div>
    <div><h3>Before you arrive</h3><p>Parking details are awaiting confirmation. Check posted street signs when you arrive.</p><div className="utility-actions"><button onClick={() => open('menu')}>View menu</button><button onClick={() => setShowMap(!showMap)} aria-expanded={showMap}>{showMap ? 'Hide map' : 'Explore map'}</button></div></div>
    {showMap && <iframe className="visit-map" title="Coney Island Avenue area in Brooklyn — not a confirmed cafe pin" src={`https://maps.google.com/maps?q=${mapQuery}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />}
  </section>;
}

// These are time-based suggestions, never a claim about kitchen capacity.
export function pickupSlots(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hourCycle: 'h23', hour: '2-digit', minute: '2-digit' }).formatToParts(now).map(p => [p.type, p.value]));
  const start = Math.max(600, Math.ceil((Number(parts.hour) * 60 + Number(parts.minute) + 30) / 15) * 15);
  return Array.from({ length: Math.max(0, Math.floor((1365 - start) / 15) + 1) }, (_, i) => {
    const minutes = start + i * 15;
    return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
  });
}

export function CafeDialog({ mode, close, changeMode }) {
  const ref = useRef(null);
  const [quantity, setQuantity] = useState(1);
  const [slot, setSlot] = useState('');
  const [now, setNow] = useState(() => new Date());
  const [channel, setChannel] = useState('email');
  const [contact, setContact] = useState('');
  const [consent, setConsent] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const slots = pickupSlots(now);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    dialog.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => { clearInterval(timer); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  useEffect(() => { if (slot && !slots.includes(slot)) { setSlot(''); setReviewed(false); } }, [now, slot]);
  const title = { menu: 'From our kitchen', pickup: 'Plan your pickup', delivery: 'Bring the table home', club: 'A place in the Jehlum Club', share: 'Good company, good chai' }[mode];
  return <dialog ref={ref} className="cafe-dialog" aria-labelledby="dialog-title" onCancel={close} onClick={e => { if (e.target === ref.current) close(); }}>
    <div className="dialog-shell"><button className="dialog-close" onClick={close} aria-label="Close dialog">×</button><p className="label">Jehlum Cafe / Brooklyn</p><h2 id="dialog-title">{title}</h2>
    {mode === 'menu' && <><p>Familiar dishes. Generous portions. A slower moment.</p><p className="utility-note">Menu preview: the complete menu, variants and remaining prices are awaiting confirmation.</p><div className="full-menu">{menu.map(item => <article key={item.name}><img src={item.image} alt="" width="320" height="210" loading="lazy" /><div><h3>{item.name}</h3><p>{item.description}</p><strong>{item.price ? `$${item.price}` : 'Price to be confirmed'}</strong></div></article>)}</div><button className="primary-action" onClick={() => changeMode('pickup')}>Plan a pickup ↗</button></>}
    {mode === 'pickup' && <form onSubmit={e => { e.preventDefault(); if (slots.includes(slot)) setReviewed(true); }} onChange={() => setReviewed(false)}>
      <p className="service-notice">Ordering preview. Online checkout is not connected yet; no order or pickup time will be reserved.</p>
      <div className="basket-line"><div><h3>Chicken karahi</h3><p>$18 per serving</p></div><label>Quantity<select value={quantity} onChange={e => setQuantity(Number(e.target.value))}>{[1,2,3,4,5,6].map(n => <option key={n}>{n}</option>)}</select></label></div>
      <label>Suggested pickup today · New York time<select required value={slot} onChange={e => setSlot(e.target.value)}><option value="">Choose a time</option>{slots.map(s => <option key={s}>{s}</option>)}</select></label>
      <p className="utility-note">Suggestions refresh every 30 seconds and allow 30 minutes for preparation. Kitchen availability is not verified.{!slots.length && ' No times remain today. Please return tomorrow.'}</p>
      <div className="basket-total"><span>Food subtotal</span><strong>${quantity * 18}.00</strong></div><p className="utility-note">Final tax and any fees will be shown by the ordering provider when connected.</p>
      <button className="primary-action" disabled={!slots.length}>Review pickup plan</button>{reviewed && <p role="status" className="service-notice">Your plan: {quantity} × chicken karahi, today at {slot}. No order has been sent and no payment has been taken.</p>}
    </form>}
    {mode === 'delivery' && <><p>Karahi for the table. Chai for the evening.</p><p className="service-notice">Delivery is not available online yet. Delivery area, fees and ordering partner are awaiting confirmation.</p><button className="primary-action" onClick={() => changeMode('menu')}>Browse the menu</button></>}
    {mode === 'club' && <form onSubmit={e => { e.preventDefault(); setReviewed(true); }} onChange={() => setReviewed(false)}><p>Every sixth chai, ours. A small thank-you for making us part of your day.</p><p className="service-notice">Signup preview. Membership enrollment is not connected yet. Your details stay in this open form and are not saved or sent.</p><fieldset><legend>Preferred contact</legend>{['email', 'sms'].map(c => <label className="choice" key={c}><input type="radio" name="channel" checked={channel === c} onChange={() => { setChannel(c); setContact(''); }} />{c === 'email' ? 'Email' : 'SMS'}</label>)}</fieldset><label>{channel === 'email' ? 'Email address' : 'Mobile number'}<input required type={channel === 'email' ? 'email' : 'tel'} autoComplete={channel === 'email' ? 'email' : 'tel'} value={contact} pattern={channel === 'sms' ? '[+0-9 ()-]{7,20}' : undefined} onChange={e => setContact(e.target.value)} /></label><label className="choice"><input required type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />I would like Jehlum Club updates by {channel === 'sms' ? 'SMS' : 'email'}.</label><button className="primary-action">Review signup details</button>{reviewed && <p role="status" className="service-notice">Details checked. Enrollment is not yet available; you have not been subscribed.</p>}</form>}
    {mode === 'share' && <><p>Send someone an invitation to slow down with you.</p><button className="primary-action" onClick={async () => { try { await navigator.clipboard.writeText(window.location.origin); setCopied(true); setError(''); } catch { setError('Copy the address below to share the cafe.'); } }}>{copied ? 'Link copied' : 'Copy cafe link'}</button><p role="status">{copied ? 'Ready to share with someone you love.' : error}</p><input aria-label="Cafe link" readOnly value={window.location.origin} onFocus={e => e.target.select()} /></>}
    </div></dialog>;
}

export function MobileNav({ open }) {
  return <nav className="mobile-nav" aria-label="Quick cafe actions"><button onClick={() => open('menu')}>Menu</button><button onClick={() => open('pickup')}>Order online</button><a href="#visit">Get directions</a></nav>;
}
