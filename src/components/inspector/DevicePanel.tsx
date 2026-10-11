import { ArrowDownToLine, ArrowUpToLine, Crosshair, FoldVertical, ImagePlus, Move } from 'lucide-react';
import type { ScreenConfig } from '../../store/ConfigContext';
import { DEVICES, DEVICE_LAYOUT, bezelsForDevice, getBezelSpec, offsetLimit, type DeviceType } from '../../shared/layout';
import { LAYOUT_PRESETS, matchPreset, presetValues } from '../../shared/layoutPresets';
import { acceptedSizesText } from '../../utils/imageValidation';
import { ScreenArtwork } from '../ScreenArtwork';
import { Group, Row, Segmented, Slider } from './controls';

interface Props {
  screen: ScreenConfig;
  device: DeviceType;
  update: (updates: Partial<ScreenConfig>) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const TILE_HEIGHT = 104;

/** Device tab: layout presets, fine placement, the screenshot and the frame. */
export const DevicePanel = ({ screen, device, update, onUpload, t }: Props) => {
  const spec = DEVICES[device];
  const layout = DEVICE_LAYOUT[device];
  const maxOffset = offsetLimit(device);
  const bezels = bezelsForDevice(device);
  const current = getBezelSpec(screen.bezelName, device);
  const models = [...new Set(bezels.map(b => b.model))];
  const colors = bezels.filter(b => b.model === current.model);
  const activePreset = matchPreset(device, screen);
  const tileScale = TILE_HEIGHT / spec.height;
  // Percent of the canvas; small values keep a decimal so a nudge is visible.
  const pct = (v: number, of: number) => {
    const p = (v / of) * 100;
    return `${p < 10 ? Math.round(p * 10) / 10 : Math.round(p)}%`;
  };

  return (
    <>
      <Group title={t('layout.presets')}>
        <div className="layout-grid" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${Math.ceil(spec.width * tileScale)}px, 1fr))` }}>
          {LAYOUT_PRESETS.map(p => {
            const values = presetValues(device, p.id);
            return (
              <button
                key={p.id}
                className={`layout-tile ${activePreset === p.id ? 'active' : ''}`}
                onClick={() => update(values)}
                title={t(`layout.preset.${p.id}.desc`)}
                aria-pressed={activePreset === p.id}
              >
                <span className="layout-tile-art" style={{ width: spec.width * tileScale, height: TILE_HEIGHT }}>
                  <ScreenArtwork
                    screen={{ ...screen, ...values }}
                    device={device}
                    idPrefix={`preset-${p.id}-`}
                    style={{ position: 'absolute', top: 0, left: 0, transform: `scale(${tileScale})`, transformOrigin: 'top left', pointerEvents: 'none' }}
                  />
                </span>
                <span className="layout-tile-label">{t(`layout.preset.${p.id}`)}</span>
              </button>
            );
          })}
        </div>
        {!activePreset && <p className="hint">{t('layout.customized')}</p>}
      </Group>

      <Group
        title={t('device.placement')}
        action={(
          <button className="text-link" onClick={() => update({ offsetX: 0, offsetY: 0 })} disabled={screen.offsetX === 0 && screen.offsetY === 0}>
            <Crosshair size={12} style={{ verticalAlign: '-1px' }} /> {t('device.center')}
          </button>
        )}
      >
        <Row label={t('layout.textPosition')}>
          <Segmented<'top' | 'bottom'>
            label={t('layout.textPosition')}
            className="compact"
            value={screen.textPosition ?? 'top'}
            options={[{ value: 'top', label: t('layout.textAbove') }, { value: 'bottom', label: t('layout.textBelow') }]}
            onChange={v => update({ textPosition: v })}
          />
        </Row>
        <div className="field">
          <span className="field-label">{t('device.position')}</span>
          <Segmented<'top' | 'center' | 'bottom'>
            label={t('device.position')}
            value={screen.positioning ?? 'center'}
            options={[
              { value: 'top', label: <><ArrowUpToLine size={14} /> {t('layout.top')}</> },
              { value: 'center', label: <><FoldVertical size={14} /> {t('layout.center')}</> },
              { value: 'bottom', label: <><ArrowDownToLine size={14} /> {t('layout.bottom')}</> },
            ]}
            onChange={v => update({ positioning: v })}
          />
        </div>
        <Slider
          label={t('device.size')}
          value={screen.scale}
          display={`${Math.round((screen.scale / layout.defaultScale) * 100)}%`}
          min={0.2} max={2} step={0.01}
          onChange={v => update({ scale: Math.round(v * 100) / 100 })}
        />
        <Slider
          label={t('device.tilt')}
          value={screen.rotation}
          display={screen.rotation === 0 ? t('device.straight') : `${screen.rotation > 0 ? '+' : '−'}${Math.abs(screen.rotation)}°`}
          min={-45} max={45} step={1}
          onChange={v => update({ rotation: Math.round(v) })}
        />
        <Slider
          label={t('device.horizontal')}
          value={screen.offsetX}
          display={screen.offsetX === 0 ? t('layout.center') : `${screen.offsetX > 0 ? '→' : '←'} ${pct(Math.abs(screen.offsetX), spec.width)}`}
          min={-maxOffset} max={maxOffset} step={1}
          onChange={v => update({ offsetX: Math.abs(v) < spec.width * 0.01 ? 0 : Math.round(v) })}
        />
        <Slider
          label={t('device.vertical')}
          value={screen.offsetY}
          display={screen.offsetY === 0 ? '0' : `${screen.offsetY > 0 ? '↓' : '↑'} ${pct(Math.abs(screen.offsetY), spec.height)}`}
          min={-maxOffset} max={maxOffset} step={1}
          onChange={v => update({ offsetY: Math.round(v) })}
        />
        <p className="hint" style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
          <Move size={13} style={{ flexShrink: 0, marginTop: 2 }} /> {t('device.nudgeHint')}
        </p>
      </Group>

      <Group title={t('device.screenshot')}>
        <label className="file-drop">
          <input type="file" accept="image/png,image/jpeg" style={{ display: 'none' }} onChange={onUpload} />
          {screen.imageObjUrl
            ? <img src={screen.imageObjUrl} alt="" className="file-drop-thumb" />
            : <ImagePlus size={22} />}
          <span>{screen.imageObjUrl ? t('device.replace') : t('device.add')}</span>
          <span className="hint">{t('content.sizeHint', { size: acceptedSizesText(device) })}</span>
        </label>
      </Group>

      <Group title={t('layout.model')}>
        {models.length > 1 && (
          <Row label={t('layout.frameModel')}>
            <select
              value={current.model}
              style={{ width: 170 }}
              onChange={e => {
                const options = bezels.filter(b => b.model === e.target.value);
                // Keep the colour when the new model has it.
                const next = options.find(b => b.color === current.color) ?? options[0];
                if (next) update({ bezelName: next.name });
              }}
            >
              {models.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </Row>
        )}
        <div className="field">
          {models.length === 1 && <span className="field-label">{current.model}</span>}
          <div className="chip-row">
            {colors.map(b => (
              <button key={b.name} className={`chip ${current.name === b.name ? 'active' : ''}`} onClick={() => update({ bezelName: b.name })}>
                {b.color}
              </button>
            ))}
          </div>
        </div>
      </Group>
    </>
  );
};
