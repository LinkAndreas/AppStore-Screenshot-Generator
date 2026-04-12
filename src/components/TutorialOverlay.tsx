import { useState } from 'react';
import { useConfig } from '../store/ConfigContext';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Monitor, 
  Palette, 
  Globe, 
  Download,
  Sparkles
} from 'lucide-react';

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const TutorialOverlay = () => {
  const { showTutorial, setShowTutorial, t } = useConfig();
  const [currentStep, setCurrentStep] = useState(0);

  if (!showTutorial) return null;


  const steps: Step[] = [
    {
      title: t('tutorial.step1.title'),
      description: t('tutorial.step1.desc'),
      icon: <Sparkles size={48} className="tutorial-icon-pulse" />
    },
    {
      title: t('tutorial.step2.title'),
      description: t('tutorial.step2.desc'),
      icon: <Monitor size={48} />
    },
    {
      title: t('tutorial.step3.title'),
      description: t('tutorial.step3.desc'),
      icon: <Globe size={48} />
    },
    {
      title: t('tutorial.step4.title'),
      description: t('tutorial.step4.desc'),
      icon: <Palette size={48} />
    },
    {
      title: t('tutorial.step5.title'),
      description: t('tutorial.step5.desc'),
      icon: <Download size={48} />
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowTutorial(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    setShowTutorial(false);
  };

  const step = steps[currentStep];

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-modal">
        <button className="tutorial-close" onClick={handleSkip} aria-label={t('tutorial.skip')}>
          <X size={20} />
        </button>

        <div className="tutorial-content">
          <div className="tutorial-icon-wrapper">
            {step.icon}
          </div>
          
          <h2 className="tutorial-title">{step.title}</h2>
          <p className="tutorial-description">{step.description}</p>

          <div className="tutorial-dots">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`tutorial-dot ${i === currentStep ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>

        <div className="tutorial-footer">
          <button 
            className="tutorial-btn tutorial-btn-link" 
            onClick={handleSkip}
          >
            {t('tutorial.skip')}
          </button>
          
          <div className="tutorial-nav-group">
            {currentStep > 0 && (
              <button 
                className="tutorial-btn tutorial-btn-secondary" 
                onClick={handleBack}
              >
                <ChevronLeft size={18} />
                {t('tutorial.back')}
              </button>
            )}
            
            <button 
              className="tutorial-btn tutorial-btn-primary" 
              onClick={handleNext}
            >
              {currentStep === steps.length - 1 ? t('tutorial.getStarted') : t('tutorial.next')}
              {currentStep < steps.length - 1 && <ChevronRight size={18} />}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .tutorial-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(12px);
          WebkitBackdropFilter: blur(12px);
          animation: fadeIn 0.3s ease-out;
          padding: 20px;
        }

        .tutorial-modal {
          background: var(--panel-bg);
          border: 1px solid var(--panel-border);
          border-radius: 32px;
          width: 100%;
          max-width: 480px;
          position: relative;
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.4);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .tutorial-close {
          position: absolute;
          top: 24px;
          right: 24px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          opacity: 0.6;
          transition: all 0.2s;
          padding: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .tutorial-close:hover {
          opacity: 1;
          background: var(--button-hover);
        }

        .tutorial-content {
          padding: 60px 40px 40px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .tutorial-icon-wrapper {
          width: 100px;
          height: 100px;
          background: var(--accent-glow);
          border-radius: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          margin-bottom: 32px;
          position: relative;
        }

        .tutorial-icon-pulse {
          animation: iconPulse 2s infinite ease-in-out;
        }

        .tutorial-title {
          font-size: 24px;
          font-weight: 800;
          color: var(--text-main);
          margin: 0 0 16px;
          letter-spacing: -0.03em;
          line-height: 1.2;
        }

        .tutorial-description {
          font-size: 16px;
          color: var(--text-muted);
          margin: 0 0 32px;
          line-height: 1.6;
        }

        .tutorial-dots {
          display: flex;
          gap: 8px;
          margin-top: auto;
        }

        .tutorial-dot {
          width: 8px;
          height: 8px;
          border-radius: 4px;
          background: var(--panel-border);
          transition: all 0.3s ease;
        }

        .tutorial-dot.active {
          width: 24px;
          background: var(--accent);
        }

        .tutorial-footer {
          padding: 24px 32px;
          background: var(--sub-panel-bg);
          border-top: 1px solid var(--panel-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .tutorial-btn {
          height: 48px;
          padding: 0 24px;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
        }

        .tutorial-btn-primary {
          background: var(--accent);
          color: white;
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
        }

        .tutorial-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(59, 130, 246, 0.4);
          filter: brightness(1.1);
        }

        .tutorial-btn-secondary {
          background: var(--button-bg);
          color: var(--text-main);
          border: 1px solid var(--panel-border);
        }

        .tutorial-btn-secondary:hover {
          background: var(--button-hover);
        }

        .tutorial-btn-link {
          background: transparent;
          color: var(--text-muted);
          padding: 0 12px;
        }

        .tutorial-btn-link:hover {
          color: var(--text-main);
        }

        .tutorial-nav-group {
          display: flex;
          gap: 12px;
        }

        @keyframes iconPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        @keyframes slideUp {
          from { transform: translateY(30px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }

        @media (max-width: 640px) {
          .tutorial-modal {
            border-radius: 24px;
          }
          .tutorial-content {
            padding: 48px 24px 32px;
          }
          .tutorial-footer {
            padding: 20px 24px;
            flex-direction: column-reverse;
            gap: 20px;
          }
          .tutorial-btn {
            width: 100%;
          }
          .tutorial-nav-group {
            width: 100%;
            flex-direction: column;
          }
          .tutorial-btn-link {
            height: auto;
            padding: 4px;
          }
        }
      `}</style>
    </div>
  );
};
