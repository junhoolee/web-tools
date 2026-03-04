export function wR(w: number, Rinf: number, k: number, lam: number): number {
  return w <= 0 ? 0 : Rinf * (1 - Math.exp(-Math.pow(w / lam, k)));
}

export function calLam(Rinf: number, k: number, r14: number): number {
  if (r14 >= Rinf || r14 <= 0 || Rinf <= 0 || k <= 0) return NaN;
  return 14 / Math.pow(-Math.log(1 - r14 / Rinf), 1 / k);
}

export function bepDay(Rinf: number, k: number, lam: number, bep: number): number | null {
  if (bep >= Rinf) return null;
  if (bep <= 0) return 0;
  const w = lam * Math.pow(-Math.log(1 - bep / Rinf), 1 / k);
  return w <= 90 ? w : null;
}
