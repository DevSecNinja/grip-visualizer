import grip from './grip.json';

export const BASIS_LEVELS = grip.meta.basisLevels;

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

// Tier ordering helper: A1 < A3 < A5
const TIER_RANK = { A1: 1, A3: 2, A5: 3 };

export function highestTier(measure) {
  return measure.microsoft.reduce((acc, item) => {
    return TIER_RANK[item.tier] > TIER_RANK[acc] ? item.tier : acc;
  }, 'A1');
}

export function hasA5Value(measure) {
  return measure.microsoft.some((item) => item.a5Adds || item.tier === 'A5');
}
