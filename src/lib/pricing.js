import { itemPrice } from '../menuData.js';
import { DEFAULT_TAX_BPS } from './constants.js';

export function lineUnitCents(item, variantIndex = 0, modifierIds = []) {
  return itemPrice(item, variantIndex, modifierIds);
}

export function quoteTotals({
  subtotalCents = 0,
  taxBps = DEFAULT_TAX_BPS,
  tipCents = 0,
  deliveryFeeCents = 0,
} = {}) {
  const safeSubtotal = Math.max(0, Math.round(Number(subtotalCents) || 0));
  const safeTaxBps = Math.max(0, Math.round(Number(taxBps) || 0));
  const safeTip = Math.max(0, Math.round(Number(tipCents) || 0));
  const safeDelivery = Math.max(0, Math.round(Number(deliveryFeeCents) || 0));
  const taxCents = Math.round(safeSubtotal * safeTaxBps / 100_000);
  return {
    subtotalCents: safeSubtotal,
    taxBps: safeTaxBps,
    taxCents,
    tipCents: safeTip,
    deliveryFeeCents: safeDelivery,
    totalCents: safeSubtotal + taxCents + safeTip + safeDelivery,
  };
}

export function tipFromPercent(subtotalCents, percent) {
  return Math.round(Math.max(0, subtotalCents) * Math.max(0, percent) / 100);
}

export function canSellOnline(item) {
  return Boolean(item) && item.cents != null && !item.sold_out && (!item.variants || item.variants.some(variant => variant.cents != null));
}
