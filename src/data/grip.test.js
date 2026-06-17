import { describe, it, expect } from 'vitest';
import grip from './grip.json';
import { getMeasures, measuresByBasis, findMeasure, highestTier, hasA5Value } from './grip.js';

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
});

describe('selectors', () => {
  it('finds a measure by code', () => {
    expect(findMeasure('O7')?.basis).toBe(1);
    expect(findMeasure('nope')).toBeNull();
  });

  it('computes the highest tier', () => {
    expect(highestTier(findMeasure('O7'))).toBe('A5');
  });

  it('detects A5 value-add', () => {
    expect(hasA5Value(findMeasure('O7'))).toBe(true);
    expect(hasA5Value(findMeasure('T1'))).toBe(false);
  });
});
