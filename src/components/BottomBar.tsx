import React, { useState } from 'react';
import { useConfig } from '../store/ConfigContext';
import { createScreen } from '../store/screenFactory';
import { X, Plus, ImagePlus } from 'lucide-react';
import { getBezelPath, getBezelCategories, SCREEN_DIMENSIONS } from '../constants';
import { DeviceFrame } from './DeviceFrame';
import { validateImageDimensions } from '../utils/imageValidation';
import { screenBackground, subtitleStyle, titleStyle } from '../utils/screenStyle';
import { DEVICE_LAYOUT, DEVICE_REFERENCE_WIDTH, TEXT_LINE_PADDING_X, TEXT_PADDING_X, TEXT_SHADOW } from '../shared/layout';

export const BottomBar = () => {
  const { screens, selectedScreenId, setSelectedScreenId, removeScreen, addScreen, batchAddScreens, reorderScreens, activeDeviceType, activeLocalizationId, getDefaultTypography, setMobileTab, setRightSidebarTab, setAppError, t } = useConfig();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDropping, setIsDropping] = useState(false);

  const handleBatchImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    // Sort files alphabetically by name to ensure consistent "selected order"
    files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
    
    const validFiles = [];
    let hadError = false;

    for (const file of files) {
      const isValid = await validateImageDimensions(file, activeDeviceType === 'iPad' ? 'iPad' : 'iPhone');
      if (isValid) {
        validFiles.push(file);
      } else {
        hadError = true;
      }
    }

    if (hadError) {
      setAppError(t(activeDeviceType === 'iPad' ? 'error.dimension.ipad' : 'error.dimension.iphone'));
    }

    if (!validFiles.length) {
      e.target.value = '';
      return;
    }
    
    const newScreens = validFiles.map(file =>
      createScreen(activeDeviceType, getDefaultTypography(activeLocalizationId), URL.createObjectURL(file))
    );

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

    const isMobile = window.innerWidth <= 1024;
    const thumbHeight = isMobile ? 90 : 140;
    const canvasDim = SCREEN_DIMENSIONS[activeDeviceType];
    const thumbWidth = (canvasDim.width / canvasDim.height) * thumbHeight;
    const ITEM_WIDTH = thumbWidth + 16; // width + 16px gap

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

  const isMobile = window.innerWidth <= 1024;
  const thumbHeight = isMobile ? 90 : 140;
  const canvasDimForRef = SCREEN_DIMENSIONS[activeDeviceType];
  const refThumbWidth = (canvasDimForRef.width / canvasDimForRef.height) * thumbHeight;

  return (
    <div className="bottom-bar">
      <div className="bottom-bar-scroll">
        <label className="bottom-bar-add" style={{ minWidth: `${refThumbWidth}px`, height: `${thumbHeight}px` }}>
          <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleBatchImport} />
          <ImagePlus size={18} strokeWidth={1.5} />
          <span style={{ fontSize: isMobile ? '10px' : '12px' }}>{t('bottomBar.batchImport')}</span>
        </label>

        <div className="bottom-bar-divider" />

        {screens.map((screen, index) => {
          const canvasDim = SCREEN_DIMENSIONS[activeDeviceType];
          const thumbWidth = (canvasDim.width / canvasDim.height) * thumbHeight;

          const bezelSrc = getBezelPath(screen.bezelName);
          const { device } = getBezelCategories(screen.bezelName);
          const isIpad = device === 'iPad';
          const layout = DEVICE_LAYOUT[isIpad ? 'iPad' : 'iPhone'];
          const deviceHeight = DEVICE_REFERENCE_WIDTH / (isIpad ? (3 / 4) : (9 / 19.5));

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
                  background: screenBackground(screen),
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {(() => {
                  const canvasDim = SCREEN_DIMENSIONS[activeDeviceType];
                  const thumbScale = thumbHeight / canvasDim.height;
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
                       paddingTop: showText ? `${layout.paddingTop}px` : '0'
                     }}>
                    {showText ? (
                      <div className="header-text" style={{
                        marginBottom: `${layout.textMarginBottom}px`,
                        width: '100%',
                        padding: `0 ${TEXT_PADDING_X}px`,
                        boxSizing: 'border-box',
                        textShadow: TEXT_SHADOW,
                        display: 'block'
                      }}>
                        {(screen.showTitle !== false && screen.title.trim() !== '') && (
                          <h1 style={{ ...titleStyle(screen, device as 'iPhone' | 'iPad'), padding: `0 ${TEXT_LINE_PADDING_X}px`, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {screen.title}
                          </h1>
                        )}
                        {(screen.showSubtitle !== false && screen.subtitle.trim() !== '') && (
                          <p style={{ ...subtitleStyle(screen, device as 'iPhone' | 'iPad'), padding: `0 ${TEXT_LINE_PADDING_X}px`, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {screen.subtitle}
                          </p>
                        )}
                      </div>
                    ) : null}

                      {/* Thumbnail Outer Bounding Box */}
                      <div style={{
                        marginTop: (screen.positioning === 'bottom' || screen.positioning === 'center' || !screen.positioning) ? 'auto' : undefined,
                        marginBottom: (screen.positioning === 'top' || screen.positioning === 'center' || !screen.positioning) ? 'auto' : undefined,
                        width: `${DEVICE_REFERENCE_WIDTH * screen.scale}px`,
                        height: `${deviceHeight * screen.scale}px`,
                        flexShrink: 0,
                        position: 'relative'
                      }}>
                        {/* Thumbnail Inner Transformer */}
                        <div style={{
                          transform: `translate(${screen.offsetX}px, ${screen.offsetY}px) scale(${screen.scale}) rotate(${screen.rotation}deg)`,
                          transformOrigin: 'top center',
                          width: `${DEVICE_REFERENCE_WIDTH}px`,
                          height: `${deviceHeight}px`,
                          position: 'absolute',
                          left: '50%',
                          marginLeft: `-${DEVICE_REFERENCE_WIDTH / 2}px`,
                          top: 0
                        }}>
                          <DeviceFrame
                            bezelSrc={bezelSrc}
                            screenshotSrc={screen.imageObjUrl}
                            screenId={`thumb-${screen.id}`}
                            onFileSelect={() => {}}
                            cornerRadiusPx={layout.screenCornerRadius}
                            isThumbnail={true}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}


                <span className="thumb-index">{String(index + 1).padStart(2, '0')}</span>
              </div>
              <button 
                className="thumb-delete" 
                onClick={(e) => {
                  e.stopPropagation();
                  removeScreen(screen.id);
                }}
              >
                <X size={12} />
              </button>
              </div>
            </div>
          );
        })}
        <button className="bottom-bar-add" style={{ minWidth: `${refThumbWidth}px`, height: `${thumbHeight}px` }} onClick={addScreen}>
          <Plus size={isMobile ? 16 : 18} strokeWidth={1.5} />
          <span style={{ fontSize: isMobile ? '10px' : '12px' }}>{t('bottomBar.addScreen')}</span>
        </button>
      </div>
    </div>
  );
};
