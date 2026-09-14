const KEY = 'jehlum-direct-fulfillment';
const QUOTE_KEY = 'jehlum-direct-delivery-quote';

export function getFulfillment() {
  try {
    return sessionStorage.getItem(KEY) === 'delivery' ? 'delivery' : 'pickup';
  } catch {
    return 'pickup';
  }
}

export function setFulfillment(mode) {
  const next = mode === 'delivery' ? 'delivery' : 'pickup';
  try {
    sessionStorage.setItem(KEY, next);
  } catch {
    // Checkout can still be completed in-memory for this page.
  }
  return next;
}

export function getDeliveryQuote() {
  try {
    return JSON.parse(sessionStorage.getItem(QUOTE_KEY) || 'null');
  } catch {
    return null;
  }
}

export function setDeliveryQuote(quote) {
  try {
    if (quote) sessionStorage.setItem(QUOTE_KEY, JSON.stringify(quote));
    else sessionStorage.removeItem(QUOTE_KEY);
  } catch {
    // Distance is revalidated server-side at checkout.
  }
  return quote;
}
