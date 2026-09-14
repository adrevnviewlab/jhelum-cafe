import { useEffect, useState } from 'react';

const HOME_SECTIONS = new Set(['', 'top', 'beginning', 'visit', 'direct']);

function fromParts(head = '', tail = '') {
  if (head === 'menu') return { page: 'menu', category: tail || null, section: null, token: null };
  if (head === 'cart' || head === 'order') return { page: 'cart', category: null, section: null, token: null };
  if (head === 'checkout') return { page: 'checkout', category: null, section: null, token: null };
  if (head === 'admin') return { page: 'admin', category: tail || 'orders', section: null, token: null };
  if (head === 'track') return { page: 'track', category: null, section: null, token: tail || null };
  if (head === 'driver') return { page: 'driver', category: tail || null, section: null, token: null };
  if (head === 'direct') return { page: 'home', category: null, section: 'direct', token: null };
  return { page: 'home', category: null, section: HOME_SECTIONS.has(head) ? head || 'top' : 'top', token: null };
}

export function parseCafeHash(hash = '', pathname = '/') {
  const path = (pathname || '/').replace(/\/+$/, '') || '/';
  if (path !== '/' && !path.endsWith('.html')) {
    const [, head = '', tail = ''] = path.split('/');
    if (['menu', 'cart', 'order', 'checkout', 'admin', 'track', 'driver', 'direct'].includes(head)) {
      return fromParts(head, tail);
    }
  }
  const raw = decodeURIComponent((hash || '').replace(/^#\/?/, '')).split('?')[0];
  const [head = '', tail] = raw.split('/');
  return fromParts(head, tail);
}

export const orderHref = itemCount => (itemCount ? '#cart' : '#menu');
export const checkoutHref = itemCount => (itemCount ? '#checkout' : '#menu');
export const directHref = itemCount => (itemCount ? '#checkout' : '#menu');

export default function useCafeRoute() {
  const [location, setLocation] = useState(() => ({ hash: window.location.hash, path: window.location.pathname }));
  useEffect(() => {
    const sync = () => setLocation({ hash: window.location.hash, path: window.location.pathname });
    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', sync);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('popstate', sync);
    };
  }, []);
  return parseCafeHash(location.hash, location.path);
}
