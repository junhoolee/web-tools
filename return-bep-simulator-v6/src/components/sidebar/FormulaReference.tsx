export default function FormulaReference() {
  return (
    <div className="mt-2 p-[10px] bg-bg rounded-md text-[11px] text-text-muted leading-relaxed">
      <strong>수식 참고</strong><br />
      <code className="bg-border px-1 rounded text-[10px]">G = 판매가 - 매출원가</code><br />
      <code className="bg-border px-1 rounded text-[10px]">L = 경로별 원가 + 배송비 + 검수/재입고비 + 포장재 - CXV (회수경로 참조)</code><br />
      <code className="bg-border px-1 rounded text-[10px]">BEP = G / (G + L)</code><br />
      <code className="bg-border px-1 rounded text-[10px]">R(w) = R∞ × [1 - e^(-(w/λ)^k)]</code><br />
      <code className="bg-border px-1 rounded text-[10px]">π/G = 1 - R(w) / BEP</code><br />
      <strong>판매량 모델</strong><br />
      <code className="bg-border px-1 rounded text-[10px]">V_adj = V_base × (Price/550)^εp × (Window/30)^εw</code><br />
      <code className="bg-border px-1 rounded text-[10px]">Cost_adj = Cost × (V_adj/V_base)^α</code><br />
      <code className="bg-border px-1 rounded text-[10px]">Salvage_adj = Salvage × (V_adj/V_base)^β</code>
    </div>
  );
}
