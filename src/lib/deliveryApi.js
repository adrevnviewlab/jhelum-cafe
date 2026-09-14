import { CAFE } from './constants.js';
import { quoteFromCoordinates } from './deliveryQuote.js';
import { fetchMenuSnapshot } from './menuApi.js';
import { invokeFunction } from './supabase.js';

export async function quoteDelivery({ address, placeId, lat, lng }) {
  try {
    return await invokeFunction('quote-delivery', { address, placeId, lat, lng });
  } catch (error) {
    if (error.code !== 'no_functions' && error.status !== 404 && !error.message?.includes('not configured')) {
      throw error;
    }
  }
  const { settings, rules } = await fetchMenuSnapshot();
  if (lat == null || lng == null) {
    return {
      eligible: false,
      miles: null,
      fee_cents: null,
      reason: 'need_coordinates',
      message: 'Choose an address from the suggestions, or set a Google Maps key for route distance.',
    };
  }
  const quote = quoteFromCoordinates(
    { lat: settings.lat ?? CAFE.lat, lng: settings.lng ?? CAFE.lng },
    { lat, lng },
    rules,
  );
  return {
    ...quote,
    address,
    lat,
    lng,
    method: 'haversine_fallback',
    message: quote.eligible
      ? quote.fee_cents === 0
        ? `You qualify for FREE local delivery (${quote.miles} miles).`
        : `${quote.miles} miles away. Delivery is ${((quote.fee_cents || 0) / 100).toFixed(2)}.`
      : `${quote.miles ?? 'This address'} is outside our delivery area.`,
  };
}

export function mapsBrowserKey() {
  return import.meta.env.VITE_GOOGLE_MAPS_BROWSER_KEY || '';
}
