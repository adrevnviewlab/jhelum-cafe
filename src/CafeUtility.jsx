import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { cafe } from './menuData';
import ExternalLink from './ExternalLink';
import SheetHandle from './mobile/SheetHandle';
import useSheetGesture from './mobile/useSheetGesture';
import { SpringButton } from './Spring';

export { default as MobileNav } from './mobile/NativeTabBar';

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
      <div className="utility-actions"><SpringButton as="a" className="menu-anchor" href="#menu">View menu</SpringButton><SpringButton type="button" onClick={() => setShowMap(current => !current)} aria-controls="visit-map" aria-expanded={showMap}>{showMap ? 'Hide map' : 'Explore map'}</SpringButton></div>
    </div>
    {showMap && <iframe id="visit-map" className="visit-map" title="Map showing Jehlum Cafe at 937 Coney Island Avenue, Brooklyn" src={`https://maps.google.com/maps?q=${mapQuery}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />}
  </section>;
}

export function InfoDialog({ close }) {
  const ref = useRef(null);
  const sheet = useSheetGesture(close);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

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

  return <dialog ref={node => { ref.current = node; sheet.sheetRef.current = node; }} className="cafe-dialog native-sheet" aria-labelledby="dialog-title" onCancel={close} onClick={event => { if (event.target === ref.current) close(); }} style={sheet.style}>
    <SheetHandle handleProps={sheet.handleProps} />
    <div className="dialog-header"><p className="label">Jehlum Cafe / Brooklyn</p><SpringButton type="button" className="dialog-close" onClick={close} aria-label="Close dialog" hover={{ scale: 1.08 }} tap={{ scale: 0.9 }}><Icon name="close" /></SpringButton></div>
    <div className="dialog-shell"><h2 id="dialog-title">Good company, good chai</h2>
      <p>Send someone an invitation to slow down with you.</p>
      <SpringButton type="button" className="primary-action" onClick={async () => { try { await navigator.clipboard.writeText(window.location.origin); setCopied(true); setError(''); } catch { setError('Select and copy the cafe address below.'); } }}>{copied ? 'Link copied' : 'Copy cafe link'}</SpringButton>
      <p role="status">{copied ? 'Ready to share.' : error}</p>
      <input aria-label="Cafe website address" readOnly value={window.location.origin} onFocus={event => event.target.select()} />
    </div>
  </dialog>;
}

