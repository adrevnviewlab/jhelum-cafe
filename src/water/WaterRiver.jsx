import { useEffect, useRef, useState } from 'react';
import './water.css';

// Loop is Mixkit 10065 (free license: https://mixkit.co/license/).

export default function WaterRiver() {
  const video = useRef(null);
  const [mode, setMode] = useState('video');

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      if (reduced.matches) {
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
    apply();
    return () => {
      element.removeEventListener('error', failed);
      reduced.removeEventListener('change', apply);
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
        autoPlay
        preload="metadata"
      />
    </div>
  );
}
