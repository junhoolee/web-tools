import { useReducer, useMemo } from 'react';
import type {
  SimulatorInputs,
  SimulatorDerived,
  SimulatorAction,
  ScenarioResult,
  ScenarioBResult,
  VolumeResult,
} from '../types/simulator';
import { CAT, MARGIN } from '../constants/presets';
import { wR, calLam, bepDay } from '../lib/weibull';
import { calcL, calcWeightedL } from '../lib/cost';
import { calcVolume } from '../lib/volume';
import { calcSensitivity } from '../lib/sensitivity';

const initialInputs: SimulatorInputs = {
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

function reducer(state: SimulatorInputs, action: SimulatorAction): SimulatorInputs {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };

    case 'APPLY_MARGIN': {
      const p = MARGIN[action.preset];
      return { ...state, price: p.price, cogs: p.cogs };
    }

    case 'APPLY_MARGIN_B': {
      const p = MARGIN[action.preset];
      return { ...state, priceB: p.price, cogsB: p.cogs };
    }

    case 'SET_CATEGORY': {
      const cat = CAT[action.category];
      if (cat) {
        return {
          ...state,
          category: action.category,
          Rinf: cat.r_inf / 100,
          k: cat.k,
        };
      }
      return { ...state, category: action.category };
    }

    case 'SET_RECOVERY_PATH': {
      const path = action.path;
      let salvagePct = state.salvagePct;
      if (path === 'salvage') salvagePct = 1.0;
      else if (path === 'refurb') salvagePct = 0;
      else if (salvagePct === 0 || salvagePct === 1) salvagePct = 0.5;
      return { ...state, recoveryPath: path, salvagePct };
    }

    case 'TOGGLE_COMPARE':
      return { ...state, compareOn: !state.compareOn };

    case 'TOGGLE_REASON':
      return { ...state, reasonMode: !state.reasonMode };

    case 'SET_CXV_PRESET':
      return { ...state, cxvRepurchase: action.retention, cxvPremium: action.attribution };

    case 'APPLY_CXV_RECOMMEND': {
      const recommended = Math.round(
        (state.cxvRepurchase / 100) * state.cxvClv * (state.cxvPremium / 100)
      );
      return { ...state, cxv: recommended };
    }

    default:
      return state;
  }
}

function getReasonMultipliers(i: SimulatorInputs) {
  return {
    defect: { ship: i.rmShipDefect, pack: i.rmPackDefect, salv: i.rmSalvDefect, recov: i.rmRecovDefect },
    mind: { ship: i.rmShipMind, pack: i.rmPackMind, salv: i.rmSalvMind, recov: i.rmRecovMind },
    damage: { ship: i.rmShipDamage, pack: i.rmPackDamage, salv: i.rmSalvDamage, recov: i.rmRecovDamage },
  };
}

function computeScenarioL(
  i: SimulatorInputs,
  cogs: number,
  adjShip: number,
  adjLabor: number,
  adjPack: number,
  adjSalv: number,
  cxv: number,
) {
  if (i.reasonMode) {
    const defectPct = (i.rrDefect || 0) / 100;
    const mindPct = (i.rrMind || 0) / 100;
    const damagePct = 100 - (i.rrDefect || 0) - (i.rrMind || 0);
    if (damagePct < 0) {
      return {
        L: calcL(cogs, i.recoveryRate, i.refurbCost, i.salv, i.salvagePct, i.recoveryPath, adjShip, adjLabor, adjPack, adjSalv, cxv),
        reasonBreakdown: null,
      };
    }
    const m = getReasonMultipliers(i);
    const result = calcWeightedL(cogs, i.recoveryRate, i.refurbCost, i.salv, i.salvagePct, i.recoveryPath, adjShip, adjLabor, adjPack, adjSalv, cxv, defectPct, mindPct, m);
    return { L: result.L, reasonBreakdown: result.breakdown };
  }
  return {
    L: calcL(cogs, i.recoveryRate, i.refurbCost, i.salv, i.salvagePct, i.recoveryPath, adjShip, adjLabor, adjPack, adjSalv, cxv),
    reasonBreakdown: null,
  };
}

function computeAll(i: SimulatorInputs): SimulatorDerived {
  // Validation
  if (i.price <= 0) {
    return emptyDerived('판매가를 입력하세요.');
  }
  if (i.price <= i.cogs) {
    return emptyDerived('판매가가 매출원가보다 커야 합니다.');
  }
  if (i.Rinf <= 0 || i.Rinf > 1) {
    return emptyDerived('R∞(최대 반품률)는 0 초과 1 이하여야 합니다.');
  }
  if (i.r14 <= 0 || i.r14 >= 1) {
    return emptyDerived('14일 반품률은 0 초과 1 미만이어야 합니다.');
  }
  if (i.r14 >= i.Rinf) {
    return emptyDerived('14일 기준 반품률이 R∞보다 작아야 합니다.');
  }
  if (i.k <= 0) {
    return emptyDerived('k 파라미터는 0보다 커야 합니다.');
  }
  if (i.retWindow <= 0) {
    return emptyDerived('반품 윈도우는 0보다 커야 합니다.');
  }
  if (i.baseVol <= 0) {
    return emptyDerived('기본 판매량은 0보다 커야 합니다.');
  }
  if (i.recoveryRate < 0 || i.recoveryRate > 1) {
    return emptyDerived('회수율은 0~1 범위여야 합니다.');
  }
  if (i.compareOn && i.priceB > 0 && i.priceB <= i.cogsB) {
    return emptyDerived('B 시나리오: 판매가가 매출원가보다 커야 합니다.');
  }

  const G = i.price - i.cogs;
  const vol = calcVolume(i);

  const { L, reasonBreakdown } = computeScenarioL(i, i.cogs, vol.adjShip, vol.adjLabor, vol.adjPack, vol.adjSalv, i.cxv);

  const BEP = L <= 0 ? 1 : G / (G + L);
  const lam = calLam(i.Rinf, i.k, i.r14);
  if (isNaN(lam)) {
    return emptyDerived('파라미터 조합이 유효하지 않습니다.');
  }

  const marginPct = (G / i.price * 100).toFixed(1);
  const bd = bepDay(i.Rinf, i.k, lam, BEP);
  const Rw = wR(i.retWindow, i.Rinf, i.k, lam);
  const contribPerUnit = G * (1 - Rw / BEP);
  const safetyPP = (BEP - i.Rinf) * 100;

  // Warning
  let warning: string | null = null;
  if (BEP < i.Rinf) {
    warning = `구조적 적자 경고 — BEP 반품률(${(BEP * 100).toFixed(1)}%)이 예상 최대 반품률(R∞=${(i.Rinf * 100).toFixed(0)}%)보다 낮습니다. 반품 1건의 손실($${L.toFixed(0)})이 판매 ${(L / G).toFixed(1)}건의 이익에 해당하여 현실적으로 흑자 달성이 어렵습니다.`;
  }

  // Chart data (0..90)
  const days: number[] = [];
  const rr: number[] = [];
  const pr: number[] = [];
  const bepArr: number[] = [];
  for (let d = 0; d <= 90; d++) {
    days.push(d);
    const r = wR(d, i.Rinf, i.k, lam);
    rr.push(+(r * 100).toFixed(2));
    pr.push(+((1 - r / BEP) * 100).toFixed(2));
    bepArr.push(+(BEP * 100).toFixed(2));
  }

  // P&L
  const plRevenue = vol.adjVol * i.price;
  const plReturnCost = vol.adjVol * Rw * L;
  const plNetProfit = vol.adjVol * contribPerUnit;
  const plReturnPct = plRevenue > 0 ? (plReturnCost / plRevenue * 100) : 0;

  // Scenario B
  let scenarioB: ScenarioBResult | null = null;
  let volB: VolumeResult | undefined;
  if (i.compareOn && i.priceB > 0 && i.priceB > i.cogsB) {
    volB = calcVolume({ ...i, price: i.priceB });
    const Gb = i.priceB - i.cogsB;
    const { L: Lb } = computeScenarioL(i, i.cogsB, volB.adjShip, volB.adjLabor, volB.adjPack, volB.adjSalv, i.cxv);
    const BEPb = Lb <= 0 ? 1 : Gb / (Gb + Lb);
    const bdb = bepDay(i.Rinf, i.k, lam, BEPb);
    const marginBPct = (Gb / i.priceB * 100).toFixed(1);
    const contribPerUnitB = Gb * (1 - Rw / BEPb);

    const prB: number[] = [];
    const bepArrB: number[] = [];
    for (let d = 0; d <= 90; d++) {
      const r = wR(d, i.Rinf, i.k, lam);
      prB.push(+((1 - r / BEPb) * 100).toFixed(2));
      bepArrB.push(+(BEPb * 100).toFixed(2));
    }

    scenarioB = { Gb, Lb, BEPb, bdb, marginBPct, prB, bepArrB, contribPerUnitB };
  }

  // Tornado
  const tornadoResults = calcSensitivity(i, i.tornadoPct);

  const scenario: ScenarioResult = {
    G, L, BEP, bd, lam, Rw, marginPct, vol, contribPerUnit, reasonBreakdown,
  };

  return {
    scenario,
    scenarioB,
    volB,
    days,
    rr,
    pr,
    bepArr,
    plRevenue,
    plReturnCost,
    plNetProfit,
    plReturnPct,
    safetyPP,
    tornadoResults,
    error: null,
    warning,
  };
}

function emptyDerived(error: string): SimulatorDerived {
  return {
    scenario: {
      G: 0, L: 0, BEP: 0, bd: null, lam: 0, Rw: 0, marginPct: '0.0',
      vol: { adjVol: 0, volRatio: 0, costMult: 0, salvMult: 0, adjShip: 0, adjLabor: 0, adjPack: 0, adjSalv: 0 },
      contribPerUnit: 0, reasonBreakdown: null,
    },
    scenarioB: null,
    days: [], rr: [], pr: [], bepArr: [],
    plRevenue: 0, plReturnCost: 0, plNetProfit: 0, plReturnPct: 0,
    safetyPP: 0, tornadoResults: [],
    error, warning: null,
  };
}

export function useSimulatorState() {
  const [inputs, dispatch] = useReducer(reducer, initialInputs);
  const derived = useMemo(() => computeAll(inputs), [inputs]);
  return { inputs, dispatch, derived };
}
