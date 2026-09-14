import { useEffect } from 'react';
import { CAFE } from './lib/constants';

export default function SeoJsonLd({ settings, sections }) {
  useEffect(() => {
    const existing = document.getElementById('jhelum-jsonld');
    const restaurant = {
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      name: CAFE.name,
      description: 'A taste of Jhelum in Brooklyn. Pakistani cafe breakfast, desi chaat, chai. Order direct for pickup or qualifying local delivery.',
      telephone: settings?.phone || CAFE.phone,
      address: {
        '@type': 'PostalAddress',
        streetAddress: '937 Coney Island Ave',
        addressLocality: 'Brooklyn',
        addressRegion: 'NY',
        postalCode: '11230',
        addressCountry: 'US',
      },
      openingHours: 'Mo-Su 10:00-23:00',
      servesCuisine: ['Pakistani', 'Punjabi', 'Cafe'],
      url: window.location.origin,
      hasMenu: `${window.location.origin}/#menu`,
      acceptsReservations: false,
      areaServed: 'Brooklyn, NY',
    };
    const menu = {
      '@context': 'https://schema.org',
      '@type': 'Menu',
      name: 'Jehlum Cafe menu',
      hasMenuSection: (sections || []).map(section => ({
        '@type': 'MenuSection',
        name: section.title,
        hasMenuItem: section.items.map(item => ({
          '@type': 'MenuItem',
          name: item.name,
          description: item.description || undefined,
          offers: item.cents == null ? undefined : { '@type': 'Offer', price: (item.cents / 100).toFixed(2), priceCurrency: 'USD' },
        })),
      })),
    };
    const script = existing || document.createElement('script');
    script.id = 'jhelum-jsonld';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify([restaurant, menu]);
    if (!existing) document.head.appendChild(script);
  }, [settings, sections]);
  return null;
}
