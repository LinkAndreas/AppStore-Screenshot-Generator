import { AlertTriangle } from 'lucide-react';
import { useConfig } from '../store/ConfigContext';

export const ErrorToast = () => {
  const { appError, setAppError, t } = useConfig();

  if (!appError) return null;

  return (
    <div className="overlay" style={{ zIndex: 99999 }} onClick={() => setAppError(null)}>
      <div
        className="sheet"
        role="alertdialog"
        aria-labelledby="error-title"
        style={{ maxWidth: '360px', padding: '28px 24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="sheet-icon danger"><AlertTriangle size={26} /></div>
        <h2 id="error-title" className="sheet-title" style={{ fontSize: '17px' }}>{t('error.title')}</h2>
        <p className="sheet-body">{appError}</p>
        <button className="primary" style={{ width: '100%', marginTop: '8px', padding: '10px' }} onClick={() => setAppError(null)} autoFocus>
          {t('error.dismiss')}
        </button>
      </div>
    </div>
  );
};
