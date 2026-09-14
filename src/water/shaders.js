// WebGL 1 / GLSL ES 1.00. Depth is linear camera distance encoded in RGBA8's
// red channel, so no float render-target or depth-texture extension is needed.
export const terrainField = `
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
             mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float bedHeight(vec2 uv) {
  float s=abs(uv.x*2.0-1.0);
  float bank=-54.0+66.0*pow(s,4.0);
  // Stable elliptical rock outcrops near alternating banks; shared by BOTH passes.
  float cell=floor(uv.y*19.0);
  float side=mix(0.13,0.87,step(0.5,hash(vec2(cell,7))));
  vec2 rock=vec2((uv.x-side)/0.085,(fract(uv.y*19.0)-0.48)/0.13);
  float outcrop=50.0*exp(-dot(rock,rock)*1.8);
  return bank+outcrop+(noise(uv*vec2(13,130))-0.5)*4.0;
}
float endFade(float t) { return smoothstep(0.0,0.008,t)*(1.0-smoothstep(0.985,1.0,t)); }
`;

export const vertexShader = `
precision highp float;
attribute vec2 aPosition;
attribute vec2 aUv;
attribute vec2 aFlow;
uniform vec2 uViewport;
uniform float uScroll;
uniform float uTime;
uniform float uTerrain;
uniform float uWaveAmplitude;
varying vec2 vUv;
varying vec2 vFlow;
varying float vHeight;
${terrainField}
void main() {
  vUv=aUv; vFlow=aFlow;
  float edge=1.0-pow(abs(aUv.x*2.0-1.0),3.0);
  float wave=sin(aUv.y*300.0-uTime*0.72+aUv.x*7.0)
       +0.45*sin(aUv.y*517.0-uTime*0.43-aUv.x*11.0);
  vHeight=mix(wave*uWaveAmplitude*edge,bedHeight(aUv),uTerrain);
  vec2 projected=aPosition;
  // Oblique orthographic projection: elevation displaces real mesh vertices.
  projected.y-=vHeight*0.65;
  vec2 clip=vec2(projected.x/uViewport.x*2.0-1.0,
                 1.0-(projected.y-uScroll)/uViewport.y*2.0);
  gl_Position=vec4(clip,clamp(-vHeight/150.0,-0.99,0.99),1.0);
}
`;

export const terrainFragmentShader = `
precision highp float;
uniform float uDepthOnly;
varying vec2 vUv;
varying float vHeight;
${terrainField}
void main() {
  float sceneDepth=(100.0-vHeight)/220.0;
  if (uDepthOnly>0.5) { gl_FragColor=vec4(sceneDepth,0,0,1); return; }
  // Only exposed bank/rock surfaces are visible; the bed remains submerged.
  float alpha=smoothstep(-1.5,2.0,vHeight)*endFade(vUv.y);
  alpha*=1.0-smoothstep(0.94,1.0,abs(vUv.x*2.0-1.0));
  if(alpha<0.01) discard;
  float grain=noise(vUv*vec2(90,850));
  vec3 rock=mix(vec3(0.16,0.15,0.13),vec3(0.36,0.32,0.24),grain);
  gl_FragColor=vec4(rock*alpha,alpha);
}
`;

export const waterFragmentShader = `
precision highp float;
uniform sampler2D uNormalMap;
uniform sampler2D uSceneDepth;
uniform vec2 uResolution;
uniform float uTime;
uniform float uNormalStrength;
uniform float uFoamDistance;
uniform float uRoughness;
varying vec2 vUv;
varying vec2 vFlow;
varying float vHeight;
${terrainField}
void main() {
  // Two independently panned and rotated, tileable tangent-space normal layers.
  // Negative UV.y velocity makes crests travel downstream along increasing vUv.y.
  vec2 uvA=vUv*vec2(2.8,52.0)+vec2(0.018,-0.075)*uTime;
  vec2 uvB=mat2(0.94,-0.342,0.342,0.94)*(vUv*vec2(4.1,77.0))
          +vec2(-0.027,-0.052)*uTime;
  vec3 nA=texture2D(uNormalMap,uvA).xyz*2.0-1.0;
  vec3 nB=texture2D(uNormalMap,uvB).xyz*2.0-1.0;
  vec2 flow=normalize(vFlow), across=vec2(flow.y,-flow.x);
  vec2 slope=(nA.xy+nB.xy)*uNormalStrength;
  vec3 N=normalize(vec3(across*slope.x+flow*slope.y,1.0));
  // Sample linear SCENE depth at the displaced water fragment's screen position.
  float sceneDepth=texture2D(uSceneDepth,gl_FragCoord.xy/uResolution).r*220.0;
  float waterDepth=100.0-vHeight;
  float gap=sceneDepth-waterDepth;
  if(gap < -0.8) discard; // Exposed rocks occlude the surface.
  float depthFade=smoothstep(0.0,8.0,max(0.0,gap));
  float deep=smoothstep(2.0,50.0,gap);
  vec3 water=mix(vec3(0.64,0.80,0.86),vec3(0.20,0.38,0.50),deep);
  vec3 V=normalize(vec3(0.0,-0.45,1.0));
  vec3 L=normalize(vec3(0.5,-0.6,0.7));
  vec3 H=normalize(L+V);
  // Independent high-frequency noise broadens/breaks highlights, avoiding a
  // single polished plastic/road reflection. Energy falls as roughness rises.
  float micro=noise(vUv*vec2(190,1800)+vec2(0.0,-uTime*0.19));
  float rough=clamp(uRoughness+(micro-0.5)*0.25,0.18,0.85);
  float exponent=mix(150.0,12.0,rough);
  float spec=pow(max(dot(N,H),0.0),exponent)*(1.0-rough)*0.72;
  float fresnel=0.06+0.48*pow(1.0-max(dot(N,V),0.0),5.0);
  water*=0.92+0.28*max(dot(N,L),0.0);
  water+=vec3(0.86,0.94,0.98)*spec+vec3(0.30,0.42,0.52)*fresnel;
  // Depth fade catches BOTH the shoreline and the rock/water intersections.
  float foamBand=1.0-smoothstep(0.0,uFoamDistance,gap);
  float breakup=noise(vUv*vec2(55,620)+vec2(uTime*.04,-uTime*.20));
  float pulse=0.5+0.5*sin(gap*1.4-uTime*1.1+breakup*5.0);
  float foam=foamBand*smoothstep(0.22,0.68,breakup+pulse*0.18)*0.82;
  water=mix(water,vec3(0.94,0.97,0.99),foam);
  float alpha=max(depthFade*0.98,foam*0.94)*endFade(vUv.y);
  gl_FragColor=vec4(water*alpha,alpha);
}
`;
