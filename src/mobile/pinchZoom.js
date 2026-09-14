export const PINCH_SCALE_THRESHOLD = 1.01;

export function readVisualViewport(viewport, fallback = {}) {
  return {
    width: viewport?.width ?? fallback.innerWidth ?? 0,
    height: viewport?.height ?? fallback.innerHeight ?? 0,
    offsetLeft: viewport?.offsetLeft ?? 0,
    offsetTop: viewport?.offsetTop ?? 0,
    scale: viewport?.scale ?? 1,
  };
}

export function pinchZoomState(viewport, fallback) {
  const metrics = readVisualViewport(viewport, fallback);
  return { ...metrics, pinched: metrics.scale > PINCH_SCALE_THRESHOLD };
}

export function applyPinchZoomDocument(doc, state) {
  const root = doc.documentElement;
  root.classList.toggle('is-pinched', Boolean(state.pinched));
  root.style.setProperty('--vv-width', `${state.width}px`);
  root.style.setProperty('--vv-height', `${state.height}px`);
  root.style.setProperty('--vv-offset-left', `${state.offsetLeft}px`);
  root.style.setProperty('--vv-offset-top', `${state.offsetTop}px`);
  root.style.setProperty('--vv-scale', String(state.scale));
  if (state.pinched) root.dataset.zoom = 'pinched';
  else delete root.dataset.zoom;
  return root;
}

export function detectTouchScreen(matchMedia) {
  if (typeof matchMedia !== 'function') return false;
  return matchMedia('(pointer: coarse)').matches || matchMedia('(hover: none) and (pointer: coarse)').matches;
}

export function detectAppleTouch(userAgent = '', maxTouchPoints = 0, platform = '') {
  const ua = String(userAgent);
  const ios = /iP(ad|hone|od)/.test(ua) || (platform === 'MacIntel' && maxTouchPoints > 1);
  const safari = /Safari/i.test(ua) && !/Chrome|Chromium|CriOS|FxiOS|EdgiOS|Android/i.test(ua);
  return { ios, safari, webkitTouch: ios || safari };
}

export function freezeLayoutViewport(state, lastLayout = {}) {
  if (state.pinched && lastLayout.width && lastLayout.height) return lastLayout;
  return { width: state.width, height: state.height };
}

export function applyDeviceDocument(doc, { touch, apple }) {
  const root = doc.documentElement;
  root.classList.toggle('is-touch', Boolean(touch));
  root.classList.toggle('is-ios', Boolean(apple.ios));
  root.classList.toggle('is-safari', Boolean(apple.safari));
  return root;
}
