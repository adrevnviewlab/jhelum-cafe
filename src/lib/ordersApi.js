import { CAFE } from './constants.js';
import { quoteTotals } from './pricing.js';
import { appendEvent, newToken, nextOrderNumber, readStore, writeStore } from './localStore.js';
import { invokeFunction, supabase, supabaseConfigured } from './supabase.js';

function snapshotLines(details) {
  return details.map(line => ({
    item_id: line.item.id,
    name: line.item.name,
    quantity: line.quantity,
    unit_cents: line.unitCents,
    total_cents: line.totalCents,
    variant: line.variant?.label || null,
    modifiers: line.modifiers.map(modifier => modifier.label),
  }));
}

function localCreateOrder({
  details,
  fulfillment,
  customer,
  pickupTime,
  delivery,
  quotes,
  attribution,
  paid = false,
}) {
  const id = newToken();
  const token = newToken();
  const totals = quoteTotals({
    subtotalCents: details.reduce((sum, line) => sum + line.totalCents, 0),
    taxBps: quotes.taxBps,
    tipCents: quotes.tipCents,
    deliveryFeeCents: fulfillment === 'delivery' ? quotes.deliveryFeeCents : 0,
  });
  const order = {
    id,
    number: nextOrderNumber(),
    access_token: token,
    source: 'direct',
    fulfillment,
    status: paid ? 'confirmed' : 'new',
    paid,
    customer_name: customer.name,
    customer_phone: customer.phone,
    customer_email: customer.email,
    pickup_time: pickupTime || null,
    delivery_address: delivery?.address || null,
    delivery_unit: delivery?.unit || null,
    delivery_notes: delivery?.notes || null,
    delivery_miles: delivery?.miles ?? null,
    delivery_lat: delivery?.lat ?? null,
    delivery_lng: delivery?.lng ?? null,
    driver_id: null,
    attribution: attribution || {},
    items: snapshotLines(details),
    ...totals,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  writeStore(store => ({ ...store, orders: [order, ...store.orders] }));
  appendEvent(id, paid ? 'paid' : 'created', paid ? 'Demo checkout marked paid' : 'Order created', 'customer');
  if (fulfillment === 'delivery') {
    writeStore(store => ({
      ...store,
      offers: [...store.offers, { id: newToken(), order_id: id, created_at: order.created_at, expires_at: new Date(Date.now() + 15 * 60_000).toISOString() }],
    }));
  }
  return order;
}

export async function createCheckout({
  details,
  fulfillment,
  customer,
  pickupTime,
  delivery,
  quotes,
  attribution,
  origin,
}) {
  if (details.some(line => line.item.sold_out || line.unitCents == null)) {
    throw new Error('A sold-out or unpriced item is in the cart.');
  }
  if (fulfillment === 'delivery' && !delivery?.eligible) {
    throw new Error('Delivery is not available for this address.');
  }
  try {
    return await invokeFunction('create-checkout', {
      lines: details.map(line => ({
        itemId: line.item.id,
        variantIndex: line.variantIndex,
        modifierIds: line.modifierIds,
        quantity: line.quantity,
      })),
      fulfillment,
      customer,
      pickupTime,
      delivery,
      tipCents: quotes.tipCents,
      attribution,
      successUrl: `${origin}/#track/SESSION_TOKEN`,
      cancelUrl: `${origin}/#checkout`,
    });
  } catch (error) {
    if (error.code !== 'no_functions' && error.status !== 404) throw error;
    const order = localCreateOrder({ details, fulfillment, customer, pickupTime, delivery, quotes, attribution, paid: true });
    return { demo: true, trackToken: order.access_token, orderId: order.id, number: order.number };
  }
}

export async function fetchOrderByToken(token) {
  if (supabaseConfigured) {
    const { data, error } = await supabase.from('orders').select('*, order_items(*)').eq('access_token', token).maybeSingle();
    if (!error && data) {
      const { data: events } = await supabase.from('order_events').select('*').eq('order_id', data.id).order('created_at');
      return { ...data, items: data.order_items || data.items, events: events || [] };
    }
  }
  const store = readStore();
  const order = store.orders.find(entry => entry.access_token === token);
  if (!order) return null;
  return { ...order, events: store.events.filter(event => event.order_id === order.id) };
}

export async function listOrders() {
  if (supabaseConfigured) {
    const { data, error } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }).limit(80);
    if (!error && data) return data.map(order => ({ ...order, items: order.order_items || [] }));
  }
  return readStore().orders;
}

export async function updateOrderStatus(orderId, status, actor = 'staff') {
  try {
    return await invokeFunction('update-order-status', { orderId, status, actor });
  } catch (error) {
    if (error.code !== 'no_functions' && error.status !== 404) throw error;
  }
  let updated;
  writeStore(store => {
    updated = store.orders.find(order => order.id === orderId);
    if (!updated) return store;
    updated = { ...updated, status, updated_at: new Date().toISOString() };
    return { ...store, orders: store.orders.map(order => order.id === orderId ? updated : order) };
  });
  if (!updated) throw new Error('Order not found');
  appendEvent(orderId, 'status', status, actor);
  return updated;
}

export async function listOffers() {
  if (supabaseConfigured) {
    const { data, error } = await supabase
      .from('orders')
      .select('id, number, status, fulfillment, delivery_miles, pickup_time, created_at, driver_id')
      .eq('fulfillment', 'delivery')
      .is('driver_id', null)
      .in('status', ['ready', 'ready_for_pickup', 'confirmed', 'preparing']);
    if (!error) return data || [];
  }
  const store = readStore();
  return store.orders.filter(order => order.fulfillment === 'delivery' && !order.driver_id && !['cancelled', 'delivered', 'completed', 'refunded'].includes(order.status));
}

export async function acceptOffer(orderId, driver) {
  try {
    return await invokeFunction('accept-offer', { orderId, driverId: driver.id, driverName: driver.name });
  } catch (error) {
    if (error.code !== 'no_functions' && error.status !== 404) throw error;
  }
  let accepted;
  writeStore(store => {
    const order = store.orders.find(entry => entry.id === orderId);
    if (!order || order.driver_id) return store;
    accepted = {
      ...order,
      driver_id: driver.id,
      driver_name: driver.name,
      status: 'driver_assigned',
      updated_at: new Date().toISOString(),
    };
    return { ...store, orders: store.orders.map(entry => entry.id === orderId ? accepted : entry) };
  });
  if (!accepted) throw new Error('This delivery was already accepted.');
  appendEvent(orderId, 'driver_assigned', `${driver.name} accepted`, 'driver');
  return accepted;
}

export async function fetchAssignedOrder(orderId, driverId) {
  const orders = await listOrders();
  return orders.find(order => order.id === orderId && order.driver_id === driverId) || null;
}

export function cafeNavAddress() {
  return encodeURIComponent(CAFE.address);
}
