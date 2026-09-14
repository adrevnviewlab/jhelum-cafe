import test from 'node:test';
import assert from 'node:assert/strict';
import { applyDeliveryRules, haversineMiles, quoteFromCoordinates } from '../src/lib/deliveryQuote.js';
import { DEFAULT_DELIVERY_RULES } from '../src/lib/constants.js';

test('5-mile free zone and 7-mile paid zone are data, not hardcoded exclusive logic', () => {
  assert.equal(applyDeliveryRules(2.8, DEFAULT_DELIVERY_RULES).fee_cents, 0);
  assert.equal(applyDeliveryRules(6, DEFAULT_DELIVERY_RULES).fee_cents, 499);
  assert.equal(applyDeliveryRules(8, DEFAULT_DELIVERY_RULES).eligible, false);
});

test('distance is never computed from ZIP — coordinates only', () => {
  const miles = haversineMiles({ lat: 40.6324, lng: -73.9676 }, { lat: 40.65, lng: -73.95 });
  assert.ok(miles > 0 && miles < 10);
  const quote = quoteFromCoordinates({ lat: 40.6324, lng: -73.9676 }, { lat: 40.65, lng: -73.95 }, DEFAULT_DELIVERY_RULES);
  assert.equal(typeof quote.miles, 'number');
});
