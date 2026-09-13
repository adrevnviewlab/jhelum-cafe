import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { cafe } from './menuData';
import ExternalLink from './ExternalLink';

const mapQuery = encodeURIComponent(cafe.address);
const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`;
const directionsUrl = mode => `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}&travelmode=${mode}`;
const parkingUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`parking near ${cafe.address}`)}`;

export function Visit() {
  const [showMap, setShowMap] = useState(false);
  return <section className="visit-strip" id="visit" tabIndex={-1} aria-labelledby="visit-title">
    <div><p className="label">A little closer to your table</p><h2 id="visit-title">Visit & hours</h2><p><strong>{cafe.hoursLabel}</strong><br />Brooklyn local time</p></div>
    <div><h3>Find us in Brooklyn</h3><p>{cafe.address}</p><a href={cafe.phoneHref}>{cafe.phone}</a><br /><ExternalLink href={mapUrl}>Get directions</ExternalLink></div>
    <div className="arrival-guide"><h3>Plan your arrival</h3>
      <details><summary>Transit & walking directions</summary><p>Choose your starting point to see current transit routes, stops and walking directions to the cafe.</p><div className="arrival-links"><ExternalLink href={directionsUrl('transit')}>Plan a transit trip</ExternalLink><ExternalLink href={directionsUrl('walking')}>Walking directions</ExternalLink></div></details>
      <details><summary>Step-free travel & cafe access</summary><p>Check accessible stations and elevator status with the MTA before travelling. A walking route is not a guarantee of step-free access.</p><div className="arrival-links"><ExternalLink href="https://www.mta.info/accessibility">MTA accessible travel</ExternalLink><a href={cafe.phoneHref}>Call about entrance, seating & restroom access</a></div></details>
      <details><summary>Parking & drop-off</summary><p>Search nearby parking and check posted restrictions before leaving your car. Call the cafe to confirm any dedicated parking or a suitable drop-off point before relying on it.</p><div className="arrival-links"><ExternalLink href={parkingUrl}>Find nearby parking</ExternalLink><a href={cafe.phoneHref}>Ask about parking & drop-off</a></div></details>
      <div className="utility-actions"><a className="menu-anchor" href="#menu">View menu</a><button type="button" onClick={() => setShowMap(current => !current)} aria-controls="visit-map" aria-expanded={showMap}>{showMap ? 'Hide map' : 'Explore map'}</button></div>
    </div>
    {showMap && <iframe id="visit-map" className="visit-map" title="Map showing Jehlum Cafe at 937 Coney Island Avenue, Brooklyn" src={`https://maps.google.com/maps?q=${mapQuery}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />}
  </section>;
}

export function InfoDialog({ mode, close }) {
  const ref = useRef(null);
  const [channel, setChannel] = useState('email');
  const [contact, setContact] = useState('');
  const [consent, setConsent] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const title = { delivery: 'Bring the table home', club: 'A place in the Jehlum Club', share: 'Good company, good chai' }[mode];

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
  }, []);

  return <dialog ref={ref} className="cafe-dialog" aria-labelledby="dialog-title" onCancel={close} onClick={event => { if (event.target === ref.current) close(); }}>
    <div className="dialog-header"><p className="label">Jehlum Cafe / Brooklyn</p><button type="button" className="dialog-close" onClick={close} aria-label="Close dialog"><Icon name="close" /></button></div>
    <div className="dialog-shell"><h2 id="dialog-title">{title}</h2>
      {mode === 'delivery' && <><p>Your cafe favourites, wherever you are.</p><p className="service-notice">Delivery ordering is coming soon. Call us to ask about the current delivery area, fees and availability.</p><a className="primary-action call-order" href={cafe.phoneHref}>Call {cafe.phone}</a></>}
      {mode === 'club' && <form onSubmit={event => { event.preventDefault(); setReviewed(true); }} onChange={() => setReviewed(false)}><p>Every sixth chai, ours. A small thank-you for making us part of your day.</p><p className="service-notice">Membership enrollment is not connected yet. Your details remain in this form and are never saved or sent.</p><fieldset><legend>Preferred contact</legend>{['email', 'sms'].map(value => <label className="choice" key={value}><input type="radio" name="channel" checked={channel === value} onChange={() => { setChannel(value); setContact(''); }} />{value === 'email' ? 'Email' : 'SMS'}</label>)}</fieldset><label>{channel === 'email' ? 'Email address' : 'Mobile number'}<input required type={channel === 'email' ? 'email' : 'tel'} autoComplete={channel === 'email' ? 'email' : 'tel'} value={contact} pattern={channel === 'sms' ? '[+0-9 ()-]{7,20}' : undefined} onChange={event => setContact(event.target.value)} /></label><label className="choice"><input required type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} />I would like Jehlum Club updates by {channel === 'sms' ? 'SMS' : 'email'}.</label><button className="primary-action">Review signup details</button>{reviewed && <p role="status" className="service-notice">Details checked. Enrollment is not yet available; you have not been subscribed.</p>}</form>}
      {mode === 'share' && <><p>Send someone an invitation to slow down with you.</p><button type="button" className="primary-action" onClick={async () => { try { await navigator.clipboard.writeText(window.location.origin); setCopied(true); setError(''); } catch { setError('Select and copy the cafe address below.'); } }}>{copied ? 'Link copied' : 'Copy cafe link'}</button><p role="status">{copied ? 'Ready to share.' : error}</p><input aria-label="Cafe website address" readOnly value={window.location.origin} onFocus={event => event.target.select()} /></>}
    </div>
  </dialog>;
}

export function MobileNav({ openMenu, openOrder, openCart, cartCount }) {
  return <nav className="mobile-nav" aria-label="Quick cafe actions">
    <button type="button" onClick={openMenu}>Menu</button>
    <button type="button" onClick={openOrder}>Order</button>
    <ExternalLink href={mapUrl}>Directions</ExternalLink>
    <button type="button" className="mobile-cart" onClick={openCart} aria-label={`Open cart with ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}>Cart <span aria-live="polite">{cartCount}</span></button>
  </nav>;
}
