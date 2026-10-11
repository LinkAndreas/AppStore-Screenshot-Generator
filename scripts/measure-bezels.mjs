#!/usr/bin/env node
// Measures bezel PNGs for src/shared/layout.ts.
//
//   node scripts/measure-bezels.mjs "src/assets/Bezels/<folder>/PNG/<file>.png" ...
//
// For each file it prints the bezel size, the screen opening (the transparent area enclosed by the
// frame, which should equal the App Store screenshot size) and, per corner, the range of radii for
// which the rounded screenshot covers every transparent pixel of the opening while staying inside
// the opaque frame. Use the middle of each range as BezelSpec.screen.radius. The MCP test
// mcp/test/bezel-fit.test.mjs then verifies the fit with real renders.
import { readFileSync } from 'node:fs';
import { PNG } from 'pngjs';

const MAX_RADIUS = 300;

for (const file of process.argv.slice(2)) {
  const { width: W, height: H, data } = PNG.sync.read(readFileSync(file));
  const alpha = (x, y) => data[(y * W + x) * 4 + 3];

  // Opening: flood fill over non-opaque pixels from the centre (stepping off a notch if needed).
  const hole = new Uint8Array(W * H);
  let sy = H >> 1;
  const sx = W >> 1;
  while (alpha(sx, sy) === 255) sy++;
  const stack = [sy * W + sx];
  while (stack.length) {
    const i = stack.pop();
    if (hole[i] || data[i * 4 + 3] === 255) continue;
    hole[i] = 1;
    const x = i % W;
    if (x > 0) stack.push(i - 1);
    if (x < W - 1) stack.push(i + 1);
    if (i >= W) stack.push(i - W);
    if (i < W * (H - 1)) stack.push(i + W);
  }
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let i = 0; i < hole.length; i++) {
    if (!hole[i]) continue;
    const x = i % W, y = (i / W) | 0;
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  if (x0 === 0 || y0 === 0 || x1 === W - 1 || y1 === H - 1) {
    console.log(`${file}: the opening is not enclosed by the frame`);
    continue;
  }
  const rect = { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };

  const fits = (corner, r) => {
    const left = corner.endsWith('l'), top = corner.startsWith('t');
    const cx = left ? rect.x + r : rect.x + rect.w - 1 - r;
    const cy = top ? rect.y + r : rect.y + rect.h - 1 - r;
    for (let y = top ? rect.y - 3 : cy; y <= (top ? cy : rect.y + rect.h + 2); y++) {
      for (let x = left ? rect.x - 3 : cx; x <= (left ? cx : rect.x + rect.w + 2); x++) {
        if (x < 0 || y < 0 || x >= W || y >= H) continue;
        const inRect = x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h
          && (r === 0 || Math.hypot(x - cx, y - cy) <= r + 0.5 || (left ? x > cx : x < cx) || (top ? y > cy : y < cy));
        const inHole = hole[y * W + x] === 1;
        if (inHole !== inRect && (inHole || alpha(x, y) < 255)) return false;
      }
    }
    return true;
  };

  const radii = ['tl', 'tr', 'br', 'bl'].map(corner => {
    const ok = [];
    for (let r = 0; r <= Math.min(MAX_RADIUS, rect.w / 2, rect.h / 2); r++) if (fits(corner, r)) ok.push(r);
    return ok.length ? { corner, min: ok[0], max: ok.at(-1), pick: Math.round((ok[0] + ok.at(-1)) / 2) } : { corner, none: true };
  });
  console.log(JSON.stringify({
    file: file.split('/').pop(),
    size: [W, H],
    screen: [rect.x, rect.y, rect.w, rect.h],
    radius: radii.map(r => r.none ? null : r.pick),
    ranges: Object.fromEntries(radii.map(r => [r.corner, r.none ? 'none' : `${r.min}-${r.max}`])),
  }));
}
