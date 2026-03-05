export type RecoveryPath = 'salvage' | 'refurb' | 'mixed';

export interface SimulatorInputs {
  price: number;
  cogs: number;
  ship: number;
  labor: number;
  pack: number;
  salv: number;
  Rinf: number;       // 0-1
  k: number;
  r14: number;        // 0-1
  baseVol: number;
  retWindow: number;
  priceElast: number;
  retElast: number;
  costScale: number;
  salvScale: number;
  recoveryRate: number; // 0-1
  refurbCost: number;
  salvagePct: number;   // 0-1
  cxv: number;
  tornadoPct: number;
  recoveryPath: RecoveryPath;

  // Scenario B
  priceB: number;
  cogsB: number;

  // Compare mode
  compareOn: boolean;

  // Reason segmentation
  reasonMode: boolean;
  rrDefect: number;   // 0-100
  rrMind: number;     // 0-100

  // Reason multipliers
  rmShipDefect: number;
  rmShipMind: number;
  rmShipDamage: number;
  rmPackDefect: number;
  rmPackMind: number;
  rmPackDamage: number;
  rmSalvDefect: number;
  rmSalvMind: number;
  rmSalvDamage: number;
  rmRecovDefect: number;
  rmRecovMind: number;
  rmRecovDamage: number;

  // CXV guide
  cxvRepurchase: number;
  cxvClv: number;
  cxvPremium: number;

  // Category
  category: string;
}

export interface VolumeResult {
  adjVol: number;
  volRatio: number;
  costMult: number;
  salvMult: number;
  adjShip: number;
  adjLabor: number;
  adjPack: number;
  adjSalv: number;
}

export interface ReasonBreakdown {
  defect: { pct: number; L: number };
  mind: { pct: number; L: number };
  damage: { pct: number; L: number };
}

export interface ScenarioResult {
  G: number;
  L: number;
  BEP: number;
  bd: number | null;
  lam: number;
  Rw: number;
  marginPct: string;
  vol: VolumeResult;
  contribPerUnit: number;
  reasonBreakdown: ReasonBreakdown | null;
}

export interface ScenarioBResult {
  Gb: number;
  Lb: number;
  BEPb: number;
  bdb: number | null;
  marginBPct: string;
  prB: number[];
  bepArrB: number[];
  contribPerUnitB: number;
}

export interface TornadoResult {
  label: string;
  bepLow: number;
  bepHigh: number;
  bepSpan: number;
  profitLow: number;
  profitHigh: number;
  profitSpan: number;
}

export interface SimulatorDerived {
  scenario: ScenarioResult;
  scenarioB: ScenarioBResult | null;
  volB?: VolumeResult;

  // Chart data arrays (0..90 days)
  days: number[];
  rr: number[];
  pr: number[];
  bepArr: number[];

  // P&L
  plRevenue: number;
  plReturnCost: number;
  plNetProfit: number;
  plReturnPct: number;

  // Safety
  safetyPP: number;

  // Tornado
  tornadoResults: TornadoResult[];

  // Errors
  error: string | null;
  warning: string | null;
}

export type SimulatorAction =
  | { type: 'SET_FIELD'; field: keyof SimulatorInputs; value: number | string | boolean }
  | { type: 'APPLY_MARGIN'; preset: 'low' | 'mid' | 'high' }
  | { type: 'APPLY_MARGIN_B'; preset: 'low' | 'mid' | 'high' }
  | { type: 'SET_CATEGORY'; category: string }
  | { type: 'SET_RECOVERY_PATH'; path: RecoveryPath }
  | { type: 'TOGGLE_COMPARE' }
  | { type: 'TOGGLE_REASON' }
  | { type: 'SET_CXV_PRESET'; retention: number; attribution: number }
  | { type: 'APPLY_CXV_RECOMMEND' };
