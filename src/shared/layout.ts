/**
 * Devices, frames and the geometry of a rendered App Store screenshot.
 *
 * The web editor (ScreenArtwork) and the MCP renderer (mcp/src/render.ts) both lay screens out
 * from these numbers, so a screen exported from either looks the same.
 */

/** One App Store Connect screenshot slot. Stored in saved projects, so ids must stay stable. */
export type DeviceType = 'iPhone' | 'iPhoneDuoInner' | 'iPhoneDuoOuter' | 'iPad' | 'Mac' | 'WatchUltra' | 'Watch';

export const DEVICE_TYPES: DeviceType[] = ['iPhone', 'iPhoneDuoInner', 'iPhoneDuoOuter', 'iPad', 'Mac', 'WatchUltra', 'Watch'];

export interface DeviceSpec {
  id: DeviceType;
  /** Name in the editor (also in translations as device.<id>). */
  label: string;
  /** App Store Connect display size this slot fills. */
  appStoreDisplay: string;
  /** Folder name in exported ZIPs. */
  exportName: string;
  /** Size of the exported screenshot. */
  width: number;
  height: number;
  /** Screenshot sizes App Store Connect accepts for this slot (the uploaded app screenshot). */
  acceptedScreenshots: { width: number; height: number }[];
  /** Layout, in pixels of the exported screenshot. */
  layout: DeviceLayout;
}

export interface DeviceLayout {
  /** Space above the text block. */
  paddingTop: number;
  /** Space between the text block and the device. */
  textMarginBottom: number;
  /** Space between title and subtitle. */
  titleMarginBottom: number;
  /** Width of the device frame at scale 1. */
  deviceWidth: number;
  defaultScale: number;
  /** Text sizes of new screens. */
  defaultTitleSize: number;
  defaultSubtitleSize: number;
  /** Text sizes when the size is set to "Auto" (unset). */
  autoTitleSize: number;
  autoSubtitleSize: number;
  /** Scales letter spacing, text padding, shadows and offset limits for small canvases (Watch). */
  unit: number;
}

export const DEVICES: Record<DeviceType, DeviceSpec> = {
  iPhone: {
    id: 'iPhone', label: 'iPhone', appStoreDisplay: 'iPhone 6.9"', exportName: 'iPhone_6.9',
    width: 1320, height: 2868, acceptedScreenshots: [{ width: 1320, height: 2868 }],
    layout: { paddingTop: 100, textMarginBottom: 80, titleMarginBottom: 40, deviceWidth: 1120, defaultScale: 1.0, defaultTitleSize: 120, defaultSubtitleSize: 60, autoTitleSize: 92, autoSubtitleSize: 52, unit: 1 },
  },
  iPhoneDuoInner: {
    id: 'iPhoneDuoInner', label: 'iPhone Duo (open)', appStoreDisplay: 'iPhone Duo inner display', exportName: 'iPhone_Duo_Inner',
    width: 2007, height: 2853, acceptedScreenshots: [{ width: 2007, height: 2853 }],
    layout: { paddingTop: 170, textMarginBottom: 110, titleMarginBottom: 50, deviceWidth: 1600, defaultScale: 1.0, defaultTitleSize: 140, defaultSubtitleSize: 70, autoTitleSize: 110, autoSubtitleSize: 60, unit: 1 },
  },
  iPhoneDuoOuter: {
    id: 'iPhoneDuoOuter', label: 'iPhone Duo (closed)', appStoreDisplay: 'iPhone Duo outer display', exportName: 'iPhone_Duo_Outer',
    width: 1398, height: 2034, acceptedScreenshots: [{ width: 1398, height: 2034 }],
    layout: { paddingTop: 90, textMarginBottom: 70, titleMarginBottom: 32, deviceWidth: 1120, defaultScale: 1.0, defaultTitleSize: 110, defaultSubtitleSize: 56, autoTitleSize: 84, autoSubtitleSize: 48, unit: 1 },
  },
  iPad: {
    id: 'iPad', label: 'iPad', appStoreDisplay: 'iPad 13"', exportName: 'iPad_13',
    width: 2064, height: 2752, acceptedScreenshots: [{ width: 2064, height: 2752 }],
    layout: { paddingTop: 200, textMarginBottom: 120, titleMarginBottom: 60, deviceWidth: 1120, defaultScale: 1.5, defaultTitleSize: 144, defaultSubtitleSize: 72, autoTitleSize: 84, autoSubtitleSize: 48, unit: 1 },
  },
  Mac: {
    id: 'Mac', label: 'Mac', appStoreDisplay: 'Mac', exportName: 'Mac',
    width: 2880, height: 1800,
    acceptedScreenshots: [{ width: 2880, height: 1800 }, { width: 2560, height: 1600 }, { width: 1440, height: 900 }, { width: 1280, height: 800 }],
    layout: { paddingTop: 110, textMarginBottom: 70, titleMarginBottom: 28, deviceWidth: 1900, defaultScale: 1.0, defaultTitleSize: 120, defaultSubtitleSize: 60, autoTitleSize: 96, autoSubtitleSize: 52, unit: 1 },
  },
  WatchUltra: {
    id: 'WatchUltra', label: 'Apple Watch Ultra', appStoreDisplay: 'Apple Watch Ultra 3', exportName: 'Watch_Ultra',
    width: 422, height: 514, acceptedScreenshots: [{ width: 422, height: 514 }],
    layout: { paddingTop: 28, textMarginBottom: 14, titleMarginBottom: 6, deviceWidth: 260, defaultScale: 1.0, defaultTitleSize: 36, defaultSubtitleSize: 19, autoTitleSize: 30, autoSubtitleSize: 17, unit: 0.3 },
  },
  Watch: {
    id: 'Watch', label: 'Apple Watch', appStoreDisplay: 'Apple Watch Series 11', exportName: 'Watch_Series',
    width: 416, height: 496, acceptedScreenshots: [{ width: 416, height: 496 }],
    layout: { paddingTop: 28, textMarginBottom: 14, titleMarginBottom: 6, deviceWidth: 250, defaultScale: 1.0, defaultTitleSize: 36, defaultSubtitleSize: 19, autoTitleSize: 30, autoSubtitleSize: 17, unit: 0.3 },
  },
};

export const isDeviceType = (value: unknown): value is DeviceType =>
  typeof value === 'string' && (DEVICE_TYPES as string[]).includes(value);

/** Pixel size of the exported screenshot per device. */
export const SCREEN_DIMENSIONS = Object.fromEntries(
  DEVICE_TYPES.map(d => [d, { width: DEVICES[d].width, height: DEVICES[d].height }]),
) as Record<DeviceType, { width: number; height: number }>;

export const DEVICE_EXPORT_NAMES = Object.fromEntries(DEVICE_TYPES.map(d => [d, DEVICES[d].exportName])) as Record<DeviceType, string>;
export const DEVICE_LAYOUT = Object.fromEntries(DEVICE_TYPES.map(d => [d, DEVICES[d].layout])) as Record<DeviceType, DeviceLayout>;

/** Whether an uploaded screenshot fits the slot: an accepted size, or the same aspect ratio (scaled). */
export const screenshotFits = (device: DeviceType, width: number, height: number) =>
  DEVICES[device].acceptedScreenshots.some(s =>
    (s.width === width && s.height === height) || Math.abs(s.width / s.height - width / height) < 0.01 * (s.width / s.height));

/** Corner radii of the screen opening: top-left, top-right, bottom-right, bottom-left. */
export type Radii = [number, number, number, number];

export interface BezelSpec {
  /** Name of the PNG in src/assets/Bezels (without extension); stored in ScreenConfig.bezelName. */
  name: string;
  device: DeviceType;
  model: string;
  color: string;
  /** Path relative to src/assets/Bezels. */
  file: string;
  /** Natural size of the bezel PNG. */
  width: number;
  height: number;
  /**
   * The transparent screen opening, in bezel pixels (measured from the PNG). The screenshot is
   * scaled to its width and aligned to its bottom; any space above it (the Mac notch strip) is black.
   *
   * Corner radii (top-left, top-right, bottom-right, bottom-left) are the middle of the range in
   * which the rounded screenshot covers every transparent pixel of the opening (no background
   * showing through) while staying inside the opaque frame (no screenshot outside the device).
   * Re-measure with scripts/measure-bezels.mjs when adding a bezel.
   */
  screen: { x: number; y: number; width: number; height: number; radius: Radii };
}

const bezels = (
  device: DeviceType, model: string, folder: string, size: [number, number],
  screen: [number, number, number, number], radius: Radii, items: [color: string, file: string][],
): BezelSpec[] =>
  items.map(([color, file]) => ({
    name: file.replace(/\.png$/, '').split('/').pop()!,
    device, model, color, file: `${folder}/${file}`,
    width: size[0], height: size[1],
    screen: { x: screen[0], y: screen[1], width: screen[2], height: screen[3], radius },
  }));

const r = (n: number): Radii => [n, n, n, n];

export const BEZELS: BezelSpec[] = [
  ...bezels('iPhone', 'iPhone 18 Pro Max', 'Bezel-iPhone-18/PNG/iPhone 18 Pro Max', [1470, 3000], [75, 66, 1320, 2868], r(134), [
    ['Silver', 'iPhone 18 Pro Max - Silver - Portrait.png'],
    ['Black', 'iPhone 18 Pro Max - Black - Portrait.png'],
    ['Glacier', 'iPhone 18 Pro Max - Glacier - Portrait.png'],
    ['Burgundy', 'iPhone 18 Pro Max - Burgundy - Portrait.png'],
  ]),
  ...bezels('iPhone', 'iPhone 17 Pro Max', 'Bezel-iPhone-17/PNG/iPhone 17 Pro Max', [1470, 3000], [75, 66, 1320, 2868], r(134), [
    ['Silver', 'iPhone 17 Pro Max - Silver - Portrait.png'],
    ['Deep Blue', 'iPhone 17 Pro Max - Deep Blue - Portrait.png'],
    ['Cosmic Orange', 'iPhone 17 Pro Max - Cosmic Orange - Portrait.png'],
  ]),
  ...bezels('iPhoneDuoInner', 'iPhone Duo', 'Bezel-iPhone-Duo/PNG', [2247, 3093], [120, 120, 2007, 2853], r(87), [
    ['Star White', 'iPhone Duo - Star White - Inner Open Portrait.png'],
    ['Night Sky', 'iPhone Duo - Night Sky - Inner Open Portrait.png'],
  ]),
  ...bezels('iPhoneDuoOuter', 'iPhone Duo', 'Bezel-iPhone-Duo/PNG', [1574, 2194], [88, 80, 1398, 2034], [11, 117, 117, 11], [
    ['Star White', 'iPhone Duo - Star White - Outer Closed Portrait.png'],
    ['Night Sky', 'iPhone Duo - Night Sky - Outer Closed Portrait.png'],
  ]),
  ...bezels('iPad', 'iPad Pro 13" (M5)', 'Bezel-iPad-Pro-M5/PNG', [2300, 3000], [118, 124, 2064, 2752], r(28), [
    ['Silver', 'iPad Pro 13 - M5 - Silver - Portrait.png'],
    ['Space Black', 'iPad Pro 13 - M5 - Space Black - Portrait.png'],
  ]),
  ...bezels('iPad', 'iPad Pro 13" (M4)', 'Bezel-iPad-Pro-M4/PNG', [2300, 3000], [118, 124, 2064, 2752], r(28), [
    ['Silver', 'iPad Pro 13 - M4 - Silver - Portrait.png'],
    ['Space Gray', 'iPad Pro 13 - M4 - Space Gray - Portrait.png'],
  ]),
  ...bezels('Mac', 'MacBook Pro 16"', 'Bezel-MacBook-Pro-M5/PNG', [4260, 2840], [402, 303, 3456, 2234], [18, 18, 0, 0], [
    ['Silver', 'MacBook Pro M5 16-inch Silver.png'],
    ['Space Black', 'MacBook Pro M5 16-inch Space Black.png'],
  ]),
  ...bezels('Mac', 'MacBook Air 15"', 'Bezel-MacBook-Air-M5/PNG', [3540, 2300], [329, 218, 2880, 1864], [15, 15, 0, 0], [
    ['Midnight', 'MacBook Air M5 15-inch Midnight.png'],
    ['Silver', 'MacBook Air M5 15-inch Silver.png'],
    ['Sky Blue', 'MacBook Air M5 15-inch Sky Blue.png'],
    ['Starlight', 'MacBook Air M5 15-inch Starlight.png'],
  ]),
  ...bezels('WatchUltra', 'Apple Watch Ultra 3', 'Bezel-Apple-Watch-Ultra-3/PNG', [600, 960], [89, 223, 422, 514], r(56), [
    ['Black · Ocean Band', 'AW Ultra 3 - Black + Ocean Band Black.png'],
    ['Natural · Ocean Band', 'AW Ultra 3 - Natural + Ocean Band Anchor Blue.png'],
    ['Black · Trail Loop', 'AW Ultra 3 - Black + Trail Loop Black Charcoal.png'],
    ['Natural · Alpine Loop', 'AW Ultra 3 - Natural + Alpine Loop Terra Cotta.png'],
  ]),
  ...bezels('Watch', 'Apple Watch Series 11 (46 mm)', 'Bezel-Apple-Watch-Series-11/PNG', [560, 880], [72, 192, 416, 496], r(54), [
    ['Jet Black', 'Apple Watch S11 - 46mm - Aluminum Jet Black + Sport Band Black.png'],
    ['Silver', 'Apple Watch S11 - 46mm - Aluminum Silver + Sport Band Purple Fog.png'],
    ['Rose Gold', 'Apple Watch S11 - 46mm - Aluminum Rose Gold + Sport Band Light Blush.png'],
    ['Space Gray', 'Apple Watch S11 - 46mm - Aluminum Space Gray + Sport Band Anchor Blue.png'],
  ]),
];

export const DEFAULT_BEZEL: Record<DeviceType, string> = {
  iPhone: 'iPhone 18 Pro Max - Silver - Portrait',
  iPhoneDuoInner: 'iPhone Duo - Star White - Inner Open Portrait',
  iPhoneDuoOuter: 'iPhone Duo - Star White - Outer Closed Portrait',
  iPad: 'iPad Pro 13 - M5 - Silver - Portrait',
  Mac: 'MacBook Pro M5 16-inch Silver',
  WatchUltra: 'AW Ultra 3 - Black + Ocean Band Black',
  Watch: 'Apple Watch S11 - 46mm - Aluminum Jet Black + Sport Band Black',
};

/** The bezel stored on a screen, falling back to the device's default for unknown names. */
export const getBezelSpec = (name: string | undefined, device: DeviceType): BezelSpec =>
  BEZELS.find(b => b.name === name) ?? BEZELS.find(b => b.name === DEFAULT_BEZEL[device])!;

export const bezelsForDevice = (device: DeviceType) => BEZELS.filter(b => b.device === device);

/**
 * Where the screenshot is drawn inside the bezel, in bezel pixels: scaled to the opening's width
 * and aligned to its bottom. Exact-size screenshots fill the opening.
 */
export const screenshotRect = (bezel: BezelSpec, imageWidth: number, imageHeight: number) => {
  const { x, y, width, height } = bezel.screen;
  const drawnHeight = Math.min(height, (width * imageHeight) / imageWidth);
  // Taller images (not expected for App Store sizes) fill the opening and are cropped by the radius box.
  return { x, y: y + height - drawnHeight, width, height: drawnHeight, fills: drawnHeight >= height - 1 };
};

/** Horizontal padding of the text block plus the inner padding of each text line (× unit). */
export const TEXT_PADDING_X = 80;
export const TEXT_LINE_PADDING_X = 10;
export const BACKGROUND_GRADIENT_ANGLE = 135;
export const textShadow = (unit: number) => `0 ${8 * unit}px ${24 * unit}px rgba(0,0,0,0.4)`;

export const TITLE_TYPOGRAPHY = { lineHeight: 1.4, letterSpacing: -3, boldWeight: 800, regularWeight: 500 };
export const SUBTITLE_TYPOGRAPHY = { lineHeight: 1.35, letterSpacing: -1, boldWeight: 700, regularWeight: 400 };

/** Range of the layout sliders in the editor; the MCP server validates against the same bounds. */
export const LAYOUT_LIMITS = {
  scale: { min: 0, max: 2 },
  rotation: { min: -45, max: 45 },
  offset: { min: -400, max: 400 },
};

/** Offset range for a device: smaller canvases get a proportionally smaller range. */
export const offsetLimit = (device: DeviceType) => Math.round(LAYOUT_LIMITS.offset.max * Math.max(DEVICE_LAYOUT[device].unit, 0.5));
