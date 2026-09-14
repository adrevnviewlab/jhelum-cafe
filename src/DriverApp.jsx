import { useEffect, useState } from 'react';
import Copyright from './Copyright';
import { CAFE } from './lib/constants';
import { currentProfile, isDriver, signIn, signOut } from './lib/auth';
import { acceptOffer, listOffers, listOrders, updateOrderStatus } from './lib/ordersApi';
import { subscribeStore } from './lib/localStore';
import { SpringButton } from './Spring';

function navHref(address) {
  const dest = encodeURIComponent(address);
  const apple = /iPhone|iPad|Macintosh/.test(navigator.userAgent);
  return apple
    ? `https://maps.apple.com/?daddr=${dest}`
    : `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
}

export default function DriverApp({ orderId }) {
  const [profile, setProfile] = useState(null);
  const [offers, setOffers] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [error, setError] = useState('');

  const reload = async user => {
    const who = user || profile;
    if (!who) return;
    setOffers(await listOffers());
    const orders = await listOrders();
    setAssigned(orders.filter(order => order.driver_id === who.id));
  };

  useEffect(() => {
    currentProfile().then(setProfile);
  }, []);

  useEffect(() => {
    if (!isDriver(profile)) return undefined;
    reload(profile);
    const timer = setInterval(() => reload(profile), 5000);
    const stop = subscribeStore(() => reload(profile));
    return () => {
      clearInterval(timer);
      stop();
    };
  }, [profile]);

  if (!profile) {
    return <section className="staff-login">
      <h1>Driver sign in</h1>
      <p>Demo: driver@jehlum.local</p>
      <SpringButton type="button" className="primary-action" onClick={() => signIn('driver@jehlum.local', 'jhelum').then(setProfile)}>Sign in as driver</SpringButton>
    </section>;
  }
  if (!isDriver(profile)) {
    return <section className="order-empty"><p>Not a driver account.</p><SpringButton type="button" onClick={() => signOut().then(() => setProfile(null))}>Sign out</SpringButton></section>;
  }

  const take = async offer => {
    setError('');
    try {
      await acceptOffer(offer.id, profile);
      window.location.hash = `driver/${offer.id}`;
      reload(profile);
    } catch (err) {
      setError(err.message);
    }
  };

  const current = assigned.find(order => order.id === orderId) || assigned[0];

  return <>
    <header className="page-masthead">
      <p className="label">Driver</p>
      <h1 id="driver">Deliveries</h1>
      <SpringButton type="button" className="secondary-action" onClick={() => signOut().then(() => setProfile(null))}>Sign out</SpringButton>
    </header>
    {error && <p className="service-notice" role="alert">{error}</p>}
    {!current && <section className="staff-orders">
      <h2>Available</h2>
      {offers.length === 0 && <p>No open deliveries. When the kitchen marks an order ready, it will appear here — without the customer address until you accept.</p>}
      {offers.map(offer => (
        <article key={offer.id} className="staff-order">
          <header><strong>{offer.number}</strong><span>{offer.delivery_miles != null ? `${offer.delivery_miles} mi` : 'Distance on accept'}</span></header>
          <p>Ready state: {offer.status}. Address is hidden until you accept.</p>
          <SpringButton type="button" className="primary-action" onClick={() => take(offer)}>Accept</SpringButton>
        </article>
      ))}
    </section>}
    {current && <section className="staff-order">
      <h2>{current.number}</h2>
      <p>Pickup: {CAFE.address}</p>
      <p>Customer: {current.delivery_address || 'Address on file'} {current.delivery_unit || ''}</p>
      {current.delivery_notes && <p>Notes: {current.delivery_notes}</p>}
      <p><a href={navHref(current.delivery_address || CAFE.address)}>Open navigation</a> · <a href={CAFE.phoneHref}>Cafe phone</a> · <a href={`tel:${current.customer_phone}`}>Call customer</a></p>
      <div className="staff-actions">
        {current.status === 'driver_assigned' && <SpringButton type="button" className="primary-action" onClick={() => updateOrderStatus(current.id, 'picked_up', 'driver').then(() => reload(profile))}>Picked up</SpringButton>}
        {current.status === 'picked_up' && <SpringButton type="button" className="primary-action" onClick={() => updateOrderStatus(current.id, 'out_for_delivery', 'driver').then(() => reload(profile))}>On the way</SpringButton>}
        {current.status === 'out_for_delivery' && <SpringButton type="button" className="primary-action" onClick={() => updateOrderStatus(current.id, 'delivered', 'driver').then(() => reload(profile))}>Delivered</SpringButton>}
      </div>
      <a href="#driver">Back to offers</a>
    </section>}
    <footer className="page-footer"><Copyright /></footer>
  </>;
}
