import { Download } from 'lucide-react';
import { useConfig } from '../store/ConfigContext';

export const ProcessingOverlay = () => {
  const { isProcessing, processingMessage, t } = useConfig();

  if (!isProcessing) return null;

  return (
    <div className="overlay" style={{ zIndex: 9999 }} role="status" aria-live="polite">
      <div className="sheet" style={{ maxWidth: '340px', padding: '28px 24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
        <div className="sheet-icon"><Download size={26} /></div>
        <h3 className="sheet-title" style={{ fontSize: '17px' }}>{t('processing.title')}</h3>
        <p className="sheet-body muted">{processingMessage || t('processing.message')}</p>
        <div className="progress-bar" style={{ width: '100%', marginTop: '4px' }} />
      </div>
    </div>
  );
};
