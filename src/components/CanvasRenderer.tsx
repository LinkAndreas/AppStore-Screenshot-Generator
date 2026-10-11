import React, { useState } from 'react';
import { useConfig } from '../store/ConfigContext';
import type { ScreenConfig } from '../store/ConfigContext';
import { getBezelPath, getBezelCategories, SCREEN_DIMENSIONS } from '../constants';
import { validateImageDimensions } from '../utils/imageValidation';
import { screenBackground, subtitleStyle, titleStyle } from '../utils/screenStyle';
import { DEVICE_LAYOUT, DEVICE_REFERENCE_WIDTH, TEXT_LINE_PADDING_X, TEXT_PADDING_X, TEXT_SHADOW } from '../shared/layout';
import { DeviceFrame } from './DeviceFrame';
import { ImagePlus, Smartphone } from 'lucide-react';

// ---------------------------------------------------------------------------
// Auto-Height Textarea for flawless React controlled input
// ---------------------------------------------------------------------------

const EditableText = ({
  value,
  onChange,
  className,
  style,
  onClick,
  placeholder
}: {
  value: string,
  onChange: (val: string) => void,
  className?: string,
  style?: React.CSSProperties,
  onClick?: (e: any) => void,
  placeholder?: string
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  // Sync cursor-safe content on mount or value change (only if not focused)
  React.useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      ref.current.innerText = value;
    }
  }, [value]);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={(e) => onChange(e.currentTarget.innerText)}
      onClick={onClick}
      className={className}
      data-placeholder={placeholder}
      style={{
        ...style,
        background: 'transparent',
        border: 'none',
        outline: 'none',
        padding: `0 ${TEXT_LINE_PADDING_X}px`,
        display: 'block',
        width: '100%',
        boxSizing: 'border-box',
        wordBreak: 'break-word',
        lineHeight: style?.lineHeight || 1.4,
        textAlign: style?.textAlign || 'center',
        minHeight: '1.2em',
        cursor: 'text'
      }}
    />
  );
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Dims { w: number; h: number }

interface ScreenCardProps {
  screen: ScreenConfig;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTextClick: () => void;
  updateScreen: (id: string, updates: Partial<ScreenConfig>) => void;
}

const ScreenCard = ({ screen, index, isSelected, onSelect, onFileSelect, onTextClick, updateScreen }: ScreenCardProps) => {
  const { activeDeviceType, setRightSidebarTab, setExpandedSections, t } = useConfig();
  const [bezelDims, setBezelDims] = useState<Dims | null>(null);

  const canvasDim = SCREEN_DIMENSIONS[activeDeviceType];

  const bezelSrc = getBezelPath(screen.bezelName);
  const { device } = getBezelCategories(screen.bezelName);
  const isIpad = device === 'iPad';
  const layout = DEVICE_LAYOUT[device as 'iPhone' | 'iPad'];

  // ------------------------------------------------------------------
  // Layout Constants
  // ------------------------------------------------------------------
  const referenceWidth = DEVICE_REFERENCE_WIDTH;
  const internalWidth = bezelDims?.w || referenceWidth;
  const internalHeight = bezelDims?.h || (referenceWidth / (isIpad ? (3 / 4) : (9 / 19.5)));
  const baseScale = referenceWidth / internalWidth;
  const actualScale = screen.scale * baseScale;

  const isTitleVisible = screen.showTitle !== false && screen.title.trim() !== '';
  const isSubtitleVisible = screen.showSubtitle !== false && screen.subtitle.trim() !== '';
  const showText = isTitleVisible || isSubtitleVisible;

  return (
    <div
      className={`screen-wrapper ${isSelected ? 'selected' : ''}`}
      data-label={t('canvas.screenLabel', { n: String(index + 1) })}
      onClick={onSelect}
      style={{
        width: `${canvasDim.width * 0.25}px`,
        height: `${canvasDim.height * 0.25}px`,
      }}
    >
      <div
        className="app-screen"
        style={{
          width: `${canvasDim.width}px`,
          height: `${canvasDim.height}px`,
          background: screenBackground(screen),
          display: 'flex',
          flexDirection: 'column',
          justifyContent: showText ? 'flex-start' : 'center',
          paddingTop: showText ? `${layout.paddingTop}px` : '0',
          alignItems: 'center',
          paddingLeft: '0', paddingRight: '0', paddingBottom: '0'
        }}
      >
        {showText && (
          <div
            className="header-text"
            style={{
              marginBottom: `${layout.textMarginBottom}px`,
              width: '100%',
              padding: `0 ${TEXT_PADDING_X}px`,
              boxSizing: 'border-box',
              textShadow: TEXT_SHADOW,
              display: showText ? 'block' : 'none'
            }}
          >
            {(screen.showTitle !== false) && (screen.title.trim() !== '' || document.activeElement === document.querySelector(`.title-${screen.id}`)) ? (
              <EditableText
                className={`screen-title title-${screen.id}`}
                value={screen.title}
                placeholder={t('content.titlePlaceholder')}
                onChange={(val: string) => updateScreen(screen.id, { title: val })}
                onClick={(e: any) => {
                  e.stopPropagation();
                  onSelect();
                  setRightSidebarTab('content');
                  setExpandedSections(prev => prev.includes('title') ? prev : [...prev, 'title']);
                  onTextClick();
                }}
                style={{
                  ...titleStyle(screen, device as 'iPhone' | 'iPad'),
                  display: screen.title.trim() === '' && document.activeElement !== document.querySelector(`.title-${screen.id}`) ? 'none' : 'block'
                }}
              />
            ) : null}
            {(screen.showSubtitle !== false) && (screen.subtitle.trim() !== '' || document.activeElement === document.querySelector(`.subtitle-${screen.id}`)) ? (
              <EditableText
                className={`screen-subtitle subtitle-${screen.id}`}
                value={screen.subtitle}
                placeholder={t('content.subtitlePlaceholder')}
                onChange={(val: string) => updateScreen(screen.id, { subtitle: val })}
                onClick={(e: any) => {
                  e.stopPropagation();
                  onSelect();
                  setRightSidebarTab('content');
                  setExpandedSections(prev => prev.includes('subtitle') ? prev : [...prev, 'subtitle']);
                  onTextClick();
                }}
                style={{
                  ...subtitleStyle(screen, device as 'iPhone' | 'iPad'),
                  display: screen.subtitle.trim() === '' && document.activeElement !== document.querySelector(`.subtitle-${screen.id}`) ? 'none' : 'block'
                }}
              />
            ) : null}
          </div>
        )}

        {/* 
          Outer Bounding Box: Perfectly tracks actual visual scale for flexbox margins 
        */}
        <div
          className="device-scale-wrapper-outer"
          style={{
            marginTop: (screen.positioning === 'bottom' || screen.positioning === 'center' || !screen.positioning) ? 'auto' : undefined,
            marginBottom: (screen.positioning === 'top' || screen.positioning === 'center' || !screen.positioning) ? 'auto' : undefined,
            width: `${internalWidth * actualScale}px`,
            height: `${internalHeight * actualScale}px`,
            flexShrink: 0,
            position: 'relative'
          }}
        >
          {/* Inner Transformer: Renders exactly the visual representation of transform tools */}
          <div
            className="device-scale-wrapper-inner"
            style={{
              transform: `translate(${screen.offsetX}px, ${screen.offsetY}px) scale(${actualScale}) rotate(${screen.rotation}deg)`,
              transformOrigin: 'top center',
              width: `${internalWidth}px`,
              height: `${internalHeight}px`,
              position: 'absolute',
              left: '50%',
              marginLeft: `-${internalWidth / 2}px`,
              top: 0
            }}
          >
            <DeviceFrame
              bezelSrc={bezelSrc}
              screenshotSrc={screen.imageObjUrl}
              screenId={screen.id}
              onFileSelect={onFileSelect}
              onBezelLoad={(dims) => setBezelDims(dims)}
              cornerRadiusPx={layout.screenCornerRadius}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// CanvasRenderer — top-level container
// ---------------------------------------------------------------------------

export const CanvasRenderer = () => {
  const { screens, selectedScreenId, setSelectedScreenId, canvasZoom, updateScreen, addScreen, setRightSidebarTab, t, activeDeviceType, setAppError } = useConfig();

  const handleFileSelect = async (screenId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // We look up the exact device of the selected screen for exact validation. 
      // If we don't know it natively here, we can fallback or use global `activeDeviceType`. 
      // CanvasRenderer uses `const { activeDeviceType...` from useConfig! Let's ensure strict match.
      const isValid = await validateImageDimensions(file, activeDeviceType === 'iPad' ? 'iPad' : 'iPhone');
      if (!isValid) {
        setAppError(t(activeDeviceType === 'iPad' ? 'error.dimension.ipad' : 'error.dimension.iphone'));
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
          onTextClick={() => setRightSidebarTab('content')}
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
                  iphone: `${SCREEN_DIMENSIONS.iPhone.width} × ${SCREEN_DIMENSIONS.iPhone.height}`,
                  ipad: `${SCREEN_DIMENSIONS.iPad.width} × ${SCREEN_DIMENSIONS.iPad.height}`,
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
