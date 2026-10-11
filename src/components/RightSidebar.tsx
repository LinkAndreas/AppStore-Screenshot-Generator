import React from 'react';
import { validateImageDimensions } from '../utils/imageValidation';
import { useConfig, type ScreenConfig } from '../store/ConfigContext';
import { AVAILABLE_BEZELS, getBezelCategories } from '../constants';
import { GRADIENT_PRESETS, SOLID_PRESETS, FONT_COLOR_PRESETS } from '../shared/presets';
import { DEFAULT_SUBTITLE_FONT, DEFAULT_TITLE_FONT, SCREEN_FONTS, getScreenFont, screenFontStack, type ScreenFontId } from '../shared/fonts';
import { DEVICE_LAYOUT, LAYOUT_LIMITS } from '../shared/layout';
import { ImagePlus, ArrowLeftRight, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, ChevronDown, ChevronRight, MousePointerClick } from 'lucide-react';

const FONT_SIZE_OPTIONS = [
  { label: 'Auto', value: undefined },
  { label: '36 px', value: 36 },
  { label: '44 px', value: 44 },
  { label: '48 px', value: 48 },
  { label: '52 px', value: 52 },
  { label: '60 px', value: 60 },
  { label: '72 px', value: 72 },
  { label: '84 px', value: 84 },
  { label: '92 px', value: 92 },
  { label: '104 px', value: 104 },
  { label: '120 px', value: 120 },
  { label: '144 px', value: 144 },
  { label: '160 px', value: 160 },
  { label: '180 px', value: 180 },
  { label: '200 px', value: 200 },
  { label: '240 px', value: 240 },
];

/** Toggle button inside a compact segmented group. */
const ToggleButton = ({ active, onClick, label, children }: { active: boolean; onClick: () => void; label: string; children: React.ReactNode }) => (
  <button className={active ? 'active' : ''} onClick={onClick} title={label} aria-label={label} aria-pressed={active}>
    {children}
  </button>
);

/** Labelled range slider with its value in mono. */
const Slider = ({ label, value, display, min, max, step, onChange }: {
  label: string; value: number; display: string; min: number; max: number; step: number; onChange: (v: number) => void;
}) => (
  <div className="field">
    <div className="slider-head">
      <span>{label}</span>
      <span className="slider-value">{display}</span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      aria-label={label}
      style={{ '--pct': `${((value - min) / (max - min)) * 100}%` } as React.CSSProperties}
      onChange={e => onChange(parseFloat(e.target.value))}
    />
  </div>
);

/**
 * Helper component for typography controls to prevent unnecessary re-mounting
 */
const TypographyControls = ({
  type,
  screen,
  updateScreen,
  t
}: {
  type: 'title' | 'subtitle';
  screen: ScreenConfig;
  updateScreen: (id: string, updates: Partial<ScreenConfig>) => void;
  t: (key: string) => string;
}) => {
  const isTitle = type === 'title';
  const color = isTitle ? screen.titleColor : screen.subtitleColor;
  const size = isTitle ? screen.titleSize : screen.subtitleSize;
  const isBold = isTitle ? screen.titleBold : screen.subtitleBold;
  const italic = isTitle ? screen.titleItalic : screen.subtitleItalic;
  const underline = isTitle ? screen.titleUnderline : screen.subtitleUnderline;
  const align = isTitle ? (screen.titleAlign || 'center') : (screen.subtitleAlign || 'center');
  const font = getScreenFont(isTitle ? screen.titleFont : screen.subtitleFont, isTitle ? DEFAULT_TITLE_FONT : DEFAULT_SUBTITLE_FONT);

  const setColor = (val: string) => updateScreen(screen.id, { [isTitle ? 'titleColor' : 'subtitleColor']: val });
  const setSize = (val: number | undefined) => updateScreen(screen.id, { [isTitle ? 'titleSize' : 'subtitleSize']: val });
  const setBold = (val: boolean) => updateScreen(screen.id, { [isTitle ? 'titleBold' : 'subtitleBold']: val });
  const setItalic = (val: boolean) => updateScreen(screen.id, { [isTitle ? 'titleItalic' : 'subtitleItalic']: val });
  const setUnderline = (val: boolean) => updateScreen(screen.id, { [isTitle ? 'titleUnderline' : 'subtitleUnderline']: val });
  const setAlign = (val: 'left' | 'center' | 'right') => updateScreen(screen.id, { [isTitle ? 'titleAlign' : 'subtitleAlign']: val });
  const setFont = (val: ScreenFontId) => updateScreen(screen.id, { [isTitle ? 'titleFont' : 'subtitleFont']: val });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <textarea
        placeholder={isTitle ? t('content.titlePlaceholder') : t('content.subtitlePlaceholder')}
        value={isTitle ? screen.title : screen.subtitle}
        onChange={e => updateScreen(screen.id, { [isTitle ? 'title' : 'subtitle']: e.target.value })}
        style={{ width: '100%', minHeight: isTitle ? '60px' : '50px', resize: 'vertical' }}
      />

      <div className="label-row">
        <span>{t('style.font')}</span>
        <select
          value={font.id}
          onChange={e => setFont(e.target.value as ScreenFontId)}
          style={{ width: '150px', fontFamily: screenFontStack(font) }}
        >
          {SCREEN_FONTS.map(f => (
            <option key={f.id} value={f.id} style={{ fontFamily: screenFontStack(f) }}>{f.label}</option>
          ))}
        </select>
      </div>

      <div className="label-row">
        <span>{t('style.fontSize')}</span>
        <select
          value={size || ''}
          onChange={e => setSize(e.target.value === '' ? undefined : parseInt(e.target.value))}
          style={{ width: '150px' }}
        >
          {FONT_SIZE_OPTIONS.map(opt => (
            <option key={opt.label} value={opt.value ?? ''}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <span className="field-label">{t('style.format')}</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px' }}>
          <div className="segmented compact">
            <ToggleButton active={!!isBold} onClick={() => setBold(!isBold)} label="Bold"><Bold size={13} /></ToggleButton>
            <ToggleButton active={!!italic} onClick={() => setItalic(!italic)} label="Italic"><Italic size={13} /></ToggleButton>
            <ToggleButton active={!!underline} onClick={() => setUnderline(!underline)} label="Underline"><Underline size={13} /></ToggleButton>
          </div>
          <div className="segmented compact">
            <ToggleButton active={align === 'left'} onClick={() => setAlign('left')} label="Align left"><AlignLeft size={13} /></ToggleButton>
            <ToggleButton active={align === 'center'} onClick={() => setAlign('center')} label="Align center"><AlignCenter size={13} /></ToggleButton>
            <ToggleButton active={align === 'right'} onClick={() => setAlign('right')} label="Align right"><AlignRight size={13} /></ToggleButton>
          </div>
        </div>
      </div>

      <div className="field">
        <div className="label-row">
          <span>{t('style.color')}</span>
          <div className="color-picker">
            <input type="text" value={color || '#ffffff'} onChange={e => setColor(e.target.value)} style={{ width: '84px', flex: 'none' }} />
            <input type="color" value={color || '#ffffff'} onChange={e => setColor(e.target.value)} />
          </div>
        </div>
        <div className="gradient-swatches text-colors">
          {FONT_COLOR_PRESETS.map(pColor => (
            <button
              key={pColor}
              className={`swatch ${color === pColor ? 'active' : ''}`}
              style={{ background: pColor }}
              onClick={() => setColor(pColor)}
              aria-label={pColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export const RightSidebar = () => {
  const {
    screens,
    selectedScreenId,
    updateScreen,
    rightSidebarTab,
    setRightSidebarTab,
    expandedSections,
    setExpandedSections,
    mobileSheetHeight,
    setMobileSheetHeight,
    setAppError,
    t
  } = useConfig();

  const [isDragging, setIsDragging] = React.useState(false);
  const [dragHeight, setDragHeight] = React.useState(mobileSheetHeight);

  // Constants for snap points
  const SNAP_POINTS = [25, 50, 75];

  const calculateHeightPct = (clientY: number) => {
    const newHeightPct = ((window.innerHeight - clientY) / window.innerHeight) * 100;
    return Math.max(10, Math.min(95, newHeightPct));
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragMove = (clientY: number) => {
    if (!isDragging) return;
    setDragHeight(calculateHeightPct(clientY));
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const closest = SNAP_POINTS.reduce((prev, curr) =>
      Math.abs(curr - dragHeight) < Math.abs(prev - dragHeight) ? curr : prev
    );

    setMobileSheetHeight(closest);
    setDragHeight(closest);
  };

  // Touch handlers
  const handleTouchStart = () => handleDragStart();
  const handleTouchMove = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientY);
  const handleTouchEnd = () => handleDragEnd();

  // Mouse handlers via window listeners for smooth drag-out
  React.useEffect(() => {
    if (!isDragging) {
      document.body.style.userSelect = '';
      return;
    }

    // Prevent text selection globally while dragging
    document.body.style.userSelect = 'none';

    const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientY);
    const onMouseUp = () => handleDragEnd();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, dragHeight]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const selectedScreen = screens.find(s => s.id === selectedScreenId);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && selectedScreen) {
      const file = e.target.files[0];
      const deviceType = bezelOptionsData?.device === 'iPad' ? 'iPad' : 'iPhone';
      const isValid = await validateImageDimensions(file, deviceType);
      if (!isValid) {
        setAppError(t(deviceType === 'iPad' ? 'error.dimension.ipad' : 'error.dimension.iphone'));
        e.target.value = '';
        return;
      }
      const url = URL.createObjectURL(file);
      updateScreen(selectedScreen.id, { imageObjUrl: url });
      e.target.value = '';
    }
  };

  // Helper for bezel options
  const bezelOptionsData = selectedScreen ? (() => {
    const { device, orientation } = getBezelCategories(selectedScreen.bezelName);
    const validOptions = AVAILABLE_BEZELS.filter(b => {
      const cats = getBezelCategories(b);
      return cats.device === device && cats.orientation === orientation;
    });
    return { device, validOptions };
  })() : null;
  const deviceLayout = DEVICE_LAYOUT[bezelOptionsData?.device === 'iPad' ? 'iPad' : 'iPhone'];

  const textSection = (type: 'title' | 'subtitle') => {
    if (!selectedScreen) return null;
    const visibleKey = type === 'title' ? 'showTitle' : 'showSubtitle';
    const isVisible = selectedScreen[visibleKey] !== false;
    const isOpen = expandedSections.includes(type) && isVisible;
    return (
      <div className={`collapsible ${isOpen ? 'open' : ''}`}>
        <div className="collapsible-head">
          <button onClick={() => toggleSection(type)} disabled={!isVisible} aria-expanded={isOpen}>
            {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
            <span>{t(type === 'title' ? 'content.title' : 'content.subtitle')}</span>
          </button>
          <input
            type="checkbox"
            className="custom-checkbox"
            checked={isVisible}
            title={t('content.show')}
            aria-label={`${t('content.show')}: ${t(type === 'title' ? 'content.title' : 'content.subtitle')}`}
            onChange={e => {
              const val = e.target.checked;
              updateScreen(selectedScreen.id, { [visibleKey]: val });
              if (val && !expandedSections.includes(type)) toggleSection(type);
              if (!val && expandedSections.includes(type)) toggleSection(type);
            }}
            onClick={e => e.stopPropagation()}
          />
        </div>
        {isOpen && (
          <div className="collapsible-body">
            <TypographyControls type={type} screen={selectedScreen} updateScreen={updateScreen} t={t} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`sidebar sidebar-right ${isDragging ? 'dragging' : ''}`}
      style={{
        '--sheet-height': isDragging ? `${dragHeight}dvh` : undefined,
        transition: isDragging ? 'none' : undefined,
        display: 'flex',
        flexDirection: 'column'
      } as React.CSSProperties}
    >
      {/* Mobile Drag Handle */}
      <div
        className="mobile-drag-handle"
        onMouseDown={handleDragStart}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
      >
        <span />
      </div>

      {!selectedScreen ? (
        <div className="empty-state" style={{ flex: 1, justifyContent: 'center', padding: '40px 28px' }}>
          <div className="empty-icon" style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--fill)', color: 'var(--text-muted)', boxShadow: 'none' }}>
            <MousePointerClick size={26} strokeWidth={1.75} />
          </div>
          <h2 style={{ fontSize: '17px', fontWeight: 600 }}>{t('sidebar.selectScreen')}</h2>
          <p style={{ fontSize: '13px', margin: 0 }}>{t('sidebar.selectDesc')}</p>
        </div>
      ) : (
        /* Main Customization Tabs */
        <>
          <div className="tabs segmented" role="tablist">
            {(['layout', 'style', 'content'] as const).map(tab => (
              <button
                key={tab}
                role="tab"
                aria-selected={rightSidebarTab === tab}
                className={rightSidebarTab === tab ? 'active' : ''}
                onClick={() => setRightSidebarTab(tab)}
              >
                {t(`tabs.${tab}`)}
              </button>
            ))}
          </div>

          <div className="sidebar-content">
            {rightSidebarTab === 'layout' && (
              <>
                <div className="panel-group">
                  <h3>{t('layout.model')}</h3>
                  <div className="card">
                  <div className="segmented wrap-free">
                    {bezelOptionsData?.validOptions.map(name => {
                      const display = name.split(' - ').slice(-2, -1)[0] ?? name;
                      return (
                        <button
                          key={name}
                          className={selectedScreen.bezelName === name ? 'active' : ''}
                          onClick={() => updateScreen(selectedScreen.id, { bezelName: name })}
                        >
                          {display}
                        </button>
                      );
                    })}
                  </div>
                  </div>
                </div>

                <div className="panel-group">
                  <h3>{t('layout.positioning')}</h3>
                  <div className="card">
                  <div className="field">
                    <span className="field-label">{t('layout.autoPlacement')}</span>
                    <div className="segmented">
                      {(['top', 'center', 'bottom'] as const).map(pos => {
                        const isActive = selectedScreen.positioning === pos || (!selectedScreen.positioning && pos === 'center');
                        return (
                          <button
                            key={pos}
                            className={isActive ? 'active' : ''}
                            onClick={() => updateScreen(selectedScreen.id, { positioning: pos })}
                          >
                            {t(`layout.${pos}`)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Slider
                    label={t('layout.scale')}
                    value={selectedScreen.scale || deviceLayout.defaultScale}
                    display={`${Math.round((selectedScreen.scale || 1) * 100)}%`}
                    min={LAYOUT_LIMITS.scale.min} max={LAYOUT_LIMITS.scale.max} step={0.01}
                    onChange={v => updateScreen(selectedScreen.id, { scale: v })}
                  />
                  <Slider
                    label={t('layout.rotation')}
                    value={selectedScreen.rotation || 0}
                    display={`${selectedScreen.rotation || 0}°`}
                    min={LAYOUT_LIMITS.rotation.min} max={LAYOUT_LIMITS.rotation.max} step={1}
                    onChange={v => updateScreen(selectedScreen.id, { rotation: Math.round(v) })}
                  />
                  <Slider
                    label={t('layout.offsetX')}
                    value={selectedScreen.offsetX || 0}
                    display={`${selectedScreen.offsetX || 0} px`}
                    min={LAYOUT_LIMITS.offset.min} max={LAYOUT_LIMITS.offset.max} step={1}
                    onChange={v => updateScreen(selectedScreen.id, { offsetX: Math.round(v) })}
                  />
                  <Slider
                    label={t('layout.offsetY')}
                    value={selectedScreen.offsetY || 0}
                    display={`${selectedScreen.offsetY || 0} px`}
                    min={LAYOUT_LIMITS.offset.min} max={LAYOUT_LIMITS.offset.max} step={1}
                    onChange={v => updateScreen(selectedScreen.id, { offsetY: Math.round(v) })}
                  />
                  <button
                    className="text-link"
                    onClick={() => updateScreen(selectedScreen.id, { scale: deviceLayout.defaultScale, rotation: 0, offsetX: 0, offsetY: 0 })}
                  >
                    {t('layout.reset')}
                  </button>
                  </div>
                </div>
              </>
            )}

            {rightSidebarTab === 'style' && (
              <div className="panel-group">
                <h3>{t('style.bg')}</h3>
                <div className="card">
                <div className="segmented">
                  <button
                    className={selectedScreen.bgType === 'gradient' ? 'active' : ''}
                    onClick={() => updateScreen(selectedScreen.id, { bgType: 'gradient' })}
                  >
                    {t('style.gradient')}
                  </button>
                  <button
                    className={selectedScreen.bgType === 'color' ? 'active' : ''}
                    onClick={() => updateScreen(selectedScreen.id, { bgType: 'color' })}
                  >
                    {t('style.solid')}
                  </button>
                </div>

                {selectedScreen.bgType === 'color' ? (
                  <>
                    <span className="swatch-label">{t('style.preset')}</span>
                    <div className="gradient-swatches">
                      {SOLID_PRESETS.map(p => (
                        <button
                          key={p.name}
                          className={`swatch ${selectedScreen.bgColor === p.color ? 'active' : ''}`}
                          title={p.name}
                          aria-label={p.name}
                          style={{ background: p.color }}
                          onClick={() => updateScreen(selectedScreen.id, { bgColor: p.color, bgType: 'color' })}
                        />
                      ))}
                    </div>
                    <div className="color-picker">
                      <input type="color" value={selectedScreen.bgColor} onChange={e => updateScreen(selectedScreen.id, { bgColor: e.target.value })} />
                      <input type="text" value={selectedScreen.bgColor} onChange={e => updateScreen(selectedScreen.id, { bgColor: e.target.value })} />
                    </div>
                  </>
                ) : (
                  <>
                    <span className="swatch-label">{t('style.preset')}</span>
                    <div className="gradient-swatches">
                      {GRADIENT_PRESETS.map(p => (
                        <button
                          key={p.name}
                          className={`swatch ${selectedScreen.bgGradientStart === p.start && selectedScreen.bgGradientEnd === p.end ? 'active' : ''}`}
                          title={p.name}
                          aria-label={p.name}
                          style={{ background: `linear-gradient(135deg, ${p.start}, ${p.end})` }}
                          onClick={() => updateScreen(selectedScreen.id, { bgGradientStart: p.start, bgGradientEnd: p.end, bgType: 'gradient' })}
                        />
                      ))}
                    </div>
                    <div className="color-picker">
                      <span>{t('style.start')}</span>
                      <input type="color" value={selectedScreen.bgGradientStart} onChange={e => updateScreen(selectedScreen.id, { bgGradientStart: e.target.value })} />
                      <input type="text" value={selectedScreen.bgGradientStart} onChange={e => updateScreen(selectedScreen.id, { bgGradientStart: e.target.value })} />
                    </div>
                    <div className="color-picker">
                      <span>{t('style.end')}</span>
                      <input type="color" value={selectedScreen.bgGradientEnd} onChange={e => updateScreen(selectedScreen.id, { bgGradientEnd: e.target.value })} />
                      <input type="text" value={selectedScreen.bgGradientEnd} onChange={e => updateScreen(selectedScreen.id, { bgGradientEnd: e.target.value })} />
                    </div>
                    <button
                      className="secondary-btn"
                      onClick={() => updateScreen(selectedScreen.id, {
                        bgGradientStart: selectedScreen.bgGradientEnd,
                        bgGradientEnd: selectedScreen.bgGradientStart
                      })}
                    >
                      <ArrowLeftRight size={13} /> {t('style.reverse')}
                    </button>
                  </>
                )}
                </div>
              </div>
            )}

            {rightSidebarTab === 'content' && (
              <>
                <div className="panel-group">
                  <h3>{t('content.section')}</h3>
                  {textSection('title')}
                  {textSection('subtitle')}
                </div>

                <div className="panel-group">
                  <h3>{t('content.screenshot')}</h3>
                  <label className="file-drop">
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                    <ImagePlus size={20} />
                    <span>{selectedScreen.imageObjUrl ? t('content.change') : t('content.upload')}</span>
                    <span className="hint">
                      {t('content.sizeHint', { size: bezelOptionsData?.device === 'iPad' ? '2064 × 2752' : '1320 × 2868' })}
                    </span>
                  </label>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};
