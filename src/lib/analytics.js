function push(event, params = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
  if (typeof window.gtag === 'function') window.gtag('event', event, params);
}

export function track(event, params) {
  push(event, params);
}

export function installAnalytics(gtmId) {
  if (!gtmId || typeof document === 'undefined' || document.getElementById('jhelum-gtm')) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  const script = document.createElement('script');
  script.id = 'jhelum-gtm';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
  document.head.appendChild(script);
}
