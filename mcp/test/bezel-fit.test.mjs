// Checks that screenshots sit pixel-perfectly in every bezel, with the production renderer:
// each device is rendered at its native bezel size with two background colours and two
// screenshot colours. Where the backgrounds differ, the background shows through; where the
// screenshot colours differ, the screenshot is visible.
//   gap:      background visible inside the device around the screen (between screenshot and frame)
//   overflow: screenshot visible anywhere outside the device
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { PNG } from 'pngjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const out = join(root, 'dist', `fit-check-${process.pid}.mjs`);
await build({
  stdin: {
    contents: `export { renderDevice } from './src/render.ts'; export { BEZELS, screenshotRect } from '../src/shared/layout.ts';`,
    resolveDir: root, loader: 'ts',
  },
  bundle: true, platform: 'node', format: 'esm', packages: 'external', outfile: out, logLevel: 'silent',
});
const { renderDevice, BEZELS } = await import(out);
rmSync(out);

const bezelDir = join(root, '..', 'src', 'assets', 'Bezels');

/** Solid-colour PNG as a data URI. */
const solid = (w, h, [r, g, b]) => {
  const png = new PNG({ width: w, height: h });
  for (let i = 0; i < w * h; i++) png.data.set([r, g, b, 255], i * 4);
  return { dataUri: `data:image/png;base64,${PNG.sync.write(png).toString('base64')}`, width: w, height: h };
};

/**
 * Pixels outside the device: everything reachable from the image border without crossing a fully
 * opaque bezel pixel. Everything else (frame, screen opening, camera islands) is the device.
 */
const outsideMask = (bezelPng) => {
  const { width: W, height: H, data } = bezelPng;
  const mask = new Uint8Array(W * H);
  const stack = [];
  for (let x = 0; x < W; x++) stack.push(x, (H - 1) * W + x);
  for (let y = 0; y < H; y++) stack.push(y * W, y * W + W - 1);
  while (stack.length) {
    const i = stack.pop();
    if (mask[i] || data[i * 4 + 3] === 255) continue;
    mask[i] = 1;
    const x = i % W;
    if (x > 0) stack.push(i - 1);
    if (x < W - 1) stack.push(i + 1);
    if (i >= W) stack.push(i - W);
    if (i < W * (H - 1)) stack.push(i + W);
  }
  return mask;
};

const differs = (a, b, i) => Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) > 6;

// Every bezel, including each colour (their antialiasing differs slightly), with the screenshot
// size App Store Connect expects (the Mac's 16:10 screenshot leaves a black strip above it).
for (const bezel of BEZELS) {
  test(`screenshot fits ${bezel.name} pixel-perfectly`, async () => {
    const shotH = bezel.device === 'Mac' ? Math.round(bezel.screen.width / 1.6) : bezel.screen.height;
    const green = solid(bezel.screen.width, shotH, [0, 200, 0]);
    const red = solid(bezel.screen.width, shotH, [200, 0, 0]);
    const [bgA, bgB, shotB] = await Promise.all([
      renderDevice(bezel, green, '#ff00ff'),
      renderDevice(bezel, green, '#00ffff'),
      renderDevice(bezel, red, '#ff00ff'),
    ]).then(pngs => pngs.map(p => PNG.sync.read(p).data));

    const bezelPng = PNG.sync.read(readFileSync(join(bezelDir, bezel.file)));
    const outside = outsideMask(bezelPng);
    assert.equal(outside[Math.round(bezel.screen.y + bezel.screen.height / 2) * bezelPng.width + Math.round(bezel.screen.x + bezel.screen.width / 2)], 0,
      `${bezel.name}: screen opening is not enclosed by the frame`);
    // Gaps only count around the screen; bands and cases may have see-through details of their own.
    const { x: sx, y: sy, width: sw, height: sh } = bezel.screen;
    const nearScreen = p => {
      const x = p % bezelPng.width, y = (p / bezelPng.width) | 0;
      return x >= sx - 2 && x < sx + sw + 2 && y >= sy - 2 && y < sy + sh + 2;
    };
    let gap = 0, overflow = 0;
    const where = [];
    for (let p = 0; p < outside.length; p++) {
      const i = p * 4;
      if (!outside[p] && nearScreen(p) && differs(bgA, bgB, i)) { gap++; if (where.length < 5) where.push(`gap@${p % bezelPng.width},${(p / bezelPng.width) | 0}`); }
      if (outside[p] && differs(bgA, shotB, i)) { overflow++; if (where.length < 5) where.push(`over@${p % bezelPng.width},${(p / bezelPng.width) | 0} a=${bezelPng.data[i + 3]}`); }
    }
    if (where.length) console.log(bezel.name, where.join(' '));
    assert.equal(gap, 0, `${bezel.name}: background shows through ${gap} pixels inside the device`);
    assert.equal(overflow, 0, `${bezel.name}: screenshot visible on ${overflow} pixels outside the device`);
  });
}
