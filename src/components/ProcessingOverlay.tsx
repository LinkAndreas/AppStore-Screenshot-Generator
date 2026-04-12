import { useConfig } from '../store/ConfigContext';

export const ProcessingOverlay = () => {
  const { isProcessing, processingMessage, theme, t } = useConfig();

  if (!isProcessing) return null;

  const isLight = theme === 'light';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isLight ? 'rgba(241, 245, 249, 0.8)' : 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      color: 'var(--text-main)',
      flexDirection: 'column',
      gap: '20px',
      animation: 'fadeIn 0.1s ease-out',
      willChange: 'backdrop-filter, opacity'
    }}>
      <div style={{
        background: isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(30, 41, 59, 0.7)',
        padding: '32px 48px',
        borderRadius: '24px',
        border: '1px solid var(--panel-border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center',
        boxShadow: 'var(--panel-shadow)'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: '3px solid var(--accent-glow)',
          borderTopColor: 'var(--accent)',
          animation: 'spin 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
          willChange: 'transform'
        }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            {t('processing.title')}
          </h3>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: 'var(--text-muted)',
            lineHeight: 1.5
          }}>
            {processingMessage || t('processing.message')}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
