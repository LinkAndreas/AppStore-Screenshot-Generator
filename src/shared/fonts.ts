/**
 * Typefaces available for screenshot headlines and descriptions.
 *
 * Shared by the web editor (loaded through src/styles/screen-fonts.css) and the MCP renderer
 * (which reads the matching .woff files from the @fontsource packages), so both produce the
 * same output. Keep this list, screen-fonts.css and the installed @fontsource packages in sync.
 */

export type ScreenFontId =
  | 'outfit'
  | 'inter'
  | 'manrope'
  | 'dm-sans'
  | 'space-grotesk'
  | 'playfair-display'
  | 'fraunces'
  | 'instrument-serif';

export interface ScreenFont {
  id: ScreenFontId;
  label: string;
  /** CSS font-family name registered by @fontsource. */
  family: string;
  category: 'sans' | 'serif';
  /** Weights that ship as font files; other weights fall back to the closest one. */
  weights: number[];
  hasItalic: boolean;
}

export const SCREEN_FONTS: ScreenFont[] = [
  { id: 'outfit', label: 'Outfit', family: 'Outfit', category: 'sans', weights: [400, 500, 700, 800], hasItalic: false },
  { id: 'inter', label: 'Inter', family: 'Inter', category: 'sans', weights: [400, 500, 700, 800], hasItalic: true },
  { id: 'manrope', label: 'Manrope', family: 'Manrope', category: 'sans', weights: [400, 500, 700, 800], hasItalic: false },
  { id: 'dm-sans', label: 'DM Sans', family: 'DM Sans', category: 'sans', weights: [400, 500, 700, 800], hasItalic: true },
  { id: 'space-grotesk', label: 'Space Grotesk', family: 'Space Grotesk', category: 'sans', weights: [400, 500, 700], hasItalic: false },
  { id: 'playfair-display', label: 'Playfair Display', family: 'Playfair Display', category: 'serif', weights: [400, 500, 700, 800], hasItalic: true },
  { id: 'fraunces', label: 'Fraunces', family: 'Fraunces', category: 'serif', weights: [400, 500, 700, 800], hasItalic: true },
  { id: 'instrument-serif', label: 'Instrument Serif', family: 'Instrument Serif', category: 'serif', weights: [400], hasItalic: true },
];

/** Defaults match the typefaces screenshots used before fonts became configurable. */
export const DEFAULT_TITLE_FONT: ScreenFontId = 'outfit';
export const DEFAULT_SUBTITLE_FONT: ScreenFontId = 'inter';

export const getScreenFont = (id: string | undefined, fallback: ScreenFontId): ScreenFont =>
  SCREEN_FONTS.find(f => f.id === id) ?? SCREEN_FONTS.find(f => f.id === fallback)!;

/** CSS font-family stack for a screen font, with a generic fallback for missing glyphs. */
export const screenFontStack = (font: ScreenFont) =>
  `'${font.family}', ${font.category === 'serif' ? 'Georgia, serif' : 'system-ui, sans-serif'}`;
