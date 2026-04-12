import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { CanvasRenderer } from './components/CanvasRenderer';
import { BottomBar } from './components/BottomBar';
import { ZoomControls } from './components/ZoomControls';
import { ProcessingOverlay } from './components/ProcessingOverlay';
import { TutorialOverlay } from './components/TutorialOverlay';
import { useConfig } from './store/ConfigContext';
import { Settings, Image as ImageIcon, Palette } from 'lucide-react';

import React, { useState, useEffect } from 'react';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  useEffect(() => {
    let timeoutId: number;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => setIsMobile(window.innerWidth <= 1024), 50);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  return isMobile;
}

function App() {
  const { mobileTab, setMobileTab, mobileSheetHeight, selectedScreenId, t } = useConfig();
  const isMobile = useIsMobile();

  const showRightSidebar = !isMobile || (mobileTab === 'customize' && selectedScreenId);

  return (
    <div 
      className={`layout mobile-tab-${mobileTab}`}
      style={{ '--sheet-height': `${mobileSheetHeight}dvh` } as React.CSSProperties}
    >
      <LeftSidebar />
      <main className="main-content">
        {(mobileTab !== 'setup' || !isMobile) && (
          <>
            <div className="canvas-area">
              <CanvasRenderer />
              <ZoomControls />
            </div>
            <BottomBar />
          </>
        )}
      </main>
      {showRightSidebar && <RightSidebar />}
      <ProcessingOverlay />
      <TutorialOverlay />

      <div className="mobile-nav">
        <button 
          className={mobileTab === 'setup' ? 'active' : ''} 
          onClick={() => setMobileTab('setup')}
        >
          <Settings size={20} />
          <span>{t('nav.setup')}</span>
        </button>
        <button 
          className={mobileTab === 'editor' ? 'active' : ''} 
          onClick={() => setMobileTab('editor')}
        >
          <ImageIcon size={20} />
          <span>{t('nav.editor')}</span>
        </button>
        <button 
          className={mobileTab === 'customize' ? 'active' : ''} 
          onClick={() => setMobileTab('customize')}
        >
          <Palette size={20} />
          <span>{t('nav.customize')}</span>
        </button>
      </div>
    </div>
  );
}

export default App;
