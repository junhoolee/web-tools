import { describe, it, expect } from 'vitest';
import { calcL } from '../lib/cost';

describe('calcL (per-return loss)', () => {
  const base = {
    cogs: 429,
    recoveryRate: 0.5,
    refurbCost: 15,
    salvage: 10,
    adjShip: 30,
    adjLabor: 20,
    adjPack: 10,
    adjSalv: 10,
    cxv: 0,
  };

  describe('salvage path', () => {
    it('calculates L = cogs + ops - salvage', () => {
      const L = calcL(base.cogs, base.recoveryRate, base.refurbCost, base.salvage, 1.0, 'salvage',
        base.adjShip, base.adjLabor, base.adjPack, base.adjSalv, base.cxv);
      // cogs(429) + ship(30) + labor(20) + pack(10) - salv(10) = 479
      expect(L).toBe(479);
    });

    it('returns 0 when salvage exceeds cost', () => {
      const L = calcL(10, 0.5, 15, 10, 1.0, 'salvage', 5, 5, 5, 1000, 0);
      expect(L).toBe(0);
    });
  });

  describe('refurb path', () => {
    it('calculates L with recovery rate', () => {
      const L = calcL(base.cogs, 0.5, 15, base.salvage, 0, 'refurb',
        base.adjShip, base.adjLabor, base.adjPack, base.adjSalv, 0);
      // cogs*(1-0.5) + ops + refurbCost = 214.5 + 60 + 15 = 289.5
      expect(L).toBeCloseTo(289.5, 1);
    });
  });

  describe('mixed path', () => {
    it('blends salvage and refurb', () => {
      const L = calcL(base.cogs, 0.5, 15, base.salvage, 0.5, 'mixed',
        base.adjShip, base.adjLabor, base.adjPack, base.adjSalv, 0);
      expect(L).toBeGreaterThan(0);
      expect(isFinite(L)).toBe(true);
    });
  });

  describe('CXV adjustment', () => {
    it('reduces L by CXV amount', () => {
      const LWithout = calcL(base.cogs, 0.5, 15, base.salvage, 1.0, 'salvage',
        base.adjShip, base.adjLabor, base.adjPack, base.adjSalv, 0);
      const LWith = calcL(base.cogs, 0.5, 15, base.salvage, 1.0, 'salvage',
        base.adjShip, base.adjLabor, base.adjPack, base.adjSalv, 50);
      expect(LWith).toBe(LWithout - 50);
    });
  });
});
