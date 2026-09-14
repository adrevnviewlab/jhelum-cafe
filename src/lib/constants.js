export const CAFE = {
  name: 'Jehlum Cafe',
  product: 'Jhelum Direct',
  address: '937 Coney Island Ave, Brooklyn, NY 11230',
  phone: '929-234-3401',
  phoneHref: 'tel:+19292343401',
  hoursLabel: 'Open daily · 10 AM – 11 PM',
  lat: 40.6324,
  lng: -73.9676,
  timezone: 'America/New_York',
};

export const DEFAULT_TAX_BPS = 8875;
export const FEATURED_ITEM_IDS = ['brooklyn', 'samosa-chaat', 'waffles'];

export const ORDER_STATUSES = [
  'new',
  'confirmed',
  'preparing',
  'ready',
  'ready_for_pickup',
  'driver_assigned',
  'out_for_delivery',
  'picked_up',
  'delivered',
  'completed',
  'cancelled',
  'refunded',
  'failed',
  'needs_attention',
];

export const KITCHEN_NEXT = {
  new: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
};

export const DRIVER_NEXT = {
  driver_assigned: 'picked_up',
  picked_up: 'out_for_delivery',
  out_for_delivery: 'delivered',
};

export const STATUS_LABELS = {
  new: 'New',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  ready_for_pickup: 'Ready for pickup',
  driver_assigned: 'Driver assigned',
  out_for_delivery: 'Out for delivery',
  picked_up: 'Picked up',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  failed: 'Failed',
  needs_attention: 'Needs attention',
};

export const TRACK_STEPS = [
  'new',
  'confirmed',
  'preparing',
  'ready',
  'driver_assigned',
  'out_for_delivery',
  'delivered',
];

export const DEFAULT_DELIVERY_RULES = [
  { id: 'free-5', min_miles: 0, max_miles: 5, fee_cents: 0, label: 'Free local delivery' },
  { id: 'paid-7', min_miles: 5, max_miles: 7, fee_cents: 499, label: 'Extended delivery' },
];

export const CREPE_TOPPINGS = 'Included topping choices: strawberry, banana, Nutella, pistachio, sprinkles, almonds, dates, walnuts & coconut flakes.';
