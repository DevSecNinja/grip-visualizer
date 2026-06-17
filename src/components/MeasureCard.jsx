import { highestTier, hasA5Value, localized } from '../data/grip.js';

export default function MeasureCard({ measure, lang, selected, dimmed, onSelect }) {
  const title = localized(measure, 'title', lang);
  const tier = highestTier(measure);
  const a5 = hasA5Value(measure);

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
        <span className={`measure-card__tier measure-card__tier--${tier.toLowerCase()}`}>
          {tier}
        </span>
      </span>
      <span className="measure-card__title">{title}</span>
      {a5 && <span className="measure-card__a5dot" aria-hidden="true" />}
    </button>
  );
}
