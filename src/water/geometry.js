// Jhelum-like centerline in the animation's 1900×720–7140 space.
// Traced from the aerial reference (not displayed): the silt river enters
// slightly right of center, swings through a left-hand S/meander, meets a
// right-hand tributary at a Y, then runs south a little left of center.
export const bends = [
  [1090,720,1105,910,1060,1120,1005,1280],
  [1005,1280,930,1450,820,1690,790,1880],
  [790,1880,740,2070,700,2290,710,2480],
  [710,2480,720,2670,735,2900,755,3090],
  [755,3090,800,3280,835,3510,850,3700],
  [850,3700,880,3890,905,4120,920,4310],
  [920,4310,945,4500,975,4730,980,4920],
  [980,4920,1040,5110,1025,5340,950,5530],
  [950,5530,940,5715,932,5945,928,6130],
  [928,6130,922,6310,918,6530,914,6700],
  [914,6700,910,6850,908,7000,904,7140],
];

export const tributaryBends = [
  [1480,4180,1465,4480,1410,4860,1260,5200],
  [1260,5200,1140,5380,1030,5480,950,5530],
];

function pathFrom(curve) {
  return `M ${curve[0][0]} ${curve[0][1]} ` + curve.map(b => `C ${b.slice(2).join(' ')}`).join(' ');
}

export const fallbackPath = pathFrom(bends) + ' ' + pathFrom(tributaryBends);

function sampleCurve(curve, t) {
  const index = Math.min(curve.length - 1, Math.floor(t * curve.length));
  const q = t * curve.length - index, r = 1 - q, b = curve[index];
  const at = offset => r * r * r * b[offset] + 3 * r * r * q * b[offset + 2] + 3 * r * q * q * b[offset + 4] + q * q * q * b[offset + 6];
  return [at(0), at(1)];
}

export function sampleRiver(t) {
  return sampleCurve(bends, t);
}

function writeRibbon(vertices, indices, vertexBase, width, startY, endY, curve, rows, columns, widthScale) {
  const height = Math.max(1, endY - startY);
  const halfWidth = Math.min(400, Math.max(88, width * .24)) * widthScale;
  let offset = vertexBase * 6;
  let indexWrite = vertexBase === 0 ? 0 : (vertexBase / (columns + 1) - 1) * columns * 6;
  for (let row = 0; row <= rows; row++) {
    const t = row / rows, p = sampleCurve(curve, t);
    const next = sampleCurve(curve, Math.min(1, t + .001)), prev = sampleCurve(curve, Math.max(0, t - .001));
    const dx = (next[0] - prev[0]) * width / 1900, dy = (next[1] - prev[1]) * height / 6420;
    const length = Math.hypot(dx, dy) || 1, fx = dx / length, fy = dy / length;
    const centerX = width * .5 + (p[0] - 950) * width / 1900 * 1.8;
    const centerY = startY + (p[1] - 720) / 6420 * height;
    const taper = Math.min(1, Math.sqrt(Math.max(0, Math.min(t, 1 - t)) / .012));
    const naturalWidth = 1 + .055 * Math.sin(t * 67) + .025 * Math.sin(t * 151);
    const body = widthScale < 1 ? 1 : (t < .62 ? 1 : 1 + .22 * Math.min(1, (t - .62) / .16));
    for (let col = 0; col <= columns; col++) {
      const u = col / columns, lateral = (u * 2 - 1) * halfWidth * taper * naturalWidth * body;
      vertices.set([centerX + fy * lateral, centerY - fx * lateral, u, t, fx, fy], offset); offset += 6;
      if (row < rows && col < columns) {
        const a = vertexBase + row * (columns + 1) + col, b = a + columns + 1;
        indices.set([a, b, a + 1, a + 1, b, b + 1], indexWrite); indexWrite += 6;
      }
    }
  }
}

export function createRibbon(width, startY, endY, rows = 660, columns = 32) {
  const tributaryRows = Math.round(rows * .28);
  const mainCount = (rows + 1) * (columns + 1);
  const tribCount = (tributaryRows + 1) * (columns + 1);
  const vertices = new Float32Array((mainCount + tribCount) * 6);
  const indices = new Uint16Array((rows + tributaryRows) * columns * 6);
  writeRibbon(vertices, indices, 0, width, startY, endY, bends, rows, columns, 1);
  writeRibbon(vertices, indices, mainCount, width, startY, endY, tributaryBends, tributaryRows, columns, .55);
  return { vertices, indices };
}

// A deterministic, seamless normal map generated once; no network asset required.
export function createNormalPixels(size = 128) {
  const pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = x / size * Math.PI * 2, v = y / size * Math.PI * 2;
    let dx = 0, dy = 0;
    for (const [kx, ky, a, phase] of [[3, 5, .14, 0], [7, -4, .09, 1.2], [13, 9, .035, 2.7], [23, -17, .015, .8]]) {
      const c = Math.cos(kx * u + ky * v + phase); dx += kx * a * c; dy += ky * a * c;
    }
    const length = Math.hypot(dx, dy, 2.5), i = (y * size + x) * 4;
    pixels[i] = Math.round((-dx / length * .5 + .5) * 255);
    pixels[i + 1] = Math.round((-dy / length * .5 + .5) * 255);
    pixels[i + 2] = Math.round((2.5 / length * .5 + .5) * 255); pixels[i + 3] = 255;
  }
  return pixels;
}
