import React, { useState } from 'react';
import { useConfig } from '../store/ConfigContext';
import { createScreen } from '../store/screenFactory';
import { X, Plus, ImagePlus } from 'lucide-react';
import { SCREEN_DIMENSIONS } from '../constants';
import { ScreenArtwork } from './ScreenArtwork';
import { checkScreenshot } from '../utils/imageValidation';

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
    let problem: Record<string, string> | null = null;

    for (const file of files) {
      const fileProblem = await checkScreenshot(file, activeDeviceType);
      if (fileProblem) problem = fileProblem;
      else validFiles.push(file);
    }

    if (problem) {
      setAppError(t('error.dimension', problem));
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
  const refThumbWidth = Math.min((canvasDimForRef.width / canvasDimForRef.height) * thumbHeight, 110);

  return (
    <div className="bottom-bar">
      <div className="bottom-bar-scroll">
        <label className="bottom-bar-add" style={{ minWidth: `${refThumbWidth}px`, height: `${thumbHeight}px` }}>
          <input id="batch-import-input" type="file" multiple accept="image/png,image/jpeg" style={{ display: 'none' }} onChange={handleBatchImport} />
          <ImagePlus size={18} strokeWidth={1.5} />
          <span style={{ fontSize: isMobile ? '10px' : '12px' }}>{t('bottomBar.batchImport')}</span>
        </label>

        <div className="bottom-bar-divider" />

        {screens.map((screen, index) => {
          const canvasDim = SCREEN_DIMENSIONS[activeDeviceType];
          const thumbWidth = (canvasDim.width / canvasDim.height) * thumbHeight;


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
                style={{ position: 'relative', overflow: 'hidden' }}
              >
                <ScreenArtwork
                  screen={screen}
                  device={activeDeviceType}
                  idPrefix="thumb-"
                  style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', transform: `scale(${thumbHeight / canvasDim.height})`, transformOrigin: 'top left' }}
                />
                <span className="thumb-index">{index + 1}</span>
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
