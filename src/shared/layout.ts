/**
 * Geometry of a rendered App Store screenshot.
 *
 * The web editor (CanvasRenderer, BottomBar thumbnails) and the MCP renderer (mcp/src/render.ts)
 * both lay screens out from these numbers, so a screen exported from either looks the same.
 */

export type DeviceType = 'iPhone' | 'iPad';

/** Pixel size of the exported screenshot, which is also the required size of the uploaded image. */
export const SCREEN_DIMENSIONS: Record<DeviceType, { width: number; height: number }> = {
  iPhone: { width: 1320, height: 2868 },
  iPad: { width: 2064, height: 2752 },
};

/** App Store Connect display names, also used as export folder names. */
export const DEVICE_EXPORT_NAMES: Record<DeviceType, string> = {
  iPhone: 'iPhone_6.9',
  iPad: 'iPad_13',
};

export interface BezelSpec {
  /** Name of the PNG in src/assets/Bezels (without extension); stored in ScreenConfig.bezelName. */
  name: string;
  device: DeviceType;
  color: string;
  /** Path relative to src/assets/Bezels. */
  file: string;
  /** Natural size of the bezel PNG; the screenshot sits centred inside at native resolution. */
  width: number;
  height: number;
}

export const BEZELS: BezelSpec[] = [
  { name: 'iPhone 17 Pro Max - Silver - Portrait', device: 'iPhone', color: 'Silver', file: 'Bezel-iPhone-17/PNG/iPhone 17 Pro Max/iPhone 17 Pro Max - Silver - Portrait.png', width: 1470, height: 3000 },
  { name: 'iPhone 17 Pro Max - Deep Blue - Portrait', device: 'iPhone', color: 'Deep Blue', file: 'Bezel-iPhone-17/PNG/iPhone 17 Pro Max/iPhone 17 Pro Max - Deep Blue - Portrait.png', width: 1470, height: 3000 },
  { name: 'iPhone 17 Pro Max - Cosmic Orange - Portrait', device: 'iPhone', color: 'Cosmic Orange', file: 'Bezel-iPhone-17/PNG/iPhone 17 Pro Max/iPhone 17 Pro Max - Cosmic Orange - Portrait.png', width: 1470, height: 3000 },
  { name: 'iPad Pro 13 - M4 - Silver - Portrait', device: 'iPad', color: 'Silver', file: 'Bezel-iPad-Pro-M4/PNG/iPad Pro 13 - M4 - Silver - Portrait.png', width: 2300, height: 3000 },
  { name: 'iPad Pro 13 - M4 - Space Gray - Portrait', device: 'iPad', color: 'Space Gray', file: 'Bezel-iPad-Pro-M4/PNG/iPad Pro 13 - M4 - Space Gray - Portrait.png', width: 2300, height: 3000 },
];

export const DEFAULT_BEZEL: Record<DeviceType, string> = {
  iPhone: 'iPhone 17 Pro Max - Silver - Portrait',
  iPad: 'iPad Pro 13 - M4 - Silver - Portrait',
};

export interface DeviceLayout {
  /** Space above the text block, in screenshot pixels. */
  paddingTop: number;
  /** Space between the text block and the device. */
  textMarginBottom: number;
  /** Space between title and subtitle. */
  titleMarginBottom: number;
  /** Corner radius of the screenshot inside the bezel, in native screenshot pixels. */
  screenCornerRadius: number;
  defaultScale: number;
  /** Text sizes of new screens. */
  defaultTitleSize: number;
  defaultSubtitleSize: number;
  /** Text sizes when the size is set to "Auto" (unset). */
  autoTitleSize: number;
  autoSubtitleSize: number;
}

export const DEVICE_LAYOUT: Record<DeviceType, DeviceLayout> = {
  iPhone: { paddingTop: 100, textMarginBottom: 80, titleMarginBottom: 40, screenCornerRadius: 100, defaultScale: 1.0, defaultTitleSize: 120, defaultSubtitleSize: 60, autoTitleSize: 92, autoSubtitleSize: 52 },
  iPad: { paddingTop: 200, textMarginBottom: 120, titleMarginBottom: 60, screenCornerRadius: 60, defaultScale: 1.5, defaultTitleSize: 144, defaultSubtitleSize: 72, autoTitleSize: 84, autoSubtitleSize: 48 },
};

/** Width of the device at scale 1, in screenshot pixels. */
export const DEVICE_REFERENCE_WIDTH = 1120;
/** Horizontal padding of the text block plus the inner padding of each text line. */
export const TEXT_PADDING_X = 80;
export const TEXT_LINE_PADDING_X = 10;
export const BACKGROUND_GRADIENT_ANGLE = 135;
export const TEXT_SHADOW = '0 8px 24px rgba(0,0,0,0.4)';

export const TITLE_TYPOGRAPHY = { lineHeight: 1.4, letterSpacing: -3, boldWeight: 800, regularWeight: 500 };
export const SUBTITLE_TYPOGRAPHY = { lineHeight: 1.35, letterSpacing: -1, boldWeight: 700, regularWeight: 400 };

/** Range of the layout sliders in the editor; the MCP server validates against the same bounds. */
export const LAYOUT_LIMITS = {
  scale: { min: 0, max: 2 },
  rotation: { min: -45, max: 45 },
  offset: { min: -400, max: 400 },
};
