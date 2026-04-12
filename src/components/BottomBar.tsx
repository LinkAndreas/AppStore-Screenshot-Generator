import React, { useState } from 'react';
import { useConfig } from '../store/ConfigContext';
import { Trash, Plus, Image as ImageIcon } from 'lucide-react';
import { getBezelPath, getBezelCategories, SCREEN_DIMENSIONS } from '../constants';
import { DeviceFrame } from './DeviceFrame';

export const BottomBar = () => {
  const { screens, selectedScreenId, setSelectedScreenId, removeScreen, addScreen, batchAddScreens, reorderScreens, activeDeviceType, activeLocalizationId, getDefaultTypography, setMobileTab, setRightSidebarTab, t } = useConfig();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDropping, setIsDropping] = useState(false);

  const handleBatchImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    // Sort files alphabetically by name to ensure consistent "selected order"
    files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
    
    const newScreens = files.map(file => ({
      id: crypto.randomUUID(),
      imageObjUrl: URL.createObjectURL(file),
      bezelName: activeDeviceType === 'iPad' ? 'iPad Pro 13 - M4 - Silver - Portrait' : 'iPhone 17 Pro Max - Silver - Portrait',
      scale: activeDeviceType === 'iPad' ? 1.7 : 1.0,
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      positioning: 'top' as const,
      ...getDefaultTypography(activeLocalizationId),
      titleAlign: 'center' as const,
      subtitleAlign: 'center' as const,
      titleSize: activeDeviceType === 'iPad' ? 144 : 120,
      subtitleSize: activeDeviceType === 'iPad' ? 72 : 60,
      titleBold: true,
      subtitleBold: false,
      showTitle: true,
      showSubtitle: true,
      bgType: 'gradient' as const,
      bgColor: '#ffffff',
      bgGradientStart: '#0f172a',
      bgGradientEnd: '#3b82f6',
      titleColor: '#ffffff',
      subtitleColor: '#ffffff',
    }));

    batchAddScreens(newScreens);
    e.target.value = '';
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setIsDropping(true);
      reorderScreens(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
    setTimeout(() => setIsDropping(false), 50);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const getTransform = (index: number) => {
    if (draggedIndex === null || dragOverIndex === null || draggedIndex === dragOverIndex) return undefined;

    const ITEM_WIDTH = 96; // 80px width + 16px gap

    if (draggedIndex < dragOverIndex) {
      if (index > draggedIndex && index <= dragOverIndex) {
        return `translateX(-${ITEM_WIDTH}px)`;
      }
    } else if (draggedIndex > dragOverIndex) {
      if (index >= dragOverIndex && index < draggedIndex) {
        return `translateX(${ITEM_WIDTH}px)`;
      }
    }
    
    if (index === draggedIndex) {
      const diff = dragOverIndex - draggedIndex;
      return `translateX(${diff * ITEM_WIDTH}px)`;
    }

    return undefined;
  };

  return (
    <div className="bottom-bar">
      <div className="bottom-bar-scroll">
        <label className="bottom-bar-add">
          <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleBatchImport} />
          <ImageIcon size={20} />
          <span>{t('bottomBar.batchImport')}</span>
        </label>

        <div style={{ width: '1px', height: '60px', background: 'var(--panel-border)', margin: '0 12px' }} />

        {screens.map((screen, index) => {
          const canvasDim = SCREEN_DIMENSIONS[activeDeviceType];
          const thumbHeight = 140;
          const thumbWidth = (canvasDim.width / canvasDim.height) * thumbHeight;

          const bezelSrc = getBezelPath(screen.bezelName);
          const { device } = getBezelCategories(screen.bezelName);
          const isIpad = device === 'iPad';

          return (
            <div
              key={screen.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              style={{
                width: `${thumbWidth}px`,
                height: `${thumbHeight}px`,
                flexShrink: 0,
                position: 'relative'
              }}
            >
              <div 
                className={`bottom-bar-item ${selectedScreenId === screen.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedScreenId(screen.id);
                  if (window.innerWidth <= 1024) {
                    setMobileTab('customize');
                    setRightSidebarTab('style');
                  }
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  margin: 0,
                  pointerEvents: draggedIndex !== null ? 'none' : 'auto',
                  opacity: draggedIndex === index ? 0.3 : 1,
                  transform: getTransform(index),
                  zIndex: draggedIndex === index ? 10 : 1,
                  transition: isDropping ? 'none' : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s'
                }}
              >
              <div 
                className="thumb-preview" 
                style={{ 
                  background: screen.bgType === 'gradient' 
                    ? `linear-gradient(135deg, ${screen.bgGradientStart}, ${screen.bgGradientEnd})` 
                    : screen.bgColor,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Scaled Real Content Presentation */}
                {(() => {
                  const canvasDim = SCREEN_DIMENSIONS[activeDeviceType];
                   const thumbScale = 140 / canvasDim.height;
                   const isTitleVisible = screen.showTitle !== false && screen.title.trim() !== '';
                   const isSubtitleVisible = screen.showSubtitle !== false && screen.subtitle.trim() !== '';
                   const showText = isTitleVisible || isSubtitleVisible;
                   
                   return (
                     <div style={{
                       pointerEvents: 'none',
                       position: 'absolute',
                       top: 0,
                       left: '50%',
                       width: `${canvasDim.width}px`,
                       height: `${canvasDim.height}px`,
                       marginLeft: `-${canvasDim.width / 2}px`,
                       transform: `scale(${thumbScale})`,
                       transformOrigin: 'top center',
                       display: 'flex',
                       flexDirection: 'column',
                       alignItems: 'center',
                       justifyContent: showText ? 'flex-start' : 'center',
                       paddingTop: showText ? '80px' : '0'
                     }}>
                    {showText ? (
                      <div className="header-text" style={{
                        marginBottom: '80px',
                        width: '100%',
                        padding: '0 80px',
                        boxSizing: 'border-box',
                        textShadow: '0 8px 24px rgba(0,0,0,0.4)',
                        display: 'block'
                      }}>
                        {(screen.showTitle !== false && screen.title.trim() !== '') && (
                          <h1 style={{ 
                            fontSize: screen.titleSize ? `${screen.titleSize}px` : `${isIpad ? 84 : 92}px`, 
                            color: screen.titleColor || '#ffffff',
                            fontStyle: screen.titleItalic ? 'italic' : 'normal',
                            textDecoration: screen.titleUnderline ? 'underline' : 'none',
                            fontWeight: screen.titleBold !== false ? 800 : 500,
                            margin: `0 0 ${isIpad ? '60px' : '40px'} 0`, 
                            lineHeight: 1.4, 
                            letterSpacing: '-3px', 
                            fontFamily: 'var(--font-display)',
                            textAlign: screen.titleAlign || 'center',
                          }}>
                            {screen.title}
                          </h1>
                        )}
                        {(screen.showSubtitle !== false && screen.subtitle.trim() !== '') && (
                          <p style={{ 
                            fontSize: screen.subtitleSize ? `${screen.subtitleSize}px` : `${isIpad ? 48 : 52}px`, 
                            color: screen.subtitleColor || '#ffffff',
                            fontStyle: screen.subtitleItalic ? 'italic' : 'normal',
                            textDecoration: screen.subtitleUnderline ? 'underline' : 'none',
                            fontWeight: screen.subtitleBold !== false ? 700 : 400,
                            margin: 0, 
                            opacity: screen.subtitleColor ? 1 : 0.9, 
                            lineHeight: 1.35, 
                            letterSpacing: '-1px',
                            textAlign: screen.subtitleAlign || 'center',
                          }}>
                            {screen.subtitle}
                          </p>
                        )}
                      </div>
                    ) : null}

                      {/* Thumbnail Outer Bounding Box */}
                      <div style={{
                        marginTop: (screen.positioning === 'bottom' || screen.positioning === 'center' || !screen.positioning) ? 'auto' : undefined,
                        marginBottom: (screen.positioning === 'top' || screen.positioning === 'center' || !screen.positioning) ? 'auto' : undefined,
                        width: `${1120 * screen.scale}px`,
                        height: `${(1120 / (isIpad ? (3 / 4) : (9 / 19.5))) * screen.scale}px`,
                        flexShrink: 0,
                        position: 'relative'
                      }}>
                        {/* Thumbnail Inner Transformer */}
                        <div style={{
                          transform: `translate(${screen.offsetX}px, ${screen.offsetY}px) scale(${screen.scale}) rotate(${screen.rotation}deg)`,
                          transformOrigin: 'top center',
                          width: '1120px',
                          height: `${(1120 / (isIpad ? (3 / 4) : (9 / 19.5)))}px`,
                          position: 'absolute',
                          left: '50%',
                          marginLeft: '-560px',
                          top: 0
                        }}>
                          <DeviceFrame
                            bezelSrc={bezelSrc}
                            screenshotSrc={screen.imageObjUrl}
                            screenId={`thumb-${screen.id}`}
                            onFileSelect={() => {}}
                            cornerRadiusPx={isIpad ? 60 : 100}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <span 
                  className="thumb-index" 
                  style={{ position: 'absolute', bottom: '6px', left: '6px', zIndex: 20 }}
                >
                  {index + 1}
                </span>
              </div>
              <button 
                className="thumb-delete" 
                onClick={(e) => {
                  e.stopPropagation();
                  removeScreen(screen.id);
                }}
              >
                <Trash size={12} />
              </button>
              </div>
            </div>
          );
        })}
        <button className="bottom-bar-add" onClick={addScreen}>
          <Plus size={20} />
          <span>{t('bottomBar.addScreen')}</span>
        </button>
      </div>
    </div>
  );
};
