import { useConfig } from '../store/ConfigContext';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

export const ZoomControls = () => {
  const { canvasZoom, setCanvasZoom } = useConfig();

  const handleZoomOut = () => {
    setCanvasZoom(prev => Math.max(0.1, Math.round((prev - 0.1) * 10) / 10));
  };

  const handleZoomIn = () => {
    setCanvasZoom(prev => Math.min(2.0, Math.round((prev + 0.1) * 10) / 10));
  };

  const handleFill = () => {
    const canvasArea = document.querySelector('.canvas-area');
    if (canvasArea) {
      // Available height minus 80px top/bottom padding
      const availableHeight = canvasArea.clientHeight - 160; 
      // Approximate physical height of the screen element including text headers/pads
      const zoom = Math.min(2.0, Math.max(0.15, availableHeight / 860));
      setCanvasZoom(zoom);
    }
  };

  return (
    <div className="zoom-controls">
      <button onClick={handleFill} title="Fit Height to Screen" style={{ width: 'auto', padding: '0 8px' }}>
        <Maximize size={14} />
      </button>

      <div style={{ width: '1px', height: '16px', background: 'var(--panel-border)', margin: '0 4px' }} />

      <button onClick={handleZoomOut} title="Zoom Out">
        <ZoomOut size={16} />
      </button>
      <div className="zoom-level" title="Current Zoom">
        {Math.round(canvasZoom * 100)}%
      </div>
      <button onClick={handleZoomIn} title="Zoom In">
        <ZoomIn size={16} />
      </button>
    </div>
  );
};
