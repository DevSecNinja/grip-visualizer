import { localized, measureTier } from '../data/grip.js';
import { t } from '../i18n/strings.js';

// Small clickable measure chip reused across the analysis views.
export default function MeasureChip({ measure, lang, selected, onSelect }) {
  const tier = measureTier(measure);
  const isAddOn = tier === 'ADDON';
  const tierLabel = isAddOn ? t(lang, 'addOnBadge') : tier;
  const tierClass = isAddOn ? 'addon' : tier.toLowerCase();
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
      <span className={`chip__tier chip__tier--${tierClass}`}>{tierLabel}</span>
    </button>
  );
}
