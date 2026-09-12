export const cafe = { address: '937 Coney Island Ave, Brooklyn, NY 11230', phone: '929-234-3401', phoneHref: 'tel:+19292343401' };
const item = (id, name, cents, description = '', extra = {}) => ({ id, name, cents, description, ...extra });
const drinks = (small, large, icedSmall, icedLarge) => [
  { label: 'Hot · Small', cents: small }, { label: 'Hot · Large', cents: large },
  { label: 'Iced · Small', cents: icedSmall }, { label: 'Iced · Large', cents: icedLarge },
];
export const menuSections = [
  { id: 'breakfast', title: 'Breakfast & brunch', subtitle: 'Your morning, made generous.', note: 'Choose a bagel, roll, wrap or croissant for your sandwich.', items: [
    item('brooklyn', 'Brooklyn Classic', 699, 'Scrambled eggs, turkey bacon, American cheese.'),
    item('avocado', 'Love N Avocado', 799, 'Fried eggs, turkey bacon, avocado, American cheese.'),
    item('dawn', 'Crack of Dawn', 599, 'Plain cream cheese with turkey bacon.'),
    item('cream', 'Bagel with Cream Cheese', 599, 'Plain cream cheese.'),
    item('scallion', 'Scallion Cream Cheese', 499),
    item('jelly', 'Bagel with Butter & Jelly', 299),
    item('balt', 'B.A.L.T', 799, 'Turkey bacon, avocado, lettuce & tomato.'),
    item('tuna', 'Tuna Melt', 999, 'Tuna salad, cheddar cheese, lettuce & tomato.'),
    item('smash', 'Smash Burger', 799, 'Beef.'),
    item('pancake', 'Pancake', 799, '', { variants: [{ label: 'Classic', cents: 799 }, { label: 'With 2 eggs', cents: 1099 }] }),
    item('waffles', 'Waffles', 799, '', { variants: [{ label: 'Classic', cents: 799 }, { label: 'With 2 eggs', cents: 1099 }] }),
    item('toast', 'French Toast', 799, 'With maple syrup & whip cream.'),
    item('crepes', 'Crepes', 999, 'Choice of 3 toppings & 1 scoop of ice cream.'),
  ] },
  { id: 'coffee', title: 'Coffee & tea bar', subtitle: 'A cup for every kind of day.', note: 'Coffee options listed: French vanilla, caramel mocha, espresso, latte and cappuccino. Ask the cafe about any additional charges.', items: [
    item('coffee', 'Black Coffee', 250, '', { variants: drinks(250,300,350,400) }),
    item('tea', 'Tea', 299, '', { variants: drinks(299,399,399,499) }),
    item('lipton', 'Lipton Tea', 299, '', { variants: drinks(299,399,399,499) }),
    item('latte', 'Latte', 299, 'Matcha, caramel, mocha, French vanilla or hot chocolate.', { variants: drinks(299,399,399,499) }),
  ] },
  { id: 'desi', title: 'Desi chaska', subtitle: 'A little spice. A taste of home.', items: [
    item('samosa-chaat', 'Samosa Chaat', 599), item('chana', 'Spicy Chana Chaat', 599),
    item('shami', 'Anda Shami Burger', 799), item('fries', 'Masala Fries', 499),
    item('gol', 'Gol Gappay', 599, '6 pieces.'), item('samosa', 'Samosa', 200),
    item('pakora', 'Pakora', 799, '', { unit: 'per lb' }),
    item('kheer', 'Kheer', 200, '', { unit: 'per piece' }), item('rasmalai', 'Rasmalai', null),
  ] },
  { id: 'chai', title: 'Chai', subtitle: 'Stay a little longer.', note: 'Chai prices are not listed on the printed menu. Please ask the cafe.', items: [
    item('adeni', 'Adeni Tea', null), item('cardamom', 'Special Cardamom Chai', null),
    item('masala', 'Masala Chai', null), item('karak', 'Karak Chai (Taiz Patti)', null),
    item('doodh', 'Special Doodh Pati Chai', null),
  ] },
  { id: 'smoothies', title: 'Smoothies', subtitle: 'Fruit, blended fresh.', note: 'Add protein +$3.00.', items: [
    item('nutty', 'Nutty Professor', 999, 'Natural peanut butter, honey, cinnamon, oats & oat milk.'),
    item('banana', 'Banana Nut', 999, 'Banana, cinnamon, natural peanut butter & almond milk.'),
    item('berry', 'Wild Berry', 999, 'Strawberry, raspberry, blueberry & vanilla yogurt.'),
    item('strawberry', 'Strawberry Banana', 999, 'Strawberry, banana & vanilla yogurt.'),
    item('mango', 'Mango Magic', 999, 'Mango, peach, banana & orange juice.'),
  ] },
  { id: 'juices', title: 'Fresh organic juices', subtitle: 'A brighter start.', items: [
    item('detox', 'Green Detox', 999, 'Green apple, cucumber, celery, ginger & lemon.'),
    item('beet', 'Heart Beet', 999, 'Beet, carrot, lemon & apple.'),
    item('tropical', 'Tropical Weight Loss', 999, 'Pineapple, carrot, ginger & lemon.'),
    item('orange', 'Orange Juice', 999), item('custom', 'Make Your Own', 999, 'Choose up to 4 ingredients.'),
  ] },
  { id: 'bakery', title: 'Something sweet', subtitle: 'A small pleasure, with your coffee.', items: [
    item('muffin', 'Muffin', 300), item('danish', 'Danish', 300),
    item('cinnamon', 'Cinnamon Bun', 300), item('cookie', 'Chocolate Chip Cookie', 300),
  ] },
];
export const menuItems = menuSections.flatMap(section => section.items);
export const money = cents => cents == null ? 'Ask the cafe' : `$${(cents / 100).toFixed(2)}`;
export const crepeToppings = 'Strawberry, banana, Nutella, pistachio, sprinkles, almonds, dates, walnuts & coconut flakes. Extras: banana +$2, strawberry +$2.';
