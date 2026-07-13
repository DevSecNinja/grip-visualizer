import { describe, it, expect } from 'vitest';
import { a3a5Split, capabilityLabel } from './analytics.js';

describe('capabilityLabel', () => {
  it('returns null when the name is the base product', () => {
    expect(capabilityLabel('Microsoft Sentinel', 'Microsoft Sentinel')).toBeNull();
  });

  it('strips a parenthetical parent (explicit parentProduct form)', () => {
    expect(
      capabilityLabel(
        'Attack Simulation Training (Microsoft Defender for Office 365)',
        'Microsoft Defender for Office 365'
      )
    ).toBe('Attack Simulation Training');
  });

  it('uses the part after a " — " separator', () => {
    expect(
      capabilityLabel('Microsoft Defender XDR — Incidents', 'Microsoft Defender XDR')
    ).toBe('Incidents');
  });

  it('uses the remainder after a base prefix', () => {
    expect(
      capabilityLabel(
        'Microsoft Defender for Endpoint Plan 2 (EDR)',
        'Microsoft Defender for Endpoint'
      )
    ).toBe('Plan 2 (EDR)');
  });
});

describe('a3a5Split capability grouping', () => {
  const { a5Capabilities } = a3a5Split();
  const byName = (name) => a5Capabilities.find((c) => c.name === name);

  it('groups Attack Simulation Training under Defender for Office 365', () => {
    expect(
      byName('Attack Simulation Training (Microsoft Defender for Office 365)')
    ).toBeUndefined();
    const card = byName('Microsoft Defender for Office 365');
    expect(card).toBeDefined();
    expect(card.variants.some((v) => v.label === 'Attack Simulation Training')).toBe(
      true
    );
  });

  it('groups the EDR plan under Microsoft Defender for Endpoint', () => {
    expect(byName('Microsoft Defender for Endpoint Plan 2 (EDR)')).toBeUndefined();
    const card = byName('Microsoft Defender for Endpoint');
    expect(card).toBeDefined();
  });
});
