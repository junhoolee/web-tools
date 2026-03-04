import { REF_PRICE, REF_WINDOW } from '../constants/presets';
import type { VolumeResult } from '../types/simulator';

interface VolumeInputs {
  price: number;
  baseVol: number;
  retWindow: number;
  priceElast: number;
  retElast: number;
  costScale: number;
  salvScale: number;
  ship: number;
  labor: number;
  pack: number;
  salv: number;
}

export function calcVolume(i: VolumeInputs): VolumeResult {
  const baseVol = i.baseVol > 0 ? i.baseVol : 1000;
  const priceRatio = i.price > 0 ? Math.pow(i.price / REF_PRICE, i.priceElast) : 1;
  const windowRatio = Math.pow((i.retWindow > 0 ? i.retWindow : 30) / REF_WINDOW, i.retElast);
  const adjVol = baseVol * priceRatio * windowRatio;
  const volRatio = adjVol / baseVol;
  const costMult = volRatio > 0 ? Math.pow(volRatio, i.costScale) : 1;
  const salvMult = volRatio > 0 ? Math.pow(volRatio, i.salvScale) : 1;
  return {
    adjVol,
    volRatio,
    costMult,
    salvMult,
    adjShip: i.ship * costMult,
    adjLabor: i.labor * costMult,
    adjPack: i.pack * costMult,
    adjSalv: i.salv * salvMult,
  };
}
