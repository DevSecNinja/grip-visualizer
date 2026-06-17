import { BASIS_LEVELS, measuresByBasis, hasA5Value } from '../data/grip.js';
import { t } from '../i18n/strings.js';
import MeasureCard from './MeasureCard.jsx';

export default function MatrixView({ lang, selectedCode, onSelect, a5Only }) {
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
                  dimmed={a5Only && !hasA5Value(m)}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
