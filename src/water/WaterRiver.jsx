import { useEffect, useRef, useState } from 'react';
import { createWaterRenderer } from './renderer';
import { fallbackPath } from './geometry';
import './water.css';

export default function WaterRiver() {
  const canvas=useRef(null);
  const [ready,setReady]=useState(false);
  useEffect(()=>{
    const element=canvas.current;
    let dispose;
    const failed=error=>{setReady(false);console.warn('Water uses its SVG fallback:',error.message);};
    const start=()=>{
      try {dispose=createWaterRenderer(element,element.closest('main'),{onError:failed});setReady(true);}
      catch(error){failed(error);}
    };
    const lost=event=>{event.preventDefault();dispose?.();dispose=undefined;setReady(false);};
    element.addEventListener('webglcontextlost',lost);
    element.addEventListener('webglcontextrestored',start);
    start();
    return ()=>{dispose?.();element.removeEventListener('webglcontextlost',lost);element.removeEventListener('webglcontextrestored',start);};
  },[]);
  return <div className="water-layer" data-renderer={ready?'webgl':'fallback'} aria-hidden="true">
    <svg className="water-fallback" viewBox="0 0 1900 7800" preserveAspectRatio="none"><path d={fallbackPath} /></svg>
    <canvas ref={canvas} className="water-canvas" />
  </div>;
}
