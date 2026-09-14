import test from 'node:test';
import assert from 'node:assert/strict';
import { orderHref, parseCafeHash } from '../src/useCafeRoute.js';

test('menu and cart hashes open dedicated pages', () => {
  assert.deepEqual(parseCafeHash('#menu'), { page: 'menu', category: null, section: null, token: null });
  assert.deepEqual(parseCafeHash('#/menu/breakfast'), { page: 'menu', category: 'breakfast', section: null, token: null });
  assert.deepEqual(parseCafeHash('#cart'), { page: 'cart', category: null, section: null, token: null });
  assert.deepEqual(parseCafeHash('#order'), { page: 'cart', category: null, section: null, token: null });
  assert.deepEqual(parseCafeHash('#checkout'), { page: 'checkout', category: null, section: null, token: null });
  assert.deepEqual(parseCafeHash('#track/abc'), { page: 'track', category: null, section: null, token: 'abc' });
  assert.deepEqual(parseCafeHash('', '/admin/menu'), { page: 'admin', category: 'menu', section: null, token: null });
});

test('story and visit hashes stay on the home journey', () => {
  assert.deepEqual(parseCafeHash(''), { page: 'home', category: null, section: 'top', token: null });
  assert.deepEqual(parseCafeHash('#beginning'), { page: 'home', category: null, section: 'beginning', token: null });
  assert.deepEqual(parseCafeHash('#visit'), { page: 'home', category: null, section: 'visit', token: null });
  assert.deepEqual(parseCafeHash('#direct'), { page: 'home', category: null, section: 'direct', token: null });
});

test('order links go to the cart only when something is waiting', () => {
  assert.equal(orderHref(0), '#menu');
  assert.equal(orderHref(2), '#cart');
});
