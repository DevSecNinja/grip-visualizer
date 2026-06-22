import { describe, it, expect } from 'vitest';
import grip from './grip.json';
import {
  getMeasures,
  measuresByBasis,
  findMeasure,
  highestTier,
  productNodeName,
  productAncestry,
  rootProductName,
  productRootForItem,
} from './grip.js';

describe('GRIP dataset integrity', () => {
  const measures = getMeasures();

  it('contains 52 measure instances (42 unique base measures with recurring O9.x/O10.x)', () => {
    expect(measures).toHaveLength(52);
    const baseCodes = new Set(measures.map((m) => m.code.split('.')[0]));
    expect(baseCodes.size).toBe(42);
  });

  it('has measures spread across Basis 1 to 6', () => {
    const counts = [1, 2, 3, 4, 5, 6].map((b) => measuresByBasis(b).length);
    expect(counts).toEqual([10, 11, 10, 7, 9, 5]);
  });

  it('uses unique measure codes', () => {
    const codes = measures.map((m) => m.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('only uses valid tiers and types', () => {
    for (const m of measures) {
      expect(['O', 'T']).toContain(m.type);
      for (const ms of m.microsoft) {
        expect(grip.meta.tiers).toContain(ms.tier);
      }
    }
  });

  it('provides trilingual titles and summaries for every measure', () => {
    for (const m of measures) {
      expect(m.title_nl?.length).toBeGreaterThan(0);
      expect(m.title_en?.length).toBeGreaterThan(0);
      expect(m.title_fr?.length).toBeGreaterThan(0);
      expect(m.summary_nl?.length).toBeGreaterThan(0);
      expect(m.summary_en?.length).toBeGreaterThan(0);
      expect(m.summary_fr?.length).toBeGreaterThan(0);
    }
  });

  it('assigns a valid implementation horizon to every measure', () => {
    for (const m of measures) {
      expect(grip.meta.horizons).toContain(m.horizon);
    }
  });
});

describe('selectors', () => {
  it('finds a measure by code', () => {
    expect(findMeasure('O7')?.basis).toBe(1);
    expect(findMeasure('nope')).toBeNull();
  });

  it('computes the highest tier', () => {
    expect(highestTier(findMeasure('O7'))).toBe('A5');
  });
});

describe('productNodeName', () => {
  it('uses an explicit parentProduct when present', () => {
    expect(
      productNodeName({
        name: 'Attack Simulation Training (Microsoft Defender for Office 365)',
        parentProduct: 'Microsoft Defender for Office 365',
      })
    ).toBe('Microsoft Defender for Office 365');
  });

  it('falls back to stripping a " — sub-feature" suffix', () => {
    expect(productNodeName({ name: 'Microsoft Purview — eDiscovery (Premium)' })).toBe(
      'Microsoft Purview'
    );
  });

  it('returns the name unchanged when there is no parent or suffix', () => {
    expect(productNodeName({ name: 'Microsoft Sentinel' })).toBe('Microsoft Sentinel');
  });

  it('collapses every parenthetical sub-feature onto a known product node', () => {
    const nodeNames = new Set();
    for (const m of getMeasures()) {
      for (const item of m.microsoft) nodeNames.add(productNodeName(item));
    }
    // Attack Simulation Training must not be its own node.
    expect(
      nodeNames.has('Attack Simulation Training (Microsoft Defender for Office 365)')
    ).toBe(false);
    expect(nodeNames.has('Microsoft Defender for Office 365')).toBe(true);
  });
});

describe('product hierarchy', () => {
  it('walks a multi-level chain up to the root brand', () => {
    expect(productAncestry('Microsoft Entra Conditional Access')).toEqual([
      'Microsoft Entra Conditional Access',
      'Microsoft Entra ID',
      'Microsoft Entra',
    ]);
    expect(rootProductName('Microsoft Entra Conditional Access')).toBe('Microsoft Entra');
  });

  it('returns the name itself when it has no parent', () => {
    expect(productAncestry('Microsoft Sentinel')).toEqual(['Microsoft Sentinel']);
    expect(rootProductName('Microsoft Sentinel')).toBe('Microsoft Sentinel');
  });

  it('resolves a mapping item to its root brand (parentProduct + hierarchy)', () => {
    // Attack Simulation Training → Defender for Office 365 → Microsoft Defender
    expect(
      productRootForItem({
        name: 'Attack Simulation Training (Microsoft Defender for Office 365)',
        parentProduct: 'Microsoft Defender for Office 365',
      })
    ).toBe('Microsoft Defender');
    // "—" sub-feature → Defender for Endpoint → Microsoft Defender
    expect(
      productRootForItem({ name: 'Microsoft Defender Vulnerability Management' })
    ).toBe('Microsoft Defender');
  });

  it('collapses the Entra and Defender families onto single root nodes', () => {
    const roots = new Set();
    for (const m of getMeasures()) {
      for (const item of m.microsoft) roots.add(productRootForItem(item));
    }
    expect(roots.has('Microsoft Entra')).toBe(true);
    expect(roots.has('Microsoft Entra Conditional Access')).toBe(false);
    expect(roots.has('Microsoft Defender')).toBe(true);
    expect(roots.has('Microsoft Defender for Office 365')).toBe(false);
    expect(roots.has('Microsoft Purview')).toBe(true);
    expect(roots.has('Microsoft Purview Information Protection')).toBe(false);
  });
});
