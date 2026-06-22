import { t, LANGS } from '../i18n/strings.js';
import ExportMenu from './ExportMenu.jsx';

export default function AppHeader({
  lang,
  setLang,
  views,
  view,
  setView,
  assessmentMode,
  onToggleAssessment,
  assessmentState,
}) {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <span className="app-header__logo" role="img" aria-label={t(lang, 'logoAlt')}>
          <svg
            className="app-header__logo-mark"
            viewBox="0 0 64 64"
            width="40"
            height="40"
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <linearGradient id="appHeaderLogoGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#2f6df6" />
                <stop offset="1" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
            <rect width="64" height="64" rx="14" fill="url(#appHeaderLogoGradient)" />
            <path
              d="M40 22a12 12 0 1 0 3 9h-9"
              fill="none"
              stroke="#fff"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div className="app-header__titles">
          <h1 className="app-header__title">{t(lang, 'appTitle')}</h1>
          <p className="app-header__subtitle">{t(lang, 'appSubtitle')}</p>
        </div>
      </div>

      <div className="app-header__controls">
        <div className="seg" role="tablist" aria-label="view">
          {views.map((v) => (
            <button
              key={v.id}
              type="button"
              role="tab"
              aria-selected={view === v.id}
              className={`seg__btn${view === v.id ? ' is-active' : ''}`}
              onClick={() => setView(v.id)}
              title={t(lang, v.hint)}
            >
              {t(lang, v.label)}
            </button>
          ))}
        </div>

        <label
          className={`switch${assessmentMode ? ' switch--checked' : ''}`}
          title={t(lang, 'assessmentModeHint')}
        >
          <input type="checkbox" checked={assessmentMode} onChange={onToggleAssessment} />
          <span className="switch__track" />
          {t(lang, 'assessmentMode')}
        </label>

        <div className="seg seg--lang" role="group" aria-label={t(lang, 'langLabel')}>
          {LANGS.map((l) => (
            <button
              type="button"
              key={l}
              className={`seg__btn${lang === l ? ' is-active' : ''}`}
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        <ExportMenu lang={lang} assessment={assessmentState} />
      </div>
    </header>
  );
}
