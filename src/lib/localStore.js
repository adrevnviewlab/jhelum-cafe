import { CAFE, DEFAULT_DELIVERY_RULES, DEFAULT_TAX_BPS } from './constants.js';

const KEY = 'jehlum-direct-store-v1';

const empty = () => ({
  itemFlags: {},
  settings: {
    address: CAFE.address,
    phone: CAFE.phone,
    hours_label: CAFE.hoursLabel,
    lat: CAFE.lat,
    lng: CAFE.lng,
    tax_bps: DEFAULT_TAX_BPS,
  },
  rules: DEFAULT_DELIVERY_RULES.map(rule => ({ ...rule })),
  orders: [],
  events: [],
  offers: [],
  nextNumber: 1001,
  demoUser: null,
});

export function readStore() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return saved && typeof saved === 'object' ? { ...empty(), ...saved } : empty();
  } catch {
    return empty();
  }
}

export function writeStore(next) {
  const value = typeof next === 'function' ? next(readStore()) : next;
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('jhelum-store', { detail: value }));
  } catch {
    // Demo kitchen still works in memory for this tab.
  }
  return value;
}

export function patchStore(partial) {
  return writeStore(current => ({ ...current, ...partial }));
}

export function subscribeStore(listener) {
  const onStorage = event => {
    if (event.key === KEY) listener(readStore());
  };
  const onCustom = event => listener(event.detail || readStore());
  window.addEventListener('storage', onStorage);
  window.addEventListener('jhelum-store', onCustom);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener('jhelum-store', onCustom);
  };
}

export function nextOrderNumber() {
  const store = readStore();
  const number = store.nextNumber;
  writeStore({ ...store, nextNumber: number + 1 });
  return `JC-${number}`;
}

export function newToken() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID().replace(/-/g, '');
  return `t${Date.now()}${Math.random().toString(36).slice(2, 12)}`;
}

export function appendEvent(orderId, type, note, actor = 'system') {
  const event = {
    id: newToken(),
    order_id: orderId,
    type,
    note: note || '',
    actor,
    created_at: new Date().toISOString(),
  };
  writeStore(store => ({ ...store, events: [...store.events, event] }));
  return event;
}
