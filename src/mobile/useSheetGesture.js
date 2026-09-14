import { useCallback, useRef, useState } from 'react';
import { clampSheetOffset, isPinchPointerEvent, sheetVelocity, shouldDismissSheet } from './sheetGesture';

export default function useSheetGesture(onClose) {
  const sheetRef = useRef(null);
  const drag = useRef({ id: null, startY: 0, lastY: 0, lastTime: 0, velocity: 0 });
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);

  const stop = useCallback(() => {
    drag.current.id = null;
    setDragging(false);
    setOffset(0);
  }, []);

  const onPointerDown = useCallback(event => {
    if (!event.isPrimary || event.button) return;
    if (isPinchPointerEvent(event)) return;
    drag.current = { id: event.pointerId, startY: event.clientY, lastY: event.clientY, lastTime: event.timeStamp, velocity: 0 };
    setDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, []);

  const onPointerMove = useCallback(event => {
    if (drag.current.id !== event.pointerId) return;
    if (isPinchPointerEvent(event)) {
      stop();
      return;
    }
    const next = clampSheetOffset(event.clientY - drag.current.startY);
    drag.current.velocity = sheetVelocity(drag.current.lastY, event.clientY, drag.current.lastTime, event.timeStamp);
    drag.current.lastY = event.clientY;
    drag.current.lastTime = event.timeStamp;
    setOffset(next);
  }, [stop]);

  const onPointerUp = useCallback(event => {
    if (drag.current.id !== event.pointerId) return;
    const next = clampSheetOffset(event.clientY - drag.current.startY);
    const velocity = drag.current.velocity;
    stop();
    if (shouldDismissSheet(next, velocity)) onClose();
  }, [onClose, stop]);

  return {
    sheetRef,
    dragging,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: stop,
    },
    style: {
      transform: offset ? `translate3d(0, ${offset}px, 0)` : undefined,
      transition: dragging ? 'none' : 'transform .32s cubic-bezier(.22, .8, .22, 1)',
    },
  };
}
