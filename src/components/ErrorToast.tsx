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
        style={{ maxWidth: '460px', borderTop: '3px solid var(--danger)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '28px 28px 8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span className="eyebrow" style={{ color: 'var(--danger)' }}>{t('error.eyebrow')}</span>
          <h2 id="error-title" className="sheet-title">{t('error.title')}</h2>
          <p className="sheet-body">{appError}</p>
        </div>
        <div style={{ padding: '20px 28px 24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="primary" onClick={() => setAppError(null)} autoFocus>
            {t('error.dismiss')}
          </button>
        </div>
      </div>
    </div>
  );
};
