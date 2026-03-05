import { describe, it, expect } from 'vitest';
import { computeAll, emptyDerived } from '../hooks/useSimulatorState';
import type { SimulatorInputs } from '../types/simulator';

const validInputs: SimulatorInputs = {
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
  category: 'hybrid',
};

function expectValidationError(d: ReturnType<typeof computeAll>, msg: string) {
  expect(d.error).toBe(msg);
  expect(d.scenario.G).toBe(0);
  expect(d.scenario.BEP).toBe(0);
}

describe('emptyDerived', () => {
  it('returns error message with zeroed fields', () => {
    const d = emptyDerived('test error');
    expect(d.error).toBe('test error');
    expect(d.scenario.G).toBe(0);
    expect(d.scenario.BEP).toBe(0);
    expect(d.plRevenue).toBe(0);
    expect(d.warning).toBeNull();
  });
});

describe('computeAll validation (AC-2.3)', () => {
  it('#1 rejects price <= 0', () => {
    expectValidationError(
      computeAll({ ...validInputs, price: 0 }),
      '판매가를 입력하세요.',
    );
  });

  it('#2 rejects price <= cogs', () => {
    expectValidationError(
      computeAll({ ...validInputs, price: 429 }),
      '판매가가 매출원가보다 커야 합니다.',
    );
  });

  it('#3 rejects Rinf <= 0', () => {
    expectValidationError(
      computeAll({ ...validInputs, Rinf: 0 }),
      'R∞(최대 반품률)는 0 초과 1 이하여야 합니다.',
    );
  });

  it('#4 rejects Rinf > 1', () => {
    expectValidationError(
      computeAll({ ...validInputs, Rinf: 1.1 }),
      'R∞(최대 반품률)는 0 초과 1 이하여야 합니다.',
    );
  });

  it('#5 rejects r14 <= 0', () => {
    expectValidationError(
      computeAll({ ...validInputs, r14: 0 }),
      '14일 반품률은 0 초과 1 미만이어야 합니다.',
    );
  });

  it('#6 rejects r14 >= 1', () => {
    expectValidationError(
      computeAll({ ...validInputs, r14: 1 }),
      '14일 반품률은 0 초과 1 미만이어야 합니다.',
    );
  });

  it('#7 rejects r14 >= Rinf', () => {
    expectValidationError(
      computeAll({ ...validInputs, r14: 0.25, Rinf: 0.25 }),
      '14일 기준 반품률이 R∞보다 작아야 합니다.',
    );
  });

  it('#8 rejects k <= 0', () => {
    expectValidationError(
      computeAll({ ...validInputs, k: 0 }),
      'k 파라미터는 0보다 커야 합니다.',
    );
  });

  it('#9 rejects retWindow <= 0', () => {
    expectValidationError(
      computeAll({ ...validInputs, retWindow: 0 }),
      '반품 윈도우는 0보다 커야 합니다.',
    );
  });

  it('#10 rejects baseVol <= 0', () => {
    expectValidationError(
      computeAll({ ...validInputs, baseVol: 0 }),
      '기본 판매량은 0보다 커야 합니다.',
    );
  });

  it('#11 rejects recoveryRate < 0', () => {
    expectValidationError(
      computeAll({ ...validInputs, recoveryRate: -0.1 }),
      '회수율은 0~1 범위여야 합니다.',
    );
  });

  it('#12 rejects recoveryRate > 1', () => {
    expectValidationError(
      computeAll({ ...validInputs, recoveryRate: 1.5 }),
      '회수율은 0~1 범위여야 합니다.',
    );
  });

  it('#13 rejects Scenario B when priceB <= cogsB', () => {
    expectValidationError(
      computeAll({ ...validInputs, compareOn: true, priceB: 400, cogsB: 429 }),
      'B 시나리오: 판매가가 매출원가보다 커야 합니다.',
    );
  });
});

describe('computeAll normal calculation (AC-2.4)', () => {
  it('returns exact G, marginPct, and valid BEP/L/bd/lam', () => {
    const d = computeAll(validInputs);
    expect(d.error).toBeNull();
    expect(d.scenario.G).toBe(121);
    expect(d.scenario.marginPct).toBe('22.0');
    expect(d.scenario.L).toBeGreaterThan(0);
    expect(d.scenario.BEP).toBeGreaterThan(0);
    expect(d.scenario.BEP).toBeLessThan(1);
    expect(d.scenario.bd).not.toBeNull();
    expect(d.scenario.lam).toBeGreaterThan(0);
  });

  it('produces 91 data points for chart arrays', () => {
    const d = computeAll(validInputs);
    expect(d.days).toHaveLength(91);
    expect(d.rr).toHaveLength(91);
    expect(d.pr).toHaveLength(91);
    expect(d.bepArr).toHaveLength(91);
  });

  it('computes contribPerUnit as number', () => {
    const d = computeAll(validInputs);
    expect(typeof d.scenario.contribPerUnit).toBe('number');
    expect(isNaN(d.scenario.contribPerUnit)).toBe(false);
  });
});

describe('computeAll P&L (AC-2.5)', () => {
  it('computes revenue, returnCost, netProfit, returnPct', () => {
    const d = computeAll(validInputs);
    expect(d.plRevenue).toBeGreaterThan(0);
    expect(d.plReturnCost).toBeGreaterThan(0);
    expect(isNaN(d.plNetProfit)).toBe(false);
    expect(d.plReturnPct).toBeGreaterThan(0);
  });

  it('plRevenue equals adjVol * price', () => {
    const d = computeAll(validInputs);
    expect(d.plRevenue).toBeCloseTo(d.scenario.vol.adjVol * validInputs.price, 2);
  });
});

describe('computeAll Scenario B (AC-2.6)', () => {
  it('returns null scenarioB when compareOn is false', () => {
    const d = computeAll(validInputs);
    expect(d.scenarioB).toBeNull();
    expect(d.volB).toBeUndefined();
  });

  it('computes scenarioB with Gb=171 when priceB=600, cogsB=429', () => {
    const d = computeAll({ ...validInputs, compareOn: true, priceB: 600, cogsB: 429 });
    expect(d.error).toBeNull();
    expect(d.scenarioB).not.toBeNull();
    expect(d.scenarioB!.Gb).toBe(171);
    expect(d.scenarioB!.BEPb).toBeGreaterThan(0);
    expect(d.scenarioB!.BEPb).toBeLessThan(1);
    expect(typeof d.scenarioB!.contribPerUnitB).toBe('number');
    expect(d.volB).toBeDefined();
    expect(d.volB!.adjVol).toBeGreaterThan(0);
  });
});

describe('computeAll warning (AC-2.7)', () => {
  it('warns when BEP < Rinf (structural deficit)', () => {
    const d = computeAll({ ...validInputs, price: 450, cogs: 449 });
    expect(d.error).toBeNull();
    expect(d.warning).not.toBeNull();
    expect(d.warning).toContain('구조적 적자 경고');
    expect(d.warning).toContain('BEP 반품률');
    expect(d.warning).toContain('R∞');
  });

  it('no warning when BEP >= Rinf', () => {
    const d = computeAll({ ...validInputs, cogs: 220 });
    expect(d.error).toBeNull();
    expect(d.warning).toBeNull();
  });
});
