const EARTH_MILES = 3958.8;

export function haversineMiles(from, to) {
  const toRad = value => (Number(value) * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_MILES * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function applyDeliveryRules(miles, rules = []) {
  const distance = Number(miles);
  if (!Number.isFinite(distance) || distance < 0) {
    return { eligible: false, fee_cents: null, rule: null, miles: null, reason: 'invalid_distance' };
  }
  const match = [...rules]
    .sort((a, b) => a.min_miles - b.min_miles)
    .find(rule => distance >= Number(rule.min_miles) && distance <= Number(rule.max_miles));
  if (!match) {
    return { eligible: false, fee_cents: null, rule: null, miles: Number(distance.toFixed(2)), reason: 'outside_zone' };
  }
  return {
    eligible: true,
    fee_cents: match.fee_cents,
    rule: match,
    miles: Number(distance.toFixed(2)),
    reason: match.fee_cents === 0 ? 'free' : 'paid',
  };
}

export function quoteFromCoordinates(restaurant, customer, rules) {
  const miles = haversineMiles(restaurant, customer);
  return applyDeliveryRules(miles, rules);
}
