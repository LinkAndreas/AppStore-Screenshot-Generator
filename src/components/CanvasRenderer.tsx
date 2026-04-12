import React, { useState } from 'react';
import { useConfig } from '../store/ConfigContext';
import type { ScreenConfig } from '../store/ConfigContext';
import { getBezelPath, getBezelCategories, SCREEN_DIMENSIONS } from '../constants';
import { validateImageDimensions } from '../utils/imageValidation';
import { DeviceFrame } from './DeviceFrame';

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
        padding: '0 10px',
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
  isSelected: boolean;
  onSelect: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTextClick: () => void;
  updateScreen: (id: string, updates: Partial<ScreenConfig>) => void;
}

const ScreenCard = ({ screen, isSelected, onSelect, onFileSelect, onTextClick, updateScreen }: ScreenCardProps) => {
  const { activeDeviceType, setRightSidebarTab, setExpandedSections, t } = useConfig();
  const [bezelDims, setBezelDims] = useState<Dims | null>(null);

  const canvasDim = SCREEN_DIMENSIONS[activeDeviceType];

  const bezelSrc = getBezelPath(screen.bezelName);
  const { device } = getBezelCategories(screen.bezelName);
  const isIpad = device === 'iPad';

  // ------------------------------------------------------------------
  // Layout Constants
  // ------------------------------------------------------------------
  const referenceWidth = 1120; // Visual width in workspace
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
          background: screen.bgType === 'gradient'
            ? `linear-gradient(135deg, ${screen.bgGradientStart}, ${screen.bgGradientEnd})`
            : screen.bgColor,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: showText ? 'flex-start' : 'center',
          paddingTop: showText ? (isIpad ? '200px' : '100px') : '0',
          alignItems: 'center',
          paddingLeft: '0', paddingRight: '0', paddingBottom: '0'
        }}
      >
        {showText && (
          <div
            className="header-text"
            style={{
              marginBottom: isIpad ? '120px' : '80px',
              width: '100%',
              padding: '0 80px',
              boxSizing: 'border-box',
              textShadow: '0 8px 24px rgba(0,0,0,0.4)',
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
                  fontSize: screen.titleSize ? `${screen.titleSize}px` : `${isIpad ? 84 : 92}px`,
                  color: screen.titleColor || '#ffffff',
                  fontStyle: screen.titleItalic ? 'italic' : 'normal',
                  textDecoration: screen.titleUnderline ? 'underline' : 'none',
                  margin: `0 0 ${isIpad ? '60px' : '40px'} 0`,
                  lineHeight: 1.4,
                  letterSpacing: '-3px',
                  fontWeight: screen.titleBold !== false ? 800 : 500,
                  fontFamily: 'var(--font-display)',
                  textAlign: screen.titleAlign || 'center',
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
                  fontSize: screen.subtitleSize ? `${screen.subtitleSize}px` : `${isIpad ? 48 : 52}px`,
                  color: screen.subtitleColor || '#ffffff',
                  fontStyle: screen.subtitleItalic ? 'italic' : 'normal',
                  textDecoration: screen.subtitleUnderline ? 'underline' : 'none',
                  opacity: screen.subtitleColor ? 1 : 0.9,
                  margin: 0,
                  lineHeight: 1.35,
                  letterSpacing: '-1px',
                  fontWeight: screen.subtitleBold !== false ? 700 : 400,
                  textAlign: screen.subtitleAlign || 'center',
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
              cornerRadiusPx={isIpad ? 60 : 100}
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
    <div
      id="sequence-container"
      className="sequence-container"
      style={{ zoom: canvasZoom, WebkitZoom: canvasZoom } as React.CSSProperties}
    >
      {screens.map((screen) => (
        <ScreenCard
          key={screen.id}
          screen={screen}
          isSelected={selectedScreenId === screen.id}
          onSelect={() => setSelectedScreenId(screen.id)}
          onFileSelect={(e) => handleFileSelect(screen.id, e)}
          onTextClick={() => setRightSidebarTab('content')}
          updateScreen={updateScreen}
        />
      ))}

      {screens.length === 0 && (
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '120px 40px', color: 'var(--text-muted)',
          textAlign: 'center', width: '100%',
        }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '24px',
            background: 'var(--card-bg)', border: '1px solid var(--panel-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '32px', color: 'var(--accent)',
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 9h18" /><path d="M9 21V9" />
            </svg>
          </div>
          <h2 style={{ color: 'var(--text-main)', marginBottom: '12px', fontSize: '24px', fontWeight: '700' }}>
            {t('canvas.empty.title')}
          </h2>
          <p style={{ maxWidth: '400px', lineHeight: '1.6', marginBottom: '32px' }}>
            {t('canvas.empty.desc')}
          </p>
          <button className="primary" onClick={addScreen} style={{ padding: '14px 28px' }}>
            {t('canvas.empty.button')}
          </button>
        </div>
      )}
    </div>
  );
};
