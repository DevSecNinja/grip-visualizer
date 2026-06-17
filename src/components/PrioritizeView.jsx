import { HORIZONS } from '../data/grip.js';
import { horizonIndex } from '../data/analytics.js';
import { t } from '../i18n/strings.js';
import MeasureCard from './MeasureCard.jsx';

export default function PrioritizeView({ lang, selectedCode, onSelect }) {
  const columns = horizonIndex(HORIZONS);

  return (
    <div className="vview prioritize" role="region" aria-label={t(lang, 'vName_prioritize')}>
      {columns.map((col) => (
        <section className={`prio prio--${col.horizon}`} key={col.horizon}>
          <header className="prio__head">
            <div className="prio__title-row">
              <span className="prio__dot" aria-hidden="true" />
              <h3 className="prio__title">{t(lang, `hz_${col.horizon}`)}</h3>
              <span className="prio__count">{col.count}</span>
            </div>
            <p className="prio__desc">{t(lang, `hzDesc_${col.horizon}`)}</p>
            <p className="prio__a3">
              <span className="tier tier--a3">A3</span> {col.a3Ready}/{col.count}{' '}
              {t(lang, 'a3ReadyHint')}
            </p>
          </header>
          <div className="prio__cards">
            {col.measures.map((m) => (
              <MeasureCard
                key={m.code}
                measure={m}
                lang={lang}
                selected={m.code === selectedCode}
                onSelect={onSelect}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
