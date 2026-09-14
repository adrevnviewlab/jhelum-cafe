import test from 'node:test';
import assert from 'node:assert/strict';
import { applyDeviceDocument, applyPinchZoomDocument, detectAppleTouch, detectTouchScreen, freezeLayoutViewport, pinchZoomState } from '../src/mobile/pinchZoom.js';
import { clampSheetOffset, isPinchPointerEvent, shouldDismissSheet, sheetVelocity } from '../src/mobile/sheetGesture.js';

test('pinch zoom follows the visual viewport scale', () => {
  assert.equal(pinchZoomState({ scale: 1, width: 390, height: 844 }, {}).pinched, false);
  assert.equal(pinchZoomState({ scale: 1.25, width: 312, height: 675, offsetLeft: 20, offsetTop: 40 }, {}).pinched, true);
});

test('pinch zoom writes Safari-safe document state', () => {
  const classList = new Set();
  const style = new Map();
  const root = {
    classList: { toggle(name, on) { if (on) classList.add(name); else classList.delete(name); } },
    style: { setProperty(name, value) { style.set(name, value); } },
    dataset: {},
  };
  applyPinchZoomDocument({ documentElement: root }, { width: 300, height: 600, offsetLeft: 12, offsetTop: 8, scale: 1.4, pinched: true });
  assert.equal(classList.has('is-pinched'), true);
  assert.equal(root.dataset.zoom, 'pinched');
  assert.equal(style.get('--vv-scale'), '1.4');
  applyPinchZoomDocument({ documentElement: root }, { width: 390, height: 844, offsetLeft: 0, offsetTop: 0, scale: 1, pinched: false });
  assert.equal(classList.has('is-pinched'), false);
  assert.equal(root.dataset.zoom, undefined);
});

test('Apple touch detection covers iPhone Safari and iPad desktop UA', () => {
  assert.deepEqual(detectAppleTouch('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'), { ios: true, safari: true, webkitTouch: true });
  assert.deepEqual(detectAppleTouch('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15', 5, 'MacIntel'), { ios: true, safari: true, webkitTouch: true });
  assert.equal(detectAppleTouch('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0 Safari/537.36').safari, false);
});

test('coarse pointers mark the document as a touch screen', () => {
  assert.equal(detectTouchScreen(query => ({ matches: query.includes('pointer: coarse') })), true);
  assert.equal(detectTouchScreen(() => ({ matches: false })), false);
});

test('device classes stay on the document root', () => {
  const classList = new Set();
  const root = { classList: { toggle(name, on) { if (on) classList.add(name); else classList.delete(name); } } };
  applyDeviceDocument({ documentElement: root }, { touch: true, apple: { ios: true, safari: true } });
  assert.deepEqual([...classList], ['is-touch', 'is-ios', 'is-safari']);
});

test('Safari pinch zoom keeps the last unzoomed layout size', () => {
  const open = freezeLayoutViewport({ pinched: false, width: 390, height: 844 }, {});
  assert.deepEqual(open, { width: 390, height: 844 });
  assert.deepEqual(freezeLayoutViewport({ pinched: true, width: 260, height: 560 }, open), open);
});

test('sheet dismiss ignores pinch and requires a downward flick or pull', () => {
  assert.equal(clampSheetOffset(-40), 0);
  assert.equal(sheetVelocity(10, 100, 0, 100), 0.9);
  assert.equal(shouldDismissSheet(130, 0), true);
  assert.equal(shouldDismissSheet(60, 0.9), true);
  assert.equal(shouldDismissSheet(20, 0.2), false);
  assert.equal(isPinchPointerEvent({ touches: [{}, {}] }), true);
  assert.equal(isPinchPointerEvent({ touches: [{}] }), false);
});
