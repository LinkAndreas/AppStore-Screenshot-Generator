import { useConfig } from '../store/ConfigContext';

export const ProcessingOverlay = () => {
  const { isProcessing, processingMessage, t } = useConfig();

  if (!isProcessing) return null;

  return (
    <div className="overlay" style={{ zIndex: 9999 }} role="status" aria-live="polite">
      <div className="sheet" style={{ maxWidth: '420px', padding: '28px 28px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <span className="eyebrow">{t('processing.eyebrow')}</span>
        <h3 className="sheet-title" style={{ fontSize: '28px' }}>{t('processing.title')}</h3>
        <p className="sheet-body mono" style={{ fontSize: '12px' }}>
          {processingMessage || t('processing.message')}
        </p>
        <div className="progress-rule" />
      </div>
    </div>
  );
};
