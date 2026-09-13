import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addCartLine,
  cartLineKey,
  cartTotals,
  createCartLine,
  orderSummary,
  updateCartLine,
} from '../src/cart.js';

test('equivalent customizations merge into one cart line', () => {
  const first = createCartLine('crepes', 0, ['extra-strawberry', 'extra-banana'], 1);
  const second = createCartLine('crepes', 0, ['extra-banana', 'extra-strawberry'], 2);
  const lines = addCartLine(addCartLine([], first), second);

  assert.equal(lines.length, 1);
  assert.equal(lines[0].quantity, 3);
  assert.equal(lines[0].key, cartLineKey('crepes', 0, ['extra-banana', 'extra-strawberry']));
});

test('variants remain distinct and totals include modifiers per item', () => {
  const lines = [
    createCartLine('coffee', 0, [], 1),
    createCartLine('coffee', 3, [], 1),
    createCartLine('mango', 0, ['protein'], 2),
  ];
  const totals = cartTotals(lines);

  assert.equal(totals.details.length, 3);
  assert.equal(totals.itemCount, 4);
  assert.equal(totals.subtotalCents, 3248);
});

test('quantity updates are bounded and zero removes a line', () => {
  const line = createCartLine('brooklyn');
  assert.equal(updateCartLine([line], line.key, 100)[0].quantity, 20);
  assert.deepEqual(updateCartLine([line], line.key, 0), []);
});

test('unpriced and stale products are excluded from order totals', () => {
  const totals = cartTotals([
    createCartLine('rasmalai'),
    createCartLine('missing-item'),
    createCartLine('brooklyn'),
  ]);

  assert.equal(totals.itemCount, 1);
  assert.equal(totals.subtotalCents, 699);
});

test('order summary is customer-readable and includes the confirmation caveat', () => {
  const summary = orderSummary([
    createCartLine('crepes', 0, ['extra-banana'], 2),
  ], '12:30');

  assert.match(summary, /Requested time: 12:30/);
  assert.match(summary, /2 × Crepes \(Extra banana\) — \$23\.98/);
  assert.match(summary, /confirm availability, pickup time, tax and final total/i);
});
