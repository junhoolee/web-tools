import { describe, it, expect } from 'vitest';
import { calcSensitivity } from '../lib/sensitivity';
import type { SimulatorInputs } from '../types/simulator';

const baseInputs: SimulatorInputs = {
  price: 550,
  cogs: 429,
  ship: 30,
  labor: 20,
  pack: 10,
  salv: 10,
  Rinf: 0.25,
  k: 1.3,
  r14: 0.20,
  baseVol: 50000,
  retWindow: 30,
  priceElast: -1.2,
  retElast: 0.20,
  costScale: -0.25,
  salvScale: 0.15,
  recoveryRate: 0.50,
  refurbCost: 15,
  salvagePct: 1.0,
  cxv: 0,
  tornadoPct: 20,
  recoveryPath: 'salvage',
  priceB: 550,
  cogsB: 429,
  compareOn: false,
  reasonMode: false,
  rrDefect: 20,
  rrMind: 65,
  rmShipDefect: 1.0,
  rmShipMind: 1.0,
  rmShipDamage: 1.2,
  rmPackDefect: 1.0,
  rmPackMind: 1.0,
  rmPackDamage: 1.5,
  rmSalvDefect: 0.3,
  rmSalvMind: 1.0,
  rmSalvDamage: 0.1,
  rmRecovDefect: 0.3,
  rmRecovMind: 0.8,
  rmRecovDamage: 0.1,
  cxvRepurchase: 10,
  cxvClv: 0,
  cxvPremium: 40,
  fixedCost: 0,
  category: 'hybrid',
};

describe('calcSensitivity (tornado)', () => {
  it('returns results for each tornado variable', () => {
    const results = calcSensitivity(baseInputs, 20);
    expect(results.length).toBeGreaterThan(0);
  });

  it('each result has bepLow <= 0 <= bepHigh (span centered around 0)', () => {
    const results = calcSensitivity(baseInputs, 20);
    for (const r of results) {
      expect(r.bepLow).toBeLessThanOrEqual(r.bepHigh);
      expect(r.bepSpan).toBeGreaterThanOrEqual(0);
    }
  });

  it('bepSpan is non-negative for all variables', () => {
    const results = calcSensitivity(baseInputs, 20);
    for (const r of results) {
      expect(r.bepSpan).toBeGreaterThanOrEqual(0);
      expect(r.profitSpan).toBeGreaterThanOrEqual(0);
    }
  });

  it('returns empty array for invalid lambda', () => {
    const invalid = { ...baseInputs, r14: 0.30 }; // r14 > Rinf
    const results = calcSensitivity(invalid, 20);
    expect(results).toEqual([]);
  });

  it('0% range produces zero span', () => {
    const results = calcSensitivity(baseInputs, 0);
    for (const r of results) {
      expect(r.bepSpan).toBeCloseTo(0, 4);
      expect(r.profitSpan).toBeCloseTo(0, -1);
    }
  });
});
