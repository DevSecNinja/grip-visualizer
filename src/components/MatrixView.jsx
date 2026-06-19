import { BASIS_LEVELS, measuresByBasis, measureTier } from '../data/grip.js';
import { t } from '../i18n/strings.js';
import MeasureCard from './MeasureCard.jsx';

export default function MatrixView({
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
    <div className="matrix" role="region" aria-label={t(lang, 'viewMatrix')}>
      {BASIS_LEVELS.map((basis) => {
        const measures = measuresByBasis(basis);
        return (
          <section className={`matrix__col matrix__col--b${basis}`} key={basis}>
            <header className="matrix__col-head">
              <span className="matrix__basis-num">{basis}</span>
              <span className="matrix__basis-label">{t(lang, 'basis')}</span>
              <span className="matrix__count">
                {measures.length} {t(lang, 'measures')}
              </span>
            </header>
            <div className="matrix__cards">
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
          </section>
        );
      })}
    </div>
  );
}
