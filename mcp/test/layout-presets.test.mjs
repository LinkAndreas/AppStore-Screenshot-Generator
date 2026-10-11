// Layout presets: applying a preset must be recognised as that preset on every device (the
// editor highlights it), and the MCP server renders presets with fine-tuning on top.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rmSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { imageSize } from 'image-size';

const root = fileURLToPath(new URL('..', import.meta.url));
const out = join(root, 'dist', `presets-check-${process.pid}.mjs`);
await build({
  stdin: {
    contents: `export * from '../src/shared/layoutPresets.ts'; export { DEVICE_TYPES, offsetLimit } from '../src/shared/layout.ts';`,
    resolveDir: root, loader: 'ts',
  },
  bundle: true, platform: 'node', format: 'esm', outfile: out, logLevel: 'silent',
});
const { LAYOUT_PRESETS, presetValues, matchPreset, DEVICE_TYPES, offsetLimit } = await import(out);
rmSync(out);

test('every preset is recognised after applying it, on every device', () => {
  for (const device of DEVICE_TYPES) {
    for (const preset of LAYOUT_PRESETS) {
      const values = presetValues(device, preset.id);
      assert.equal(matchPreset(device, values), preset.id, `${device} / ${preset.id}`);
      assert.ok(Math.abs(values.offsetX) <= offsetLimit(device) && Math.abs(values.offsetY) <= offsetLimit(device), `${device} / ${preset.id} offsets within range`);
    }
  }
});

test('presets are distinct and nudged placements count as custom', () => {
  const ids = new Set(LAYOUT_PRESETS.map(p => JSON.stringify(presetValues('iPhone', p.id))));
  assert.equal(ids.size, LAYOUT_PRESETS.length);
  const nudged = { ...presetValues('iPhone', 'classic'), offsetX: 20 };
  assert.equal(matchPreset('iPhone', nudged), null);
});

test('MCP: renders layout presets, text below and fine-tuning', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'mcp-presets-'));
  const c = new Client({ name: 'test', version: '1' });
  await c.connect(new StdioClientTransport({ command: process.execPath, args: [join(root, 'dist/server.js')], cwd: dir, stderr: 'ignore' }));
  try {
    const options = JSON.parse((await c.callTool({ name: 'get_design_options', arguments: {} })).content[0].text);
    assert.deepEqual(options.layoutPresets.map(p => p.id), LAYOUT_PRESETS.map(p => p.id));
    const image = join(root, 'test/fixtures/iphone.png');
    const result = await c.callTool({
      name: 'render_screenshots',
      arguments: {
        previews: false,
        brand: { layoutPreset: 'tiltLeft' },
        screens: [
          { image, title: 'Brand preset' },
          { image, title: 'Below', layoutPreset: 'textBelow' },
          { image, title: 'Fine-tuned', layoutPreset: 'hero', rotation: 5, offsetX: 40 },
        ],
      },
    });
    assert.ok(!result.isError, result.content[0].text);
    for (let n = 1; n <= 3; n++) {
      const size = imageSize(readFileSync(join(dir, 'appstore-screenshots/iPhone_6.9/en-US', `screen_${n}.png`)));
      assert.deepEqual([size.width, size.height], [1320, 2868]);
    }
  } finally {
    await c.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
