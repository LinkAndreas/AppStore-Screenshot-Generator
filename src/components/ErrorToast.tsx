import React from 'react';
import { useConfig } from '../store/ConfigContext';
import { AlertCircle } from 'lucide-react';

export const ErrorToast = () => {
  const { appError, setAppError, t } = useConfig();

  if (!appError) return null;

  return (
    <div 
      className="error-dialog-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.2s ease-out',
        padding: '24px'
      }}
      onClick={() => setAppError(null)}
    >
      <div 
        style={{
          background: 'var(--panel-bg)',
          border: '1px solid var(--panel-border)',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '500px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 24px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
          animation: 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'rgba(244, 63, 94, 0.1)',
          color: '#f43f5e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          <AlertCircle size={40} />
        </div>
        
        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-main)' }}>
          Action Failed
        </h2>
        
        <p style={{ fontSize: '16px', lineHeight: 1.6, color: 'var(--text-muted)', margin: '0 0 32px 0' }}>
          {appError}
        </p>

        <button 
          onClick={() => setAppError(null)}
          style={{
            background: 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '16px 40px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s, transform 0.2s',
            boxShadow: '0 8px 16px var(--accent-glow)'
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          Got it
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};
