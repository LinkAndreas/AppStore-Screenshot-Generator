import { randomBytes } from 'node:crypto';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import JSZip from 'jszip';
import { z } from 'zod';
import { loadImage, MAX_IMAGE_BYTES, toImage, type InputPolicy, type LoadedImage } from './inputs';
import { renderScreen } from './render';
import { brandSchema, designOptions, outputFolder, resolveScreen, screenSchema } from './spec';

const VERSION = '1.11.0';
const MAX_SCREENS_PER_CALL = 40;
const MAX_PREVIEWS = 6;
const FILE_TTL_MS = 60 * 60 * 1000;

type Mode = { kind: 'stdio' } | { kind: 'http'; baseUrl: string };

// ── Hosted-mode storage: uploads in, rendered files out. Both expire after an hour. ──────────────

const uploads = new Map<string, { data: Buffer; expires: number }>();
const results = new Map<string, { files: Map<string, Buffer>; expires: number }>();
const MAX_STORED_BYTES = 768 * 1024 * 1024;

const sweep = () => {
  const now = Date.now();
  for (const [id, u] of uploads) if (u.expires < now) uploads.delete(id);
  for (const [id, r] of results) if (r.expires < now) results.delete(id);
  // Drop the oldest entries when memory use is too high.
  const size = () => [...uploads.values()].reduce((n, u) => n + u.data.length, 0)
    + [...results.values()].reduce((n, r) => n + [...r.files.values()].reduce((m, f) => m + f.length, 0), 0);
  while (size() > MAX_STORED_BYTES && (results.size || uploads.size)) {
    if (results.size) results.delete(results.keys().next().value!);
    else uploads.delete(uploads.keys().next().value!);
  }
};
setInterval(sweep, 60_000).unref();

const token = () => randomBytes(16).toString('base64url');

/** Allows a couple of renders at a time; they are CPU bound. */
let running = 0;
const waiting: (() => void)[] = [];
const withRenderSlot = async <T>(fn: () => Promise<T>): Promise<T> => {
  if (running >= 2) await new Promise<void>(r => waiting.push(r));
  running++;
  try {
    return await fn();
  } finally {
    running--;
    waiting.shift()?.();
  }
};

// ── MCP server ───────────────────────────────────────────────────────────────────────────────

const inputHelp = (mode: Mode) => mode.kind === 'stdio'
  ? 'image accepts a local file path (absolute, relative to the server\'s working directory, or ~/...), an http(s) URL or a data URI.'
  : `image accepts an https URL, a data URI, or an upload reference. To use a local file, upload it first: ` +
    `curl -s --data-binary @screen.png -H "Content-Type: image/png" ${mode.baseUrl}/uploads → {"image":"upload:<id>"}, ` +
    'then pass that value as image. Uploads expire after an hour.';

export const buildServer = (mode: Mode) => {
  const server = new McpServer(
    { name: 'storyframe', title: 'Storyframe: App Store screenshots', version: VERSION },
    {
      instructions:
        'Storyframe renders App Store marketing screenshots: the app screenshot inside an Apple device frame (iPhone 18/17 Pro Max, ' +
        'iPhone Duo open or closed, iPad Pro 13", MacBook Pro/Air, Apple Watch Ultra 3 / Series 11) on a branded background ' +
        'with a headline and description, at the exact sizes App Store Connect requires for each slot. Call get_design_options once, then render_screenshots with a brand ' +
        'and one entry per screen (repeat entries per device and locale). Check the returned previews and adjust. ' +
        inputHelp(mode),
    },
  );

  server.registerTool('get_design_options', {
    title: 'Get design options',
    description: 'Lists devices and required screenshot sizes, frame colours, typefaces, background presets, layout limits, defaults and copywriting tips for render_screenshots.',
    annotations: { readOnlyHint: true, openWorldHint: false },
  }, async () => ({
    content: [{
      type: 'text',
      text: JSON.stringify({
        ...designOptions(),
        imageInput: inputHelp(mode),
        ...(mode.kind === 'http' ? { upload: { method: 'POST', url: `${mode.baseUrl}/uploads`, body: 'raw PNG or JPEG bytes', maxBytes: MAX_IMAGE_BYTES, returns: '{"image":"upload:<id>"}' } } : {}),
        output: mode.kind === 'stdio'
          ? 'PNG files written to outputDir as <device>/<locale>/screen_<n>.png (iPhone_6.9, iPhone_Duo_Inner, iPad_13, Mac, Watch_Ultra, …), plus screenshots.zip when zip is true.'
          : 'Download links to each PNG and to a ZIP of the whole set (<device>/<locale>/screen_<n>.png), valid for one hour.',
      }, null, 2),
    }],
  }));

  server.registerTool('render_screenshots', {
    title: 'Render App Store screenshots',
    description:
      'Renders branded App Store screenshots. Put shared colours, fonts and layout in brand; each screens entry is one ' +
      'output image and may override any brand option. Order matters: screens are numbered per device and locale in ' +
      'the order given. Returns file locations, warnings and small previews to check the result. ' + inputHelp(mode),
    inputSchema: {
      brand: brandSchema.optional(),
      screens: z.array(screenSchema).min(1).max(MAX_SCREENS_PER_CALL),
      ...(mode.kind === 'stdio' ? {
        outputDir: z.string().optional().describe('Where to write the PNGs (default ./appstore-screenshots, relative to the server\'s working directory).'),
        zip: z.boolean().optional().describe('Also write screenshots.zip with the whole set (default false).'),
      } : {}),
      previews: z.boolean().optional().describe(`Include small previews of up to ${MAX_PREVIEWS} screens in the result (default true).`),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  }, async (args) => {
    const brand = args.brand ?? {};
    const policy: InputPolicy = mode.kind === 'stdio'
      ? { allowFiles: true, allowPrivateNetwork: true }
      : { allowFiles: false, allowPrivateNetwork: false, uploads };

    const warnings: string[] = [];
    const counters = new Map<string, number>();
    const rendered: { path: string; png: Buffer; preview: Buffer; label: string }[] = [];
    const imageCache = new Map<string, Promise<LoadedImage>>();

    try {
      await withRenderSlot(async () => {
        for (const [i, screen] of args.screens.entries()) {
          const label = `screens[${i}]`;
          let image: LoadedImage | null = null;
          if (screen.image) {
            let pending = imageCache.get(screen.image);
            if (!pending) imageCache.set(screen.image, pending = loadImage(screen.image, policy));
            image = await pending.catch(e => { throw new Error(`${label}: ${(e as Error).message}`); });
          }
          const resolved = resolveScreen(brand, screen, image, warnings, label);
          const folder = outputFolder(resolved.device, screen.locale ?? 'en-US');
          const n = (counters.get(folder) ?? 0) + 1;
          counters.set(folder, n);
          const { png, preview } = await renderScreen(resolved);
          rendered.push({ path: `${folder}/screen_${n}.png`, png, preview, label: `${folder}/screen_${n}.png — ${screen.title?.replace(/\n/g, ' ') || 'no title'}` });
          if (n > 10) warnings.push(`${folder}: App Store Connect accepts at most 10 screenshots per device and locale; screen_${n}.png is extra.`);
        }
      });
    } catch (e) {
      return { isError: true, content: [{ type: 'text', text: `Rendering failed: ${(e as Error).message}` }] };
    }

    const zipFiles = async () => {
      const zip = new JSZip();
      for (const r of rendered) zip.file(r.path, r.png);
      return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });
    };

    let summary: Record<string, unknown>;
    if (mode.kind === 'stdio') {
      const outDir = resolve(args.outputDir ?? 'appstore-screenshots');
      for (const r of rendered) {
        const file = join(outDir, r.path);
        await mkdir(dirname(file), { recursive: true });
        await writeFile(file, r.png);
      }
      let zipPath: string | undefined;
      if (args.zip) {
        zipPath = join(outDir, 'screenshots.zip');
        await writeFile(zipPath, await zipFiles());
      }
      summary = { outputDir: outDir, files: rendered.map(r => join(outDir, r.path)), zip: zipPath };
    } else {
      const id = token();
      results.set(id, { files: new Map(rendered.map(r => [r.path, r.png])), expires: Date.now() + FILE_TTL_MS });
      sweep();
      const base = `${mode.baseUrl}/files/${id}`;
      summary = {
        zip: `${base}/screenshots.zip`,
        files: rendered.map(r => `${base}/${r.path}`),
        expiresAt: new Date(Date.now() + FILE_TTL_MS).toISOString(),
      };
    }
    if (warnings.length) summary.warnings = warnings;

    const content: ({ type: 'text'; text: string } | { type: 'image'; data: string; mimeType: string })[] = [
      { type: 'text', text: `Rendered ${rendered.length} screenshot${rendered.length === 1 ? '' : 's'}.\n${JSON.stringify(summary, null, 2)}` },
    ];
    if (args.previews !== false) {
      for (const r of rendered.slice(0, MAX_PREVIEWS)) {
        content.push({ type: 'text', text: `Preview: ${r.label}` });
        content.push({ type: 'image', data: r.preview.toString('base64'), mimeType: 'image/png' });
      }
      if (rendered.length > MAX_PREVIEWS) content.push({ type: 'text', text: `${rendered.length - MAX_PREVIEWS} more not previewed.` });
    }
    return { content };
  });

  server.registerPrompt('app_store_screenshot_set', {
    title: 'Design an App Store screenshot set',
    description: 'Guides the model through planning copy and branding for a full screenshot set, then rendering it.',
    argsSchema: {
      app: z.string().describe('App name and what it does.'),
      screenshots: z.string().describe('The app screenshots to use (paths or URLs), in order, with what each shows.'),
      brand: z.string().optional().describe('Brand colours, fonts or style notes.'),
      locales: z.string().optional().describe('Locales to produce, e.g. "en-US, de-DE".'),
    },
  }, ({ app, screenshots, brand, locales }) => ({
    messages: [{
      role: 'user',
      content: {
        type: 'text',
        text: [
          `Create App Store screenshots for: ${app}`,
          `Screenshots: ${screenshots}`,
          brand ? `Brand: ${brand}` : 'Brand: derive a palette from the app\'s screenshots and name.',
          `Locales: ${locales || 'en-US'}`,
          '',
          '1. Call get_design_options.',
          '2. Write one benefit-led headline (2-5 words) and one short description per screenshot, strongest first; translate per locale (do not translate the app name).',
          '3. Choose one brand: background (preset or hex), text colours with good contrast, title/description typefaces, frame colour and device position.',
          '4. Call render_screenshots once with the brand and one screens entry per screenshot × locale (and × device if iPad screenshots exist).',
          '5. Review the previews: fix overflowing or awkward line breaks (use \\n), weak contrast, or the device covering text, and render again.',
          '6. Report where the files are.',
        ].join('\n'),
      },
    }],
  }));

  return server;
};

// ── Transports ───────────────────────────────────────────────────────────────────────────────

const readBody = (req: IncomingMessage, limit: number): Promise<Buffer> =>
  new Promise((resolveBody, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on('data', (c: Buffer) => {
      size += c.length;
      if (size > limit) {
        reject(new Error('Body too large'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolveBody(Buffer.concat(chunks)));
    req.on('error', reject);
  });

const json = (res: ServerResponse, status: number, body: unknown) => {
  res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
};

const cors = (res: ServerResponse) => {
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('access-control-allow-methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('access-control-allow-headers', 'content-type, mcp-session-id, mcp-protocol-version, authorization');
  res.setHeader('access-control-expose-headers', 'mcp-session-id');
};

/** Requests per client IP per minute, for uploads and tool calls on the public server. */
const hits = new Map<string, { count: number; reset: number }>();
const rateLimited = (req: IncomingMessage, limit: number) => {
  const ip = (req.headers['cf-connecting-ip'] as string) || (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress || '?';
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.reset < now) {
    hits.set(ip, { count: 1, reset: now + 60_000 });
    if (hits.size > 10_000) hits.clear();
    return false;
  }
  entry.count++;
  return entry.count > limit;
};

const startHttp = (port: number, prefix: string, publicUrl?: string) => {
  const http = createServer(async (req, res) => {
    cors(res);
    if (req.method === 'OPTIONS') return void res.writeHead(204).end();
    const url = new URL(req.url ?? '/', 'http://localhost');
    const path = url.pathname.startsWith(prefix) ? url.pathname.slice(prefix.length) || '/' : null;
    if (path === null) return json(res, 404, { error: 'Not found' });

    const proto = (req.headers['x-forwarded-proto'] as string)?.split(',')[0] || 'http';
    const baseUrl = publicUrl ?? `${proto}://${req.headers['x-forwarded-host'] ?? req.headers.host}${prefix}`;

    try {
      if (path === '/' || path === '') {
        if (req.method === 'POST') {
          if (rateLimited(req, 60)) return json(res, 429, { error: 'Too many requests; try again in a minute.' });
          // Stateless: a fresh server and transport per request.
          const server = buildServer({ kind: 'http', baseUrl });
          const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
          res.on('close', () => { void transport.close(); void server.close(); });
          await server.connect(transport);
          const body = JSON.parse((await readBody(req, 1024 * 1024 * 30)).toString('utf8') || 'null');
          await transport.handleRequest(req, res, body);
          return;
        }
        if (req.method === 'GET' && (req.headers.accept ?? '').includes('text/html')) {
          res.writeHead(302, { location: 'https://github.com/LinkAndreas/AppStore-Screenshot-Generator#-mcp-server-for-ai-agents' });
          return void res.end();
        }
        return json(res, 405, { jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed: this MCP endpoint is stateless, use POST.' }, id: null });
      }

      if (path === '/health') return json(res, 200, { ok: true, version: VERSION });

      if (path === '/uploads' && req.method === 'POST') {
        if (rateLimited(req, 60)) return json(res, 429, { error: 'Too many uploads; try again in a minute.' });
        const data = await readBody(req, MAX_IMAGE_BYTES);
        const image = toImage(data, 'upload');
        const id = token();
        uploads.set(id, { data, expires: Date.now() + FILE_TTL_MS });
        sweep();
        return json(res, 201, { image: `upload:${id}`, width: image.width, height: image.height, expiresAt: new Date(Date.now() + FILE_TTL_MS).toISOString() });
      }

      const fileMatch = path.match(/^\/files\/([A-Za-z0-9_-]+)\/(.+)$/);
      if (fileMatch && req.method === 'GET') {
        const result = results.get(fileMatch[1]);
        if (!result || result.expires < Date.now()) return json(res, 404, { error: 'Expired or unknown; render again.' });
        const name = decodeURIComponent(fileMatch[2]);
        if (name === 'screenshots.zip') {
          const zip = new JSZip();
          for (const [p, png] of result.files) zip.file(p, png);
          const data = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });
          res.writeHead(200, { 'content-type': 'application/zip', 'content-disposition': 'attachment; filename="Storyframe_Screenshots.zip"', 'cache-control': 'private, max-age=3600' });
          return void res.end(data);
        }
        const png = result.files.get(name);
        if (!png) return json(res, 404, { error: 'No such file in this result.' });
        res.writeHead(200, { 'content-type': 'image/png', 'cache-control': 'private, max-age=3600' });
        return void res.end(png);
      }

      return json(res, 404, { error: 'Not found' });
    } catch (e) {
      if (!res.headersSent) json(res, 400, { error: (e as Error).message });
    }
  });
  http.listen(port, () => console.error(`App Store screenshot MCP server on http://0.0.0.0:${port}${prefix}`));
};

const main = async () => {
  const argv = process.argv.slice(2);
  const httpMode = argv.includes('--http') || process.env.MCP_TRANSPORT === 'http';
  if (httpMode) {
    startHttp(Number(process.env.PORT ?? 3000), process.env.MCP_PATH_PREFIX ?? '/mcp', process.env.PUBLIC_URL?.replace(/\/$/, ''));
  } else {
    const server = buildServer({ kind: 'stdio' });
    await server.connect(new StdioServerTransport());
  }
};

main().catch(e => {
  console.error(e);
  process.exit(1);
});
