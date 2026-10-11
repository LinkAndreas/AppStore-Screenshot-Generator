import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Font } from 'satori';
import { BEZELS, type BezelSpec } from '../../src/shared/layout';
import { SCREEN_FONTS, type ScreenFont } from '../../src/shared/fonts';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

/**
 * Bezel PNGs live in the web app's src/assets/Bezels. The Docker image copies them next to the
 * server (assets/Bezels); in a checkout they are found relative to mcp/.
 */
const bezelDir = (() => {
  const candidates = [
    process.env.BEZEL_DIR,
    resolve(here, '../assets/Bezels'),
    resolve(here, '../../src/assets/Bezels'),
    resolve(here, '../../../src/assets/Bezels'),
  ].filter((p): p is string => !!p);
  const found = candidates.find(p => existsSync(p));
  if (!found) throw new Error(`Bezel assets not found; looked in ${candidates.join(', ')}. Set BEZEL_DIR.`);
  return found;
})();

const bezelCache = new Map<string, string>();

/** Bezel PNG as a data URI, cached. */
export const bezelDataUri = (bezel: BezelSpec): string => {
  let uri = bezelCache.get(bezel.name);
  if (!uri) {
    uri = `data:image/png;base64,${readFileSync(join(bezelDir, bezel.file)).toString('base64')}`;
    bezelCache.set(bezel.name, uri);
  }
  return uri;
};

export const findBezel = (device: string, color?: string): BezelSpec | undefined =>
  BEZELS.find(b => b.device === device && (!color || b.color.toLowerCase() === color.toLowerCase()));

let fontCache: Font[] | null = null;

const fontFile = (font: ScreenFont, weight: number, style: 'normal' | 'italic', subset: string) => {
  const pkgDir = dirname(require.resolve(`@fontsource/${font.id}/package.json`));
  return join(pkgDir, 'files', `${font.id}-${subset}-${weight}-${style}.woff`);
};

/**
 * Every screen typeface as satori fonts. Latin and Latin Extended are separate files with the
 * same family name; satori falls through them per glyph.
 */
export const loadScreenFonts = (): Font[] => {
  if (fontCache) return fontCache;
  const fonts: Font[] = [];
  for (const font of SCREEN_FONTS) {
    for (const weight of font.weights) {
      for (const style of ['normal', 'italic'] as const) {
        if (style === 'italic' && !font.hasItalic) continue;
        for (const subset of ['latin', 'latin-ext']) {
          const file = fontFile(font, weight, style, subset);
          if (!existsSync(file)) continue;
          fonts.push({ name: font.family, data: readFileSync(file), weight: weight as Font['weight'], style });
        }
      }
    }
  }
  fontCache = fonts;
  return fonts;
};

/** Google Noto families used for scripts the bundled typefaces don't cover (e.g. Japanese). */
const NOTO_FOR_SCRIPT: Record<string, string> = {
  'ja-JP': 'Noto Sans JP',
  'ko-KR': 'Noto Sans KR',
  'zh-CN': 'Noto Sans SC',
  'zh-TW': 'Noto Sans TC',
  'zh-HK': 'Noto Sans HK',
  'th-TH': 'Noto Sans Thai',
  'ar-AR': 'Noto Sans Arabic',
  'he-IL': 'Noto Sans Hebrew',
  'bn-IN': 'Noto Sans Bengali',
  'ta-IN': 'Noto Sans Tamil',
  'te-IN': 'Noto Sans Telugu',
  'ml-IN': 'Noto Sans Malayalam',
  devanagari: 'Noto Sans Devanagari',
  kannada: 'Noto Sans Kannada',
  symbol: 'Noto Sans Symbols',
  math: 'Noto Sans Math',
  unknown: 'Noto Sans',
};

const fallbackCache = new Map<string, Promise<Font[]>>();

/**
 * Fetches a subset of a Noto font from Google Fonts for glyphs no bundled font has. The subset
 * covers all of `screenText`, so one screen gets one font per script (separate subsets for the
 * same language would shadow each other). Without network access this resolves to no fonts and
 * satori draws empty boxes for those glyphs.
 */
export const loadFallbackFont = (languageCode: string, segment: string, locale: string | undefined, screenText: string): Promise<Font[]> => {
  // Satori lists every candidate for shared characters (e.g. Han: "ja-JP|zh-CN|zh-TW|zh-HK");
  // prefer the screen's locale so Japanese text gets Japanese glyph forms.
  const candidates = languageCode.split('|');
  const code = candidates.find(c => locale && c.toLowerCase() === locale.toLowerCase())
    ?? candidates.find(c => locale && c.split('-')[0] === locale.split('-')[0].toLowerCase())
    ?? candidates[0];
  const family = NOTO_FOR_SCRIPT[code] ?? (code === 'emoji' ? undefined : 'Noto Sans');
  if (!family || segment.trim() === '') return Promise.resolve([]);
  const text = [...new Set(screenText.replace(/\s/g, ''))].sort().join('');
  const key = `${family}|${text}`;
  let pending = fallbackCache.get(key);
  if (!pending) {
    pending = Promise.all([400, 700].map(async weight => {
      const css = await fetch(
        `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&text=${encodeURIComponent(text)}`,
        { signal: AbortSignal.timeout(8000) },
      ).then(r => (r.ok ? r.text() : ''));
      const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
      if (!url) return null;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      const data = Buffer.from(await res.arrayBuffer());
      // Only accept TrueType / OpenType data; anything else (an error page) would make satori throw.
      const signature = data.subarray(0, 4).toString('latin1');
      if (!res.ok || !['\0\x01\0\0', 'OTTO', 'true'].includes(signature)) {
        console.error(`[fonts] ${family} ${weight}: unusable response (${res.status}, ${JSON.stringify(signature)}) for ${url}`);
        return null;
      }
      // Each subset needs its own name (satori keeps one font per name and weight) and the script's
      // language, without which satori doesn't use it for shared characters such as Han.
      return {
        name: `${family} ${fallbackCache.size}`,
        data,
        weight: weight as Font['weight'],
        style: 'normal' as const,
        ...(code in NOTO_FOR_SCRIPT && code !== 'unknown' ? { lang: code } : {}),
      };
    })).then(fonts => fonts.filter((f): f is NonNullable<typeof f> => f !== null)).catch(() => []);
    fallbackCache.set(key, pending);
    if (fallbackCache.size > 500) fallbackCache.delete(fallbackCache.keys().next().value!);
  }
  return pending;
};
