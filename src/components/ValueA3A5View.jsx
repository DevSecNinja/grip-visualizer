import { a3a5Split } from '../data/analytics.js';
import { findMeasure } from '../data/grip.js';
import { t } from '../i18n/strings.js';
import MeasureChip from './MeasureChip.jsx';

export default function ValueA3A5View({ lang, selectedCode, onSelect }) {
  const { a3, a5, a5Capabilities } = a3a5Split();

  return (
    <div className="vview value" role="region" aria-label={t(lang, 'vName_v1')}>
      <div className="value__cols">
        <section className="value__col value__col--a3">
          <header className="value__head">
            <span className="tier tier--a3">A3</span>
            <h3>{t(lang, 'a3included')}</h3>
            <span className="value__count">{a3.length}</span>
          </header>
          <div className="chips">
            {a3.map((m) => (
              <MeasureChip
                key={m.code}
                measure={m}
                lang={lang}
                selected={m.code === selectedCode}
                onSelect={onSelect}
              />
            ))}
          </div>
        </section>

        <section className="value__col value__col--a5">
          <header className="value__head">
            <span className="tier tier--a5">A5</span>
            <h3>{t(lang, 'a5adds')}</h3>
            <span className="value__count">{a5.length}</span>
          </header>
          <div className="chips">
            {a5.map((m) => (
              <MeasureChip
                key={m.code}
                measure={m}
                lang={lang}
                selected={m.code === selectedCode}
                onSelect={onSelect}
              />
            ))}
          </div>
        </section>
      </div>

      <section className="value__caps">
        <h3 className="value__caps-title">{t(lang, 'a5capabilities')}</h3>
        <ul className="caps">
          {a5Capabilities.map((c) => (
            <li className="caps__item" key={c.name}>
              <div className="caps__head">
                <span className="caps__name">{c.name}</span>
                {c.docsUrl && (
                  <a
                    className="caps__docs"
                    href={c.docsUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={t(lang, 'openDocs')}
                  >
                    ↗
                  </a>
                )}
              </div>
              <ul className="caps__variants">
                {c.variants.map((v, i) => (
                  <li className="caps__variant" key={v.label ?? `_${i}`}>
                    {v.label && <span className="caps__label">{v.label}</span>}
                    <span className="caps__measures">
                      {v.measures.map((code) => (
                        <button
                          key={code}
                          type="button"
                          className={`caps__code${code === selectedCode ? ' is-selected' : ''}`}
                          onClick={() => onSelect(code)}
                          title={findMeasure(code)?.[`title_${lang}`] ?? code}
                        >
                          {code}
                        </button>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
