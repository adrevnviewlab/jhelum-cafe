import { useEffect, useState } from 'react';
import Copyright from './Copyright';
import { STATUS_LABELS } from './lib/constants';
import { canManageKitchen, canManageSettings, currentProfile, signIn, signOut } from './lib/auth';
import { fetchMenuSnapshot, saveDeliveryRules, saveItemFlags, saveSettings } from './lib/menuApi';
import { listOrders, updateOrderStatus } from './lib/ordersApi';
import { subscribeStore } from './lib/localStore';
import { money } from './menuData';
import { SpringButton } from './Spring';

function Login({ onIn }) {
  const [email, setEmail] = useState('admin@jehlum.local');
  const [password, setPassword] = useState('jhelum');
  const [error, setError] = useState('');
  return (
    <form className="staff-login" onSubmit={async event => {
      event.preventDefault();
      try {
        onIn(await signIn(email, password));
      } catch (err) {
        setError(err.message);
      }
    }}>
      <h1>Kitchen sign in</h1>
      <p>Use admin@jehlum.cafe / kitchen@jehlum.cafe after Auth users are created. Local demo still accepts admin@jehlum.local.</p>
      <label>Email<input type="email" value={email} onChange={event => setEmail(event.target.value)} /></label>
      <label>Password<input type="password" value={password} onChange={event => setPassword(event.target.value)} /></label>
      {error && <p role="alert">{error}</p>}
      <SpringButton className="primary-action">Sign in</SpringButton>
    </form>
  );
}

export default function AdminBoard({ tab = 'orders' }) {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState({ items: [], settings: {}, rules: [] });
  const [notice, setNotice] = useState('');

  const reload = async () => {
    setOrders(await listOrders());
    setMenu(await fetchMenuSnapshot());
  };

  useEffect(() => {
    currentProfile().then(setProfile);
  }, []);

  useEffect(() => {
    if (!canManageKitchen(profile)) return undefined;
    reload();
    const timer = setInterval(reload, 6000);
    return () => {
      clearInterval(timer);
    };
  }, [profile]);

  useEffect(() => subscribeStore(() => { if (canManageKitchen(profile)) reload(); }), [profile]);

  if (!profile) return <section className="cafe-page"><Login onIn={setProfile} /><footer className="page-footer"><Copyright /></footer></section>;
  if (!canManageKitchen(profile)) {
    return <section className="order-empty"><p>This account cannot open the kitchen board.</p><SpringButton type="button" onClick={() => signOut().then(() => setProfile(null))}>Sign out</SpringButton></section>;
  }

  const advance = async order => {
    const next = order.status === 'ready' && order.fulfillment === 'pickup'
      ? 'ready_for_pickup'
      : order.status === 'ready' && order.fulfillment === 'delivery'
        ? 'ready'
        : order.status === 'ready_for_pickup'
          ? 'completed'
          : { new: 'confirmed', confirmed: 'preparing', preparing: 'ready' }[order.status];
    if (!next) return;
    await updateOrderStatus(order.id, next, profile.role);
    reload();
  };

  return <>
    <header className="page-masthead">
      <p className="label">Kitchen · {profile.role}</p>
      <h1 id="admin">Jhelum Direct board</h1>
      <div className="page-masthead-meta">
        <nav className="staff-nav">
          <a href="#admin/orders" aria-current={tab === 'orders' ? 'page' : undefined}>Orders</a>
          <a href="#admin/menu" aria-current={tab === 'menu' ? 'page' : undefined}>Menu 86</a>
          {canManageSettings(profile) && <a href="#admin/settings" aria-current={tab === 'settings' ? 'page' : undefined}>Settings</a>}
        </nav>
        <SpringButton type="button" className="secondary-action" onClick={() => signOut().then(() => setProfile(null))}>Sign out</SpringButton>
      </div>
    </header>

    {tab !== 'menu' && tab !== 'settings' && <section className="staff-orders">
      {orders.length === 0 && <p>No website orders yet.</p>}
      {orders.map(order => (
        <article key={order.id} className="staff-order">
          <header>
            <strong>{order.number}</strong>
            <span>{STATUS_LABELS[order.status] || order.status}</span>
            <em>{order.fulfillment} · {order.source || 'direct'}</em>
          </header>
          <p>{order.customer_name} · {order.customer_phone}</p>
          <ul>{(order.items || []).map((line, index) => <li key={index}>{line.quantity} × {line.name}</li>)}</ul>
          <p>{money(order.total_cents)}</p>
          <div className="staff-actions">
            {['new', 'confirmed', 'preparing', 'ready', 'ready_for_pickup'].includes(order.status) && <SpringButton type="button" className="primary-action" onClick={() => advance(order)}>Advance</SpringButton>}
            {!['cancelled', 'delivered', 'completed', 'refunded'].includes(order.status) && <SpringButton type="button" className="secondary-action" onClick={() => updateOrderStatus(order.id, 'cancelled', profile.role).then(reload)}>Cancel</SpringButton>}
            {order.status !== 'needs_attention' && <button type="button" className="clear-order" onClick={() => updateOrderStatus(order.id, 'needs_attention', profile.role).then(reload)}>Needs attention</button>}
          </div>
        </article>
      ))}
    </section>}

    {tab === 'menu' && <section className="staff-menu">
      <p>Mark items sold out. Price edits are in cents.</p>
      {menu.items.map(item => (
        <div className="staff-item" key={item.id}>
          <strong>{item.name}</strong>
          <label>Price (cents)
            <input type="number" defaultValue={item.cents ?? ''} onBlur={event => {
              const cents = event.target.value === '' ? null : Number(event.target.value);
              saveItemFlags(item.id, { cents }).then(() => { setNotice('Saved'); menu.refresh?.(); });
            }} />
          </label>
          <label className="choice">
            <input type="checkbox" checked={Boolean(item.sold_out)} onChange={event => saveItemFlags(item.id, { sold_out: event.target.checked }).then(() => { setNotice('Saved'); reload(); })} />
            Sold out
          </label>
        </div>
      ))}
      {notice && <p role="status">{notice}</p>}
    </section>}

    {tab === 'settings' && canManageSettings(profile) && <SettingsForm settings={menu.settings} rules={menu.rules} onSave={reload} />}
    <footer className="page-footer"><Copyright /></footer>
  </>;
}

function SettingsForm({ settings, rules, onSave }) {
  const [tax, setTax] = useState(settings.tax_bps ?? 8875);
  const [rows, setRows] = useState(rules.length ? rules : []);
  return (
    <form className="staff-settings" onSubmit={async event => {
      event.preventDefault();
      await saveSettings({ tax_bps: Number(tax) });
      await saveDeliveryRules(rows.map((row, index) => ({
        id: row.id || `rule-${index}`,
        min_miles: Number(row.min_miles),
        max_miles: Number(row.max_miles),
        fee_cents: Number(row.fee_cents),
        label: row.label || `Zone ${index + 1}`,
      })));
      onSave();
    }}>
      <h2>Delivery & tax</h2>
      <label>Tax rate stored as 8875 = 8.875%<input type="number" value={tax} onChange={event => setTax(event.target.value)} /></label>
      {rows.map((row, index) => (
        <fieldset key={row.id || index}>
          <legend>Zone {index + 1}</legend>
          <label>Min miles<input type="number" step="0.1" value={row.min_miles} onChange={event => setRows(current => current.map((entry, i) => i === index ? { ...entry, min_miles: event.target.value } : entry))} /></label>
          <label>Max miles<input type="number" step="0.1" value={row.max_miles} onChange={event => setRows(current => current.map((entry, i) => i === index ? { ...entry, max_miles: event.target.value } : entry))} /></label>
          <label>Fee cents<input type="number" value={row.fee_cents} onChange={event => setRows(current => current.map((entry, i) => i === index ? { ...entry, fee_cents: event.target.value } : entry))} /></label>
        </fieldset>
      ))}
      <SpringButton type="button" className="secondary-action" onClick={() => setRows(current => [...current, { min_miles: 7, max_miles: 9, fee_cents: 799, label: 'New zone' }])}>Add zone</SpringButton>
      <SpringButton className="primary-action">Save settings</SpringButton>
    </form>
  );
}
