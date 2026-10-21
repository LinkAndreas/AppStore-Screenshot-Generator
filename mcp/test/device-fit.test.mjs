// Checks that a device below a long title and subtitle fits whole on the canvas, so what's at the
// bottom of its screen (a tab bar) shows, unless it's placed at the bottom to bleed off the edge.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { PNG } from 'pngjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const out = join(root, 'dist', `device-fit-${process.pid}.mjs`);
await build({
  stdin: {
    contents: `export { renderScreen } from './src/render.ts'; export { DEFAULT_BEZEL, getBezelSpec, DEVICE_LAYOUT } from '../src/shared/layout.ts';`,
    resolveDir: root, loader: 'ts',
  },
  bundle: true, platform: 'node', format: 'esm', packages: 'external', outfile: out, logLevel: 'silent',
});
const { renderScreen, DEFAULT_BEZEL, getBezelSpec, DEVICE_LAYOUT } = await import(out);
rmSync(out);

const background = [24, 20, 18];
const fixture = readFileSync(join(root, 'test', 'fixtures', 'iphone.png'));

const screen = (devicePosition) => ({
  device: 'iPhone',
  locale: 'en-US',
  bezel: getBezelSpec(DEFAULT_BEZEL.iPhone, 'iPhone'),
  image: { dataUri: `data:image/png;base64,${fixture.toString('base64')}`, width: 1320, height: 2868 },
  title: 'How many days\nuntil then?',
  subtitle: 'Days, weeks and hours in a tap',
  background: { type: 'solid', color: `rgb(${background.join(',')})` },
  titleColor: '#ffffff', subtitleColor: '#ffffff',
  titleFont: 'outfit', subtitleFont: 'inter',
  titleSize: 120, subtitleSize: 60,
  titleBold: true, subtitleBold: false, titleItalic: false, subtitleItalic: false,
  titleAlign: 'center', subtitleAlign: 'center',
  devicePosition, textPosition: 'top',
  scale: 1, rotation: 0, offsetX: 0, offsetY: 0,
});

/** Whether any pixel in the bottom `rows` rows differs from the background. */
const bottomShowsDevice = (png, rows) => {
  const { width, height, data } = png;
  for (let y = height - rows; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (Math.abs(data[i] - background[0]) + Math.abs(data[i + 1] - background[1]) + Math.abs(data[i + 2] - background[2]) > 6) return true;
    }
  }
  return false;
};

test('a device under a long title fits whole, with the margin below it', async () => {
  for (const position of ['top', 'center']) {
    const { png } = await renderScreen(screen(position));
    // The margin to the edge, less a little for anti-aliasing at the frame's edge.
    const margin = DEVICE_LAYOUT.iPhone.textMarginBottom - 20;
    assert.equal(bottomShowsDevice(PNG.sync.read(png), margin), false, `${position}: the device reaches the bottom edge`);
  }
});

test('a device placed at the bottom still bleeds off the edge', async () => {
  const { png } = await renderScreen(screen('bottom'));
  assert.equal(bottomShowsDevice(PNG.sync.read(png), 4), true);
});
