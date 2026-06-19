import { BASIS_LEVELS, measuresByBasis, measureTier } from '../data/grip.js';
import { t } from '../i18n/strings.js';
import MeasureCard from './MeasureCard.jsx';

export default function JourneyView({
  lang,
  selectedCode,
  onSelect,
  typeFilter,
  tierFilter,
  getAssessmentStatus,
}) {
  const isDimmed = (m) =>
    (typeFilter && m.type !== typeFilter) ||
    (tierFilter && measureTier(m) !== tierFilter);

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
                    dimmed={isDimmed(m)}
                    onSelect={onSelect}
                    status={getAssessmentStatus ? getAssessmentStatus(m.code) : null}
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
