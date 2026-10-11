import React from 'react';

/** Labelled slider with a friendly value and a filled track. */
export const Slider = ({ label, value, display, min, max, step, onChange }: {
  label: string; value: number; display: string; min: number; max: number; step: number; onChange: (v: number) => void;
}) => (
  <div className="field">
    <div className="slider-head">
      <span>{label}</span>
      <span className="slider-value">{display}</span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      aria-label={label}
      style={{ '--pct': `${((value - min) / (max - min)) * 100}%` } as React.CSSProperties}
      onChange={e => onChange(parseFloat(e.target.value))}
    />
  </div>
);

/** Segmented control for picking one of a few options. */
export function Segmented<T extends string>({ value, options, onChange, label, className = '' }: {
  value: T | undefined;
  options: { value: T; label: React.ReactNode; title?: string }[];
  onChange: (v: T) => void;
  label?: string;
  className?: string;
}) {
  return (
    <div className={`segmented ${className}`} role="radiogroup" aria-label={label}>
      {options.map(o => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          title={o.title}
          aria-label={o.title}
          className={value === o.value ? 'active' : ''}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** A titled group: small grey heading above a white card. */
export const Group = ({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) => (
  <section className="panel-group">
    <div className="section-title-row">
      <h3 className="section-title">{title}</h3>
      {action}
    </div>
    <div className="card">{children}</div>
  </section>
);

/** Label on the left, control on the right. */
export const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="label-row">
    <span>{label}</span>
    {children}
  </div>
);

/** Circular colour well that opens the system colour picker. */
export const ColorWell = ({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) => (
  <label className="color-well" title={`${label}: ${value.toUpperCase()}`}>
    <input type="color" value={value} onChange={e => onChange(e.target.value)} aria-label={label} />
    <span className="color-well-label">{label}</span>
  </label>
);
