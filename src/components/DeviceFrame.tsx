import React, { useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { screenshotRect, type BezelSpec } from '../shared/layout';
import { useConfig } from '../store/ConfigContext';

interface DeviceFrameProps {
  /** The frame, with its asset URL (from resolveBezel). */
  bezel: BezelSpec & { url: string };
  /** Object URL of the uploaded screenshot, or null for an empty screen. */
  screenshotSrc: string | null;
  /** Unique screen ID, used for the hidden file input. */
  screenId: string;
  /** Called when the user picks a file via the empty screen; omit for thumbnails. */
  onFileSelect?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const radiusCss = (r: [number, number, number, number]) => `${r[0]}px ${r[1]}px ${r[2]}px ${r[3]}px`;

/**
 * A device at the bezel's native pixel size: the screenshot (or an upload placeholder) in the
 * measured screen opening, with the bezel PNG on top. Callers scale it with a CSS transform.
 */
export const DeviceFrame = ({ bezel, screenshotSrc, screenId, onFileSelect }: DeviceFrameProps) => {
  const { t } = useConfig();
  const [imageSize, setImageSize] = useState<{ src: string; w: number; h: number } | null>(null);
  const { screen } = bezel;
  const radius = radiusCss(screen.radius);

  // Until the image reports its size, assume it matches the opening (the usual case).
  const size = imageSize && imageSize.src === screenshotSrc ? imageSize : { w: screen.width, h: screen.height };
  const rect = screenshotRect(bezel, size.w, size.h);
  const opening: React.CSSProperties = {
    position: 'absolute',
    left: screen.x,
    top: screen.y,
    width: screen.width,
    height: screen.height,
    borderRadius: radius,
  };

  return (
    <div className="device-container" style={{ position: 'relative', width: bezel.width, height: bezel.height }}>
      {screenshotSrc ? (
        <>
          {!rect.fills && <div style={{ ...opening, background: '#000', zIndex: 3 }} />}
          <img
            src={screenshotSrc}
            alt=""
            className="device-screen-img"
            onLoad={(e) => {
              const img = e.currentTarget;
              setImageSize({ src: screenshotSrc, w: img.naturalWidth, h: img.naturalHeight });
            }}
            style={{
              position: 'absolute',
              left: rect.x,
              top: rect.y,
              width: rect.width,
              height: rect.height,
              borderRadius: rect.fills ? radius : `0 0 ${screen.radius[2]}px ${screen.radius[3]}px`,
              zIndex: 4,
            }}
          />
        </>
      ) : (
        <div
          className="device-placeholder"
          onClick={onFileSelect ? (e) => {
            e.stopPropagation();
            document.getElementById(`file-input-${screenId}`)?.click();
          } : undefined}
          style={{
            ...opening,
            zIndex: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: screen.width * 0.03,
            background: 'linear-gradient(160deg, #2c2c2e, #1c1c1e)',
            color: 'rgba(255,255,255,0.55)',
            cursor: onFileSelect ? 'pointer' : 'default',
          }}
        >
          {onFileSelect && (
            <input type="file" id={`file-input-${screenId}`} style={{ display: 'none' }} accept="image/png,image/jpeg" onChange={onFileSelect} />
          )}
          <ImagePlus size={screen.width * 0.14} strokeWidth={1.5} />
          <span style={{ fontSize: screen.width * 0.04, fontWeight: 600, textAlign: 'center', maxWidth: '80%' }}>
            {t('content.upload')}
          </span>
        </div>
      )}

      <img
        key={bezel.url}
        src={bezel.url}
        alt=""
        className="device-bezel"
        style={{ position: 'absolute', left: 0, top: 0, width: bezel.width, height: bezel.height, zIndex: 10, pointerEvents: 'none' }}
      />
    </div>
  );
};
