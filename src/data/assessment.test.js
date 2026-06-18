import { describe, it, expect, beforeEach, vi } from 'vitest';
import { parseImport, exportAssessment, emptyState, STORAGE_KEY } from './assessment.js';

// Minimal localStorage stub
const store = {};
const localStorageMock = {
  getItem: (key) => store[key] ?? null,
  setItem: (key, val) => {
    store[key] = val;
  },
  removeItem: (key) => {
    delete store[key];
  },
  clear: () => Object.keys(store).forEach((k) => delete store[k]),
};
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

beforeEach(() => localStorageMock.clear());

describe('parseImport', () => {
  it('throws invalidJson on malformed JSON', () => {
    expect(() => parseImport('not json')).toThrow('invalidJson');
  });

  it('throws invalidSchema when schema field is missing or wrong', () => {
    expect(() => parseImport(JSON.stringify({ schema: 'other' }))).toThrow(
      'invalidSchema'
    );
    expect(() => parseImport(JSON.stringify({}))).toThrow('invalidSchema');
  });

  it('returns filteredMeasures and empty warnings for a clean import', () => {
    const payload = JSON.stringify({
      schema: 'grip-assessment',
      version: 1,
      measures: {
        O7: { status: 'done', note: 'test' },
      },
    });
    const { measures, warnings } = parseImport(payload);
    expect(measures).toHaveProperty('O7');
    expect(measures.O7.status).toBe('done');
    expect(warnings.unknown).toHaveLength(0);
    // There are 51 more known codes that are not in the import
    expect(warnings.missing.length).toBeGreaterThan(0);
  });

  it('strips unknown codes and lists them in warnings.unknown', () => {
    const payload = JSON.stringify({
      schema: 'grip-assessment',
      version: 1,
      measures: {
        O7: { status: 'done' },
        GHOST_CODE: { status: 'in_progress' },
      },
    });
    const { measures, warnings } = parseImport(payload);
    expect(measures).toHaveProperty('O7');
    expect(measures).not.toHaveProperty('GHOST_CODE');
    expect(warnings.unknown).toContain('GHOST_CODE');
  });

  it('lists codes absent from the import in warnings.missing', () => {
    const payload = JSON.stringify({
      schema: 'grip-assessment',
      version: 1,
      measures: {},
    });
    const { warnings } = parseImport(payload);
    // All 52 known codes are missing
    expect(warnings.missing.length).toBe(52);
  });

  it('normalizes invalid status and note values to safe defaults', () => {
    const payload = JSON.stringify({
      schema: 'grip-assessment',
      version: 1,
      measures: {
        O7: { status: { nested: true }, note: 42 },
      },
    });
    const { measures } = parseImport(payload);
    expect(measures.O7.status).toBe('not_started');
    expect(measures.O7.note).toBe('');
  });

  it('ignores a non-object measures field without throwing', () => {
    const payload = JSON.stringify({
      schema: 'grip-assessment',
      version: 1,
      measures: ['not', 'an', 'object'],
    });
    const { measures, warnings } = parseImport(payload);
    expect(measures).toEqual({});
    expect(warnings.unknown).toHaveLength(0);
  });
});

describe('exportAssessment', () => {
  it('triggers a download without throwing', () => {
    // JSDOM does not implement URL.createObjectURL; provide a stub
    const revokeStub = vi.fn();
    global.URL.createObjectURL = vi.fn(() => 'blob:test');
    global.URL.revokeObjectURL = revokeStub;

    const clickSpy = vi.fn();
    vi.spyOn(document, 'createElement').mockImplementationOnce(() => ({
      href: '',
      download: '',
      click: clickSpy,
    }));

    const state = { ...emptyState(), measures: { O7: { status: 'done' } } };
    expect(() => exportAssessment(state)).not.toThrow();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeStub).toHaveBeenCalled();
  });
});

describe('STORAGE_KEY', () => {
  it('is a non-empty string starting with grip-assessment-', () => {
    expect(typeof STORAGE_KEY).toBe('string');
    expect(STORAGE_KEY.startsWith('grip-assessment-')).toBe(true);
    expect(STORAGE_KEY.length).toBeGreaterThan('grip-assessment-'.length);
  });
});
