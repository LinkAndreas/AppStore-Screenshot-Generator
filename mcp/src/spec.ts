import { z } from 'zod';
import { BEZELS, DEFAULT_BEZEL, DEVICE_EXPORT_NAMES, DEVICE_LAYOUT, LAYOUT_LIMITS, SCREEN_DIMENSIONS, type DeviceType } from '../../src/shared/layout';
import { DEFAULT_SUBTITLE_FONT, DEFAULT_TITLE_FONT, SCREEN_FONTS, type ScreenFontId } from '../../src/shared/fonts';
import { GRADIENT_PRESETS, SOLID_PRESETS } from '../../src/shared/presets';
import type { LoadedImage } from './inputs';
import type { ResolvedScreen } from './render';

const hex = z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i, 'Use a hex colour like #1a2b3c');
const fontId = z.enum(SCREEN_FONTS.map(f => f.id) as [ScreenFontId, ...ScreenFontId[]]);
const align = z.enum(['left', 'center', 'right']);

/** Visual options shared by the brand and each screen; a screen's values override the brand's. */
export const styleShape = {
  backgroundPreset: z.string().optional().describe('Name of a gradient or solid preset from get_design_options. Overridden by backgroundColor / gradientFrom+gradientTo.'),
  backgroundColor: hex.optional().describe('Solid background colour.'),
  gradientFrom: hex.optional().describe('Gradient start colour (top left, 135°). Needs gradientTo.'),
  gradientTo: hex.optional().describe('Gradient end colour (bottom right).'),
  titleColor: hex.optional(),
  subtitleColor: hex.optional(),
  titleFont: fontId.optional().describe(`Headline typeface (default ${DEFAULT_TITLE_FONT}).`),
  subtitleFont: fontId.optional().describe(`Description typeface (default ${DEFAULT_SUBTITLE_FONT}).`),
  titleSize: z.number().int().min(24).max(320).optional().describe('Headline size in px of the final image (default 120 iPhone / 144 iPad).'),
  subtitleSize: z.number().int().min(16).max(200).optional().describe('Description size in px (default 60 iPhone / 72 iPad).'),
  titleBold: z.boolean().optional().describe('Default true.'),
  subtitleBold: z.boolean().optional().describe('Default false.'),
  titleItalic: z.boolean().optional(),
  subtitleItalic: z.boolean().optional(),
  textAlign: align.optional().describe('Alignment of both text lines (default center).'),
  bezelColor: z.string().optional().describe('Device frame colour: iPhone Silver | Deep Blue | Cosmic Orange; iPad Silver | Space Gray.'),
  devicePosition: z.enum(['top', 'center', 'bottom']).optional().describe('Where the device sits below the text (default top).'),
  scale: z.number().min(0.2).max(LAYOUT_LIMITS.scale.max).optional().describe('Device size; 1 = 1120 px wide (default 1 iPhone / 1.5 iPad). Values above 1 let the device bleed off the bottom.'),
  rotation: z.number().min(LAYOUT_LIMITS.rotation.min).max(LAYOUT_LIMITS.rotation.max).optional().describe('Device rotation in degrees.'),
  offsetX: z.number().min(LAYOUT_LIMITS.offset.min).max(LAYOUT_LIMITS.offset.max).optional().describe('Horizontal device shift in px.'),
  offsetY: z.number().min(LAYOUT_LIMITS.offset.min).max(LAYOUT_LIMITS.offset.max).optional().describe('Vertical device shift in px.'),
};

export const brandSchema = z.object(styleShape).describe('Brand defaults applied to every screen.');

export const screenSchema = z.object({
  image: z.string().optional().describe('The app screenshot: a local file path (local server only), an https URL, a data URI, or an "upload:<id>" reference. Omit for an empty device frame.'),
  device: z.enum(['iPhone', 'iPad']).optional().describe('Defaults to the device matching the image aspect ratio, else iPhone.'),
  locale: z.string().optional().describe('Locale folder for the output, e.g. en-US, de-DE (default en-US).'),
  title: z.string().max(200).optional().describe('Headline. Use \\n for line breaks. Empty hides it.'),
  subtitle: z.string().max(400).optional().describe('Description line. Empty hides it.'),
  ...styleShape,
});

export type StyleInput = z.infer<typeof brandSchema>;
export type ScreenInput = z.infer<typeof screenSchema>;

type Background = ResolvedScreen['background'];

const layerBackground = (layer: StyleInput): Background | undefined => {
  if (layer.gradientFrom && layer.gradientTo) return { type: 'gradient', from: layer.gradientFrom, to: layer.gradientTo };
  if (layer.backgroundColor) return { type: 'solid', color: layer.backgroundColor };
  if (layer.backgroundPreset) {
    const name = layer.backgroundPreset.toLowerCase();
    const gradient = GRADIENT_PRESETS.find(p => p.name.toLowerCase() === name);
    if (gradient) return { type: 'gradient', from: gradient.start, to: gradient.end };
    const solid = SOLID_PRESETS.find(p => p.name.toLowerCase() === name);
    if (solid) return { type: 'solid', color: solid.color };
    throw new Error(`Unknown backgroundPreset "${layer.backgroundPreset}". See get_design_options for preset names.`);
  }
  if (layer.gradientFrom || layer.gradientTo) throw new Error('gradientFrom and gradientTo must be set together.');
  return undefined;
};

/** Guesses the device from the screenshot's aspect ratio (iPhone ≈ 0.46, iPad ≈ 0.75). */
const inferDevice = (image: LoadedImage | null): DeviceType =>
  image && image.width / image.height > 0.6 ? 'iPad' : 'iPhone';

/** Merges defaults, brand and screen into a screen the renderer can draw; collects warnings. */
export const resolveScreen = (brand: StyleInput, screen: ScreenInput, image: LoadedImage | null, warnings: string[], label: string): ResolvedScreen => {
  const device = screen.device ?? inferDevice(image);
  const layout = DEVICE_LAYOUT[device];
  const pick = <K extends keyof StyleInput>(key: K): StyleInput[K] => (screen[key] !== undefined ? screen[key] : brand[key]);

  const bezelColor = pick('bezelColor');
  const bezel = bezelColor
    ? BEZELS.find(b => b.device === device && b.color.toLowerCase() === bezelColor.toLowerCase())
    : BEZELS.find(b => b.name === DEFAULT_BEZEL[device]);
  if (!bezel) {
    const options = BEZELS.filter(b => b.device === device).map(b => b.color).join(', ');
    throw new Error(`${label}: no ${device} frame in "${bezelColor}". Available: ${options}.`);
  }

  if (image) {
    const want = SCREEN_DIMENSIONS[device];
    if (image.width !== want.width || image.height !== want.height) {
      const ratioDiff = Math.abs(image.width / image.height - want.width / want.height) / (want.width / want.height);
      warnings.push(`${label}: image is ${image.width}×${image.height}; ${device} screenshots should be ${want.width}×${want.height}. ` +
        (ratioDiff > 0.02 ? 'The aspect ratio differs, so it was scaled to fill and cropped.' : 'It was scaled to fit.'));
    }
  }

  const textAlign = pick('textAlign') ?? 'center';
  return {
    device,
    locale: screen.locale ?? 'en-US',
    bezel,
    image,
    title: screen.title ?? '',
    subtitle: screen.subtitle ?? '',
    background: layerBackground(screen) ?? layerBackground(brand) ?? { type: 'gradient', from: '#0f172a', to: '#3b82f6' },
    titleColor: pick('titleColor') ?? '#ffffff',
    subtitleColor: pick('subtitleColor') ?? '#ffffff',
    titleFont: pick('titleFont') ?? DEFAULT_TITLE_FONT,
    subtitleFont: pick('subtitleFont') ?? DEFAULT_SUBTITLE_FONT,
    titleSize: pick('titleSize') ?? layout.defaultTitleSize,
    subtitleSize: pick('subtitleSize') ?? layout.defaultSubtitleSize,
    titleBold: pick('titleBold') ?? true,
    subtitleBold: pick('subtitleBold') ?? false,
    titleItalic: pick('titleItalic') ?? false,
    subtitleItalic: pick('subtitleItalic') ?? false,
    titleAlign: textAlign,
    subtitleAlign: textAlign,
    devicePosition: pick('devicePosition') ?? 'top',
    scale: pick('scale') ?? layout.defaultScale,
    rotation: pick('rotation') ?? 0,
    offsetX: pick('offsetX') ?? 0,
    offsetY: pick('offsetY') ?? 0,
  };
};

/** Output path of a screen, matching the web app's ZIP layout: iPhone_6.9/en-US/screen_1.png. */
export const outputFolder = (device: DeviceType, locale: string) =>
  `${DEVICE_EXPORT_NAMES[device]}/${locale.replace(/[^A-Za-z0-9_-]/g, '_')}`;

/** Everything a model needs to choose options, returned by get_design_options. */
export const designOptions = () => ({
  devices: (['iPhone', 'iPad'] as const).map(device => ({
    device,
    appStoreDisplay: device === 'iPhone' ? 'iPhone 6.9" (iPhone 17 Pro Max)' : 'iPad 13" (iPad Pro M4)',
    outputSize: SCREEN_DIMENSIONS[device],
    expectedScreenshotSize: SCREEN_DIMENSIONS[device],
    bezelColors: BEZELS.filter(b => b.device === device).map(b => b.color),
    defaults: {
      bezelColor: BEZELS.find(b => b.name === DEFAULT_BEZEL[device])!.color,
      scale: DEVICE_LAYOUT[device].defaultScale,
      titleSize: DEVICE_LAYOUT[device].defaultTitleSize,
      subtitleSize: DEVICE_LAYOUT[device].defaultSubtitleSize,
    },
  })),
  fonts: SCREEN_FONTS.map(f => ({ id: f.id, name: f.label, category: f.category, weights: f.weights, italic: f.hasItalic })),
  gradientPresets: GRADIENT_PRESETS.map(p => ({ name: p.name, from: p.start, to: p.end })),
  solidPresets: SOLID_PRESETS.map(p => ({ name: p.name, color: p.color })),
  layout: {
    devicePosition: ['top', 'center', 'bottom'],
    scale: { min: 0.2, max: LAYOUT_LIMITS.scale.max },
    rotation: LAYOUT_LIMITS.rotation,
    offset: LAYOUT_LIMITS.offset,
    textAlign: ['left', 'center', 'right'],
  },
  defaults: {
    background: { gradientFrom: '#0f172a', gradientTo: '#3b82f6' },
    titleColor: '#ffffff',
    subtitleColor: '#ffffff',
    titleFont: DEFAULT_TITLE_FONT,
    subtitleFont: DEFAULT_SUBTITLE_FONT,
    devicePosition: 'top',
  },
  copywriting: [
    'One benefit per screen; the first 2-3 screens appear in search results, so lead with the strongest.',
    'Headlines of 2-5 words read best; break long ones with \\n rather than shrinking the size.',
    'Keep the description to one short line that supports the headline.',
    'Use the same brand colours, fonts and device position on every screen so the set reads as one story.',
    'Make sure text colour contrasts with the background (light text on dark backgrounds and vice versa).',
  ],
});
