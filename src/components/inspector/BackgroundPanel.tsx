import { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import type { ScreenConfig } from '../../store/ConfigContext';
import { GRADIENT_CATEGORIES, GRADIENT_PRESETS, SOLID_PRESETS, readableTextColor, LIGHT_TEXT, DARK_TEXT, type GradientCategory } from '../../shared/presets';
import { BACKGROUND_GRADIENT_ANGLE } from '../../shared/layout';
import { backgroundColors } from '../../utils/screenStyle';
import { ColorWell, Group, Segmented } from './controls';

interface Props {
  screen: ScreenConfig;
  update: (updates: Partial<ScreenConfig>) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

/**
 * New background, keeping text readable: when the text uses the automatic colour (or plain
 * white/black), it switches to whichever reads best on the new background.
 */
const withReadableText = (screen: ScreenConfig, bg: Partial<ScreenConfig>): Partial<ScreenConfig> => {
  const next = { ...screen, ...bg };
  const oldAuto = readableTextColor(...backgroundColors(screen));
  const title = (screen.titleColor ?? LIGHT_TEXT).toLowerCase();
  const subtitle = (screen.subtitleColor ?? title).toLowerCase();
  const followsBackground = [oldAuto, LIGHT_TEXT, DARK_TEXT, '#000000'].includes(title) && subtitle === title;
  if (!followsBackground) return bg;
  const auto = readableTextColor(...backgroundColors(next));
  return { ...bg, titleColor: auto, subtitleColor: auto };
};

const gradientCss = (from: string, to: string) => `linear-gradient(${BACKGROUND_GRADIENT_ANGLE}deg, ${from}, ${to})`;

/** Background tab: a gallery of presets with a readability preview, plus custom colours. */
export const BackgroundPanel = ({ screen, update, t }: Props) => {
  const [category, setCategory] = useState<GradientCategory | 'all'>('all');
  const isGradient = screen.bgType === 'gradient';
  const apply = (bg: Partial<ScreenConfig>) => update(withReadableText(screen, bg));

  const gradients = GRADIENT_PRESETS.filter(p => category === 'all' || p.category === category);

  return (
    <>
      <Segmented<'gradient' | 'color'>
        label={t('style.bg')}
        className="large"
        value={screen.bgType}
        options={[{ value: 'gradient', label: t('bg.gradient') }, { value: 'color', label: t('bg.solid') }]}
        onChange={v => apply({ bgType: v })}
      />

      {isGradient ? (
        <section className="panel-group">
           <div className="chip-row scroll" role="tablist" aria-label={t('bg.categories')}>
            {(['all', ...GRADIENT_CATEGORIES] as const).map(c => (
              <button key={c} role="tab" aria-selected={category === c} className={`chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
                {t(`bg.cat.${c}`)}
              </button>
            ))}
          </div>
          <div className="preset-grid">
            {gradients.map(p => {
              const active = screen.bgGradientStart === p.start && screen.bgGradientEnd === p.end;
              return (
                <button
                  key={p.name}
                  className={`preset-tile ${active ? 'active' : ''}`}
                  style={{ background: gradientCss(p.start, p.end), color: readableTextColor(p.start, p.end) }}
                  title={p.name}
                  aria-label={p.name}
                  aria-pressed={active}
                  onClick={() => apply({ bgType: 'gradient', bgGradientStart: p.start, bgGradientEnd: p.end })}
                >
                  Aa
                </button>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="panel-group">
          <div className="preset-grid">
            {SOLID_PRESETS.map(p => {
              const active = screen.bgColor.toLowerCase() === p.color;
              return (
                <button
                  key={p.name}
                  className={`preset-tile ${active ? 'active' : ''}`}
                  style={{ background: p.color, color: readableTextColor(p.color) }}
                  title={p.name}
                  aria-label={p.name}
                  aria-pressed={active}
                  onClick={() => apply({ bgType: 'color', bgColor: p.color })}
                >
                  Aa
                </button>
              );
            })}
          </div>
        </section>
      )}

      <Group title={t('bg.custom')}>
        {isGradient ? (
          <div className="custom-gradient">
            <ColorWell value={screen.bgGradientStart} onChange={v => apply({ bgGradientStart: v })} label={t('bg.from')} />
            <div className="gradient-preview" style={{ background: gradientCss(screen.bgGradientStart, screen.bgGradientEnd) }} />
            <ColorWell value={screen.bgGradientEnd} onChange={v => apply({ bgGradientEnd: v })} label={t('bg.to')} />
            <button
              className="icon-btn"
              title={t('bg.swap')}
              aria-label={t('bg.swap')}
              onClick={() => apply({ bgGradientStart: screen.bgGradientEnd, bgGradientEnd: screen.bgGradientStart })}
            >
              <ArrowLeftRight size={16} />
            </button>
          </div>
        ) : (
          <div className="custom-gradient">
            <ColorWell value={screen.bgColor} onChange={v => apply({ bgColor: v })} label={t('bg.color')} />
            <div className="gradient-preview" style={{ background: screen.bgColor }} />
          </div>
        )}
      </Group>
    </>
  );
};
