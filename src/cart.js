import { itemPrice, menuItems, money } from './menuData.js';

const MAX_LINE_QUANTITY = 20;

export function normalizeModifierIds(ids = []) {
  return [...new Set(ids)].sort();
}

export function cartLineKey(itemId, variantIndex = 0, modifierIds = []) {
  return `${itemId}:${variantIndex}:${normalizeModifierIds(modifierIds).join(',')}`;
}

export function createCartLine(itemId, variantIndex = 0, modifierIds = [], quantity = 1) {
  return {
    key: cartLineKey(itemId, variantIndex, modifierIds),
    itemId,
    variantIndex,
    modifierIds: normalizeModifierIds(modifierIds),
    quantity: Math.min(MAX_LINE_QUANTITY, Math.max(1, Math.round(Number(quantity) || 1))),
  };
}

export function addCartLine(lines, nextLine) {
  const line = createCartLine(nextLine.itemId, nextLine.variantIndex, nextLine.modifierIds, nextLine.quantity);
  const existing = lines.find(entry => entry.key === line.key);
  if (!existing) return [...lines, line];
  return lines.map(entry => entry.key === line.key
    ? { ...entry, quantity: Math.min(MAX_LINE_QUANTITY, entry.quantity + line.quantity) }
    : entry);
}

export function updateCartLine(lines, key, quantity) {
  const safeQuantity = Math.min(MAX_LINE_QUANTITY, Math.max(0, Math.round(Number(quantity) || 0)));
  if (safeQuantity === 0) return lines.filter(line => line.key !== key);
  return lines.map(line => line.key === key ? { ...line, quantity: safeQuantity } : line);
}

export function getCartLineDetails(line) {
  const item = menuItems.find(entry => entry.id === line.itemId);
  if (!item) return null;
  const variantIndex = item.variants?.[line.variantIndex] ? line.variantIndex : 0;
  const modifierIds = normalizeModifierIds(line.modifierIds)
    .filter(id => item.modifiers.some(modifier => modifier.id === id));
  const unitCents = itemPrice(item, variantIndex, modifierIds);
  if (unitCents == null) return null;
  return {
    ...line,
    item,
    variantIndex,
    variant: item.variants?.[variantIndex],
    modifiers: item.modifiers.filter(modifier => modifierIds.includes(modifier.id)),
    unitCents,
    totalCents: unitCents * line.quantity,
  };
}

export function cartTotals(lines) {
  const details = lines.map(getCartLineDetails).filter(Boolean);
  return {
    details,
    itemCount: details.reduce((sum, line) => sum + line.quantity, 0),
    subtotalCents: details.reduce((sum, line) => sum + line.totalCents, 0),
  };
}

export function orderSummary(lines, pickupTime = '') {
  const { details, subtotalCents } = cartTotals(lines);
  const rows = details.map(line => {
    const choices = [line.variant?.label, ...line.modifiers.map(modifier => modifier.label)].filter(Boolean);
    return `${line.quantity} × ${line.item.name}${choices.length ? ` (${choices.join(', ')})` : ''} — ${money(line.totalCents)}`;
  });
  return [
    'Jehlum Cafe pickup request',
    pickupTime ? `Requested time: ${pickupTime}` : 'Pickup time: please confirm by phone',
    '',
    ...rows,
    '',
    `Food subtotal: ${money(subtotalCents)}`,
    'Please confirm availability, pickup time, tax and final total.',
  ].join('\n');
}

const pickupClock = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  hourCycle: 'h23',
  hour: '2-digit',
  minute: '2-digit',
});

export function pickupSlots(now = new Date()) {
  const parts = Object.fromEntries(pickupClock.formatToParts(now).map(part => [part.type, part.value]));
  const start = Math.max(600, Math.ceil((Number(parts.hour) * 60 + Number(parts.minute) + 30) / 15) * 15);
  return Array.from({ length: Math.max(0, Math.floor((1365 - start) / 15) + 1) }, (_, index) => {
    const minutes = start + index * 15;
    const hour = Math.floor(minutes / 60);
    const minute = String(minutes % 60).padStart(2, '0');
    return `${hour % 12 || 12}:${minute} ${hour < 12 ? 'AM' : 'PM'}`;
  });
}
