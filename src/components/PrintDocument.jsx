import { t } from '../i18n/strings.js';
import {
  getMeasures,
  localized,
  measureTier,
  standardsFor,
  localizedStandardsWhy,
  localizedGuidance,
} from '../data/grip.js';
import { entryForCode, hasSelfEvaluation } from '../data/assessment.js';

// Hidden on screen; revealed only when printing (see @media print in index.css).
// Renders one full page per GRIP measure so the browser "Save as PDF" output
// mirrors the PPTX export: every measure with all of its detail.
export default function PrintDocument({ lang, assessment }) {
  const measures = getMeasures();

  return (
    <div className="print-doc" aria-hidden="true">
      <section className="print-cover">
        <h1 className="print-cover__title">{t(lang, 'appTitle')}</h1>
        <p className="print-cover__subtitle">{t(lang, 'appSubtitle')}</p>
      </section>

      {measures.map((measure) => {
        const title = localized(measure, 'title', lang);
        const summary = localized(measure, 'summary', lang);
        const tier = measureTier(measure);
        const isAddOn = tier === 'ADDON';
        const tierLabel = isAddOn ? t(lang, 'addOnBadge') : tier;
        const tierClass = isAddOn ? 'addon' : tier.toLowerCase();
        const guidance = localizedGuidance(measure, lang);
        const standards = standardsFor(measure);
        const standardsWhy = localizedStandardsWhy(measure, lang);
        const typeLabel =
          measure.type === 'T' ? t(lang, 'technical') : t(lang, 'organisational');
        const selfEval = assessment ? entryForCode(assessment, measure.code) : null;

        return (
          <article className="print-page" key={measure.code}>
            <header className="print-page__head">
              <span
                className={`print-page__code print-page__code--${
                  measure.type === 'T' ? 'tech' : 'org'
                }`}
              >
                {measure.code}
              </span>
              <span className="print-page__meta">{typeLabel}</span>
              <span className="print-page__meta">
                {t(lang, 'basis')} {measure.basis}
              </span>
              <span className={`print-page__tier print-page__tier--${tierClass}`}>
                {tierLabel}
              </span>
            </header>

            <h2 className="print-page__title">{title}</h2>
            <p className="print-page__summary">{summary}</p>

            {selfEval && (
              <section className="print-section print-self-eval">
                <h3 className="print-section__title">{t(lang, 'selfEvaluationTitle')}</h3>
                {hasSelfEvaluation(selfEval) ? (
                  <>
                    <p className="print-self-eval__status">
                      <strong>{t(lang, 'assessmentStatusLabel')}:</strong>{' '}
                      {t(lang, `status_${selfEval.status}`)}
                    </p>
                    {selfEval.note && selfEval.note.trim() !== '' && (
                      <p className="print-self-eval__note">
                        <strong>{t(lang, 'assessmentNoteLabel')}:</strong>{' '}
                        {selfEval.note.trim()}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="print-section__muted">{t(lang, 'selfEvaluationNone')}</p>
                )}
              </section>
            )}

            {guidance && (
              <section className="print-section">
                <h3 className="print-section__title">{t(lang, 'guidanceTitle')}</h3>
                {guidance.rationale && (
                  <p className="print-section__rationale">
                    <strong>{t(lang, 'guidanceWhy')}:</strong> {guidance.rationale}
                  </p>
                )}
                {guidance.do && guidance.do.length > 0 && (
                  <div className="print-guidance print-guidance--do">
                    <h4 className="print-guidance__label">{t(lang, 'guidanceDo')}</h4>
                    <ul>
                      {guidance.do.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {guidance.dont && guidance.dont.length > 0 && (
                  <div className="print-guidance print-guidance--dont">
                    <h4 className="print-guidance__label">{t(lang, 'guidanceDont')}</h4>
                    <ul>
                      {guidance.dont.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            <section className="print-section">
              <h3 className="print-section__title">{t(lang, 'microsoftMapping')}</h3>
              {measure.microsoft.length === 0 ? (
                <p className="print-section__muted">{t(lang, 'noMapping')}</p>
              ) : (
                <ul className="print-mapping">
                  {measure.microsoft.map((item) => (
                    <li className="print-mapping__item" key={item.name}>
                      <span className="print-mapping__name">{item.name}</span>
                      {!(item.addOn && item.standalone) && (
                        <span
                          className={`print-page__tier print-page__tier--${item.tier.toLowerCase()}`}
                        >
                          {item.tier}
                          {item.a5Adds && !item.addOn ? '+' : ''}
                        </span>
                      )}
                      {item.addOn && (
                        <span className="print-page__tier print-page__tier--addon">
                          {t(lang, 'addOnBadge')}
                        </span>
                      )}
                      {item.docsUrl && (
                        <span className="print-mapping__url">{item.docsUrl}</span>
                      )}
                      {localized(item, 'value', lang) && (
                        <span className="print-mapping__value">
                          <strong>{t(lang, 'microsoftValue')}:</strong>{' '}
                          {localized(item, 'value', lang)}
                          {item.valueUrl && ` (${item.valueUrl})`}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {standards.length > 0 && (
              <section className="print-section">
                <h3 className="print-section__title">{t(lang, 'standardsTitle')}</h3>
                {standardsWhy && (
                  <p className="print-section__rationale">
                    <strong>{t(lang, 'standardsWhy')}:</strong> {standardsWhy}
                  </p>
                )}
                <ul className="print-standards">
                  {standards.map((std) => (
                    <li className="print-standards__item" key={std.id}>
                      <span className="print-standards__name">{std.label}</span>
                      <span className="print-standards__controls">
                        {std.controls.join(', ')}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="print-section__muted">{t(lang, 'standardsNote')}</p>
              </section>
            )}

            {measure.references && measure.references.length > 0 && (
              <section className="print-section">
                <h3 className="print-section__title">{t(lang, 'referencesTitle')}</h3>
                <ul className="print-refs">
                  {measure.references.map((ref) => (
                    <li key={ref.url}>{localized(ref, 'label', lang)}</li>
                  ))}
                </ul>
              </section>
            )}
          </article>
        );
      })}
    </div>
  );
}
