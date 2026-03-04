import { describe, it, expect } from 'vitest';
import { calcVolume } from '../lib/volume';

describe('calcVolume', () => {
  const base = {
    price: 550,
    baseVol: 50000,
    retWindow: 30,
    priceElast: -1.2,
    retElast: 0.20,
    costScale: -0.25,
    salvScale: 0.15,
    ship: 30,
    labor: 20,
    pack: 10,
    salv: 10,
  };

  it('returns baseVol at reference price and window', () => {
    const vol = calcVolume(base);
    expect(vol.adjVol).toBeCloseTo(50000, -1);
    expect(vol.volRatio).toBeCloseTo(1.0, 2);
  });

  it('higher price reduces volume (negative elasticity)', () => {
    const vol = calcVolume({ ...base, price: 700 });
    expect(vol.adjVol).toBeLessThan(50000);
  });

  it('lower price increases volume', () => {
    const vol = calcVolume({ ...base, price: 400 });
    expect(vol.adjVol).toBeGreaterThan(50000);
  });

  it('longer return window increases volume', () => {
    const vol = calcVolume({ ...base, retWindow: 60 });
    expect(vol.adjVol).toBeGreaterThan(50000);
  });

  it('zero baseVol falls back to 1000', () => {
    const vol = calcVolume({ ...base, baseVol: 0 });
    expect(vol.adjVol).toBeGreaterThan(0);
  });

  it('adjusts cost multiplier with volume ratio', () => {
    const high = calcVolume({ ...base, price: 400 });
    expect(high.costMult).toBeLessThan(1); // costScale is negative
    expect(high.salvMult).toBeGreaterThan(1); // salvScale is positive
  });

  it('returns correct adjShip/adjLabor/adjPack/adjSalv', () => {
    const vol = calcVolume(base);
    expect(vol.adjShip).toBeCloseTo(base.ship * vol.costMult, 2);
    expect(vol.adjLabor).toBeCloseTo(base.labor * vol.costMult, 2);
    expect(vol.adjPack).toBeCloseTo(base.pack * vol.costMult, 2);
    expect(vol.adjSalv).toBeCloseTo(base.salv * vol.salvMult, 2);
  });
});
