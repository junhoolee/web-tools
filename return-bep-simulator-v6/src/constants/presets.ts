export const CAT: Record<string, { r_inf: number; k: number }> = {
  electronics: { r_inf: 24, k: 1.5 },
  hybrid:      { r_inf: 25, k: 1.3 },
  eyewear:     { r_inf: 28, k: 1.1 },
  fashion:     { r_inf: 35, k: 0.85 },
};

export const MARGIN: Record<string, { price: number; cogs: number }> = {
  low:  { price: 550, cogs: 429 },
  mid:  { price: 550, cogs: 330 },
  high: { price: 550, cogs: 220 },
};

export const REF_PRICE = 550;
export const REF_WINDOW = 30;

export const TORNADO_VARS = [
  { id: 'price',    label: '판매가',       field: 'price' },
  { id: 'cogs',     label: '매출원가',     field: 'cogs' },
  { id: 'shipping', label: '배송비',       field: 'ship' },
  { id: 'labor',    label: '검수/재입고비', field: 'labor' },
  { id: 'salvage',  label: '잔존가치',     field: 'salv' },
  { id: 'r_inf',    label: 'R\u221E 최대반품률', field: 'Rinf', pct: true },
  { id: 'cxv',      label: '고객경험 가치 (CXV)', field: 'cxv' },
] as const;

export type TornadoVarField = typeof TORNADO_VARS[number]['field'];
