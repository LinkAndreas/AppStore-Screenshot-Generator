// End-to-end tests against the built server (npm run build first), over stdio and HTTP.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { imageSize } from 'image-size';

const root = fileURLToPath(new URL('..', import.meta.url));
const server = join(root, 'dist/server.js');
const iphone = join(root, 'test/fixtures/iphone.png');
const ipad = join(root, 'test/fixtures/ipad.png');
const mac = join(root, 'test/fixtures/mac.png');
const watch = join(root, 'test/fixtures/watch-ultra.png');
const duo = join(root, 'test/fixtures/duo-inner.png');
const PORT = 3917;

let outDir;
let stdio;
let httpProc;
let http;

const text = result => result.content.filter(c => c.type === 'text').map(c => c.text).join('\n');

before(async () => {
  outDir = await mkdtemp(join(tmpdir(), 'mcp-test-'));
  stdio = new Client({ name: 'test', version: '1' });
  await stdio.connect(new StdioClientTransport({ command: process.execPath, args: [server], cwd: outDir, stderr: 'ignore' }));

  httpProc = spawn(process.execPath, [server, '--http'], { env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'ignore', 'pipe'] });
  await new Promise((resolve, reject) => {
    httpProc.stderr.on('data', d => String(d).includes('MCP server on') && resolve());
    httpProc.on('exit', code => reject(new Error(`http server exited with ${code}`)));
  });
  http = new Client({ name: 'test', version: '1' });
  await http.connect(new StreamableHTTPClientTransport(new URL(`http://localhost:${PORT}/mcp`)));
});

after(async () => {
  await stdio?.close();
  await http?.close();
  httpProc?.kill();
  await rm(outDir, { recursive: true, force: true });
});

test('lists tools and the prompt', async () => {
  const { tools } = await stdio.listTools();
  assert.deepEqual(tools.map(t => t.name).sort(), ['get_design_options', 'render_screenshots']);
  const { prompts } = await stdio.listPrompts();
  assert.equal(prompts[0].name, 'app_store_screenshot_set');
});

test('get_design_options describes devices, fonts and presets', async () => {
  const options = JSON.parse(text(await stdio.callTool({ name: 'get_design_options', arguments: {} })));
  assert.deepEqual(options.devices[0].outputSize, { width: 1320, height: 2868 });
  assert.ok(options.fonts.some(f => f.id === 'fraunces'));
  assert.ok(options.gradientPresets.length > 10);
});

test('stdio: renders a branded set per device and locale into the output folder', async () => {
  const result = await stdio.callTool({
    name: 'render_screenshots',
    arguments: {
      brand: { gradientFrom: '#101828', gradientTo: '#d9461b', titleFont: 'fraunces', bezelColor: 'Silver' },
      screens: [
        { image: iphone, title: 'Plan your day', subtitle: 'Everything in one list' },
        { image: iphone, title: 'Stay on track', backgroundPreset: 'Midnight' },
        { image: iphone, locale: 'de-DE', title: 'Plane deinen Tag', subtitle: 'Alles in einer Liste' },
        { image: ipad, title: 'Plan your day', bezelColor: 'Space Gray' },
      ],
      zip: true,
    },
  });
  assert.ok(!result.isError, text(result));
  const files = ['iPhone_6.9/en-US/screen_1.png', 'iPhone_6.9/en-US/screen_2.png', 'iPhone_6.9/de-DE/screen_1.png', 'iPad_13/en-US/screen_1.png'];
  for (const f of files) {
    const size = imageSize(await readFile(join(outDir, 'appstore-screenshots', f)));
    assert.deepEqual([size.width, size.height], f.startsWith('iPad') ? [2064, 2752] : [1320, 2868], f);
  }
  await readFile(join(outDir, 'appstore-screenshots', 'screenshots.zip'));
  assert.equal(result.content.filter(c => c.type === 'image').length, 4);
});

test('stdio: renders Mac, iPhone Duo and Apple Watch, detecting the device from the image size', async () => {
  const result = await stdio.callTool({
    name: 'render_screenshots',
    arguments: {
      brand: { backgroundPreset: 'Midnight' },
      screens: [
        { image: mac, title: 'Made for Mac', frameModel: 'MacBook Air', bezelColor: 'Sky Blue' },
        { image: duo, title: 'Unfold more' },
        { image: watch, title: 'On your wrist', bezelColor: 'Natural · Alpine Loop' },
        { image: iphone, title: 'Classic', frameModel: 'iPhone 17 Pro Max', bezelColor: 'cosmic orange' },
      ],
      outputDir: 'devices',
      previews: false,
    },
  });
  assert.ok(!result.isError, text(result));
  const expected = { 'Mac/en-US/screen_1.png': [2880, 1800], 'iPhone_Duo_Inner/en-US/screen_1.png': [2007, 2853], 'Watch_Ultra/en-US/screen_1.png': [422, 514], 'iPhone_6.9/en-US/screen_1.png': [1320, 2868] };
  for (const [f, wh] of Object.entries(expected)) {
    const size = imageSize(await readFile(join(outDir, 'devices', f)));
    assert.deepEqual([size.width, size.height], wh, f);
  }
  assert.doesNotMatch(text(result), /warnings/);
});

test('get_design_options lists frames per device', async () => {
  const options = JSON.parse(text(await stdio.callTool({ name: 'get_design_options', arguments: {} })));
  const ids = options.devices.map(d => d.device);
  assert.deepEqual(ids, ['iPhone', 'iPhoneDuoInner', 'iPhoneDuoOuter', 'iPad', 'Mac', 'WatchUltra', 'Watch']);
  const mac = options.devices.find(d => d.device === 'Mac');
  assert.ok(mac.frames.some(f => f.model === 'MacBook Air 15"' && f.colors.includes('Starlight')));
  assert.equal(mac.acceptedScreenshotSizes.length, 4);
});

test('stdio: reports invalid frame colours clearly', async () => {
  const result = await stdio.callTool({ name: 'render_screenshots', arguments: { screens: [{ image: iphone, bezelColor: 'Gold' }] } });
  assert.ok(result.isError);
  assert.match(text(result), /no iPhone frame matches .*"Gold".*iPhone 18 Pro Max Silver/);
});

test('stdio: warns about screenshots of the wrong size', async () => {
  const result = await stdio.callTool({ name: 'render_screenshots', arguments: { screens: [{ image: ipad, device: 'iPhone' }], previews: false } });
  assert.ok(!result.isError, text(result));
  assert.match(text(result), /should be 1320×2868/);
});

test('http: upload, render and download', async () => {
  const upload = await fetch(`http://localhost:${PORT}/mcp/uploads`, { method: 'POST', body: await readFile(iphone), headers: { 'content-type': 'image/png' } });
  assert.equal(upload.status, 201);
  const { image } = await upload.json();
  assert.match(image, /^upload:/);

  const result = await http.callTool({ name: 'render_screenshots', arguments: { screens: [{ image, title: 'Hello' }], previews: false } });
  assert.ok(!result.isError, text(result));
  const summary = JSON.parse(text(result).split('\n').slice(1).join('\n'));
  const png = await fetch(summary.files[0]);
  assert.equal(png.headers.get('content-type'), 'image/png');
  assert.deepEqual(imageSize(Buffer.from(await png.arrayBuffer())).width, 1320);
  const zip = await fetch(summary.zip);
  assert.equal(zip.headers.get('content-type'), 'application/zip');
});

test('http: refuses local files and private network URLs', async () => {
  const file = await http.callTool({ name: 'render_screenshots', arguments: { screens: [{ image: iphone }] } });
  assert.ok(file.isError);
  assert.match(text(file), /cannot read local files/);

  const local = await http.callTool({ name: 'render_screenshots', arguments: { screens: [{ image: `http://127.0.0.1:${PORT}/mcp/health` }] } });
  assert.ok(local.isError);
  assert.match(text(local), /private/);

  const named = await http.callTool({ name: 'render_screenshots', arguments: { screens: [{ image: `http://localhost:${PORT}/mcp/health` }] } });
  assert.ok(named.isError);
  assert.match(text(named), /private/);
});

test('http: rejects uploads that are not images', async () => {
  const res = await fetch(`http://localhost:${PORT}/mcp/uploads`, { method: 'POST', body: 'hello' });
  assert.equal(res.status, 400);
});
