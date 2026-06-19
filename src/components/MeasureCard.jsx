import { measureTier, localized } from '../data/grip.js';
import { t } from '../i18n/strings.js';

export default function MeasureCard({
  measure,
  lang,
  selected,
  dimmed,
  onSelect,
  status,
}) {
  const title = localized(measure, 'title', lang);
  const tier = measureTier(measure);
  const isAddOn = tier === 'ADDON';
  const tierLabel = isAddOn ? t(lang, 'addOnBadge') : tier;
  const tierClass = isAddOn ? 'addon' : tier.toLowerCase();

  const classes = [
    'measure-card',
    `measure-card--${measure.type === 'T' ? 'tech' : 'org'}`,
    selected ? 'is-selected' : '',
    dimmed ? 'is-dimmed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      onClick={() => onSelect(measure.code)}
      aria-pressed={selected}
    >
      <span className="measure-card__head">
        <span className="measure-card__code">{measure.code}</span>
        <span className="measure-card__head-right">
          {status && (
            <span
              className={`measure-card__status-dot measure-card__status-dot--${status.replace(/_/g, '-')}`}
              aria-hidden="true"
            />
          )}
          <span className={`measure-card__tier measure-card__tier--${tierClass}`}>
            {tierLabel}
          </span>
        </span>
      </span>
      <span className="measure-card__title">{title}</span>
    </button>
  );
}
