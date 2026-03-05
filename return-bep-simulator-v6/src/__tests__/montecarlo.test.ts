import { describe, it, expect } from 'vitest';
import { runMonteCarlo } from '../lib/montecarlo';
import type { SimulatorInputs } from '../types/simulator';

const baseInputs: SimulatorInputs = {
  price: 550, cogs: 429, ship: 30, labor: 20, pack: 10, salv: 10,
  Rinf: 0.25, k: 1.3, r14: 0.20, baseVol: 50000, retWindow: 30,
  priceElast: -1.2, retElast: 0.20, costScale: -0.25, salvScale: 0.15,
  recoveryRate: 0.50, refurbCost: 15, salvagePct: 1.0, cxv: 0,
  tornadoPct: 20, recoveryPath: 'salvage',
  priceB: 550, cogsB: 429, compareOn: false,
  reasonMode: false, rrDefect: 20, rrMind: 65,
  rmShipDefect: 1.0, rmShipMind: 1.0, rmShipDamage: 1.2,
  rmPackDefect: 1.0, rmPackMind: 1.0, rmPackDamage: 1.5,
  rmSalvDefect: 0.3, rmSalvMind: 1.0, rmSalvDamage: 0.1,
  rmRecovDefect: 0.3, rmRecovMind: 0.8, rmRecovDamage: 0.1,
  cxvRepurchase: 10, cxvClv: 0, cxvPremium: 40, category: 'hybrid',
};

describe('runMonteCarlo', () => {
  it('returns correct number of samples', () => {
    const result = runMonteCarlo(baseInputs, 20, 20, 1000);
    expect(result.runCount).toBeGreaterThan(0);
    expect(result.runCount).toBeLessThanOrEqual(1000);
    expect(result.bepSamples).toHaveLength(result.runCount);
    expect(result.profitSamples).toHaveLength(result.runCount);
  });

  it('BEP samples are in valid range (0-1)', () => {
    const result = runMonteCarlo(baseInputs, 20, 20, 500);
    for (const b of result.bepSamples) {
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThanOrEqual(1);
    }
  });

  it('percentiles are monotonically increasing for BEP', () => {
    const result = runMonteCarlo(baseInputs, 20, 20, 5000);
    const p = result.percentiles;
    expect(p.p5.bep).toBeLessThanOrEqual(p.p25.bep);
    expect(p.p25.bep).toBeLessThanOrEqual(p.p50.bep);
    expect(p.p50.bep).toBeLessThanOrEqual(p.p75.bep);
    expect(p.p75.bep).toBeLessThanOrEqual(p.p95.bep);
  });

  it('returns empty result for invalid inputs', () => {
    const invalid = { ...baseInputs, r14: 0.30 };
    const result = runMonteCarlo(invalid, 20, 20, 100);
    expect(result.runCount).toBe(0);
    expect(result.bepSamples).toHaveLength(0);
  });

  it('0% range produces near-identical samples', () => {
    const result = runMonteCarlo(baseInputs, 0, 0, 100);
    const unique = new Set(result.bepSamples.map(b => b.toFixed(4)));
    expect(unique.size).toBe(1);
  });

  it('cogsRange independently controls COGS variation', () => {
    const narrow = runMonteCarlo(baseInputs, 5, 5, 2000);
    const wide = runMonteCarlo(baseInputs, 5, 30, 2000);
    // Wider COGS range should produce wider BEP spread
    const narrowSpread = narrow.percentiles.p95.bep - narrow.percentiles.p5.bep;
    const wideSpread = wide.percentiles.p95.bep - wide.percentiles.p5.bep;
    expect(wideSpread).toBeGreaterThan(narrowSpread);
  });
});
