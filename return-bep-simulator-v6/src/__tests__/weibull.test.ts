import { describe, it, expect } from 'vitest';
import { wR, calLam, bepDay } from '../lib/weibull';

describe('wR (Weibull CDF return rate)', () => {
  it('returns 0 for day 0 or negative', () => {
    expect(wR(0, 0.25, 1.3, 20)).toBe(0);
    expect(wR(-5, 0.25, 1.3, 20)).toBe(0);
  });

  it('approaches Rinf as w grows', () => {
    const r = wR(1000, 0.25, 1.3, 20);
    expect(r).toBeCloseTo(0.25, 4);
  });

  it('gives intermediate values for typical inputs', () => {
    const lam = calLam(0.25, 1.3, 0.20);
    const r14 = wR(14, 0.25, 1.3, lam);
    expect(r14).toBeCloseTo(0.20, 2);
  });

  it('is monotonically increasing', () => {
    const lam = calLam(0.25, 1.3, 0.20);
    const vals = [0, 5, 10, 20, 30, 60, 90].map(d => wR(d, 0.25, 1.3, lam));
    for (let j = 1; j < vals.length; j++) {
      expect(vals[j]).toBeGreaterThanOrEqual(vals[j - 1]);
    }
  });
});

describe('calLam (lambda calibration)', () => {
  it('returns a positive finite number for valid inputs', () => {
    const lam = calLam(0.25, 1.3, 0.20);
    expect(lam).toBeGreaterThan(0);
    expect(isFinite(lam)).toBe(true);
  });

  it('returns NaN when r14 >= Rinf', () => {
    expect(isNaN(calLam(0.25, 1.3, 0.25))).toBe(true);
    expect(isNaN(calLam(0.25, 1.3, 0.30))).toBe(true);
  });

  it('returns NaN for zero/negative inputs', () => {
    expect(isNaN(calLam(0, 1.3, 0.20))).toBe(true);
    expect(isNaN(calLam(0.25, 0, 0.20))).toBe(true);
    expect(isNaN(calLam(0.25, 1.3, 0))).toBe(true);
  });
});

describe('bepDay', () => {
  it('returns null when BEP >= Rinf (never reached)', () => {
    expect(bepDay(0.25, 1.3, 20, 0.30)).toBeNull();
    expect(bepDay(0.25, 1.3, 20, 0.25)).toBeNull();
  });

  it('returns 0 when BEP <= 0', () => {
    expect(bepDay(0.25, 1.3, 20, 0)).toBe(0);
    expect(bepDay(0.25, 1.3, 20, -0.1)).toBe(0);
  });

  it('returns a day within 90 for typical inputs', () => {
    const lam = calLam(0.25, 1.3, 0.20);
    const d = bepDay(0.25, 1.3, lam, 0.22);
    expect(d).not.toBeNull();
    expect(d!).toBeGreaterThan(0);
    expect(d!).toBeLessThanOrEqual(90);
  });

  it('returns null when BEP day exceeds 90', () => {
    const lam = calLam(0.25, 1.3, 0.20);
    // BEP extremely close to Rinf → exceeds 90-day window
    const d = bepDay(0.25, 1.3, lam, 0.249999999999);
    expect(d).toBeNull();
  });
});
