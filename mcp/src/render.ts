import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import {
  BACKGROUND_GRADIENT_ANGLE,
  DEVICE_LAYOUT,
  DEVICE_REFERENCE_WIDTH,
  SCREEN_DIMENSIONS,
  SUBTITLE_TYPOGRAPHY,
  TEXT_LINE_PADDING_X,
  TEXT_PADDING_X,
  TEXT_SHADOW,
  TITLE_TYPOGRAPHY,
  type BezelSpec,
  type DeviceType,
} from '../../src/shared/layout';
import { getScreenFont, DEFAULT_SUBTITLE_FONT, DEFAULT_TITLE_FONT, type ScreenFontId } from '../../src/shared/fonts';
import { bezelDataUri, loadFallbackFont, loadScreenFonts } from './assets';

/** A fully resolved screen: every option has a value. Mirrors ScreenConfig in the web app. */
export interface ResolvedScreen {
  device: DeviceType;
  /** BCP 47 locale of the text, used to pick fonts for non-Latin scripts. */
  locale: string;
  bezel: BezelSpec;
  /** Screenshot as a data URI plus its pixel size, or null for an empty device. */
  image: { dataUri: string; width: number; height: number } | null;
  title: string;
  subtitle: string;
  background: { type: 'solid'; color: string } | { type: 'gradient'; from: string; to: string };
  titleColor: string;
  subtitleColor: string;
  titleFont: ScreenFontId;
  subtitleFont: ScreenFontId;
  titleSize: number;
  subtitleSize: number;
  titleBold: boolean;
  subtitleBold: boolean;
  titleItalic: boolean;
  subtitleItalic: boolean;
  titleAlign: 'left' | 'center' | 'right';
  subtitleAlign: 'left' | 'center' | 'right';
  devicePosition: 'top' | 'center' | 'bottom';
  scale: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
}

interface El {
  type: string;
  props: Record<string, unknown> & { style?: Record<string, unknown>; children?: unknown };
}

const h = (type: string, style: Record<string, unknown>, children?: unknown, props: Record<string, unknown> = {}): El =>
  ({ type, props: { ...props, style, children } });

/**
 * Builds the element tree for one screen, following CanvasRenderer.tsx: a column with optional
 * text on top and the device below, pushed up, centred or down with auto margins.
 */
const buildTree = (s: ResolvedScreen): El => {
  const { width, height } = SCREEN_DIMENSIONS[s.device];
  const layout = DEVICE_LAYOUT[s.device];
  const showTitle = s.title.trim() !== '';
  const showSubtitle = s.subtitle.trim() !== '';
  const showText = showTitle || showSubtitle;

  // Device box: the bezel PNG scaled so that scale 1 is DEVICE_REFERENCE_WIDTH wide.
  const actualScale = s.scale * (DEVICE_REFERENCE_WIDTH / s.bezel.width);
  const boxW = s.bezel.width * actualScale;
  const boxH = s.bezel.height * actualScale;

  // The editor rotates around the box's top centre; satori rotates around the centre, so add the
  // translation that turns one into the other.
  const rad = (s.rotation * Math.PI) / 180;
  const half = boxH / 2;
  const tx = s.offsetX - half * Math.sin(rad);
  const ty = s.offsetY - half * (1 - Math.cos(rad));

  const textLine = (text: string, kind: 'title' | 'subtitle') => {
    const isTitle = kind === 'title';
    const typo = isTitle ? TITLE_TYPOGRAPHY : SUBTITLE_TYPOGRAPHY;
    const font = getScreenFont(isTitle ? s.titleFont : s.subtitleFont, isTitle ? DEFAULT_TITLE_FONT : DEFAULT_SUBTITLE_FONT);
    const bold = isTitle ? s.titleBold : s.subtitleBold;
    const align = isTitle ? s.titleAlign : s.subtitleAlign;
    // No explicit display here: satori ignores textAlign on text nodes declared display: flex.
    return h('div', {
      padding: `0 ${TEXT_LINE_PADDING_X}px`,
      margin: isTitle ? `0 0 ${layout.titleMarginBottom}px 0` : 0,
      fontFamily: font.family,
      fontSize: isTitle ? s.titleSize : s.subtitleSize,
      fontWeight: bold ? typo.boldWeight : typo.regularWeight,
      fontStyle: (isTitle ? s.titleItalic : s.subtitleItalic) ? 'italic' : 'normal',
      lineHeight: typo.lineHeight,
      letterSpacing: typo.letterSpacing,
      color: isTitle ? s.titleColor : s.subtitleColor,
      textAlign: align,
      textShadow: TEXT_SHADOW,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    }, text);
  };

  const children: El[] = [];
  if (showText) {
    children.push(h('div', {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      padding: `0 ${TEXT_PADDING_X}px`,
      marginBottom: layout.textMarginBottom,
      flexShrink: 0,
    }, [showTitle && textLine(s.title, 'title'), showSubtitle && textLine(s.subtitle, 'subtitle')].filter(Boolean)));
  }

  const deviceLayers: El[] = [];
  if (s.image) {
    // The screenshot sits centred in the bezel at native resolution with rounded corners.
    const shotW = SCREEN_DIMENSIONS[s.device].width;
    const shotH = SCREEN_DIMENSIONS[s.device].height;
    deviceLayers.push(h('img', {
      position: 'absolute',
      left: ((s.bezel.width - shotW) / 2) * actualScale,
      top: ((s.bezel.height - shotH) / 2) * actualScale,
      width: shotW * actualScale,
      height: shotH * actualScale,
      borderRadius: layout.screenCornerRadius * actualScale,
      objectFit: 'cover',
    }, undefined, { src: s.image.dataUri, width: shotW * actualScale, height: shotH * actualScale }));
  }
  deviceLayers.push(h('img', { position: 'absolute', left: 0, top: 0, width: boxW, height: boxH }, undefined,
    { src: bezelDataUri(s.bezel), width: boxW, height: boxH }));

  const pos = s.devicePosition;
  children.push(h('div', {
    display: 'flex',
    position: 'relative',
    flexShrink: 0,
    width: boxW,
    height: boxH,
    marginTop: pos === 'bottom' || pos === 'center' ? 'auto' : 0,
    marginBottom: pos === 'top' || pos === 'center' ? 'auto' : 0,
  }, [h('div', {
    display: 'flex',
    position: 'absolute',
    left: 0,
    top: 0,
    width: boxW,
    height: boxH,
    transform: `translate(${tx}px, ${ty}px) rotate(${s.rotation}deg)`,
  }, deviceLayers)]));

  const background = s.background.type === 'gradient'
    ? `linear-gradient(${BACKGROUND_GRADIENT_ANGLE}deg, ${s.background.from}, ${s.background.to})`
    : s.background.color;

  return h('div', {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: showText ? 'flex-start' : 'center',
    width,
    height,
    paddingTop: showText ? layout.paddingTop : 0,
    backgroundColor: s.background.type === 'solid' ? s.background.color : undefined,
    backgroundImage: s.background.type === 'gradient' ? background : undefined,
    overflow: 'hidden',
  }, children);
};

export interface RenderedScreen {
  png: Buffer;
  /** Small PNG for showing the result to the model. */
  preview: Buffer;
}

/** Renders one screen to a PNG at App Store size, plus a small preview. */
export const renderScreen = async (screen: ResolvedScreen, previewWidth = 360): Promise<RenderedScreen> => {
  const { width, height } = SCREEN_DIMENSIONS[screen.device];
  const svg = await satori(buildTree(screen) as unknown as Parameters<typeof satori>[0], {
    width,
    height,
    fonts: loadScreenFonts(),
    loadAdditionalAsset: async (code, segment) => loadFallbackFont(code, segment, screen.locale, screen.title + screen.subtitle),
  });
  const png = new Resvg(svg, { fitTo: { mode: 'original' }, font: { loadSystemFonts: false } }).render().asPng();
  const preview = new Resvg(svg, { fitTo: { mode: 'width', value: previewWidth }, font: { loadSystemFonts: false } }).render().asPng();
  return { png, preview };
};
