import { useEffect, useState } from 'react';
import Copyright from './Copyright';
import { STATUS_LABELS, TRACK_STEPS } from './lib/constants';
import { fetchOrderByToken } from './lib/ordersApi';
import { cafe, money } from './menuData';
import { SpringButton } from './Spring';

export default function TrackPage({ token }) {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Missing tracking link.');
      return;
    }
    let cancelled = false;
    const load = () => fetchOrderByToken(token).then(next => {
      if (cancelled) return;
      if (!next) setError('This tracking link is not valid.');
      else {
        setOrder(next);
        setError('');
      }
    });
    load();
    const timer = setInterval(load, 8000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [token]);

  const step = order ? TRACK_STEPS.findIndex(status => {
    if (order.fulfillment === 'pickup' && ['driver_assigned', 'out_for_delivery'].includes(status)) return false;
    return status === order.status || (order.status === 'ready_for_pickup' && status === 'ready') || (order.status === 'completed' && status === 'delivered') || (order.status === 'picked_up' && status === 'out_for_delivery');
  }) : -1;

  return <>
    <header className="page-masthead">
      <p className="label">Jhelum Direct</p>
      <h1 id="track">Order tracking</h1>
      <p>{order ? `${order.number} · ${STATUS_LABELS[order.status] || order.status}` : 'Open a secure link from your confirmation.'}</p>
    </header>
    {error && <section className="order-empty"><p>{error}</p><SpringButton as="a" className="primary-action" href="#menu">Back to the menu</SpringButton></section>}
    {order && <div className="order-layout">
      <section className="order-lines">
        <ol className="track-steps">
          {TRACK_STEPS.filter(status => order.fulfillment === 'delivery' || !['driver_assigned', 'out_for_delivery'].includes(status)).map((status, index) => (
            <li key={status} className={index <= Math.max(step, 0) ? 'is-done' : ''}>{STATUS_LABELS[status]}</li>
          ))}
        </ol>
        <h2>Items</h2>
        {(order.items || []).map((line, index) => (
          <p key={index}>{line.quantity} × {line.name}{line.variant ? ` · ${line.variant}` : ''} — {money(line.total_cents)}</p>
        ))}
      </section>
      <aside className="order-summary">
        <h2>Receipt</h2>
        <p>{order.fulfillment === 'delivery' ? 'Delivery' : 'Pickup'} · {order.customer_name}</p>
        {order.delivery_miles != null && <p>{order.delivery_miles} miles</p>}
        <div className="cart-total"><span>Total paid</span><strong>{money(order.total_cents)}</strong></div>
        <p>Questions? Call <a href={cafe.phoneHref}>{cafe.phone}</a>.</p>
      </aside>
    </div>}
    <footer className="page-footer"><Copyright /></footer>
  </>;
}
