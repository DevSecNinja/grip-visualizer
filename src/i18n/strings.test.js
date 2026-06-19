import { describe, it, expect } from 'vitest';
import { DEFAULT_LANG, langFromSearch } from './strings.js';

describe('langFromSearch', () => {
  it('returns a supported language from the lang query parameter', () => {
    expect(langFromSearch('?lang=en')).toBe('en');
    expect(langFromSearch('?lang=fr')).toBe('fr');
    expect(langFromSearch('?lang=nl')).toBe('nl');
  });

  it('falls back to the default language when lang is missing', () => {
    expect(langFromSearch('')).toBe(DEFAULT_LANG);
    expect(langFromSearch('?view=matrix')).toBe(DEFAULT_LANG);
  });

  it('falls back to the default language for an unsupported lang value', () => {
    expect(langFromSearch('?lang=xx')).toBe(DEFAULT_LANG);
    expect(langFromSearch('?lang=')).toBe(DEFAULT_LANG);
  });
});
