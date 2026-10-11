import React from 'react';
import { useConfig } from '../store/ConfigContext';
import type { ScreenConfig } from '../store/ConfigContext';
import { SCREEN_DIMENSIONS } from '../constants';
import { acceptedSizesText, checkScreenshot } from '../utils/imageValidation';
import { DEVICES } from '../shared/layout';
import { ScreenArtwork } from './ScreenArtwork';
import { ImagePlus, Smartphone } from 'lucide-react';

interface ScreenCardProps {
  screen: ScreenConfig;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  updateScreen: (id: string, updates: Partial<ScreenConfig>) => void;
}

/** A screen on the canvas: the full-size artwork shown at 25%, editable in place. */
const ScreenCard = ({ screen, index, isSelected, onSelect, onFileSelect, updateScreen }: ScreenCardProps) => {
  const { activeDeviceType, setRightSidebarTab, setExpandedSections, t } = useConfig();
  const canvasDim = SCREEN_DIMENSIONS[activeDeviceType];

  return (
    <div
      className={`screen-wrapper ${isSelected ? 'selected' : ''}`}
      data-label={t('canvas.screenLabel', { n: String(index + 1) })}
      onClick={onSelect}
      style={{ width: canvasDim.width * 0.25, height: canvasDim.height * 0.25 }}
    >
      <ScreenArtwork
        className="app-screen"
        screen={screen}
        device={activeDeviceType}
        editing={{
          onChange: (updates) => updateScreen(screen.id, updates),
          onTextClick: (kind) => {
            onSelect();
            setRightSidebarTab('content');
            setExpandedSections(prev => prev.includes(kind) ? prev : [...prev, kind]);
          },
          onFileSelect,
          titlePlaceholder: t('content.titlePlaceholder'),
          subtitlePlaceholder: t('content.subtitlePlaceholder'),
        }}
      />
    </div>
  );
};

// ---------------------------------------------------------------------------
// CanvasRenderer — top-level container
// ---------------------------------------------------------------------------

export const CanvasRenderer = () => {
  const { screens, selectedScreenId, setSelectedScreenId, canvasZoom, updateScreen, addScreen, t, activeDeviceType, setAppError } = useConfig();

  const handleFileSelect = async (screenId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const problem = await checkScreenshot(file, activeDeviceType);
      if (problem) {
        setAppError(t('error.dimension', problem));
        e.target.value = '';
        return;
      }
      updateScreen(screenId, { imageObjUrl: URL.createObjectURL(file) });
    }
  };

  return (
    <div className="canvas-area">
      <div 
        className="canvas-transformer-outer"
        style={{
          width: 'fit-content',
          height: 'fit-content',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'flex-start'
        }}
      >
        <div
          id="sequence-container"
          className="sequence-container"
          style={{ 
            transform: `scale(${canvasZoom})`, 
            transformOrigin: '0 0',
            // Correct the space occupied by the element since transform doesn't affect document flow
            marginBottom: `calc(${canvasZoom - 1} * 100%)`, // Rough approximation for height
            marginRight: `calc(${canvasZoom - 1} * 100%)`  // Rough approximation for width
          }}
        >
      {screens.map((screen, index) => (
        <ScreenCard
          key={screen.id}
          screen={screen}
          index={index}
          isSelected={selectedScreenId === screen.id}
          onSelect={() => setSelectedScreenId(screen.id)}
          onFileSelect={(e) => handleFileSelect(screen.id, e)}
          updateScreen={updateScreen}
        />
      ))}

      {screens.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon"><Smartphone size={34} strokeWidth={1.75} /></div>
          <h2>{t('canvas.empty.title')}</h2>
          <p>{t('canvas.empty.desc')}</p>
          <div className="empty-actions">
            <label htmlFor="batch-import-input" className="primary-btn-label large" style={{ padding: '11px 22px', fontSize: '15px' }}>
              <ImagePlus size={17} /> {t('canvas.empty.upload')}
            </label>
            <button className="secondary-btn large" onClick={addScreen}>
              {t('canvas.empty.button')}
            </button>
          </div>
          <div className="steps">
            {[1, 2, 3].map(n => (
              <div className="step" key={n}>
                <span className="step-number">{n}</span>
                <strong>{t(`canvas.step${n}.title`)}</strong>
                <span>{t(`canvas.step${n}.desc`, {
                  device: DEVICES[activeDeviceType].label,
                  size: acceptedSizesText(activeDeviceType),
                })}</span>
              </div>
            ))}
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};
