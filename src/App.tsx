import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { CanvasRenderer } from './components/CanvasRenderer';
import { BottomBar } from './components/BottomBar';
import { ZoomControls } from './components/ZoomControls';
import { ProcessingOverlay } from './components/ProcessingOverlay';
import { TutorialOverlay } from './components/TutorialOverlay';
import { useConfig } from './store/ConfigContext';
import { Settings, Image as ImageIcon, Palette } from 'lucide-react';

function App() {
  const { mobileTab, setMobileTab, t } = useConfig();

  return (
    <div className={`layout mobile-tab-${mobileTab}`}>
      <LeftSidebar />
      <main className="main-content">
        <div className="canvas-area">
          <CanvasRenderer />
          <ZoomControls />
        </div>
        <BottomBar />
      </main>
      <RightSidebar />
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
