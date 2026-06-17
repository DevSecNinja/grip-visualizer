import { t } from '../i18n/strings.js';

const TIER_CLASS = {
  A1: 'tier tier--a1',
  A3: 'tier tier--a3',
  A5: 'tier tier--a5',
};

export default function LicenseBadge({ tier, a5Adds, lang }) {
  return (
    <span className={TIER_CLASS[tier] ?? 'tier'} title={`${t(lang, 'license')}: ${tier}`}>
      {tier}
      {a5Adds && <span className="tier__plus" aria-hidden="true">+</span>}
    </span>
  );
}
