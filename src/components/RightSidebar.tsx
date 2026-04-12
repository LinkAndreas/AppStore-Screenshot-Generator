import React from 'react';
import { useConfig, type ScreenConfig } from '../store/ConfigContext';
import { AVAILABLE_BEZELS, getBezelCategories } from '../constants';
import { Image as ImageIcon, ArrowLeftRight, Layout, Palette, FileText, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, ChevronDown, ChevronRight, GripHorizontal } from 'lucide-react';

const GRADIENT_PRESETS = [
  /* VIBRANT & LUXURY */
  { name: 'Royal Indigo', start: '#4f46e5', end: '#7c3aed' },
  { name: 'Electric Sky', start: '#3b82f6', end: '#0ea5e9' },
  { name: 'Cyan Teal', start: '#0d9488', end: '#2dd4bf' },
  { name: 'Deep Forest', start: '#064e3b', end: '#10b981' },
  { name: 'Electric Violet', start: '#7c3aed', end: '#c026d3' },
  { name: 'Berry Blast', start: '#9d174d', end: '#db2777' },
  { name: 'Firework', start: '#f43f5e', end: '#ea580c' },
  { name: 'Midnight Sun', start: '#2c3e50', end: '#fd746c' },
  
  /* WARM & ENERGETIC */
  { name: 'Amber Glow', start: '#d97706', end: '#f59e0b' },
  { name: 'Sunset Rose', start: '#f43f5e', end: '#fb7185' },
  { name: 'Peach Kiss', start: '#f97316', end: '#fdba74' },
  { name: 'Zest Orange', start: '#ea580c', end: '#f97316' },
  { name: 'Rose Gold', start: '#f43f5e', end: '#fca5a5' },
  { name: 'Hot Pink', start: '#ec4899', end: '#f472b6' },
  { name: 'Tangerine', start: '#fb923c', end: '#fdba74' },
  
  /* SOFT & PASTEL */
  { name: 'Lavender Mist', start: '#ede9fe', end: '#ddd6fe' },
  { name: 'Peach Dream', start: '#ffedd5', end: '#fed7aa' },
  { name: 'Mint Breeze', start: '#f0fdf4', end: '#bbf7d0' },
  { name: 'Ice Blue', start: '#f0f9ff', end: '#bae6fd' },
  { name: 'Silver Cloud', start: '#f1f5f9', end: '#cbd5e1' },
  { name: 'Marshmallow', start: '#fdf2f8', end: '#fce7f3' },
  
  /* DEEP & NEUTRAL */
  { name: 'Midnight', start: '#0f172a', end: '#1e293b' },
  { name: 'Deep Space', start: '#020617', end: '#1e1b4b' },
  { name: 'Emerald Night', start: '#065f46', end: '#022c22' },
  { name: 'Ocean Depth', start: '#0c4a6e', end: '#075985' },
  { name: 'Coal Slate', start: '#1e293b', end: '#0f172a' },
  { name: 'Graphite', start: '#334155', end: '#1e293b' },
  { name: 'Clay Ground', start: '#7c2d12', end: '#9a3412' }
];

const SOLID_PRESETS = [
  /* ESSENTIALS */
  { name: 'Pure White', color: '#ffffff' },
  { name: 'Slate 50', color: '#f8fafc' },
  { name: 'Slate 100', color: '#f1f5f9' },
  { name: 'Slate 900', color: '#0f172a' },
  { name: 'Pitch Black', color: '#000000' },
  
  /* SOPHISTICATED NEUTRALS (APPLE-LIKE) */
  { name: 'Starlight', color: '#fafaf9' },
  { name: 'Silver Cloud', color: '#e2e8f0' },
  { name: 'Space Gray', color: '#4b5563' },
  { name: 'Graphite', color: '#1f2937' },
  { name: 'Midnight', color: '#010b13' },
  
  /* BRAND COLORS */
  { name: 'Indigo 600', color: '#4f46e5' },
  { name: 'Royal Blue', color: '#2563eb' },
  { name: 'Sky 500', color: '#0ea5e9' },
  { name: 'Teal 600', color: '#0d9488' },
  { name: 'Mint Green', color: '#10b981' },
  { name: 'Forest Green', color: '#166534' },
  { name: 'Golden Amber', color: '#f59e0b' },
  { name: 'Solar Orange', color: '#ea580c' },
  { name: 'Ember Red', color: '#f43f5e' },
  { name: 'Rose Gold', color: '#fca5a5' },
  
  /* PROFESSIONAL TONES */
  { name: 'Violet 600', color: '#7c3aed' },
  { name: 'Deep Purple', color: '#4c1d95' },
  { name: 'Crimson Night', color: '#7f1d1d' },
  { name: 'Dark Teal', color: '#134e4a' },
  { name: 'Olive Drab', color: '#3f6212' },
  { name: 'Coffee Brown', color: '#451a03' },
  { name: 'Zinc 700', color: '#3f3f46' },
  { name: 'Stone 900', color: '#1c1917' }
];

const FONT_COLOR_PRESETS = [
  '#ffffff', '#f8fafc', '#94a3b8', '#475569', '#1e293b', '#0f172a', '#000000',
  '#2563eb', '#0ea5e9', '#10b981', '#f43f5e', '#f97316', '#8b5cf6'
];

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

  const setColor = (val: string) => updateScreen(screen.id, { [isTitle ? 'titleColor' : 'subtitleColor']: val });
  const setSize = (val: number | undefined) => updateScreen(screen.id, { [isTitle ? 'titleSize' : 'subtitleSize']: val });
  const setBold = (val: boolean) => updateScreen(screen.id, { [isTitle ? 'titleBold' : 'subtitleBold']: val });
  const setItalic = (val: boolean) => updateScreen(screen.id, { [isTitle ? 'titleItalic' : 'subtitleItalic']: val });
  const setUnderline = (val: boolean) => updateScreen(screen.id, { [isTitle ? 'titleUnderline' : 'subtitleUnderline']: val });
  const setAlign = (val: 'left' | 'center' | 'right') => updateScreen(screen.id, { [isTitle ? 'titleAlign' : 'subtitleAlign']: val });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <textarea
        placeholder={isTitle ? t('content.titlePlaceholder') : t('content.subtitlePlaceholder')}
        value={isTitle ? screen.title : screen.subtitle}
        onChange={e => updateScreen(screen.id, { [isTitle ? 'title' : 'subtitle']: e.target.value })}
        style={{ width: '100%', minHeight: isTitle ? '60px' : '50px', resize: 'vertical', fontSize: '13px', marginBottom: '8px' }}
      />

      <hr style={{ border: 'none', borderTop: '1px solid var(--panel-border)', margin: '4px 0' }} />

      <div>
        <div className="label-row" style={{ marginBottom: '8px' }}>
          <span>{t('style.color')}</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="text" value={color || '#ffffff'} onChange={e => setColor(e.target.value)} style={{ width: '60px', padding: '4px 8px' }} />
            <input type="color" value={color || '#ffffff'} onChange={e => setColor(e.target.value)} style={{ width: '28px', height: '28px', padding: 0, cursor: 'pointer', border: 'none', background: 'transparent' }} />
          </div>
        </div>
        <div className="gradient-swatches">
          {FONT_COLOR_PRESETS.map(pColor => (
            <button
              key={pColor}
              className={`swatch ${color === pColor ? 'active' : ''}`}
              style={{ background: pColor, width: '20px', height: '20px', minWidth: '20px' }}
              onClick={() => setColor(pColor)}
            />
          ))}
        </div>
      </div>

      <div className="label-row">
        <span>{t('style.fontSize')}</span>
        <select
          value={size || ''}
          onChange={e => setSize(e.target.value === '' ? undefined : parseInt(e.target.value))}
          style={{ width: '100px', cursor: 'pointer' }}
        >
          {FONT_SIZE_OPTIONS.map(opt => (
            <option key={opt.label} value={opt.value ?? ''}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="label-row">
        <span>{t('style.format')}</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '2px', background: 'var(--input-bg)', padding: '2px', borderRadius: '6px', border: '1px solid var(--panel-border)' }}>
            <button onClick={() => setBold(!isBold)} style={{ background: isBold ? 'var(--accent)' : 'transparent', color: isBold ? '#fff' : 'inherit', border: 'none', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}><Bold size={14} /></button>
            <button onClick={() => setItalic(!italic)} style={{ background: italic ? 'var(--accent)' : 'transparent', color: italic ? '#fff' : 'inherit', border: 'none', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}><Italic size={14} /></button>
            <button onClick={() => setUnderline(!underline)} style={{ background: underline ? 'var(--accent)' : 'transparent', color: underline ? '#fff' : 'inherit', border: 'none', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}><Underline size={14} /></button>
          </div>
          <div style={{ display: 'flex', gap: '2px', background: 'var(--input-bg)', padding: '2px', borderRadius: '6px', border: '1px solid var(--panel-border)' }}>
            <button onClick={() => setAlign('left')} style={{ background: align === 'left' ? 'var(--accent)' : 'transparent', color: align === 'left' ? '#fff' : 'inherit', border: 'none', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}><AlignLeft size={14} /></button>
            <button onClick={() => setAlign('center')} style={{ background: align === 'center' ? 'var(--accent)' : 'transparent', color: align === 'center' ? '#fff' : 'inherit', border: 'none', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}><AlignCenter size={14} /></button>
            <button onClick={() => setAlign('right')} style={{ background: align === 'right' ? 'var(--accent)' : 'transparent', color: align === 'right' ? '#fff' : 'inherit', border: 'none', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}><AlignRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const RightSidebar = () => {
  const { screens, selectedScreenId, updateScreen, rightSidebarTab, setRightSidebarTab, expandedSections, setExpandedSections, mobileSheetHeight, setMobileSheetHeight, t } = useConfig();

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedScreen) return;
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateScreen(selectedScreen.id, { imageObjUrl: url });
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
        <GripHorizontal size={24} color="var(--text-muted)" />
      </div>

      {!selectedScreen ? null : (
        /* Main Customization Tabs */
        <>
          <div className="tabs">
            <button className={rightSidebarTab === 'layout' ? 'active' : ''} onClick={() => setRightSidebarTab('layout')}>
              <Layout size={16} /> {t('tabs.layout')}
            </button>
            <button className={rightSidebarTab === 'style' ? 'active' : ''} onClick={() => setRightSidebarTab('style')}>
              <Palette size={16} /> {t('tabs.style')}
            </button>
            <button className={rightSidebarTab === 'content' ? 'active' : ''} onClick={() => setRightSidebarTab('content')}>
              <FileText size={16} /> {t('tabs.content')}
            </button>
          </div>

          <div className="sidebar-content">
            {rightSidebarTab === 'layout' && (
              <div className="panel-group">
                <h3>{t('layout.model')}</h3>
                <div className="label-row" style={{ marginBottom: '16px' }}>
                  <span>{t('layout.model')}</span>
                  <select value={selectedScreen.bezelName} onChange={e => updateScreen(selectedScreen.id, { bezelName: e.target.value })} style={{ width: '130px' }}>
                    {bezelOptionsData?.validOptions.map(name => {
                      let display = name.replace('iPhone ', '').replace('iPad ', '').replace(' - Portrait', '').replace(' - Landscape', '');
                      return <option key={name} value={name}>{display}</option>;
                    })}
                  </select>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--panel-border)', margin: '16px -16px' }} />

                <h3>{t('layout.positioning')}</h3>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>{t('layout.autoPlacement')}</div>
                  <div style={{ display: 'flex', background: 'var(--input-bg)', padding: '4px', borderRadius: '8px', gap: '4px' }}>
                    {(['top', 'center', 'bottom'] as const).map(pos => {
                      const isActive = selectedScreen.positioning === pos || (!selectedScreen.positioning && pos === 'center');
                      return (
                        <button
                          key={pos}
                          onClick={() => updateScreen(selectedScreen.id, { positioning: pos })}
                          style={{
                            flex: 1,
                            padding: '6px 0',
                            border: 'none',
                            background: isActive ? 'var(--accent)' : 'transparent',
                            color: isActive ? '#fff' : 'var(--text-muted)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                            textTransform: 'capitalize',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {t(`layout.${pos}`)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-main)', marginBottom: '8px', fontWeight: 500 }}>
                      <span>{t('layout.scale')}</span>
                      <span>{Math.round((selectedScreen.scale || 1) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.01"
                      value={selectedScreen.scale || (bezelOptionsData?.device === 'iPad' ? 1.7 : 1.0)}
                      onChange={e => updateScreen(selectedScreen.id, { scale: parseFloat(e.target.value) })}
                      style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent)' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-main)', marginBottom: '8px', fontWeight: 500 }}>
                      <span>{t('layout.rotation')}</span>
                      <span>{selectedScreen.rotation || 0}°</span>
                    </div>
                    <input
                      type="range"
                      min="-45" max="45" step="1"
                      value={selectedScreen.rotation || 0}
                      onChange={e => updateScreen(selectedScreen.id, { rotation: parseInt(e.target.value) })}
                      style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent)' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-main)', marginBottom: '8px', fontWeight: 500 }}>
                      <span>{t('layout.offsetX')}</span>
                      <span>{selectedScreen.offsetX || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="-400" max="400" step="1"
                      value={selectedScreen.offsetX || 0}
                      onChange={e => updateScreen(selectedScreen.id, { offsetX: parseInt(e.target.value) })}
                      style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent)' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-main)', marginBottom: '8px', fontWeight: 500 }}>
                      <span>{t('layout.offsetY')}</span>
                      <span>{selectedScreen.offsetY || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="-400" max="400" step="1"
                      value={selectedScreen.offsetY || 0}
                      onChange={e => updateScreen(selectedScreen.id, { offsetY: parseInt(e.target.value) })}
                      style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent)' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                      <button
                        onClick={() => updateScreen(selectedScreen.id, { scale: (bezelOptionsData?.device === 'iPad' ? 1.5 : 1.0), rotation: 0, offsetX: 0, offsetY: 0 })}
                        style={{ fontSize: '11px', color: 'var(--accent)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                      >
                        {t('layout.reset')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {rightSidebarTab === 'style' && (
              <div className="panel-group">
                <h3>{t('style.bg')}</h3>
                <div className="label-row">
                  <span>{t('style.type')}</span>
                  <select value={selectedScreen.bgType} onChange={e => updateScreen(selectedScreen.id, { bgType: e.target.value as any })} style={{ width: '100px' }}>
                    <option value="gradient">{t('style.gradient')}</option>
                    <option value="color">{t('style.solid')}</option>
                  </select>
                </div>

                {selectedScreen.bgType === 'color' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span className="swatch-label">{t('style.preset')}</span>
                    <div className="gradient-swatches">
                      {SOLID_PRESETS.map(p => {
                        const isActive = selectedScreen.bgColor === p.color;
                        return (
                          <button
                            key={p.name}
                            className={`swatch ${isActive ? 'active' : ''}`}
                            title={p.name}
                            style={{ background: p.color }}
                            onClick={() => updateScreen(selectedScreen.id, {
                              bgColor: p.color,
                              bgType: 'color'
                            })}
                          />
                        );
                      })}
                    </div>
                    <div className="color-picker">
                      <input type="color" value={selectedScreen.bgColor} onChange={e => updateScreen(selectedScreen.id, { bgColor: e.target.value })} />
                      <input type="text" value={selectedScreen.bgColor} onChange={e => updateScreen(selectedScreen.id, { bgColor: e.target.value })} />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span className="swatch-label">{t('style.preset')}</span>
                    <div className="gradient-swatches">
                      {GRADIENT_PRESETS.map(p => {
                        const isActive = selectedScreen.bgGradientStart === p.start && selectedScreen.bgGradientEnd === p.end;
                        return (
                          <button
                            key={p.name}
                            className={`swatch ${isActive ? 'active' : ''}`}
                            title={p.name}
                            style={{ background: `linear-gradient(135deg, ${p.start}, ${p.end})` }}
                            onClick={() => updateScreen(selectedScreen.id, {
                              bgGradientStart: p.start,
                              bgGradientEnd: p.end,
                              bgType: 'gradient'
                            })}
                          />
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                      <button
                        onClick={() => updateScreen(selectedScreen.id, {
                          bgGradientStart: selectedScreen.bgGradientEnd,
                          bgGradientEnd: selectedScreen.bgGradientStart
                        })}
                        title="Reverse Gradient"
                        className="secondary-btn"
                        style={{ width: 'auto', padding: '6px 12px' }}
                      >
                        <ArrowLeftRight size={14} />
                        <span style={{ fontSize: '11px', marginLeft: '4px' }}>{t('style.reverse')}</span>
                      </button>
                    </div>
                    <div className="color-picker">
                      <span style={{ width: 30, fontSize: 12 }}>{t('style.start')}:</span>
                      <input type="color" value={selectedScreen.bgGradientStart} onChange={e => updateScreen(selectedScreen.id, { bgGradientStart: e.target.value })} style={{ width: 36, height: 36 }} />
                      <input type="text" value={selectedScreen.bgGradientStart} onChange={e => updateScreen(selectedScreen.id, { bgGradientStart: e.target.value })} />
                    </div>
                    <div className="color-picker">
                      <span style={{ width: 30, fontSize: 12 }}>{t('style.end')}:</span>
                      <input type="color" value={selectedScreen.bgGradientEnd} onChange={e => updateScreen(selectedScreen.id, { bgGradientEnd: e.target.value })} style={{ width: 36, height: 36 }} />
                      <input type="text" value={selectedScreen.bgGradientEnd} onChange={e => updateScreen(selectedScreen.id, { bgGradientEnd: e.target.value })} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {rightSidebarTab === 'content' && (
              <div className="panel-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ marginTop: '8px' }}>
                  <h3 style={{ marginBottom: '16px' }}>{t('content.section')}</h3>

                  {/* Title Section */}
                  <div style={{
                    marginBottom: '12px',
                    border: '1px solid var(--panel-border)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: 'var(--card-bg)',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px 12px',
                      background: expandedSections.includes('title') ? 'rgba(255,255,255,0.03)' : 'transparent',
                      borderBottom: expandedSections.includes('title') ? '1px solid var(--panel-border)' : 'none'
                    }}>
                      <input
                        type="checkbox"
                        className="custom-checkbox"
                        checked={selectedScreen.showTitle !== false}
                        onChange={e => {
                          const val = e.target.checked;
                          updateScreen(selectedScreen.id, { showTitle: val });
                          if (!val && expandedSections.includes('title')) toggleSection('title');
                        }}
                        style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                        onClick={e => e.stopPropagation()}
                      />
                      <button
                        onClick={() => toggleSection('title')}
                        disabled={selectedScreen.showTitle === false}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 4px 8px 10px',
                          background: 'transparent',
                          border: 'none',
                          cursor: (selectedScreen.showTitle !== false) ? 'pointer' : 'not-allowed',
                          color: (selectedScreen.showTitle !== false) ? 'var(--text-main)' : 'var(--text-muted)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{t('content.title')}</span>
                        {expandedSections.includes('title') ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    </div>
                    {expandedSections.includes('title') && selectedScreen.showTitle !== false && (
                      <div style={{ padding: '16px' }}>
                        <TypographyControls type="title" screen={selectedScreen} updateScreen={updateScreen} t={t} />
                      </div>
                    )}
                  </div>

                  {/* Subtitle Section */}
                  <div style={{
                    marginBottom: '12px',
                    border: '1px solid var(--panel-border)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: 'var(--card-bg)',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px 12px',
                      background: expandedSections.includes('subtitle') ? 'rgba(255,255,255,0.03)' : 'transparent',
                      borderBottom: expandedSections.includes('subtitle') ? '1px solid var(--panel-border)' : 'none'
                    }}>
                      <input
                        type="checkbox"
                        className="custom-checkbox"
                        checked={selectedScreen.showSubtitle !== false}
                        onChange={e => {
                          const val = e.target.checked;
                          updateScreen(selectedScreen.id, { showSubtitle: val });
                          if (!val && expandedSections.includes('subtitle')) toggleSection('subtitle');
                        }}
                        style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                        onClick={e => e.stopPropagation()}
                      />
                      <button
                        onClick={() => toggleSection('subtitle')}
                        disabled={selectedScreen.showSubtitle === false}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 4px 8px 10px',
                          background: 'transparent',
                          border: 'none',
                          cursor: (selectedScreen.showSubtitle !== false) ? 'pointer' : 'not-allowed',
                          color: (selectedScreen.showSubtitle !== false) ? 'var(--text-main)' : 'var(--text-muted)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{t('content.subtitle')}</span>
                        {expandedSections.includes('subtitle') ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    </div>
                    {expandedSections.includes('subtitle') && selectedScreen.showSubtitle !== false && (
                      <div style={{ padding: '16px' }}>
                        <TypographyControls type="subtitle" screen={selectedScreen} updateScreen={updateScreen} t={t} />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 style={{ marginBottom: '12px' }}>{t('content.screenshot')}</h3>
                  <label
                    className="file-drop"
                    style={{ cursor: 'pointer', padding: '16px', borderRadius: '12px', border: '1px dashed var(--panel-border)', background: 'var(--input-bg)', textAlign: 'center', transition: 'all 0.2s ease', display: 'block' }}
                  >
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <ImageIcon size={20} color={selectedScreen.imageObjUrl ? 'var(--accent)' : 'var(--text-muted)'} />
                      <span style={{ fontSize: '12px', fontWeight: 500, color: selectedScreen.imageObjUrl ? 'var(--text-main)' : 'var(--text-muted)' }}>
                        {selectedScreen.imageObjUrl ? t('content.change') : t('content.upload')}
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
