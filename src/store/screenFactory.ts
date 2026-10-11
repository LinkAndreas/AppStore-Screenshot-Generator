import { DEFAULT_BEZEL, DEVICE_LAYOUT, type DeviceType } from '../shared/layout';
import { DEFAULT_SUBTITLE_FONT, DEFAULT_TITLE_FONT } from '../shared/fonts';
import type { ScreenConfig } from './ConfigContext';

export const LOCALIZED_DEFAULTS: Record<string, { title: string; subtitle: string }> = {
  'en-US': { title: 'Feature Title', subtitle: 'A short description here' },
  'de-DE': { title: 'Feature Titel', subtitle: 'Kurze Beschreibung hier' },
  'fr-FR': { title: 'Titre du Feature', subtitle: 'Description courte ici' },
  'es-ES': { title: 'Título', subtitle: 'Breve descripción aquí' },
  'it-IT': { title: 'Titolo', subtitle: 'Breve descrizione' },
  'ja-JP': { title: 'タイトル', subtitle: 'ここに簡単な説明' },
  'zh-CN': { title: '标题', subtitle: '在此输入简短描述' },
};

/** A new screen for the device with the default style, optionally with an image already placed. */
export const createScreen = (
  device: DeviceType,
  typography: { title: string; subtitle: string },
  imageObjUrl: string | null = null,
): ScreenConfig => {
  const layout = DEVICE_LAYOUT[device];
  return {
    id: crypto.randomUUID(),
    imageObjUrl,
    bezelName: DEFAULT_BEZEL[device],
    scale: layout.defaultScale,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    positioning: 'top',
    ...typography,
    titleAlign: 'center',
    subtitleAlign: 'center',
    titleSize: layout.defaultTitleSize,
    subtitleSize: layout.defaultSubtitleSize,
    titleBold: true,
    subtitleBold: false,
    titleFont: DEFAULT_TITLE_FONT,
    subtitleFont: DEFAULT_SUBTITLE_FONT,
    bgType: 'gradient',
    bgColor: '#ffffff',
    bgGradientStart: '#0f172a',
    bgGradientEnd: '#3b82f6',
    titleColor: '#ffffff',
    subtitleColor: '#ffffff',
    showTitle: true,
    showSubtitle: true,
  };
};
