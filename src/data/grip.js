import grip from './grip.json';

export const BASIS_LEVELS = grip.meta.basisLevels;
export const HORIZONS = grip.meta.horizons;

export function getMeasures() {
  return grip.measures;
}

export function getMeta() {
  return grip.meta;
}

export function measuresByBasis(basis) {
  return grip.measures.filter((m) => m.basis === basis);
}

export function findMeasure(code) {
  return grip.measures.find((m) => m.code === code) ?? null;
}

// Pick a localized field (e.g. 'title', 'summary') for the given language,
// falling back to Dutch (the GRIP source of truth) when a translation is absent.
export function localized(measure, field, lang) {
  return measure[`${field}_${lang}`] || measure[`${field}_nl`];
}

// Practical implementation guidance is an optional, per-language structured
// object: { rationale, do: [], dont: [] }. Falls back to Dutch (source of
// truth) and returns null when no guidance exists for the measure.
export function localizedGuidance(measure, lang) {
  if (!measure.guidance) return null;
  return measure.guidance[lang] || measure.guidance.nl || null;
}

// Tier ordering helper: A1 < A3 < A5
const TIER_RANK = { A1: 1, A3: 2, A5: 3 };

export function highestTier(measure) {
  return measure.microsoft.reduce((acc, item) => {
    return TIER_RANK[item.tier] > TIER_RANK[acc] ? item.tier : acc;
  }, 'A1');
}
