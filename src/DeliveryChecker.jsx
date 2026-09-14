import { useEffect, useRef, useState } from 'react';
import { mapsBrowserKey, quoteDelivery } from './lib/deliveryApi';
import { setDeliveryQuote, setFulfillment } from './lib/fulfillment';
import { track } from './lib/analytics';
import { money } from './menuData';
import { SpringButton } from './Spring';

async function loadPlaces() {
  const key = mapsBrowserKey();
  if (!key) return null;
  if (window.google?.maps?.places) return window.google.maps.places;
  await new Promise((resolve, reject) => {
    const existing = document.getElementById('jhelum-maps');
    if (existing) {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }
    const script = document.createElement('script');
    script.id = 'jhelum-maps';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return window.google?.maps?.places || null;
}

export default function DeliveryChecker({ compact = false, onQuote }) {
  const inputRef = useRef(null);
  const [address, setAddress] = useState('');
  const [place, setPlace] = useState(null);
  const [quote, setQuote] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let autocomplete;
    loadPlaces().then(places => {
      if (!places || !inputRef.current) return;
      autocomplete = new places.Autocomplete(inputRef.current, {
        fields: ['formatted_address', 'geometry', 'place_id'],
        componentRestrictions: { country: ['us'] },
      });
      autocomplete.addListener('place_changed', () => {
        const next = autocomplete.getPlace();
        const loc = next.geometry?.location;
        setAddress(next.formatted_address || inputRef.current.value);
        setPlace({
          address: next.formatted_address,
          placeId: next.place_id,
          lat: loc ? loc.lat() : null,
          lng: loc ? loc.lng() : null,
        });
      });
    }).catch(() => {});
    return () => autocomplete?.unbindAll?.();
  }, []);

  const check = async event => {
    event?.preventDefault();
    setBusy(true);
    setError('');
    try {
      const result = await quoteDelivery({
        address: place?.address || address,
        placeId: place?.placeId,
        lat: place?.lat,
        lng: place?.lng,
      });
      setQuote(result);
      setDeliveryQuote({ ...result, address: place?.address || address });
      if (result.eligible) setFulfillment('delivery');
      onQuote?.(result);
      track('delivery_check', { eligible: result.eligible, miles: result.miles });
    } catch (err) {
      setError(err.message || 'Could not check that address.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={`direct-checker ${compact ? 'direct-checker--compact' : ''}`} id={compact ? undefined : 'direct'} aria-labelledby={compact ? undefined : 'delivery-checker-title'}>
      {!compact && <p className="label">Jhelum Direct</p>}
      <h2 id={compact ? undefined : 'delivery-checker-title'}>{compact ? 'Delivery address' : 'Do we deliver to you?'}</h2>
      <p>Enter a full street address. We measure the route from the cafe — not your ZIP code.</p>
      <form className="direct-checker-form" onSubmit={check}>
        <label>
          Delivery address
          <input ref={inputRef} required autoComplete="street-address" value={address} onChange={event => { setAddress(event.target.value); setPlace(null); }} placeholder="Street, Brooklyn, NY" />
        </label>
        <SpringButton className="primary-action" disabled={busy}>{busy ? 'Checking…' : 'Check delivery'}</SpringButton>
      </form>
      {error && <p className="service-notice" role="alert">{error}</p>}
      {quote && <p className={`direct-quote ${quote.eligible ? 'direct-quote--yes' : 'direct-quote--no'}`} role="status">
        {quote.miles != null && <strong>{quote.miles} miles away. </strong>}
        {quote.message}
        {quote.eligible && quote.fee_cents > 0 && ` Delivery fee ${money(quote.fee_cents)}.`}
      </p>}
      {!mapsBrowserKey() && <p className="catalog-note">Address suggestions need a Google Maps browser key. Checkout still revalidates distance on the server.</p>}
    </section>
  );
}
