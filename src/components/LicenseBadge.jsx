import { t } from '../i18n/strings.js';

const TIER_CLASS = {
  A1: 'tier tier--a1',
  A3: 'tier tier--a3',
  A5: 'tier tier--a5',
};

export default function LicenseBadge({ tier, a5Adds, addOn, standalone, lang }) {
  return (
    <span className="tierwrap">
      {!(addOn && standalone) && (
        <span
          className={TIER_CLASS[tier] ?? 'tier'}
          title={`${t(lang, 'license')}: ${tier}`}
        >
          {tier}
          {a5Adds && !addOn && (
            <span className="tier__plus" aria-hidden="true">
              +
            </span>
          )}
        </span>
      )}
      {addOn && <span className="tier tier--addon">{t(lang, 'addOnBadge')}</span>}
    </span>
  );
}
