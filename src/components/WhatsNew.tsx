import { useState } from 'react';
import { X } from 'lucide-react';
import { BrandMark } from './BrandMark';
import { useConfig } from '../store/ConfigContext';
import { RELEASES } from '../releaseNotes';

const formatDate = (iso: string, locale: string) =>
  iso ? new Date(`${iso}T12:00:00Z`).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' }) : '';

/** Release history from CHANGELOG.md: the latest release in full, older ones on request. */
export const WhatsNew = () => {
  const { showWhatsNew, setShowWhatsNew, uiLanguage, t } = useConfig();
  const [showAll, setShowAll] = useState(false);

  if (!showWhatsNew) return null;

  const [latest, ...older] = RELEASES;
  const close = () => { setShowWhatsNew(false); setShowAll(false); };

  return (
    <div className="overlay" style={{ zIndex: 10001 }} onClick={close}>
      <div className="sheet whats-new" role="dialog" aria-labelledby="whats-new-title" onClick={e => e.stopPropagation()}>
        <button className="icon-btn small" style={{ position: 'absolute', top: 12, right: 12 }} onClick={close} aria-label={t('whatsNew.close')}>
          <X size={15} />
        </button>

        <div className="whats-new-head">
          <BrandMark size={56} />
          <h2 id="whats-new-title" className="sheet-title">{t('whatsNew.title')}</h2>
          <p className="sheet-body muted">{t('whatsNew.version', { version: latest.version })} · {formatDate(latest.date, uiLanguage)}</p>
        </div>

        <div className="whats-new-body">
          {latest.summary && <p className="whats-new-summary">{latest.summary}</p>}
          <ul className="whats-new-list">
            {latest.notes.map(n => <li key={n}>{n}</li>)}
          </ul>

          {showAll ? (
            older.map(r => (
              <section key={r.version} className="whats-new-release">
                <h3>
                  {t('whatsNew.version', { version: r.version })}
                  <span className="muted"> · {formatDate(r.date, uiLanguage)}</span>
                </h3>
                {r.summary && <p className="whats-new-summary">{r.summary}</p>}
                <ul className="whats-new-list">
                  {r.notes.map(n => <li key={n}>{n}</li>)}
                </ul>
              </section>
            ))
          ) : older.length > 0 && (
            <button className="text-link" onClick={() => setShowAll(true)}>{t('whatsNew.history')}</button>
          )}
        </div>

        <div style={{ padding: '0 24px 24px' }}>
          <button className="primary" style={{ width: '100%', padding: '10px' }} onClick={close} autoFocus>
            {t('whatsNew.continue')}
          </button>
        </div>
      </div>
    </div>
  );
};
