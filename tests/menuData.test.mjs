import test from 'node:test';
import assert from 'node:assert/strict';
import { filterMenu, itemPrice, menuItems, menuSections } from '../src/menuData.js';

const find = id => menuItems.find(item => item.id === id);

test('each category returns its own items and all includes every item', () => {
  for (const section of menuSections) {
    assert.deepEqual(filterMenu(section.id).flatMap(group => group.items.map(item => item.id)), section.items.map(item => item.id));
  }
  assert.equal(filterMenu('all').flatMap(section => section.items).length, 47);
});

test('search is case insensitive across categories and supports empty results', () => {
  assert.equal(filterMenu('chai', '  WAFFLES  ')[0].items[0].id, 'waffles');
  assert.deepEqual(filterMenu('all', 'no-such-dish'), []);
  assert.equal(filterMenu('breakfast', '   ')[0].id, 'breakfast');
});

test('egg preparation is a total price, not another full-price add-on', () => {
  for (const id of ['pancake', 'waffles']) {
    assert.equal(itemPrice(find(id)), 799);
    assert.equal(itemPrice(find(`${id}-eggs`)), 1099);
    assert.equal(find(id).variants, undefined);
    assert.equal(find(`${id}-eggs`).variants, undefined);
  }
});

test('crepe extras add per item and do not double count repeated ids', () => {
  assert.equal(itemPrice(find('crepes'), 0, ['extra-banana']), 1199);
  assert.equal(itemPrice(find('crepes'), 0, ['extra-banana', 'extra-strawberry']) * 2, 2798);
  assert.equal(itemPrice(find('crepes'), 0, ['extra-banana', 'extra-banana']), 1199);
});

test('protein applies to each smoothie; stale modifiers cannot affect a new item', () => {
  for (const item of menuSections.find(section => section.id === 'smoothies').items) {
    assert.equal(itemPrice(find(item.id), 0, ['protein']), 1299);
  }
  assert.equal(itemPrice(find('brooklyn'), 0, ['protein']), 699);
});

test('unlisted prices stay unknown and all beverage variants retain their prices', () => {
  assert.equal(itemPrice(find('rasmalai')), null);
  assert.equal(itemPrice(find('masala')), null);
  assert.deepEqual(find('coffee').variants.map((_, index) => itemPrice(find('coffee'), index)), [250, 300, 350, 400]);
});
