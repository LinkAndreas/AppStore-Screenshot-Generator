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
  const spec = DEVICES[device];
  const layout = spec.layout;
  const bezel = resolveBezel(screen.bezelName, device);

  // Empty lines take no space, except the one being edited.
  const showTitle = screen.showTitle !== false && (screen.title.trim() !== '' || focused === 'title');
  const showSubtitle = screen.showSubtitle !== false && (screen.subtitle.trim() !== '' || focused === 'subtitle');
  const showText = showTitle || showSubtitle;

  const actualScale = screen.scale * (layout.deviceWidth / bezel.width);
  const position = screen.positioning ?? 'center';
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
        ...style,
        width: spec.width,
        height: spec.height,
        background: screenBackground(screen),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: showText ? 'flex-start' : 'center',
        paddingTop: showText ? layout.paddingTop : 0,
        overflow: 'hidden',
      }}
    >
      {showText && (
        <div
          className="header-text"
          style={{
            width: '100%',
            marginBottom: layout.textMarginBottom,
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
        style={{
          position: 'relative',
          flexShrink: 0,
          width: bezel.width * actualScale,
          height: bezel.height * actualScale,
          marginTop: position === 'bottom' || position === 'center' ? 'auto' : undefined,
          marginBottom: position === 'top' || position === 'center' ? 'auto' : undefined,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            width: bezel.width,
            height: bezel.height,
            marginLeft: -bezel.width / 2,
            transform: `translate(${screen.offsetX}px, ${screen.offsetY}px) scale(${actualScale}) rotate(${screen.rotation}deg)`,
            transformOrigin: 'top center',
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
    </div>
  );
};
