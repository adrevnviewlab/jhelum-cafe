import test from 'node:test';
import assert from 'node:assert/strict';
import { quoteTotals, tipFromPercent, canSellOnline } from '../src/lib/pricing.js';

test('NYC tax basis points apply to food subtotal only', () => {
  const quote = quoteTotals({ subtotalCents: 1000, taxBps: 8875, tipCents: 150, deliveryFeeCents: 0 });
  assert.equal(quote.taxCents, 89);
  assert.equal(quote.totalCents, 1239);
});

test('tip percent rounds to cents', () => {
  assert.equal(tipFromPercent(699, 15), 105);
  assert.equal(tipFromPercent(699, 0), 0);
});

test('unpriced and sold-out items cannot sell online', () => {
  assert.equal(canSellOnline({ cents: null }), false);
  assert.equal(canSellOnline({ cents: 599, sold_out: true }), false);
  assert.equal(canSellOnline({ cents: 599, sold_out: false }), true);
});
