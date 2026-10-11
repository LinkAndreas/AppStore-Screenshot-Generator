import { useState } from 'react';
import { ArrowDownToLine, ArrowUpToLine, ChevronDown, ChevronRight, FoldVertical, Hand, ImagePlus } from 'lucide-react';
import type { ScreenConfig } from '../../store/ConfigContext';
import { DEVICE_LAYOUT, bezelsForDevice, getBezelSpec, offsetLimit, type DeviceType } from '../../shared/layout';
import { acceptedSizesText } from '../../utils/imageValidation';
import { Group, Row, Segmented, Slider } from './controls';

interface Props {
  screen: ScreenConfig;
  device: DeviceType;
  update: (updates: Partial<ScreenConfig>) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

/** Device tab: the screenshot, the frame, and where the device sits. */
export const DevicePanel = ({ screen, device, update, onUpload, t }: Props) => {
  const [fineTune, setFineTune] = useState(false);
  const layout = DEVICE_LAYOUT[device];
  const maxOffset = offsetLimit(device);
  const bezels = bezelsForDevice(device);
  const current = getBezelSpec(screen.bezelName, device);
  const models = [...new Set(bezels.map(b => b.model))];
  const colors = bezels.filter(b => b.model === current.model);
  const moved = screen.offsetX !== 0 || screen.offsetY !== 0 || screen.rotation !== 0 || screen.scale !== layout.defaultScale;

  return (
    <>
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

      <Group
        title={t('device.placement')}
        action={moved && (
          <button className="text-link" onClick={() => update({ scale: layout.defaultScale, rotation: 0, offsetX: 0, offsetY: 0 })}>
            {t('device.reset')}
          </button>
        )}
      >
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
        <Slider
          label={t('device.size')}
          value={screen.scale}
          display={`${Math.round((screen.scale / layout.defaultScale) * 100)}%`}
          min={0.2} max={2} step={0.01}
          onChange={v => update({ scale: v })}
        />
        <Slider
          label={t('device.tilt')}
          value={screen.rotation}
          display={screen.rotation === 0 ? t('device.straight') : `${screen.rotation > 0 ? '+' : '−'}${Math.abs(screen.rotation)}°`}
          min={-45} max={45} step={1}
          onChange={v => update({ rotation: Math.round(v) })}
        />
        <p className="hint" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <Hand size={13} /> {t('device.dragHint')}
        </p>
        <button className="disclosure" onClick={() => setFineTune(!fineTune)} aria-expanded={fineTune}>
          {fineTune ? <ChevronDown size={14} /> : <ChevronRight size={14} />} {t('device.fineTune')}
        </button>
        {fineTune && (
          <>
            <Slider
              label={t('device.horizontal')}
              value={screen.offsetX}
              display={screen.offsetX === 0 ? t('layout.center') : `${screen.offsetX > 0 ? '→' : '←'} ${Math.abs(screen.offsetX)}`}
              min={-maxOffset} max={maxOffset} step={1}
              onChange={v => update({ offsetX: Math.round(v) })}
            />
            <Slider
              label={t('device.vertical')}
              value={screen.offsetY}
              display={screen.offsetY === 0 ? '0' : `${screen.offsetY > 0 ? '↓' : '↑'} ${Math.abs(screen.offsetY)}`}
              min={-maxOffset} max={maxOffset} step={1}
              onChange={v => update({ offsetY: Math.round(v) })}
            />
          </>
        )}
      </Group>
    </>
  );
};
