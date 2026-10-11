import React, { useState } from 'react';
import type { ScreenConfig } from '../store/ConfigContext';
import { resolveBezel } from '../constants';
import { DEVICES, TEXT_LINE_PADDING_X, TEXT_PADDING_X, textShadow, type DeviceType } from '../shared/layout';
import { screenBackground, subtitleStyle, titleStyle } from '../utils/screenStyle';
import { DeviceFrame } from './DeviceFrame';

/** contentEditable line that keeps the caret stable while React re-renders. */
const EditableText = ({ value, onChange, onClick, onFocus, onBlur, className, style, placeholder }: {
  value: string;
  onChange: (val: string) => void;
  onClick?: (e: React.MouseEvent) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
  style: React.CSSProperties;
  placeholder?: string;
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  // Sync content when the value changes elsewhere, but never while the user is typing here.
  React.useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) ref.current.innerText = value;
  }, [value]);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={(e) => onChange(e.currentTarget.innerText)}
      onClick={onClick}
      onFocus={onFocus}
      onBlur={onBlur}
      className={className}
      data-placeholder={placeholder}
      style={{ ...style, outline: 'none', minHeight: '1.2em', cursor: 'text' }}
    />
  );
};

export interface ScreenEditing {
  onChange: (updates: Partial<ScreenConfig>) => void;
  /** Called when a text line is clicked, to open its settings. */
  onTextClick: (kind: 'title' | 'subtitle') => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  titlePlaceholder: string;
  subtitlePlaceholder: string;
  /** On-screen pixels per artwork pixel (canvas preview scale × zoom), for dragging the device. */
  displayScale: number;
  /** Largest allowed device offset in either direction. */
  maxOffset: number;
}

interface ScreenArtworkProps {
  screen: ScreenConfig;
  device: DeviceType;
  className?: string;
  style?: React.CSSProperties;
  /** Makes the text editable in place and the empty screen clickable; omit for thumbnails. */
  editing?: ScreenEditing;
  idPrefix?: string;
}

/**
 * One App Store screenshot at its exported pixel size: background, headline, description and the
 * framed device. The canvas shows it scaled down and exports it 1:1; thumbnails reuse it.
 */
export const ScreenArtwork = ({ screen, device, className, style, editing, idPrefix = '' }: ScreenArtworkProps) => {
  const [focused, setFocused] = useState<'title' | 'subtitle' | null>(null);
  const [dragging, setDragging] = useState(false);
  const drag = React.useRef<{ x: number; y: number; offsetX: number; offsetY: number; moved: boolean } | null>(null);
  const justDragged = React.useRef(false);

  // Drag the device to move it; a click without movement still reaches the upload placeholder.
  const dragHandlers = editing ? {
    onPointerDown: (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      drag.current = { x: e.clientX, y: e.clientY, offsetX: screen.offsetX, offsetY: screen.offsetY, moved: false };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove: (e: React.PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const dx = (e.clientX - d.x) / editing.displayScale;
      const dy = (e.clientY - d.y) / editing.displayScale;
      if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 4) return;
      d.moved = true;
      setDragging(true);
      const clamp = (v: number) => Math.round(Math.max(-editing.maxOffset, Math.min(editing.maxOffset, v)));
      // Shift keeps the movement horizontal or vertical; near the middle the device snaps to centre.
      const lockX = e.shiftKey && Math.abs(dy) > Math.abs(dx);
      const lockY = e.shiftKey && !lockX;
      let x = lockX ? d.offsetX : d.offsetX + dx;
      if (Math.abs(x) < 8 / editing.displayScale) x = 0;
      const y = lockY ? d.offsetY : d.offsetY + dy;
      editing.onChange({ offsetX: clamp(x), offsetY: clamp(y) });
    },
    onPointerUp: () => {
      justDragged.current = !!drag.current?.moved;
      drag.current = null;
      setDragging(false);
    },
    onPointerCancel: () => {
      drag.current = null;
      setDragging(false);
    },
    // A drag ends with a click; don't let it open the file picker or reselect.
    onClickCapture: (e: React.MouseEvent) => {
      if (justDragged.current) e.stopPropagation();
      justDragged.current = false;
    },
  } : {};
  const spec = DEVICES[device];
  const layout = spec.layout;
  const bezel = resolveBezel(screen.bezelName, device);

  // Empty lines take no space, except the one being edited.
  const showTitle = screen.showTitle !== false && (screen.title.trim() !== '' || focused === 'title');
  const showSubtitle = screen.showSubtitle !== false && (screen.subtitle.trim() !== '' || focused === 'subtitle');
  const showText = showTitle || showSubtitle;

  const actualScale = screen.scale * (layout.deviceWidth / bezel.width);
  const position = screen.positioning ?? 'center';
  const textBelow = screen.textPosition === 'bottom';
  const linePadding = `0 ${TEXT_LINE_PADDING_X * layout.unit}px`;

  const line = (kind: 'title' | 'subtitle') => {
    const isTitle = kind === 'title';
    const text = isTitle ? screen.title : screen.subtitle;
    const lineStyle: React.CSSProperties = {
      ...(isTitle ? titleStyle(screen, device) : subtitleStyle(screen, device)),
      display: 'block',
      width: '100%',
      padding: linePadding,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    };
    if (!editing) return <div key={kind} style={lineStyle}>{text}</div>;
    return (
      <EditableText
        key={kind}
        className={`screen-${kind} ${kind}-${idPrefix}${screen.id}`}
        value={text}
        placeholder={isTitle ? editing.titlePlaceholder : editing.subtitlePlaceholder}
        onChange={(val) => editing.onChange({ [kind]: val })}
        onFocus={() => setFocused(kind)}
        onBlur={() => setFocused(null)}
        onClick={(e) => { e.stopPropagation(); editing.onTextClick(kind); }}
        style={lineStyle}
      />
    );
  };

  return (
    <div
      className={className}
      style={{
        // Callers may position the artwork (thumbnails use absolute), so this is only the default.
        position: 'relative',
        ...style,
        width: spec.width,
        height: spec.height,
        background: screenBackground(screen),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: showText ? (textBelow ? 'flex-end' : 'flex-start') : 'center',
        paddingTop: showText && !textBelow ? layout.paddingTop : 0,
        paddingBottom: showText && textBelow ? layout.paddingTop : 0,
        overflow: 'hidden',
      }}
    >
      {showText && (
        <div
          className="header-text"
          style={{
            width: '100%',
            flexShrink: 0,
            order: textBelow ? 1 : 0,
            marginTop: textBelow ? layout.textMarginBottom : 0,
            marginBottom: textBelow ? 0 : layout.textMarginBottom,
            padding: `0 ${TEXT_PADDING_X * layout.unit}px`,
            boxSizing: 'border-box',
            textShadow: textShadow(layout.unit),
          }}
        >
          {showTitle && line('title')}
          {showSubtitle && line('subtitle')}
        </div>
      )}

      {/* The box occupies the device's scaled size in the layout; the inner layer applies the transform. */}
      <div
        {...dragHandlers}
        className={editing ? 'device-drag' : undefined}
        style={{
          position: 'relative',
          // The box may shrink when device and text overflow the canvas. The device is anchored to
          // the side facing the text, so a large device bleeds off the far edge instead of covering
          // the text. Both renderers place it the same way (see mcp/src/render.ts).
          flexShrink: 1,
          minHeight: 0,
          cursor: editing ? (dragging ? 'grabbing' : 'grab') : undefined,
          touchAction: editing ? 'none' : undefined,
          width: bezel.width * actualScale,
          height: bezel.height * actualScale,
          marginTop: position === 'bottom' || position === 'center' ? 'auto' : undefined,
          marginBottom: position === 'top' || position === 'center' ? 'auto' : undefined,
        }}
      >
        <div
          style={{
            position: 'absolute',
            ...(textBelow ? { bottom: 0 } : { top: 0 }),
            left: '50%',
            width: bezel.width,
            height: bezel.height,
            marginLeft: -bezel.width / 2,
            transform: `translate(${screen.offsetX}px, ${screen.offsetY}px) scale(${actualScale}) rotate(${screen.rotation}deg)`,
            transformOrigin: textBelow ? 'bottom center' : 'top center',
          }}
        >
          <DeviceFrame
            bezel={bezel}
            screenshotSrc={screen.imageObjUrl}
            screenId={`${idPrefix}${screen.id}`}
            onFileSelect={editing?.onFileSelect}
          />
        </div>
      </div>

      {/* Centre guide while dragging, when the device has snapped to the middle. */}
      {dragging && screen.offsetX === 0 && (
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 6, marginLeft: -3, background: '#5e5ce6', opacity: 0.85, pointerEvents: 'none' }} />
      )}
    </div>
  );
};
