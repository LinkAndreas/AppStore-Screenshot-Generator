import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { getBezelCategories, SCREEN_DIMENSIONS } from '../constants';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Dims { w: number; h: number }

interface DeviceFrameProps {
  /** Resolved URL of the bezel PNG (from getBezelPath) */
  bezelSrc: string;
  /** Object URL of the uploaded screenshot, or null */
  screenshotSrc: string | null;
  /** Unique screen ID — used for the hidden file input */
  screenId: string;
  /** Called when the user picks a file via the placeholder */
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Called once the bezel image has loaded with its natural dimensions */
  onBezelLoad?: (dims: Dims) => void;
  /** Called once the screenshot image has loaded with its natural dimensions */
  onScreenshotLoad?: (dims: Dims) => void;
  /**
   * Corner radius in native screenshot pixels.
   * Applied to the screenshot so its corners don't peek outside the bezel.
   * Default: 100 — matches typical Apple device screen radii at native res.
   */
  cornerRadiusPx?: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// computeCenteredPlacement removed – not needed after simplifying screenshot placement

/**
 * Compute a CSS border-radius string that produces a visually circular
 * arc of `radiusPx` native-screenshot-pixels, regardless of element
 * scaling.  Because width ≠ height, we express Rx as % of width and
 * Ry as % of height.
 */
function computeBorderRadius(shot: Dims, radiusPx: number): string {
  const rx = (radiusPx / shot.w) * 100;
  const ry = (radiusPx / shot.h) * 100;
  return `${rx.toFixed(2)}% / ${ry.toFixed(2)}%`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Generic device-frame compositor.
 *
 * 1. Centers the screenshot inside the bezel using simple offset math.
 * 2. Applies rounded corners to the screenshot so it doesn't exceed
 *    the bezel's visible screen area.
 * 3. Layers the bezel image on top — its opaque border permanently masks
 *    any remaining edge difference.
 *
 * Assumes the uploaded screenshot is suitable for the selected device
 * (i.e. its resolution matches the bezel's screen area).  No device-
 * specific constants or pixel scanning needed.
 */
export const DeviceFrame = ({
  bezelSrc,
  screenshotSrc,
  screenId,
  onFileSelect,
  onBezelLoad,
  onScreenshotLoad,
  cornerRadiusPx = 100,
}: DeviceFrameProps) => {
  const [bezelDims, setBezelDims] = useState<Dims | null>(null);
  const [shotDims,  setShotDims]  = useState<Dims | null>(null);

  // Removed placement logic in favor of object-fit: contain within an aspect-ratio container


  const borderRadius = shotDims
    ? computeBorderRadius(shotDims, cornerRadiusPx)
    : undefined;

  return (
    <div
      className="device-container"
      style={{
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        ...(bezelDims ? { aspectRatio: `${bezelDims.w} / ${bezelDims.h}` } : { height: '100%' }),
      }}
    >
      {screenshotSrc && shotDims && bezelDims ? (
        <img
          key={screenshotSrc}
          src={screenshotSrc}
          alt="App Screenshot"
          className="device-screen-img"
          onLoad={(e) => {
            const img = e.currentTarget;
            const dims = { w: img.naturalWidth, h: img.naturalHeight };
            setShotDims(dims);
            onScreenshotLoad?.(dims);
          }}
          style={{
            position: 'absolute',
            left: `${((bezelDims.w - shotDims.w) / 2 / bezelDims.w) * 100}%`,
            top: `${((bezelDims.h - shotDims.h) / 2 / bezelDims.h) * 100}%`,
            width: `${(shotDims.w / bezelDims.w) * 100}%`,
            height: `${(shotDims.h / bezelDims.h) * 100}%`,
            borderRadius,
            zIndex: 4,
          }}
        />
      ) : screenshotSrc ? (
        /* Hidden image for loading dimensions if not yet measured */
        <img
          src={screenshotSrc}
          alt=""
          onLoad={(e) => {
            const img = e.currentTarget;
            setShotDims({ w: img.naturalWidth, h: img.naturalHeight });
          }}
          style={{ display: 'none' }}
        />
      ) : (

        /* Placeholder - only shown if no screenshot */
        (() => {
          if (!bezelDims) return null;
          
          const { device } = getBezelCategories(bezelSrc);
          const isIpad = device === 'iPad';

          // Accurate Pro Max / iPad Screen-to-Body heuristics
          const screenToBodyH = isIpad ? 0.94 : 0.955;
          const screenToBodyW = isIpad ? 0.95 : 0.93;
          
          const targetW = bezelDims.w * screenToBodyW;
          const targetH = bezelDims.h * screenToBodyH;

          const leftPercent = ((bezelDims.w - targetW) / 2 / bezelDims.w) * 100;
          const topPercent = ((bezelDims.h - targetH) / 2 / bezelDims.h) * 100;
          const widthPercent = (targetW / bezelDims.w) * 100;
          const heightPercent = (targetH / bezelDims.h) * 100;

          return (
            <>
              {/* 1. Background Fill - slightly larger than screen to prevent gaps (bleed) */}
              <div
                className="device-screen-img"
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById(`file-input-${screenId}`)?.click();
                }}
                style={{
                  position: 'absolute',
                  left: `${leftPercent - 0.5}%`,
                  top: `${topPercent - 0.5}%`,
                  width: `${widthPercent + 1}%`,
                  height: `${heightPercent + 1}%`,
                  zIndex: 4,
                  background: 'linear-gradient(135deg, #1e293b, #0f172a, #1e1b4b)',
                  cursor: 'pointer',
                  borderRadius: isIpad ? '2.5% / 2%' : '15% / 10%',
                }}
              />

              {/* 2. Primary Dashed Click Target - exact screen area */}
              <div
                style={{
                  position: 'absolute',
                  left: `${leftPercent}%`,
                  top: `${topPercent}%`,
                  width: `${widthPercent}%`,
                  height: `${heightPercent}%`,
                  zIndex: 6,
                  border: '4px dashed rgba(255, 255, 255, 0.15)',
                  borderRadius: isIpad ? '2.5% / 2%' : '7.7% / 3.57%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                  pointerEvents: 'none',
                  background: 'rgba(255, 255, 255, 0.02)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: 'inset 0 0 40px rgba(0,0,0,0.3)',
                }}
              >
                <input
                  type="file"
                  id={`file-input-${screenId}`}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={onFileSelect}
                />
                <ImageIcon size={isIpad ? 280 : 200} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '40px' }} />
                <span
                  style={{
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: isIpad ? '52px' : '44px',
                    fontWeight: 800,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    maxWidth: '80%',
                  }}
                >
                  Drop or Click
                </span>
              </div>
            </>
          );
        })()
      )}

      {/* ---- Device Bezel — always rendered on top ---- */}
      <img
        key={bezelSrc}
        src={bezelSrc}
        alt="Device Bezel"
        className="device-bezel"
        onLoad={(e) => {
          const img = e.currentTarget;
          const dims = { w: img.naturalWidth, h: img.naturalHeight };
          setBezelDims(dims);
          onBezelLoad?.(dims);
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'fill',
          zIndex: 10,
          pointerEvents: 'none',
        }}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
};
