import type React from 'react';
import type { ScreenConfig } from '../store/ConfigContext';
import {
  BACKGROUND_GRADIENT_ANGLE,
  DEVICE_LAYOUT,
  SUBTITLE_TYPOGRAPHY,
  TITLE_TYPOGRAPHY,
  type DeviceType,
} from '../shared/layout';
import { DEFAULT_SUBTITLE_FONT, DEFAULT_TITLE_FONT, getScreenFont, screenFontStack } from '../shared/fonts';

/** CSS background of a screen. */
export const screenBackground = (screen: ScreenConfig) =>
  screen.bgType === 'gradient'
    ? `linear-gradient(${BACKGROUND_GRADIENT_ANGLE}deg, ${screen.bgGradientStart}, ${screen.bgGradientEnd})`
    : screen.bgColor;

/** Typography of the headline, shared by the canvas and the filmstrip thumbnails. */
export const titleStyle = (screen: ScreenConfig, device: DeviceType): React.CSSProperties => ({
  fontSize: `${screen.titleSize || DEVICE_LAYOUT[device].autoTitleSize}px`,
  color: screen.titleColor || '#ffffff',
  fontStyle: screen.titleItalic ? 'italic' : 'normal',
  textDecoration: screen.titleUnderline ? 'underline' : 'none',
  fontWeight: screen.titleBold !== false ? TITLE_TYPOGRAPHY.boldWeight : TITLE_TYPOGRAPHY.regularWeight,
  fontFamily: screenFontStack(getScreenFont(screen.titleFont, DEFAULT_TITLE_FONT)),
  margin: `0 0 ${DEVICE_LAYOUT[device].titleMarginBottom}px 0`,
  lineHeight: TITLE_TYPOGRAPHY.lineHeight,
  letterSpacing: `${TITLE_TYPOGRAPHY.letterSpacing}px`,
  textAlign: screen.titleAlign || 'center',
});

/** Typography of the description line. */
export const subtitleStyle = (screen: ScreenConfig, device: DeviceType): React.CSSProperties => ({
  fontSize: `${screen.subtitleSize || DEVICE_LAYOUT[device].autoSubtitleSize}px`,
  color: screen.subtitleColor || '#ffffff',
  fontStyle: screen.subtitleItalic ? 'italic' : 'normal',
  textDecoration: screen.subtitleUnderline ? 'underline' : 'none',
  opacity: screen.subtitleColor ? 1 : 0.9,
  fontWeight: screen.subtitleBold !== false ? SUBTITLE_TYPOGRAPHY.boldWeight : SUBTITLE_TYPOGRAPHY.regularWeight,
  fontFamily: screenFontStack(getScreenFont(screen.subtitleFont, DEFAULT_SUBTITLE_FONT)),
  margin: 0,
  lineHeight: SUBTITLE_TYPOGRAPHY.lineHeight,
  letterSpacing: `${SUBTITLE_TYPOGRAPHY.letterSpacing}px`,
  textAlign: screen.subtitleAlign || 'center',
});
