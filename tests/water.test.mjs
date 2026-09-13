import test from 'node:test';
import assert from 'node:assert/strict';
import {createRibbon,createNormalPixels,sampleRiver} from '../src/water/geometry.js';

test('mobile and desktop ribbons have finite vertices and valid 16-bit indices',()=>{
  for(const width of [375,1440,2560]) {
    const {vertices,indices}=createRibbon(width,900,8000);
    assert.ok(vertices.every(Number.isFinite));
    assert.ok(vertices.length/6<65536);
    assert.ok(indices.every(i=>i<vertices.length/6));
  }
});
test('river follows a continuous downstream path with rounded endpoints',()=>{
  let previous=sampleRiver(0);
  for(let i=1;i<=1000;i++) {
    const next=sampleRiver(i/1000);
    assert.ok(next[1]>previous[1]);
    assert.ok(Math.hypot(next[0]-previous[0],next[1]-previous[1])<15);
    previous=next;
  }
  const {vertices}=createRibbon(375,900,8000);
  assert.equal(vertices[0],vertices[32*6]);
});
test('procedural normal map has valid normalized vectors and is deterministic',()=>{
  const pixels=createNormalPixels();
  assert.equal(pixels.length,128*128*4);
  assert.deepEqual(pixels,createNormalPixels());
  for(let i=0;i<pixels.length;i+=4) {
    const length=Math.hypot(...Array.from(pixels.slice(i,i+3),v=>v/255*2-1));
    assert.ok(Math.abs(length-1)<.015);
    assert.equal(pixels[i+3],255);
  }
});
