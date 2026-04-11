import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { CanvasRenderer } from './components/CanvasRenderer';
import { BottomBar } from './components/BottomBar';
import { ZoomControls } from './components/ZoomControls';
import { ProcessingOverlay } from './components/ProcessingOverlay';

function App() {
  return (
    <div className="layout">
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
    </div>
  );
}

export default App;
