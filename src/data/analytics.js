import { getMeasures, highestTier } from './grip.js';

export { highestTier };

// --- A3 vs A5 value -----------------------------------------------------
// Split a product/feature name into its base product and an optional
// sub-feature label, e.g. "Microsoft Defender XDR — Incidents" ->
// { base: "Microsoft Defender XDR", label: "Incidents" }. License plans are
// part of the base (e.g. "Defender for Endpoint Plan 2 (EDR)"), so plan-
// distinguished products are never merged together.
export function splitCapabilityName(name) {
  const parts = name.split(/\s+—\s+/);
  if (parts.length > 1) {
    return { base: parts[0].trim(), label: parts.slice(1).join(' — ').trim() };
  }
  return { base: name.trim(), label: null };
}

export function a3a5Split() {
  const a3 = [];
  const a5 = [];
  for (const m of getMeasures()) {
    if (highestTier(m) === 'A5') a5.push(m);
    else a3.push(m);
  }
  // Distinct A5-only capabilities, grouped by base product. Sub-features of
  // the same product are merged into one card with per-variant labels.
  const groups = new Map();
  for (const m of getMeasures()) {
    for (const item of m.microsoft) {
      if (item.tier === 'A5' || item.a5Adds) {
        const { base, label } = splitCapabilityName(item.name);
        if (!groups.has(base)) {
          groups.set(base, { name: base, docsUrl: item.docsUrl, variants: new Map(), measures: new Set() });
        }
        const group = groups.get(base);
        group.measures.add(m.code);
        // Prefer the general (label-less) entry's docs link for the card.
        if (!label) group.docsUrl = item.docsUrl;
        const key = label ?? '';
        if (!group.variants.has(key)) group.variants.set(key, { label, codes: new Set() });
        group.variants.get(key).codes.add(m.code);
      }
    }
  }
  const a5Capabilities = [...groups.values()]
    .map((g) => ({
      name: g.name,
      docsUrl: g.docsUrl,
      count: g.measures.size,
      // Labelled variants first, the general (label-less) entry last.
      variants: [...g.variants.values()]
        .sort((x, y) => (x.label ? 0 : 1) - (y.label ? 0 : 1))
        .map((v) => ({ label: v.label, measures: [...v.codes].sort() })),
    }))
    .sort((x, y) => y.count - x.count || x.name.localeCompare(y.name));

  return { a3, a5, a5Capabilities };
}

// --- Prioritize: implementation horizon ---------------------------------
// Group measures by implementation horizon (short/medium/long effort),
// independent of the GRIP Basis sequence. Within each horizon, also report
// how many measures are achievable today with A3 (highest tier !== A5).
export function horizonIndex(horizons) {
  return horizons.map((h) => {
    const measures = getMeasures().filter((m) => m.horizon === h);
    const a3Ready = measures.filter((m) => highestTier(m) !== 'A5').length;
    return { horizon: h, measures, count: measures.length, a3Ready };
  });
}
