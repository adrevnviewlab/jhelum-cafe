const STORAGE_KEY = 'jehlum-direct-attribution';

export function captureAttribution(search = '') {
  const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
  const next = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'src', 'qr']) {
    const value = params.get(key);
    if (value) next[key] = value;
  }
  if (!Object.keys(next).length) return readAttribution();
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readAttribution(), ...next, capturedAt: new Date().toISOString() }));
  } catch {
    // Attribution is optional when storage is blocked.
  }
  return readAttribution();
}

export function readAttribution() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}
