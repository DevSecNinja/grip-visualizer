import grip from './grip.json';

export const BASIS_LEVELS = grip.meta.basisLevels;
export const HORIZONS = grip.meta.horizons;

export function getMeasures() {
  return grip.measures;
}

export function getMeta() {
  return grip.meta;
}

// Registry of risk/control standards the measures are mapped against.
export function getStandards() {
  return grip.meta.standards ?? [];
}

// Returns [{ id, label, url, controls: [...] }] for a measure's standard
// mappings, or an empty array when the measure has no mappings.
export function standardsFor(measure) {
  if (!measure.standards) return [];
  return getStandards()
    .map((std) => ({ ...std, controls: measure.standards[std.id] ?? [] }))
    .filter((std) => std.controls.length > 0);
}

// Localized rationale ("why") explaining why a measure maps to its standards.
// Falls back to Dutch (source of truth) and returns null when absent.
export function localizedStandardsWhy(measure, lang) {
  if (!measure.standardsWhy) return null;
  return measure.standardsWhy[lang] || measure.standardsWhy.nl || null;
}

// The immediate product a Microsoft mapping rolls up to. A capability that is
// really a feature of a larger product can declare its parent explicitly via
// `parentProduct` (preferred — robust against naming). Otherwise we fall back
// to stripping a trailing " — sub-feature" suffix (e.g.
// "Microsoft Purview — eDiscovery (Premium)" → "Microsoft Purview"). This is
// the grouping used where the distinct product matters (e.g. the A3 vs A5
// value view).
export function productNodeName(item) {
  if (item.parentProduct) return item.parentProduct;
  return item.name.split(/\s+—\s+/)[0];
}

// Optional multi-level product hierarchy: a registry mapping a product (or
// feature) name to its parent, chainable up to a root brand — e.g. Conditional
// Access → Microsoft Entra ID → Microsoft Entra. Defined in
// meta.productHierarchy. Lets views roll capabilities up to whichever level
// they need without baking the taxonomy into product names.
export function getProductHierarchy() {
  return grip.meta.productHierarchy ?? {};
}

// Walk the hierarchy from a product name up to its root brand, returning the
// full ancestry chain [name, …, root]. Guards against cycles.
export function productAncestry(name) {
  const hierarchy = getProductHierarchy();
  const chain = [name];
  let current = name;
  const seen = new Set([current]);
  while (hierarchy[current]) {
    current = hierarchy[current];
    if (seen.has(current)) break; // cycle guard
    seen.add(current);
    chain.push(current);
  }
  return chain;
}

// The root brand a product collapses onto (topmost ancestor), or the product
// itself when it has no parent. Used where one node per product family is
// wanted (e.g. the Network view).
export function rootProductName(name) {
  const chain = productAncestry(name);
  return chain[chain.length - 1];
}

// The root brand for a Microsoft mapping: resolves the immediate product first
// (parentProduct / "—" split), then walks the hierarchy to its root.
export function productRootForItem(item) {
  return rootProductName(productNodeName(item));
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

// Tier shown on a measure card/chip. Returns the highest real licence tier
// across mappings that are not standalone add-ons, or 'ADDON' when every
// mapping is a standalone add-on (e.g. Sentinel, Entra Private Access) and
// no base-licence capability is available. An explicit `tierOverride` on the
// measure (e.g. "A3") wins — use it when the core measure is achievable at a
// lower tier and the higher-tier mappings are only value-adds.
export function measureTier(measure) {
  if (measure.tierOverride) return measure.tierOverride;
  const base = measure.microsoft.filter((item) => !(item.addOn && item.standalone));
  if (base.length === 0) return 'ADDON';
  return base.reduce((acc, item) => {
    return TIER_RANK[item.tier] > TIER_RANK[acc] ? item.tier : acc;
  }, 'A1');
}
