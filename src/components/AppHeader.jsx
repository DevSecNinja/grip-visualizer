import { t, LANGS } from '../i18n/strings.js';

export default function AppHeader({
  lang,
  setLang,
  view,
  setView,
  a5Only,
  setA5Only,
}) {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <span className="app-header__logo" aria-hidden="true">
          <span className="app-header__logo-grip">GRIP</span>
          <span className="app-header__logo-x">×</span>
          <span className="app-header__logo-ms">MSFT</span>
        </span>
        <div className="app-header__titles">
          <h1 className="app-header__title">{t(lang, 'appTitle')}</h1>
          <p className="app-header__subtitle">{t(lang, 'appSubtitle')}</p>
        </div>
      </div>

      <div className="app-header__controls">
        <div className="seg" role="tablist" aria-label="view">
          <button
            type="button"
            role="tab"
            aria-selected={view === 'matrix'}
            className={`seg__btn${view === 'matrix' ? ' is-active' : ''}`}
            onClick={() => setView('matrix')}
          >
            {t(lang, 'viewMatrix')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'journey'}
            className={`seg__btn${view === 'journey' ? ' is-active' : ''}`}
            onClick={() => setView('journey')}
          >
            {t(lang, 'viewJourney')}
          </button>
        </div>

        <label className="switch">
          <input
            type="checkbox"
            checked={a5Only}
            onChange={(e) => setA5Only(e.target.checked)}
          />
          <span className="switch__track" aria-hidden="true" />
          <span className="switch__label">{t(lang, 'showA5')}</span>
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
      </div>
    </header>
  );
}
