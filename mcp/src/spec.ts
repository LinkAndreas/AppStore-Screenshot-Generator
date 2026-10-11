import { z } from 'zod';
import {
  BEZELS, DEFAULT_BEZEL, DEVICES, DEVICE_EXPORT_NAMES, DEVICE_LAYOUT, DEVICE_TYPES, LAYOUT_LIMITS, bezelsForDevice, offsetLimit,
  screenshotFits, type DeviceType,
} from '../../src/shared/layout';
import { DEFAULT_SUBTITLE_FONT, DEFAULT_TITLE_FONT, SCREEN_FONTS, type ScreenFontId } from '../../src/shared/fonts';
import { GRADIENT_PRESETS, SOLID_PRESETS, readableTextColor } from '../../src/shared/presets';
import { LAYOUT_PRESETS, presetValues, type LayoutPresetId } from '../../src/shared/layoutPresets';
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
  titleSize: z.number().int().min(12).max(320).optional().describe('Headline size in px of the final image (defaults per device, e.g. 120 iPhone, 144 iPad, 36 Watch).'),
  subtitleSize: z.number().int().min(10).max(200).optional().describe('Description size in px (defaults per device, e.g. 60 iPhone, 72 iPad, 19 Watch).'),
  titleBold: z.boolean().optional().describe('Default true.'),
  subtitleBold: z.boolean().optional().describe('Default false.'),
  titleItalic: z.boolean().optional(),
  subtitleItalic: z.boolean().optional(),
  textAlign: align.optional().describe('Alignment of both text lines (default center).'),
  frameModel: z.string().optional().describe('Device frame model, e.g. "iPhone 18 Pro Max", "iPhone 17 Pro Max", "MacBook Air" (see get_design_options). Default: the newest model.'),
  bezelColor: z.string().optional().describe('Device frame colour, e.g. Silver, Black, Cosmic Orange, Space Black, Midnight (see get_design_options).'),
  layoutPreset: z.enum(LAYOUT_PRESETS.map(p => p.id) as [LayoutPresetId, ...LayoutPresetId[]]).optional().describe(
    'Composition: ' + LAYOUT_PRESETS.map(p => `${p.id} (${p.description})`).join('; ') + ' Default classic. scale, rotation, offsets, devicePosition and textPosition fine-tune it.'),
  textPosition: z.enum(['top', 'bottom']).optional().describe('Text above (default) or below the device.'),
  devicePosition: z.enum(['top', 'center', 'bottom']).optional().describe('Where the device sits in the space next to the text (default top).'),
  scale: z.number().min(0.2).max(LAYOUT_LIMITS.scale.max).optional().describe('Device size relative to the default width (1; iPad 1.5). Values above 1 let the device bleed off the bottom.'),
  rotation: z.number().min(LAYOUT_LIMITS.rotation.min).max(LAYOUT_LIMITS.rotation.max).optional().describe('Device rotation in degrees.'),
  offsetX: z.number().min(LAYOUT_LIMITS.offset.min).max(LAYOUT_LIMITS.offset.max).optional().describe('Horizontal device shift in px of the output image, up to half the canvas.'),
  offsetY: z.number().min(LAYOUT_LIMITS.offset.min).max(LAYOUT_LIMITS.offset.max).optional().describe('Vertical device shift in px (positive moves down), up to half the canvas.'),
};

export const brandSchema = z.object(styleShape).describe('Brand defaults applied to every screen.');

export const screenSchema = z.object({
  image: z.string().optional().describe('The app screenshot: a local file path (local server only), an https URL, a data URI, or an "upload:<id>" reference. Omit for an empty device frame.'),
  device: z.enum(DEVICE_TYPES as [DeviceType, ...DeviceType[]]).optional().describe(
    'App Store slot: iPhone (6.9"), iPhoneDuoInner, iPhoneDuoOuter, iPad (13"), Mac, WatchUltra, Watch. Defaults to the slot matching the image size, else iPhone.'),
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

/** Picks the slot whose App Store size matches the image, else the closest aspect ratio, else iPhone. */
const inferDevice = (image: LoadedImage | null): DeviceType => {
  if (!image) return 'iPhone';
  const exact = DEVICE_TYPES.find(d => DEVICES[d].acceptedScreenshots.some(s => s.width === image.width && s.height === image.height));
  if (exact) return exact;
  const ratio = image.width / image.height;
  return DEVICE_TYPES.reduce((best, d) => {
    const diff = (x: DeviceType) => Math.abs(DEVICES[x].width / DEVICES[x].height - ratio);
    return diff(d) < diff(best) ? d : best;
  }, 'iPhone' as DeviceType);
};

/** Merges defaults, brand and screen into a screen the renderer can draw; collects warnings. */
export const resolveScreen = (brand: StyleInput, screen: ScreenInput, image: LoadedImage | null, warnings: string[], label: string): ResolvedScreen => {
  const device = screen.device ?? inferDevice(image);
  const layout = DEVICE_LAYOUT[device];
  const pick = <K extends keyof StyleInput>(key: K): StyleInput[K] => (screen[key] !== undefined ? screen[key] : brand[key]);

  const bezel = findFrame(device, pick('frameModel'), pick('bezelColor'));
  if (!bezel) {
    const options = bezelsForDevice(device).map(b => `${b.model} ${b.color}`).join(', ');
    throw new Error(`${label}: no ${device} frame matches model "${pick('frameModel') ?? 'any'}" and colour "${pick('bezelColor') ?? 'any'}". Available: ${options}.`);
  }
  const maxOffset = offsetLimit(device);
  for (const key of ['offsetX', 'offsetY'] as const) {
    const v = pick(key);
    if (v !== undefined && Math.abs(v) > maxOffset) warnings.push(`${label}: ${key} ${v} is outside ±${maxOffset} for ${device}; the device may leave the image.`);
  }

  if (image && !screenshotFits(device, image.width, image.height)) {
    const sizes = DEVICES[device].acceptedScreenshots.map(s => `${s.width}×${s.height}`).join(' or ');
    warnings.push(`${label}: image is ${image.width}×${image.height}; ${device} screenshots should be ${sizes}. It was scaled to the screen width and may be cropped.`);
  }

  const textAlign = pick('textAlign') ?? 'center';
  // Placement: a layer's explicit values beat its preset; the screen's layer beats the brand's.
  const placement = (key: 'textPosition' | 'positioning' | 'scale' | 'rotation' | 'offsetX' | 'offsetY') => {
    const field = key === 'positioning' ? 'devicePosition' : key;
    for (const layer of [screen, brand]) {
      if (layer[field] !== undefined) return layer[field];
      if (layer.layoutPreset) return presetValues(device, layer.layoutPreset)[key];
    }
    return presetValues(device, 'classic')[key];
  };
  const background = layerBackground(screen) ?? layerBackground(brand) ?? { type: 'gradient', from: '#0f172a', to: '#3b82f6' };
  // Without explicit colours, text is white or near-black, whichever reads better (as "Auto" in the editor).
  const autoText = background.type === 'gradient' ? readableTextColor(background.from, background.to) : readableTextColor(background.color);
  return {
    device,
    locale: screen.locale ?? 'en-US',
    bezel,
    image,
    title: screen.title ?? '',
    subtitle: screen.subtitle ?? '',
    background,
    titleColor: pick('titleColor') ?? autoText,
    subtitleColor: pick('subtitleColor') ?? pick('titleColor') ?? autoText,
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
    devicePosition: placement('positioning') as ResolvedScreen['devicePosition'],
    textPosition: placement('textPosition') as ResolvedScreen['textPosition'],
    scale: placement('scale') as number,
    rotation: placement('rotation') as number,
    offsetX: placement('offsetX') as number,
    offsetY: placement('offsetY') as number,
  };
};

/** A frame by model and colour (case-insensitive, partial matches allowed), or the device default. */
const findFrame = (device: DeviceType, model?: string, color?: string) => {
  const norm = (v: string) => v.toLowerCase().replace(/["″]/g, '').replace(/\s+/g, ' ').trim();
  const candidates = bezelsForDevice(device).filter(b => !model || norm(b.model).includes(norm(model)));
  if (!color) return candidates.find(b => b.name === DEFAULT_BEZEL[device]) ?? candidates[0];
  return candidates.find(b => norm(b.color) === norm(color)) ?? candidates.find(b => norm(b.color).includes(norm(color)));
};

/** Output path of a screen, matching the web app's ZIP layout: iPhone_6.9/en-US/screen_1.png. */
export const outputFolder = (device: DeviceType, locale: string) =>
  `${DEVICE_EXPORT_NAMES[device]}/${locale.replace(/[^A-Za-z0-9_-]/g, '_')}`;

/** Everything a model needs to choose options, returned by get_design_options. */
export const designOptions = () => ({
  devices: DEVICE_TYPES.map(device => {
    const spec = DEVICES[device];
    const models = [...new Set(bezelsForDevice(device).map(b => b.model))];
    const defaultBezel = BEZELS.find(b => b.name === DEFAULT_BEZEL[device])!;
    return {
      device,
      appStoreDisplay: spec.appStoreDisplay,
      outputSize: { width: spec.width, height: spec.height },
      acceptedScreenshotSizes: spec.acceptedScreenshots,
      frames: models.map(model => ({ model, colors: bezelsForDevice(device).filter(b => b.model === model).map(b => b.color) })),
      defaults: {
        frameModel: defaultBezel.model,
        bezelColor: defaultBezel.color,
        scale: spec.layout.defaultScale,
        titleSize: spec.layout.defaultTitleSize,
        subtitleSize: spec.layout.defaultSubtitleSize,
      },
    };
  }),
  fonts: SCREEN_FONTS.map(f => ({ id: f.id, name: f.label, category: f.category, weights: f.weights, italic: f.hasItalic })),
  gradientPresets: GRADIENT_PRESETS.map(p => ({ name: p.name, category: p.category, from: p.start, to: p.end, textColor: readableTextColor(p.start, p.end) })),
  solidPresets: SOLID_PRESETS.map(p => ({ name: p.name, color: p.color })),
  layoutPresets: LAYOUT_PRESETS.map(p => ({ id: p.id, name: p.name, description: p.description })),
  layout: {
    textPosition: ['top', 'bottom'],
    devicePosition: ['top', 'center', 'bottom'],
    scale: { min: 0.2, max: LAYOUT_LIMITS.scale.max },
    rotation: LAYOUT_LIMITS.rotation,
    offset: LAYOUT_LIMITS.offset,
    textAlign: ['left', 'center', 'right'],
  },
  defaults: {
    background: { gradientFrom: '#0f172a', gradientTo: '#3b82f6' },
    titleColor: 'auto: white, or #1d1d1f on light backgrounds',
    subtitleColor: 'same as titleColor',
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
