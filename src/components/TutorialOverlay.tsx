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
  Crop
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
      icon: <Crop size={18} strokeWidth={1.75} />
    },
    {
      title: t('tutorial.step2.title'),
      description: t('tutorial.step2.desc'),
      icon: <Monitor size={18} strokeWidth={1.75} />
    },
    {
      title: t('tutorial.step3.title'),
      description: t('tutorial.step3.desc'),
      icon: <Globe size={18} strokeWidth={1.75} />
    },
    {
      title: t('tutorial.step4.title'),
      description: t('tutorial.step4.desc'),
      icon: <Palette size={18} strokeWidth={1.75} />
    },
    {
      title: t('tutorial.step5.title'),
      description: t('tutorial.step5.desc'),
      icon: <Download size={18} strokeWidth={1.75} />
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
    <div className="overlay tutorial-overlay" style={{ zIndex: 10000 }}>
      <div className="sheet tutorial-modal" role="dialog" aria-labelledby="tutorial-title">
        <button className="icon-btn small tutorial-close" onClick={handleSkip} aria-label={t('tutorial.skip')}>
          <X size={14} />
        </button>

        <div className="tutorial-content">
          <div className="tutorial-meta">
            <span className="tutorial-icon">{step.icon}</span>
            <span className="eyebrow">
              {String(currentStep + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
            </span>
          </div>
          <h2 id="tutorial-title" className="sheet-title">{step.title}</h2>
          <p className="sheet-body">{step.description}</p>
        </div>

        <div className="tutorial-progress" aria-hidden="true">
          {steps.map((_, i) => (
            <span key={i} className={i <= currentStep ? 'done' : ''} />
          ))}
        </div>

        <div className="tutorial-footer">
          <button className="text-link" onClick={handleSkip} style={{ alignSelf: 'center' }}>
            {t('tutorial.skip')}
          </button>
          <div className="tutorial-nav-group">
            {currentStep > 0 && (
              <button className="secondary-btn" onClick={handleBack} style={{ width: 'auto' }}>
                <ChevronLeft size={15} />
                {t('tutorial.back')}
              </button>
            )}
            <button className="primary" onClick={handleNext}>
              {currentStep === steps.length - 1 ? t('tutorial.getStarted') : t('tutorial.next')}
              {currentStep < steps.length - 1 && <ChevronRight size={15} />}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .tutorial-modal {
          max-width: 480px;
          display: flex;
          flex-direction: column;
        }

        .tutorial-close {
          position: absolute;
          top: 16px;
          right: 16px;
        }

        .tutorial-content {
          padding: 32px 32px 28px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .tutorial-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .tutorial-icon {
          display: inline-flex;
          color: var(--accent);
        }

        .tutorial-progress {
          display: flex;
          gap: 4px;
          padding: 0 32px;
        }

        .tutorial-progress span {
          flex: 1;
          height: 2px;
          background: var(--panel-border);
          transition: background 0.2s;
        }

        .tutorial-progress span.done {
          background: var(--accent);
        }

        .tutorial-footer {
          padding: 20px 32px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .tutorial-nav-group {
          display: flex;
          gap: 8px;
        }

        @media (max-width: 640px) {
          .tutorial-content {
            padding: 28px 22px 22px;
          }
          .tutorial-progress {
            padding: 0 22px;
          }
          .tutorial-footer {
            padding: 18px 22px 22px;
          }
        }
      `}</style>
    </div>
  );
};
