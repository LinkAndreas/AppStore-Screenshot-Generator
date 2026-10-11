import { AlignCenter, AlignLeft, AlignRight } from 'lucide-react';
import type { ScreenConfig } from '../../store/ConfigContext';
import { DEFAULT_SUBTITLE_FONT, DEFAULT_TITLE_FONT, SCREEN_FONTS, getScreenFont, screenFontStack, type ScreenFontId } from '../../shared/fonts';
import { DEVICE_LAYOUT, type DeviceType } from '../../shared/layout';
import { DARK_TEXT, LIGHT_TEXT, readableTextColor } from '../../shared/presets';

/** A short list of text colours that work on most backgrounds; anything else via the colour well. */
const TEXT_COLORS = [LIGHT_TEXT, DARK_TEXT, '#0a84ff', '#ff375f', '#ff9f0a'];
import { ColorWell, Group, Row, Segmented } from './controls';
import { backgroundColors } from '../../utils/screenStyle';

type Size = 'S' | 'M' | 'L' | 'XL';
const SIZE_FACTORS: Record<Size, number> = { S: 0.75, M: 1, L: 1.25, XL: 1.5 };

/** The size step closest to a pixel size, relative to the device's default. */
const nearestSize = (px: number, base: number): Size =>
  (Object.keys(SIZE_FACTORS) as Size[]).reduce((best, s) =>
    Math.abs(SIZE_FACTORS[s] * base - px) < Math.abs(SIZE_FACTORS[best] * base - px) ? s : best, 'M');


interface Props {
  screen: ScreenConfig;
  device: DeviceType;
  update: (updates: Partial<ScreenConfig>) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LineCard = ({ kind, screen, device, update, t }: Props & { kind: 'title' | 'subtitle' }) => {
  const isTitle = kind === 'title';
  const layout = DEVICE_LAYOUT[device];
  const visible = (isTitle ? screen.showTitle : screen.showSubtitle) !== false;
  const base = isTitle ? layout.defaultTitleSize : layout.defaultSubtitleSize;
  const px = (isTitle ? screen.titleSize : screen.subtitleSize) || (isTitle ? layout.autoTitleSize : layout.autoSubtitleSize);
  const bold = isTitle ? screen.titleBold !== false : !!screen.subtitleBold;

  return (
    <section className="panel-group">
      <div className="section-title-row">
        <h3 className="section-title">{t(isTitle ? 'text.headline' : 'text.subtitle')}</h3>
        <input
          type="checkbox"
          className="custom-checkbox"
          checked={visible}
          title={t('text.show')}
          aria-label={`${t('text.show')}: ${t(isTitle ? 'text.headline' : 'text.subtitle')}`}
          onChange={e => update({ [isTitle ? 'showTitle' : 'showSubtitle']: e.target.checked })}
        />
      </div>
      <div className={`card ${visible ? '' : 'is-disabled'}`}>
        <textarea
          rows={isTitle ? 2 : 2}
          disabled={!visible}
          placeholder={t(isTitle ? 'text.headlinePlaceholder' : 'text.subtitlePlaceholder')}
          value={isTitle ? screen.title : screen.subtitle}
          onChange={e => update({ [kind]: e.target.value })}
          style={{ width: '100%', resize: 'vertical' }}
        />
        <div className="inline-controls">
          <Segmented<Size>
            label={t('text.size')}
            className="compact"
            value={nearestSize(px, base)}
            options={(Object.keys(SIZE_FACTORS) as Size[]).map(s => ({ value: s, label: s, title: `${t('text.size')} ${s}` }))}
            onChange={s => update({ [isTitle ? 'titleSize' : 'subtitleSize']: Math.round(SIZE_FACTORS[s] * base) })}
          />
          <button
            className={`chip ${bold ? 'active' : ''}`}
            aria-pressed={bold}
            onClick={() => update({ [isTitle ? 'titleBold' : 'subtitleBold']: !bold })}
            style={{ fontWeight: 700 }}
          >
            {t('text.bold')}
          </button>
        </div>
      </div>
    </section>
  );
};

/** Text tab: the two lines, then one shared style (font, alignment, colour). */
export const TextPanel = (props: Props) => {
  const { screen, update, t } = props;
  const titleFont = getScreenFont(screen.titleFont, DEFAULT_TITLE_FONT);
  const subtitleFont = getScreenFont(screen.subtitleFont, DEFAULT_SUBTITLE_FONT);
  const align = screen.titleAlign ?? 'center';
  const auto = readableTextColor(...backgroundColors(screen));
  const color = (screen.titleColor ?? '#ffffff').toLowerCase();
  const isAuto = color === auto && (screen.subtitleColor ?? color).toLowerCase() === auto;
  const setColor = (c: string) => update({ titleColor: c, subtitleColor: c });

  const fontSelect = (value: ScreenFontId, onChange: (v: ScreenFontId) => void, label: string) => (
    <select value={value} onChange={e => onChange(e.target.value as ScreenFontId)} aria-label={label}
      style={{ width: 160, fontFamily: screenFontStack(getScreenFont(value, value)) }}>
      {SCREEN_FONTS.map(f => <option key={f.id} value={f.id} style={{ fontFamily: screenFontStack(f) }}>{f.label}</option>)}
    </select>
  );

  return (
    <>
      <LineCard kind="title" {...props} />
      <LineCard kind="subtitle" {...props} />

      <Group title={t('text.style')}>
        <Row label={t('text.headlineFont')}>
          {fontSelect(titleFont.id, v => update({ titleFont: v }), t('text.headlineFont'))}
        </Row>
        <Row label={t('text.subtitleFont')}>
          {fontSelect(subtitleFont.id, v => update({ subtitleFont: v }), t('text.subtitleFont'))}
        </Row>
        <Row label={t('text.align')}>
          <Segmented<'left' | 'center' | 'right'>
            label={t('text.align')}
            className="compact"
            value={align}
            options={[
              { value: 'left', label: <AlignLeft size={15} />, title: t('text.alignLeft') },
              { value: 'center', label: <AlignCenter size={15} />, title: t('text.alignCenter') },
              { value: 'right', label: <AlignRight size={15} />, title: t('text.alignRight') },
            ]}
            onChange={v => update({ titleAlign: v, subtitleAlign: v })}
          />
        </Row>
        <div className="field">
          <span className="field-label">{t('text.color')}</span>
          <div className="color-row">
            <button className={`chip ${isAuto ? 'active' : ''}`} onClick={() => setColor(auto)} title={t('text.autoHint')}>
              <span className="chip-dot" style={{ background: auto }} /> {t('text.auto')}
            </button>
            {TEXT_COLORS.map(c => (
              <button
                key={c}
                className={`swatch small ${!isAuto && color === c ? 'active' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
                aria-label={c}
              />
            ))}
            <ColorWell value={screen.titleColor ?? '#ffffff'} onChange={setColor} label={t('text.custom')} />
          </div>
          <p className="hint">{t('text.autoHint')}</p>
        </div>
      </Group>
    </>
  );
};
