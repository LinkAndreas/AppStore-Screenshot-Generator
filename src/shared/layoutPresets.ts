/**
 * Common App Store screenshot compositions. Values are relative so every preset works on every
 * device: scale is a factor of the device's default size, offsets are fractions of the canvas.
 * Shared by the editor (Device tab) and the MCP server (layoutPreset).
 */
import { DEVICES, getBezelSpec, offsetLimit, type DeviceType } from './layout';

export type TextPosition = 'top' | 'bottom';
export type DevicePosition = 'top' | 'center' | 'bottom';

export type LayoutPresetId = 'classic' | 'hero' | 'floating' | 'textBelow' | 'tiltLeft' | 'tiltRight';

export interface LayoutPreset {
  id: LayoutPresetId;
  /** English name; the editor shows the translation layout.preset.<id>. */
  name: string;
  description: string;
  textPosition: TextPosition;
  positioning: DevicePosition;
  /** Factor of the device's default scale. */
  scale: number;
  /** Tilt in degrees; offsets that keep a tilted device clear of the text are computed. */
  rotation: number;
  /** Devices the preset suits (default: all). Tilted laptops and watches look wrong. */
  devices?: DeviceType[];
}

/**
 * Compositions that keep text and device in a clean relationship: the device sits next to the
 * text with the standard gap and, when it is too big for the canvas, bleeds off the far edge.
 */
export const LAYOUT_PRESETS: LayoutPreset[] = [
  { id: 'classic', name: 'Classic', description: 'Headline on top, the device right below it.', textPosition: 'top', positioning: 'top', scale: 1, rotation: 0 },
  { id: 'hero', name: 'Big & Bold', description: 'Headline on top, a larger device that runs off the bottom edge.', textPosition: 'top', positioning: 'top', scale: 1.3, rotation: 0 },
  { id: 'floating', name: 'Floating', description: 'A smaller device centred below the headline, fully visible.', textPosition: 'top', positioning: 'center', scale: 0.85, rotation: 0 },
  { id: 'textBelow', name: 'Text Below', description: 'The device comes in from the top edge, the headline sits below it.', textPosition: 'bottom', positioning: 'bottom', scale: 1.15, rotation: 0 },
  { id: 'tiltLeft', name: 'Tilted Left', description: 'Headline on top, the device leans to the left.', textPosition: 'top', positioning: 'top', scale: 1, rotation: -8, devices: ['iPhone', 'iPhoneDuoInner', 'iPhoneDuoOuter', 'iPad'] },
  { id: 'tiltRight', name: 'Tilted Right', description: 'Headline on top, the device leans to the right.', textPosition: 'top', positioning: 'top', scale: 1, rotation: 8, devices: ['iPhone', 'iPhoneDuoInner', 'iPhoneDuoOuter', 'iPad'] },
];

export const DEFAULT_LAYOUT_PRESET: LayoutPresetId = 'classic';

/** Presets offered for a device. */
export const presetsForDevice = (device: DeviceType) => LAYOUT_PRESETS.filter(p => !p.devices || p.devices.includes(device));

export interface PlacementValues {
  textPosition: TextPosition;
  positioning: DevicePosition;
  scale: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
}

/** The screen values a preset sets on a device, in canvas pixels. */
export const presetValues = (device: DeviceType, presetId: LayoutPresetId): PlacementValues => {
  const preset = LAYOUT_PRESETS.find(p => p.id === presetId) ?? LAYOUT_PRESETS[0];
  const spec = DEVICES[device];
  const scale = Math.round(preset.scale * spec.layout.defaultScale * 100) / 100;
  let offsetX = 0, offsetY = 0;
  if (preset.rotation !== 0) {
    // The device turns around its top centre: one top corner rises by w/2·sin(θ) and the body
    // swings sideways by up to h·sin(θ). Lower it by the rise so the gap to the text stays as in
    // Classic, and shift it back a little so the top stays inside the canvas while the bottom
    // bleeds off the lower edge.
    const bezel = getBezelSpec(undefined, device);
    const w = spec.layout.deviceWidth * scale;
    const h = w * (bezel.height / bezel.width);
    const sin = Math.sin((Math.abs(preset.rotation) * Math.PI) / 180);
    offsetY = (w / 2) * sin;
    // CSS rotate(θ < 0) is counter-clockwise, which swings the body to the right: shift left.
    offsetX = Math.sign(preset.rotation) * (h / 2) * sin * 0.4;
  }
  const limit = offsetLimit(device);
  const clamp = (v: number) => Math.max(-limit, Math.min(limit, Math.round(v)));
  return { textPosition: preset.textPosition, positioning: preset.positioning, scale, rotation: preset.rotation, offsetX: clamp(offsetX), offsetY: clamp(offsetY) };
};

/** The preset a screen's placement matches, or null when it has been adjusted by hand. */
export const matchPreset = (device: DeviceType, s: Partial<PlacementValues>): LayoutPresetId | null => {
  for (const preset of presetsForDevice(device)) {
    const v = presetValues(device, preset.id);
    if ((s.textPosition ?? 'top') === v.textPosition
      && (s.positioning ?? 'center') === v.positioning
      && Math.abs((s.scale ?? 1) - v.scale) < 0.011
      && (s.rotation ?? 0) === v.rotation
      && Math.abs((s.offsetX ?? 0) - v.offsetX) <= 1
      && Math.abs((s.offsetY ?? 0) - v.offsetY) <= 1) return preset.id;
  }
  return null;
};
