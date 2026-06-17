import { t, LANGS } from '../i18n/strings.js';

export default function AppHeader({ lang, setLang, views, view, setView }) {
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
