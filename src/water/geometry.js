export const bends = [
  [950,720,790,910,800,1120,970,1280],
  [970,1280,1130,1450,1135,1690,955,1880],
  [955,1880,775,2070,770,2290,950,2480],
  [950,2480,1125,2670,1120,2900,940,3090],
  [940,3090,760,3280,765,3510,950,3700],
  [950,3700,1135,3890,1125,4120,940,4310],
  [940,4310,755,4500,760,4730,950,4920],
  [950,4920,1135,5110,1125,5340,945,5530],
  [945,5530,770,5715,780,5945,955,6130],
  [955,6130,1125,6310,1110,6530,945,6700],
  [945,6700,800,6850,800,7000,930,7140],
];
export const fallbackPath = 'M 950 720 ' + bends.map(b => `C ${b.slice(2).join(' ')}`).join(' ');

export function sampleRiver(t) {
  const index=Math.min(bends.length-1,Math.floor(t*bends.length));
  const q=t*bends.length-index, r=1-q, b=bends[index];
  const at=offset=>r*r*r*b[offset]+3*r*r*q*b[offset+2]+3*r*q*q*b[offset+4]+q*q*q*b[offset+6];
  return [at(0),at(1)];
}

export function createRibbon(width, startY, endY, rows=660, columns=32) {
  const vertices=new Float32Array((rows+1)*(columns+1)*6);
  const indices=new Uint16Array(rows*columns*6);
  const height=Math.max(1,endY-startY);
  const halfWidth=Math.min(245,Math.max(55,width*.14));
  let offset=0, index=0;
  for(let row=0;row<=rows;row++) {
    const t=row/rows, p=sampleRiver(t);
    const next=sampleRiver(Math.min(1,t+.001)), prev=sampleRiver(Math.max(0,t-.001));
    const dx=(next[0]-prev[0])*width/1900, dy=(next[1]-prev[1])*height/6420;
    const length=Math.hypot(dx,dy), fx=dx/length, fy=dy/length;
    const centerX=width*.5+(p[0]-950)*width/1900*1.8;
    const centerY=startY+(p[1]-720)/6420*height;
    const taper=Math.min(1,Math.sqrt(Math.max(0,Math.min(t,1-t))/.025));
    const naturalWidth=1+.055*Math.sin(t*67)+.025*Math.sin(t*151);
    for(let col=0;col<=columns;col++) {
      const u=col/columns, lateral=(u*2-1)*halfWidth*taper*naturalWidth;
      vertices.set([centerX+fy*lateral,centerY-fx*lateral,u,t,fx,fy],offset); offset+=6;
      if(row<rows && col<columns) {
        const a=row*(columns+1)+col,b=a+columns+1;
        indices.set([a,b,a+1,a+1,b,b+1],index); index+=6;
      }
    }
  }
  return {vertices,indices};
}

// A deterministic, seamless normal map generated once; no network asset required.
export function createNormalPixels(size=128) {
  const pixels=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++) for(let x=0;x<size;x++) {
    const u=x/size*Math.PI*2,v=y/size*Math.PI*2;
    let dx=0,dy=0;
    for(const [kx,ky,a,phase] of [[3,5,.14,0],[7,-4,.09,1.2],[13,9,.035,2.7],[23,-17,.015,.8]]) {
      const c=Math.cos(kx*u+ky*v+phase); dx+=kx*a*c; dy+=ky*a*c;
    }
    const length=Math.hypot(dx,dy,2.5), i=(y*size+x)*4;
    pixels[i]=Math.round((-dx/length*.5+.5)*255);
    pixels[i+1]=Math.round((-dy/length*.5+.5)*255);
    pixels[i+2]=Math.round((2.5/length*.5+.5)*255); pixels[i+3]=255;
  }
  return pixels;
}
