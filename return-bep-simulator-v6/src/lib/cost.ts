import type { RecoveryPath, ReasonBreakdown } from '../types/simulator';

export function calcL(
  cogs: number,
  recoveryRate: number,
  refurbCost: number,
  _salvage: number,
  salvagePct: number,
  recoveryPath: RecoveryPath,
  adjShip: number,
  adjLabor: number,
  adjPack: number,
  adjSalv: number,
  cxv: number,
): number {
  const opsCost = adjShip + adjLabor + adjPack;
  const cxvAdj = cxv || 0;
  let base: number;
  if (recoveryPath === 'salvage') {
    base = cogs + opsCost - adjSalv;
  } else if (recoveryPath === 'refurb') {
    base = cogs * (1 - recoveryRate) + opsCost + refurbCost;
  } else {
    const refurbPct = 1 - salvagePct;
    base = cogs * (1 - recoveryRate * refurbPct) + opsCost + refurbCost * refurbPct - adjSalv * salvagePct;
  }
  return Math.max(0, base - cxvAdj);
}

export interface ReasonMultipliers {
  defect: { ship: number; pack: number; salv: number; recov: number };
  mind: { ship: number; pack: number; salv: number; recov: number };
  damage: { ship: number; pack: number; salv: number; recov: number };
}

export function calcWeightedL(
  cogs: number,
  recoveryRate: number,
  refurbCost: number,
  salvage: number,
  salvagePct: number,
  recoveryPath: RecoveryPath,
  adjShip: number,
  adjLabor: number,
  adjPack: number,
  adjSalv: number,
  cxv: number,
  defectPct: number,
  mindPct: number,
  multipliers: ReasonMultipliers,
): { L: number; breakdown: ReasonBreakdown | null } {
  const damagePct = Math.max(0, 1 - defectPct - mindPct);

  if (defectPct + damagePct === 0 && defectPct === 0) {
    return { L: calcL(cogs, recoveryRate, refurbCost, salvage, salvagePct, recoveryPath, adjShip, adjLabor, adjPack, adjSalv, cxv), breakdown: null };
  }

  const m = multipliers;
  const Ld = calcL(cogs, recoveryRate * m.defect.recov, refurbCost, salvage, salvagePct, recoveryPath, adjShip * m.defect.ship, adjLabor, adjPack * m.defect.pack, adjSalv * m.defect.salv, cxv);
  const Lm = calcL(cogs, recoveryRate * m.mind.recov, refurbCost, salvage, salvagePct, recoveryPath, adjShip * m.mind.ship, adjLabor, adjPack * m.mind.pack, adjSalv * m.mind.salv, cxv);
  const Lp = calcL(cogs, recoveryRate * m.damage.recov, refurbCost, salvage, salvagePct, recoveryPath, adjShip * m.damage.ship, adjLabor, adjPack * m.damage.pack, adjSalv * m.damage.salv, cxv);
  const L = defectPct * Ld + mindPct * Lm + damagePct * Lp;

  return {
    L,
    breakdown: {
      defect: { pct: defectPct, L: Ld },
      mind: { pct: mindPct, L: Lm },
      damage: { pct: damagePct, L: Lp },
    },
  };
}
