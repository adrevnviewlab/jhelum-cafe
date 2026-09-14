import { applyDeviceDocument, applyPinchZoomDocument, detectAppleTouch, detectTouchScreen, freezeLayoutViewport, pinchZoomState } from './mobile/pinchZoom.js';

const root = document.documentElement;
let lastLayout = { width: 0, height: 0 };

function applyViewportFit() {
  const state = pinchZoomState(window.visualViewport, window);
  const layout = freezeLayoutViewport(state, lastLayout);
  if (!state.pinched) lastLayout = { width: Math.round(layout.width), height: Math.round(layout.height) };

  applyPinchZoomDocument(document, state);
  applyDeviceDocument(document, {
    touch: detectTouchScreen(query => window.matchMedia(query)),
    apple: detectAppleTouch(navigator.userAgent, navigator.maxTouchPoints, navigator.platform),
  });

  const width = state.pinched ? layout.width : (document.documentElement.clientWidth || layout.width);
  const height = layout.height;
  root.style.setProperty('--vvw', `${Math.round(width)}px`);
  root.style.setProperty('--vvh', `${Math.round(height)}px`);
  root.dataset.pointer = detectTouchScreen(query => window.matchMedia(query)) ? 'coarse' : 'fine';
  root.dataset.hover = window.matchMedia('(hover: none)').matches ? 'none' : 'hover';
  root.dataset.orientation = layout.height < layout.width ? 'landscape' : 'portrait';
  root.dataset.short = layout.height <= 500 ? 'true' : 'false';
}

export function installViewportFit() {
  applyViewportFit();
  window.visualViewport?.addEventListener('resize', applyViewportFit);
  window.visualViewport?.addEventListener('scroll', applyViewportFit);
  window.addEventListener('orientationchange', applyViewportFit);
  window.addEventListener('resize', applyViewportFit);
  window.matchMedia('(pointer: coarse)').addEventListener('change', applyViewportFit);
  window.matchMedia('(hover: none)').addEventListener('change', applyViewportFit);
}
