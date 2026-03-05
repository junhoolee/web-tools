import type { SimulatorInputs, TornadoResult } from '../types/simulator';
import { TORNADO_VARS } from '../constants/presets';
import { wR, calLam } from './weibull';
import { calcL, calcWeightedL, getReasonMultipliers } from './cost';
import { calcVolume } from './volume';


function calcLForMode(
  inputs: SimulatorInputs,
  cogs: number,
  adjShip: number,
  adjLabor: number,
  adjPack: number,
  adjSalv: number,
  cxv: number,
): number {
  if (inputs.reasonMode) {
    const defectPct = (inputs.rrDefect || 0) / 100;
    const mindPct = (inputs.rrMind || 0) / 100;
    const m = getReasonMultipliers(inputs);
    return calcWeightedL(cogs, inputs.recoveryRate, inputs.refurbCost, inputs.salv, inputs.salvagePct, inputs.recoveryPath, adjShip, adjLabor, adjPack, adjSalv, cxv, defectPct, mindPct, m).L;
  }
  return calcL(cogs, inputs.recoveryRate, inputs.refurbCost, inputs.salv, inputs.salvagePct, inputs.recoveryPath, adjShip, adjLabor, adjPack, adjSalv, cxv);
}

export function calcSensitivity(baseInputs: SimulatorInputs, pctRange: number): TornadoResult[] {
  const baseLam = calLam(baseInputs.Rinf, baseInputs.k, baseInputs.r14);
  if (isNaN(baseLam)) return [];

  const baseVol = calcVolume(baseInputs);
  const baseG = baseInputs.price - baseInputs.cogs;
  const baseL = calcLForMode(baseInputs, baseInputs.cogs, baseVol.adjShip, baseVol.adjLabor, baseVol.adjPack, baseVol.adjSalv, baseInputs.cxv);
  const baseBEP = baseL <= 0 ? 1 : baseG / (baseG + baseL);
  const baseRw = wR(baseInputs.retWindow, baseInputs.Rinf, baseInputs.k, baseLam);
  const baseContrib = baseG * (1 - baseRw / baseBEP);
  const baseNetProfit = baseVol.adjVol * baseContrib;

  const results: TornadoResult[] = [];
  const mult = pctRange / 100;

  TORNADO_VARS.forEach((tv) => {
    const tweaked = (dir: number) => {
      const copy = { ...baseInputs };
      const origVal = copy[tv.field as keyof SimulatorInputs] as number;
      (copy as Record<string, unknown>)[tv.field] = origVal * (1 + dir * mult);

      const tLam = calLam(copy.Rinf, copy.k, copy.r14);
      if (isNaN(tLam)) return { bep: baseBEP, netProfit: baseNetProfit };

      const tVol = calcVolume(copy);
      const tG = copy.price - copy.cogs;
      if (tG <= 0) return { bep: 0, netProfit: -999999 };

      const tL = calcLForMode(copy, copy.cogs, tVol.adjShip, tVol.adjLabor, tVol.adjPack, tVol.adjSalv, copy.cxv);
      const tBEP = tL <= 0 ? 1 : tG / (tG + tL);
      const tRw = wR(copy.retWindow, copy.Rinf, copy.k, tLam);
      const tContrib = tG * (1 - tRw / tBEP);
      const tNet = tVol.adjVol * tContrib;
      return { bep: tBEP, netProfit: tNet };
    };

    const up = tweaked(+1);
    const down = tweaked(-1);
    const bepUp = (up.bep - baseBEP) * 100;
    const bepDown = (down.bep - baseBEP) * 100;
    const profitUp = up.netProfit - baseNetProfit;
    const profitDown = down.netProfit - baseNetProfit;

    results.push({
      label: tv.label,
      bepLow: Math.min(bepDown, bepUp),
      bepHigh: Math.max(bepDown, bepUp),
      bepSpan: Math.abs(bepUp - bepDown),
      profitLow: Math.min(profitDown, profitUp),
      profitHigh: Math.max(profitDown, profitUp),
      profitSpan: Math.abs(profitUp - profitDown),
    });
  });

  return results;
}
