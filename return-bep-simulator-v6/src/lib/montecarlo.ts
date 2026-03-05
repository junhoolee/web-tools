import type { SimulatorInputs, MonteCarloResult } from '../types/simulator';
import { TORNADO_VARS } from '../constants/presets';
import { wR, calLam } from './weibull';
import { calcL, calcWeightedL } from './cost';
import { calcVolume } from './volume';

function percentile(sorted: number[], p: number): number {
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function getReasonMultipliers(i: SimulatorInputs) {
  return {
    defect: { ship: i.rmShipDefect, pack: i.rmPackDefect, salv: i.rmSalvDefect, recov: i.rmRecovDefect },
    mind: { ship: i.rmShipMind, pack: i.rmPackMind, salv: i.rmSalvMind, recov: i.rmRecovMind },
    damage: { ship: i.rmShipDamage, pack: i.rmPackDamage, salv: i.rmSalvDamage, recov: i.rmRecovDamage },
  };
}

function calcLForMode(
  inputs: SimulatorInputs, cogs: number,
  adjShip: number, adjLabor: number, adjPack: number, adjSalv: number, cxv: number,
): number {
  if (inputs.reasonMode) {
    const defectPct = (inputs.rrDefect || 0) / 100;
    const mindPct = (inputs.rrMind || 0) / 100;
    const m = getReasonMultipliers(inputs);
    return calcWeightedL(cogs, inputs.recoveryRate, inputs.refurbCost, inputs.salv, inputs.salvagePct, inputs.recoveryPath, adjShip, adjLabor, adjPack, adjSalv, cxv, defectPct, mindPct, m).L;
  }
  return calcL(cogs, inputs.recoveryRate, inputs.refurbCost, inputs.salv, inputs.salvagePct, inputs.recoveryPath, adjShip, adjLabor, adjPack, adjSalv, cxv);
}

const EMPTY: MonteCarloResult = {
  bepSamples: [], profitSamples: [],
  percentiles: {
    p5: { bep: 0, profit: 0 }, p25: { bep: 0, profit: 0 },
    p50: { bep: 0, profit: 0 }, p75: { bep: 0, profit: 0 },
    p95: { bep: 0, profit: 0 },
  },
  runCount: 0,
};

export function runMonteCarlo(
  baseInputs: SimulatorInputs, pctRange: number, cogsRange: number, runs: number = 10000,
): MonteCarloResult {
  const baseLam = calLam(baseInputs.Rinf, baseInputs.k, baseInputs.r14);
  if (isNaN(baseLam)) return EMPTY;

  const mult = pctRange / 100;
  const bepSamples: number[] = [];
  const profitSamples: number[] = [];

  for (let i = 0; i < runs; i++) {
    const copy = { ...baseInputs };
    for (const tv of TORNADO_VARS) {
      const orig = copy[tv.field as keyof SimulatorInputs] as number;
      const fieldMult = tv.field === 'cogs' ? cogsRange / 100 : mult;
      const delta = (Math.random() * 2 - 1) * fieldMult;
      (copy as Record<string, unknown>)[tv.field] = orig * (1 + delta);
    }

    const tLam = calLam(copy.Rinf, copy.k, copy.r14);
    if (isNaN(tLam)) continue;

    const tVol = calcVolume(copy);
    const tG = copy.price - copy.cogs;
    if (tG <= 0) continue;

    const tL = calcLForMode(copy, copy.cogs, tVol.adjShip, tVol.adjLabor, tVol.adjPack, tVol.adjSalv, copy.cxv);
    const tBEP = tL <= 0 ? 1 : tG / (tG + tL);
    const tRw = wR(copy.retWindow, copy.Rinf, copy.k, tLam);
    const tContrib = tG * (1 - tRw / tBEP);
    const tNet = tVol.adjVol * tContrib;

    bepSamples.push(tBEP);
    profitSamples.push(tNet);
  }

  if (bepSamples.length === 0) return EMPTY;

  const sortedBep = [...bepSamples].sort((a, b) => a - b);
  const sortedProfit = [...profitSamples].sort((a, b) => a - b);

  return {
    bepSamples,
    profitSamples,
    percentiles: {
      p5:  { bep: percentile(sortedBep, 5),  profit: percentile(sortedProfit, 5) },
      p25: { bep: percentile(sortedBep, 25), profit: percentile(sortedProfit, 25) },
      p50: { bep: percentile(sortedBep, 50), profit: percentile(sortedProfit, 50) },
      p75: { bep: percentile(sortedBep, 75), profit: percentile(sortedProfit, 75) },
      p95: { bep: percentile(sortedBep, 95), profit: percentile(sortedProfit, 95) },
    },
    runCount: bepSamples.length,
  };
}
