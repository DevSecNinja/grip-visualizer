import { useEffect, useRef } from 'react';
import { t } from '../i18n/strings.js';
import {
  localized,
  standardsFor,
  localizedStandardsWhy,
  localizedGuidance,
} from '../data/grip.js';
import LicenseBadge from './LicenseBadge.jsx';

// Breakpoint at which the layout switches to a single column (matches CSS).
const MOBILE_BREAKPOINT = 1080;

export default function MeasureDetailPanel({ measure, lang, onClose }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (
      measure &&
      panelRef.current &&
      typeof panelRef.current.scrollIntoView === 'function' &&
      window.innerWidth <= MOBILE_BREAKPOINT
    ) {
      panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [measure]);

  if (!measure) {
    return (
      <aside ref={panelRef} className="detail detail--empty" aria-live="polite">
        <h2 className="detail__empty-title">{t(lang, 'selectMeasure')}</h2>
        <p className="detail__empty-hint">{t(lang, 'selectMeasureHint')}</p>
      </aside>
    );
  }

  const title = localized(measure, 'title', lang);
  const summary = localized(measure, 'summary', lang);
  const standards = standardsFor(measure);
  const standardsWhy = localizedStandardsWhy(measure, lang);
  const guidance = localizedGuidance(measure, lang);
  const typeLabel =
    measure.type === 'T' ? t(lang, 'technical') : t(lang, 'organisational');

  return (
    <aside ref={panelRef} className="detail" aria-live="polite">
      <header className="detail__head">
        <div className="detail__head-meta">
          <span className="detail__code">{measure.code}</span>
          <span
            className={`detail__type detail__type--${measure.type === 'T' ? 'tech' : 'org'}`}
          >
            {typeLabel}
          </span>
          <span className="detail__basis">
            {t(lang, 'basis')} {measure.basis}
          </span>
        </div>
        <button
          type="button"
          className="detail__close"
          onClick={onClose}
          aria-label={t(lang, 'close')}
        >
          ×
        </button>
      </header>

      <h2 className="detail__title">{title}</h2>
      <p className="detail__summary">{summary}</p>

      {guidance && (
        <section className="guidance">
          <h3 className="detail__section-title">{t(lang, 'guidanceTitle')}</h3>
          {guidance.rationale && (
            <p className="guidance__rationale">
              <span className="guidance__why">{t(lang, 'guidanceWhy')}:</span>{' '}
              {guidance.rationale}
            </p>
          )}
          {guidance.do && guidance.do.length > 0 && (
            <div className="guidance__block guidance__block--do">
              <h4 className="guidance__label">{t(lang, 'guidanceDo')}</h4>
              <ul className="guidance__list">
                {guidance.do.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {guidance.dont && guidance.dont.length > 0 && (
            <div className="guidance__block guidance__block--dont">
              <h4 className="guidance__label">{t(lang, 'guidanceDont')}</h4>
              <ul className="guidance__list">
                {guidance.dont.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <h3 className="detail__section-title">{t(lang, 'microsoftMapping')}</h3>
      {measure.microsoft.length === 0 ? (
        <p className="detail__empty-hint">{t(lang, 'noMapping')}</p>
      ) : (
        <ul className="mapping">
          {measure.microsoft.map((item) => (
            <li
              className={`mapping__item${item.a5Adds ? ' mapping__item--a5' : ''}`}
              key={item.name}
            >
              <div className="mapping__top">
                <span className="mapping__name">{item.name}</span>
                <LicenseBadge tier={item.tier} a5Adds={item.a5Adds} lang={lang} />
              </div>
              {item.a5Adds && (
                <span className="mapping__a5tag">{t(lang, 'a5Badge')}</span>
              )}
              {item.docsUrl && (
                <a
                  className="mapping__link"
                  href={item.docsUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {t(lang, 'openDocs')} ↗
                </a>
              )}
            </li>
          ))}
        </ul>
      )}

      {standards.length > 0 && (
        <section className="standards">
          <h3 className="detail__section-title">{t(lang, 'standardsTitle')}</h3>
          {standardsWhy && (
            <p className="standards__why">
              <span className="standards__why-label">{t(lang, 'standardsWhy')}:</span>{' '}
              {standardsWhy}
            </p>
          )}
          <ul className="standards__list">
            {standards.map((std) => (
              <li className="standards__item" key={std.id}>
                <a
                  className="standards__name"
                  href={std.url}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {std.label} ↗
                </a>
                <span className="standards__controls">
                  {std.controls.map((control) => (
                    <span className="standards__chip" key={control}>
                      {control}
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
          <p className="standards__note">{t(lang, 'standardsNote')}</p>
        </section>
      )}

      {measure.references && measure.references.length > 0 && (
        <section className="references">
          <h3 className="detail__section-title">{t(lang, 'referencesTitle')}</h3>
          <ul className="references__list">
            {measure.references.map((ref) => (
              <li className="references__item" key={ref.url}>
                <a
                  className="references__link"
                  href={ref.url}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {localized(ref, 'label', lang)} ↗
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  );
}
