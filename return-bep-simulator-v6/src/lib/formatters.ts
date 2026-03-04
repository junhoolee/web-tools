export function fmtMoney(v: number): string {
  const abs = Math.abs(v);
  const str = abs >= 1000 ? '$' + Math.round(abs).toLocaleString() : '$' + abs.toFixed(0);
  return v < 0 ? '-' + str : str;
}

export function fmtPercent(v: number, decimals = 1): string {
  return v.toFixed(decimals) + '%';
}

export function fmtSignedPercent(v: number, decimals = 1): string {
  return (v >= 0 ? '+' : '') + v.toFixed(decimals) + '%';
}
