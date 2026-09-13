import { createNormalPixels, createRibbon } from './geometry';
import { vertexShader, terrainFragmentShader, waterFragmentShader } from './shaders';

export const waterMaterial = Object.freeze({
  waveAmplitude: 2.6, normalStrength: .58, foamDistance: 9,
  roughness: .42, pixelBudget: 1800000, maxPixelRatio: 1.5,
});

export function createWaterRenderer(canvas, main, options = {}) {
  const config={...waterMaterial,...options};
  const gl=canvas.getContext('webgl', {alpha:true,antialias:false,premultipliedAlpha:true,depth:false,stencil:false});
  if(!gl) throw new Error('WebGL unavailable');
  const resources=[];
  let stopped=false, raf=0, observer, frameTime=0, elapsed=0;
  let viewportWidth=1, viewportHeight=1, mainTop=0, start=0, end=1;
  let dirty=true, indexCount=0, bufferWidth=0, bufferHeight=0;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const keep=(value,remove)=>{ if(!value) throw new Error('WebGL allocation failed'); resources.push(()=>remove.call(gl,value)); return value; };
  const destroy=()=>{
    stopped=true; cancelAnimationFrame(raf); observer?.disconnect();
    window.removeEventListener('resize',invalidate);
    window.removeEventListener('scroll',wake);
    document.removeEventListener('visibilitychange',visibility);
    reduced.removeEventListener('change',wake);
    resources.reverse().forEach(dispose=>dispose());
  };
  function invalidate(){ dirty=true; wake(); }
  function wake(){ if(!stopped && !document.hidden && !raf) { frameTime=0; raf=requestAnimationFrame(frame); } }
  function visibility(){ if(document.hidden){cancelAnimationFrame(raf);raf=0;frameTime=0;} else wake(); }

  let terrain,water,vertexBuffer,indexBuffer,normalMap,sceneDepth,framebuffer;
  function program(fragment) {
    const p=keep(gl.createProgram(),gl.deleteProgram);
    for(const [type,source] of [[gl.VERTEX_SHADER,vertexShader],[gl.FRAGMENT_SHADER,fragment]]) {
      const shader=gl.createShader(type);
      gl.shaderSource(shader,source); gl.compileShader(shader); gl.attachShader(p,shader);
      gl.deleteShader(shader); // Attached shaders live until their program is deleted.
    }
    gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const uniforms={};
    for(let i=0;i<gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);i++) {
      const name=gl.getActiveUniform(p,i).name; uniforms[name]=gl.getUniformLocation(p,name);
    }
    return {p,uniforms,attributes:['aPosition','aUv','aFlow'].map(name=>gl.getAttribLocation(p,name))};
  }
  function texture() {
    const tex=keep(gl.createTexture(),gl.deleteTexture); gl.bindTexture(gl.TEXTURE_2D,tex);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    return tex;
  }
  function resize() {
    viewportWidth=document.documentElement.clientWidth; viewportHeight=window.innerHeight;
    mainTop=main.getBoundingClientRect().top+window.scrollY;
    const hero=main.querySelector('.hero'), footer=main.querySelector('.footer');
    start=hero.offsetTop+hero.offsetHeight-100; end=footer.offsetTop+110;
    const mesh=createRibbon(viewportWidth,start,end);
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer); gl.bufferData(gl.ARRAY_BUFFER,mesh.vertices,gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,mesh.indices,gl.STATIC_DRAW);
    indexCount=mesh.indices.length;
    const maxSize=gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const ratio=Math.min(window.devicePixelRatio||1,config.maxPixelRatio,
      Math.sqrt(config.pixelBudget/(viewportWidth*viewportHeight)),maxSize/viewportWidth,maxSize/viewportHeight);
    const w=Math.max(1,Math.floor(viewportWidth*ratio)),h=Math.max(1,Math.floor(viewportHeight*ratio));
    if(w!==bufferWidth || h!==bufferHeight) {
      canvas.width=bufferWidth=w; canvas.height=bufferHeight=h;
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D,sceneDepth);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
      gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);
      if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE) throw new Error('Water depth framebuffer unavailable');
      gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    }
    gl.viewport(0,0,w,h); dirty=false;
  }
  function bind(material,isTerrain) {
    gl.useProgram(material.p);
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
    material.attributes.forEach((location,i)=>{if(location>=0){gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,2,gl.FLOAT,false,24,i*8);}});
    const u=material.uniforms;
    gl.uniform2f(u.uViewport,viewportWidth,viewportHeight);
    gl.uniform1f(u.uScroll,window.scrollY-mainTop);
    gl.uniform1f(u.uTime,reduced.matches?0:elapsed);
    gl.uniform1f(u.uTerrain,isTerrain?1:0);
    gl.uniform1f(u.uWaveAmplitude,reduced.matches?0:config.waveAmplitude);
  }
  function render() {
    if(dirty) resize();
    const scroll=window.scrollY-mainTop;
    gl.bindFramebuffer(gl.FRAMEBUFFER,null); gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
    if(scroll+viewportHeight < start-80 || scroll > end+80) return false;
    // Pass 1: opaque scene linear depth, in viewport space. No readback to CPU.
    gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer); gl.disable(gl.BLEND);
    gl.clearColor(0,0,0,1); gl.clear(gl.COLOR_BUFFER_BIT);
    bind(terrain,true); gl.uniform1f(terrain.uniforms.uDepthOnly,1);
    gl.drawElements(gl.TRIANGLES,indexCount,gl.UNSIGNED_SHORT,0);
    // Pass 2: only exposed banks and rocks, on the transparent page canvas.
    gl.bindFramebuffer(gl.FRAMEBUFFER,null); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform1f(terrain.uniforms.uDepthOnly,0); gl.drawElements(gl.TRIANGLES,indexCount,gl.UNSIGNED_SHORT,0);
    // Pass 3: displaced water, dual normals, depth foam, varying micro-roughness.
    bind(water,false);
    const u=water.uniforms;
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,normalMap); gl.uniform1i(u.uNormalMap,0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D,sceneDepth); gl.uniform1i(u.uSceneDepth,1);
    gl.uniform2f(u.uResolution,bufferWidth,bufferHeight);
    gl.uniform1f(u.uNormalStrength,config.normalStrength); gl.uniform1f(u.uFoamDistance,config.foamDistance);
    gl.uniform1f(u.uRoughness,config.roughness);
    gl.drawElements(gl.TRIANGLES,indexCount,gl.UNSIGNED_SHORT,0);
    return true;
  }
  function frame(now) {
    raf=0; if(stopped || document.hidden) return;
    const limit=viewportWidth<700?1000/30:1000/45;
    if(frameTime && now-frameTime<limit) {raf=requestAnimationFrame(frame);return;}
    elapsed+=frameTime?Math.min((now-frameTime)/1000,.1):0; frameTime=now;
    try {
      const visible=render();
      if(visible && !reduced.matches) raf=requestAnimationFrame(frame);
    } catch(error) {destroy(); config.onError?.(error);}
  }
  try {
    terrain=program(terrainFragmentShader); water=program(waterFragmentShader);
    vertexBuffer=keep(gl.createBuffer(),gl.deleteBuffer); indexBuffer=keep(gl.createBuffer(),gl.deleteBuffer);
    gl.activeTexture(gl.TEXTURE0); normalMap=texture();
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,128,128,0,gl.RGBA,gl.UNSIGNED_BYTE,createNormalPixels());
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);
    gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
    gl.activeTexture(gl.TEXTURE1); sceneDepth=texture();
    framebuffer=keep(gl.createFramebuffer(),gl.deleteFramebuffer); gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,sceneDepth,0);
    observer=new ResizeObserver(invalidate); observer.observe(main);
    observer.observe(main.querySelector('.hero')); observer.observe(main.querySelector('.footer'));
    window.addEventListener('resize',invalidate); window.addEventListener('scroll',wake,{passive:true});
    document.addEventListener('visibilitychange',visibility); reduced.addEventListener('change',wake);
    render(); wake(); return destroy;
  } catch(error) {destroy();throw error;}
}
