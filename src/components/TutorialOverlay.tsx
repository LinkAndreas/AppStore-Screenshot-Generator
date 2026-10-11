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
  Smartphone
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
      icon: <Smartphone size={26} />
    },
    {
      title: t('tutorial.step2.title'),
      description: t('tutorial.step2.desc'),
      icon: <Monitor size={26} />
    },
    {
      title: t('tutorial.step3.title'),
      description: t('tutorial.step3.desc'),
      icon: <Globe size={26} />
    },
    {
      title: t('tutorial.step4.title'),
      description: t('tutorial.step4.desc'),
      icon: <Palette size={26} />
    },
    {
      title: t('tutorial.step5.title'),
      description: t('tutorial.step5.desc'),
      icon: <Download size={26} />
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
          <div className="sheet-icon">{step.icon}</div>
          <h2 id="tutorial-title" className="sheet-title">{step.title}</h2>
          <p className="sheet-body">{step.description}</p>
          <div className="tutorial-dots" aria-label={`${currentStep + 1} / ${steps.length}`}>
            {steps.map((_, i) => (
              <span key={i} className={i === currentStep ? 'active' : ''} />
            ))}
          </div>
        </div>

        <div className="tutorial-footer">
          <button className="text-link" onClick={handleSkip}>
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
          max-width: 400px;
          display: flex;
          flex-direction: column;
        }

        .tutorial-close {
          position: absolute;
          top: 12px;
          right: 12px;
        }

        .tutorial-content {
          padding: 36px 32px 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-align: center;
        }

        .tutorial-content .sheet-icon {
          margin-bottom: 6px;
        }

        .tutorial-dots {
          display: flex;
          gap: 6px;
          margin-top: 10px;
        }

        .tutorial-dots span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--fill-strong);
          transition: background 0.2s;
        }

        .tutorial-dots span.active {
          background: var(--accent);
        }

        .tutorial-footer {
          padding: 20px 24px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .tutorial-nav-group {
          display: flex;
          gap: 8px;
        }
      `}</style>
    </div>
  );
};
