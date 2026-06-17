import { BASIS_LEVELS, measuresByBasis, hasA5Value } from '../data/grip.js';
import { t } from '../i18n/strings.js';
import MeasureCard from './MeasureCard.jsx';

export default function JourneyView({ lang, selectedCode, onSelect, a5Only }) {
  return (
    <div className="journey" role="region" aria-label={t(lang, 'viewJourney')}>
      <div className="journey__track" aria-hidden="true" />
      {BASIS_LEVELS.map((basis, idx) => {
        const measures = measuresByBasis(basis);
        return (
          <section className={`journey__step journey__step--b${basis}`} key={basis}>
            <div className="journey__marker">
              <span className="journey__marker-num">{basis}</span>
            </div>
            <div className="journey__body">
              <header className="journey__step-head">
                <h3 className="journey__step-title">
                  {t(lang, 'basis')} {basis}
                </h3>
                <span className="journey__count">
                  {measures.length} {t(lang, 'measures')}
                </span>
              </header>
              <div className="journey__cards">
                {measures.map((m) => (
                  <MeasureCard
                    key={m.code}
                    measure={m}
                    lang={lang}
                    selected={m.code === selectedCode}
                    dimmed={a5Only && !hasA5Value(m)}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            </div>
            {idx < BASIS_LEVELS.length - 1 && (
              <span className="journey__arrow" aria-hidden="true">
                ↓
              </span>
            )}
          </section>
        );
      })}
    </div>
  );
}
