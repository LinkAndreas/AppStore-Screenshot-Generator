import { readFile } from 'node:fs/promises';
import { lookup } from 'node:dns';
import { request as httpRequest, type IncomingMessage } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { isIP, type LookupFunction } from 'node:net';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { imageSize } from 'image-size';

export const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

export interface LoadedImage {
  dataUri: string;
  width: number;
  height: number;
}

export interface InputPolicy {
  /** Local file paths are only readable when the server runs on the user's machine (stdio). */
  allowFiles: boolean;
  /** Hosted mode refuses URLs that resolve to private or loopback addresses. */
  allowPrivateNetwork: boolean;
  /** Images uploaded through POST /uploads, referenced as "upload:<id>". */
  uploads?: Map<string, { data: Buffer; expires: number }>;
}

/** Validates the bytes as a PNG or JPEG and returns them as a data URI with their size. */
export const toImage = (data: Buffer, source: string): LoadedImage => {
  if (data.length > MAX_IMAGE_BYTES) throw new Error(`${source}: image is larger than 20 MB`);
  let info;
  try {
    info = imageSize(data);
  } catch {
    throw new Error(`${source}: not a readable image`);
  }
  const mime = info.type === 'png' ? 'image/png' : info.type === 'jpg' ? 'image/jpeg' : null;
  if (!mime || !info.width || !info.height) throw new Error(`${source}: only PNG and JPEG screenshots are supported (got ${info.type})`);
  return { dataUri: `data:${mime};base64,${data.toString('base64')}`, width: info.width, height: info.height };
};

const isPrivateAddress = (address: string): boolean => {
  if (isIP(address) === 4) {
    const [a, b] = address.split('.').map(Number);
    return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254)
      || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 198 && (b === 18 || b === 19)) || a >= 224;
  }
  const v6 = address.toLowerCase();
  const mapped = v6.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateAddress(mapped[1]);
  return v6 === '::' || v6 === '::1' || v6.startsWith('fc') || v6.startsWith('fd') || v6.startsWith('fe80') || v6.startsWith('ff');
};

/** DNS lookup that refuses private addresses, checked at connect time so rebinding can't bypass it. */
const publicOnlyLookup: LookupFunction = (hostname, options, callback) => {
  lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err, '', 0);
    const list = addresses as unknown as { address: string; family: number }[];
    const blocked = list.find(a => isPrivateAddress(a.address));
    if (blocked) return callback(new Error(`${hostname} resolves to a private address`), '', 0);
    if ((options as { all?: boolean }).all) return (callback as unknown as (e: null, a: typeof list) => void)(null, list);
    callback(null, list[0].address, list[0].family);
  });
};

const fetchUrl = (url: string, allowPrivate: boolean, redirects = 3): Promise<Buffer> =>
  new Promise((resolvePromise, reject) => {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return reject(new Error(`${url}: only http(s) URLs are supported`));
    if (!allowPrivate && isIP(parsed.hostname) && isPrivateAddress(parsed.hostname)) return reject(new Error(`${url}: private addresses are not allowed`));
    const req = (parsed.protocol === 'https:' ? httpsRequest : httpRequest)(parsed, {
      method: 'GET',
      timeout: 15000,
      headers: { 'user-agent': 'appstore-screenshot-mcp', accept: 'image/png,image/jpeg,*/*;q=0.5' },
      ...(allowPrivate ? {} : { lookup: publicOnlyLookup }),
    }, (res: IncomingMessage) => {
      const status = res.statusCode ?? 0;
      if (status >= 300 && status < 400 && res.headers.location) {
        res.resume();
        if (redirects === 0) return reject(new Error(`${url}: too many redirects`));
        return resolvePromise(fetchUrl(new URL(res.headers.location, url).toString(), allowPrivate, redirects - 1));
      }
      if (status !== 200) {
        res.resume();
        return reject(new Error(`${url}: HTTP ${status}`));
      }
      const chunks: Buffer[] = [];
      let size = 0;
      res.on('data', (chunk: Buffer) => {
        size += chunk.length;
        if (size > MAX_IMAGE_BYTES) {
          req.destroy(new Error(`${url}: image is larger than 20 MB`));
          return;
        }
        chunks.push(chunk);
      });
      res.on('end', () => resolvePromise(Buffer.concat(chunks)));
      res.on('error', reject);
    });
    req.on('timeout', () => req.destroy(new Error(`${url}: timed out`)));
    req.on('error', reject);
    req.end();
  });

/**
 * Loads a screenshot from a data URI, an upload reference, an http(s) URL or (stdio only) a file
 * path, and returns it as a data URI.
 */
export const loadImage = async (source: string, policy: InputPolicy): Promise<LoadedImage> => {
  const ref = source.trim();
  if (ref.startsWith('data:')) {
    const match = ref.match(/^data:image\/[a-z+.-]+;base64,(.+)$/i);
    if (!match) throw new Error('data URI must be base64 encoded (data:image/png;base64,...)');
    return toImage(Buffer.from(match[1], 'base64'), 'data URI');
  }
  if (ref.startsWith('upload:')) {
    const upload = policy.uploads?.get(ref.slice('upload:'.length));
    if (!upload || upload.expires < Date.now()) throw new Error(`${ref}: unknown or expired upload; upload the file again`);
    return toImage(upload.data, ref);
  }
  if (/^https?:\/\//i.test(ref)) {
    return toImage(await fetchUrl(ref, policy.allowPrivateNetwork), ref);
  }
  if (!policy.allowFiles) {
    throw new Error(`"${ref}" is not a URL. This hosted server cannot read local files: pass an https URL, a data URI, or upload the file (see get_design_options → upload).`);
  }
  const path = ref.startsWith('file://') ? new URL(ref).pathname : resolve(ref.replace(/^~(?=\/|$)/, homedir()));
  return toImage(await readFile(path), path);
};
