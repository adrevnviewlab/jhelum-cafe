export const SHEET_DISMISS_DISTANCE = 120;
export const SHEET_FLICK_DISTANCE = 48;
export const SHEET_FLICK_VELOCITY = 0.85;

export function clampSheetOffset(deltaY) {
  return Math.max(0, Number(deltaY) || 0);
}

export function sheetVelocity(fromY, toY, fromTime, toTime) {
  const elapsed = Math.max(1, toTime - fromTime);
  return (toY - fromY) / elapsed;
}

export function shouldDismissSheet(offset, velocity, distance = SHEET_DISMISS_DISTANCE) {
  return offset >= distance || (offset >= SHEET_FLICK_DISTANCE && velocity >= SHEET_FLICK_VELOCITY);
}

export function isPinchPointerEvent(event) {
  return Boolean(event?.touches && event.touches.length > 1);
}
