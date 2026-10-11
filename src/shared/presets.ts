/**
 * Background and text colour presets offered by the editor and by the MCP server.
 */

export type GradientCategory = 'vibrant' | 'warm' | 'cool' | 'soft' | 'dark';

export const GRADIENT_CATEGORIES: GradientCategory[] = ['vibrant', 'warm', 'cool', 'soft', 'dark'];

export interface GradientPreset {
  name: string;
  start: string;
  end: string;
  category: GradientCategory;
}

const g = (category: GradientCategory, items: [string, string, string][]): GradientPreset[] =>
  items.map(([name, start, end]) => ({ name, start, end, category }));

export const GRADIENT_PRESETS: GradientPreset[] = [
  ...g('vibrant', [
    ['Aurora', '#00c6ff', '#0072ff'],
    ['Royal Indigo', '#4f46e5', '#7c3aed'],
    ['Royal Purple', '#4776e6', '#8e54e9'],
    ['Electric Violet', '#7c3aed', '#c026d3'],
    ['Ultraviolet', '#7f00ff', '#e100ff'],
    ['Neon Pink', '#f953c6', '#b91d73'],
    ['Berry Blast', '#9d174d', '#db2777'],
    ['Lagoon', '#11998e', '#38ef7d'],
    ['Deep Forest', '#064e3b', '#10b981'],
    ['Midnight Sun', '#2c3e50', '#fd746c'],
  ]),
  ...g('warm', [
    ['Flamingo', '#ff5f6d', '#ffc371'],
    ['Firework', '#f43f5e', '#ea580c'],
    ['Cherry', '#eb3349', '#f45c43'],
    ['Juicy Orange', '#ff8008', '#ffc837'],
    ['Amber Glow', '#d97706', '#f59e0b'],
    ['Zest Orange', '#ea580c', '#f97316'],
    ['Sunset Rose', '#f43f5e', '#fb7185'],
    ['Hot Pink', '#ec4899', '#f472b6'],
    ['Tangerine', '#fb923c', '#fdba74'],
    ['Peach Kiss', '#f97316', '#fdba74'],
    ['Rose Gold', '#f43f5e', '#fca5a5'],
  ]),
  ...g('cool', [
    ['Electric Sky', '#3b82f6', '#0ea5e9'],
    ['Pacific', '#2193b0', '#6dd5ed'],
    ['Cyan Teal', '#0d9488', '#2dd4bf'],
    ['Ocean Depth', '#0c4a6e', '#075985'],
    ['Space Indigo', '#1e1b4b', '#4338ca'],
    ['Glacier', '#74ebd5', '#9face6'],
  ]),
  ...g('soft', [
    ['Peach Sorbet', '#ffecd2', '#fcb69f'],
    ['Cloud Nine', '#a1c4fd', '#c2e9fb'],
    ['Lilac Dream', '#e0c3fc', '#8ec5fc'],
    ['Rose Quartz', '#fbc2eb', '#a6c1ee'],
    ['Pistachio', '#d4fc79', '#96e6a1'],
    ['Sorbet', '#ffd1ff', '#fad0c4'],
    ['Sunbeam', '#fdfcfb', '#e2d1c3'],
    ['Lavender Mist', '#ede9fe', '#ddd6fe'],
    ['Peach Dream', '#ffedd5', '#fed7aa'],
    ['Mint Breeze', '#f0fdf4', '#bbf7d0'],
    ['Ice Blue', '#f0f9ff', '#bae6fd'],
    ['Silver Cloud', '#f1f5f9', '#cbd5e1'],
    ['Marshmallow', '#fdf2f8', '#fce7f3'],
  ]),
  ...g('dark', [
    ['Midnight', '#0f172a', '#1e293b'],
    ['Midnight Aurora', '#0f2027', '#2c5364'],
    ['Deep Sea', '#141e30', '#243b55'],
    ['Deep Space', '#020617', '#1e1b4b'],
    ['Nebula', '#1f1c2c', '#928dab'],
    ['Velvet', '#642b73', '#c6426e'],
    ['Forest Night', '#0b3d2e', '#1f6f50'],
    ['Emerald Night', '#065f46', '#022c22'],
    ['Obsidian', '#000000', '#434343'],
    ['Coal Slate', '#1e293b', '#0f172a'],
    ['Graphite', '#334155', '#1e293b'],
    ['Clay Ground', '#7c2d12', '#9a3412'],
  ]),
];

export const SOLID_PRESETS = [
  /* ESSENTIALS */
  { name: 'Pure White', color: '#ffffff' },
  { name: 'Slate 50', color: '#f8fafc' },
  { name: 'Slate 100', color: '#f1f5f9' },
  { name: 'Slate 900', color: '#0f172a' },
  { name: 'Pitch Black', color: '#000000' },

  /* SOPHISTICATED NEUTRALS (APPLE-LIKE) */
  { name: 'Starlight', color: '#fafaf9' },
  { name: 'Silver Cloud', color: '#e2e8f0' },
  { name: 'Space Gray', color: '#4b5563' },
  { name: 'Graphite', color: '#1f2937' },
  { name: 'Midnight', color: '#010b13' },

  /* BRAND COLORS */
  { name: 'Indigo 600', color: '#4f46e5' },
  { name: 'Royal Blue', color: '#2563eb' },
  { name: 'Sky 500', color: '#0ea5e9' },
  { name: 'Teal 600', color: '#0d9488' },
  { name: 'Mint Green', color: '#10b981' },
  { name: 'Forest Green', color: '#166534' },
  { name: 'Golden Amber', color: '#f59e0b' },
  { name: 'Solar Orange', color: '#ea580c' },
  { name: 'Ember Red', color: '#f43f5e' },
  { name: 'Rose Gold', color: '#fca5a5' },

  /* PROFESSIONAL TONES */
  { name: 'Violet 600', color: '#7c3aed' },
  { name: 'Deep Purple', color: '#4c1d95' },
  { name: 'Crimson Night', color: '#7f1d1d' },
  { name: 'Dark Teal', color: '#134e4a' },
  { name: 'Olive Drab', color: '#3f6212' },
  { name: 'Coffee Brown', color: '#451a03' },
  { name: 'Zinc 700', color: '#3f3f46' },
  { name: 'Stone 900', color: '#1c1917' },
];

export const FONT_COLOR_PRESETS = [
  '#ffffff', '#f8fafc', '#94a3b8', '#475569', '#1e293b', '#0f172a', '#000000',
  '#2563eb', '#0ea5e9', '#10b981', '#f43f5e', '#f97316', '#8b5cf6'
];

/** Text colours used when the text colour follows the background ("Auto"). */
export const LIGHT_TEXT = '#ffffff';
export const DARK_TEXT = '#1d1d1f';

const luminance = (hex: string) => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h.slice(0, 6);
  const [r, g, b] = [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/**
 * White or near-black text for a background (averaged over a gradient). Marketing screenshots use
 * white on saturated colours, so dark text is only chosen for clearly light backgrounds.
 */
export const readableTextColor = (...backgroundColors: string[]) => {
  const valid = backgroundColors.filter(c => /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(c));
  if (!valid.length) return LIGHT_TEXT;
  const l = valid.reduce((sum, c) => sum + luminance(c), 0) / valid.length;
  return l > 0.45 ? DARK_TEXT : LIGHT_TEXT;
};
