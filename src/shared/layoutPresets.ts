/**
 * Common App Store screenshot compositions. Values are relative so every preset works on every
 * device: scale is a factor of the device's default size, offsets are fractions of the canvas.
 * Shared by the editor (Device tab) and the MCP server (layoutPreset).
 */
import { DEVICES, offsetLimit, type DeviceType } from './layout';

export type TextPosition = 'top' | 'bottom';
export type DevicePosition = 'top' | 'center' | 'bottom';

export type LayoutPresetId = 'classic' | 'hero' | 'rising' | 'floating' | 'tiltLeft' | 'tiltRight' | 'textBelow';

export interface LayoutPreset {
  id: LayoutPresetId;
  /** English name; the editor shows the translation layout.preset.<id>. */
  name: string;
  description: string;
  textPosition: TextPosition;
  positioning: DevicePosition;
  /** Factor of the device's default scale. */
  scale: number;
  rotation: number;
  /** Fractions of the canvas width / height. */
  offsetX: number;
  offsetY: number;
}

export const LAYOUT_PRESETS: LayoutPreset[] = [
  { id: 'classic', name: 'Classic', description: 'Text on top, the whole device below it.', textPosition: 'top', positioning: 'top', scale: 1, rotation: 0, offsetX: 0, offsetY: 0 },
  { id: 'hero', name: 'Big & Bold', description: 'A larger device that runs off the bottom edge.', textPosition: 'top', positioning: 'top', scale: 1.3, rotation: 0, offsetX: 0, offsetY: 0 },
  { id: 'rising', name: 'Rising', description: 'The device rises from the bottom edge, leaving room for big text.', textPosition: 'top', positioning: 'bottom', scale: 1.1, rotation: 0, offsetX: 0, offsetY: 0.16 },
  { id: 'floating', name: 'Floating', description: 'A smaller device centred below the text, fully visible.', textPosition: 'top', positioning: 'center', scale: 0.82, rotation: 0, offsetX: 0, offsetY: 0 },
  { id: 'tiltLeft', name: 'Tilted Left', description: 'The device leans to the left for a dynamic look.', textPosition: 'top', positioning: 'top', scale: 1.08, rotation: -9, offsetX: -0.11, offsetY: 0.01 },
  { id: 'tiltRight', name: 'Tilted Right', description: 'The device leans to the right for a dynamic look.', textPosition: 'top', positioning: 'top', scale: 1.08, rotation: 9, offsetX: 0.11, offsetY: 0.01 },
  { id: 'textBelow', name: 'Text Below', description: 'The device comes in from the top edge, text sits below it.', textPosition: 'bottom', positioning: 'top', scale: 1.1, rotation: 0, offsetX: 0, offsetY: -0.14 },
];

export const DEFAULT_LAYOUT_PRESET: LayoutPresetId = 'classic';

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
  const limit = offsetLimit(device);
  const clamp = (v: number) => Math.max(-limit, Math.min(limit, Math.round(v)));
  return {
    textPosition: preset.textPosition,
    positioning: preset.positioning,
    scale: Math.round(preset.scale * spec.layout.defaultScale * 100) / 100,
    rotation: preset.rotation,
    offsetX: clamp(preset.offsetX * spec.width),
    offsetY: clamp(preset.offsetY * spec.height),
  };
};

/** The preset a screen's placement matches, or null when it has been adjusted by hand. */
export const matchPreset = (device: DeviceType, s: Partial<PlacementValues>): LayoutPresetId | null => {
  for (const preset of LAYOUT_PRESETS) {
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
