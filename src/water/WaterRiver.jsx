import { useEffect, useRef, useState } from 'react';
import './water.css';

// Loop is Mixkit 10065 (free license: https://mixkit.co/license/).

function preferStillWater() {
  if (typeof window === 'undefined') return true;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
  if (window.matchMedia('(pointer: coarse) and (max-width: 760px)').matches) return true;
  if (window.matchMedia('(max-width: 480px)').matches) return true;
  const connection = navigator.connection;
  if (connection?.saveData) return true;
  if (connection?.effectiveType && /2g/.test(connection.effectiveType)) return true;
  return false;
}

export default function WaterRiver() {
  const video = useRef(null);
  const [mode, setMode] = useState('still');

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const coarseSmall = matchMedia('(pointer: coarse) and (max-width: 760px)');
    const narrow = matchMedia('(max-width: 480px)');
    const apply = () => {
      if (preferStillWater()) {
        element.pause();
        setMode('still');
        return;
      }
      const play = element.play();
      if (play && typeof play.then === 'function') {
        play.then(() => setMode('video')).catch(() => setMode('still'));
      }
    };
    const failed = () => setMode('still');
    element.addEventListener('error', failed);
    reduced.addEventListener('change', apply);
    coarseSmall.addEventListener('change', apply);
    narrow.addEventListener('change', apply);
    apply();
    return () => {
      element.removeEventListener('error', failed);
      reduced.removeEventListener('change', apply);
      coarseSmall.removeEventListener('change', apply);
      narrow.removeEventListener('change', apply);
    };
  }, []);

  return (
    <div className="water-layer" data-renderer={mode} aria-hidden="true">
      <video
        ref={video}
        className="water-film"
        src="/river-flow.mp4"
        poster="/river-flow-poster.jpg"
        muted
        playsInline
        loop
        preload="none"
      />
    </div>
  );
}
