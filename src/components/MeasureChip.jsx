import { localized, highestTier } from '../data/grip.js';

// Small clickable measure chip reused across the analysis views.
export default function MeasureChip({ measure, lang, selected, onSelect }) {
  const tier = highestTier(measure);
  return (
    <button
      type="button"
      className={`chip chip--${measure.type === 'T' ? 'tech' : 'org'}${
        selected ? ' is-selected' : ''
      }`}
      onClick={() => onSelect(measure.code)}
      title={localized(measure, 'title', lang)}
    >
      <span className="chip__code">{measure.code}</span>
      <span className={`chip__tier chip__tier--${tier.toLowerCase()}`}>{tier}</span>
    </button>
  );
}
