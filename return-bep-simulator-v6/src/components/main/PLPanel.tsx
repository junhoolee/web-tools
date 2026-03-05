import type { SimulatorDerived } from '../../types/simulator';
import { fmtMoney } from '../../lib/formatters';

interface Props {
  derived: SimulatorDerived;
}

export default function PLPanel({ derived }: Props) {
  const { plRevenue, plReturnCost, plNetProfit, plReturnPct, scenarioB, plBRevenue, plBReturnCost, plBNetProfit, plBReturnPct } = derived;

  return (
    <div className="grid grid-cols-4 gap-3 mb-5 p-4 bg-gradient-to-br from-[#f0f9ff] to-white border border-[#bfdbfe] rounded-[10px] max-desktop:grid-cols-2">
      <div className="col-span-full text-[13px] font-bold text-[#1e40af] mb-1">월간 P&L 임팩트</div>

      <PLCard label="월 매출" value={fmtMoney(plRevenue)} desc="V_adj × 판매가"
        compare={scenarioB ? `B: ${fmtMoney(plBRevenue)}` : undefined} />

      <PLCard
        label="월 순이익"
        value={(plNetProfit >= 0 ? '+' : '-') + fmtMoney(Math.abs(plNetProfit))}
        desc={`V_adj × G × (1 − R(w)/BEP)${plRevenue > 0 ? ` · ${(plNetProfit / plRevenue * 100).toFixed(1)}%` : ''}`}
        positive={plNetProfit >= 0}
        compare={scenarioB ? `B: ${plBNetProfit >= 0 ? '+' : '-'}${fmtMoney(Math.abs(plBNetProfit))}` : undefined}
      />

      <PLCard label="월 반품비용" value={fmtMoney(plReturnCost)}
        desc={`V_adj × R(w) × L${plRevenue > 0 ? ` · ${(plReturnCost / plRevenue * 100).toFixed(1)}%` : ''}`}
        compare={scenarioB ? `B: ${fmtMoney(plBReturnCost)}` : undefined} />

      <PLCard
        label="반품/매출 비율"
        value={plReturnPct.toFixed(1) + '%'}
        desc="반품비용 ÷ 매출"
        positive={plReturnPct <= 15}
        compare={scenarioB ? `B: ${plBReturnPct.toFixed(1)}%` : undefined}
      />
    </div>
  );
}

function PLCard({ label, value, desc, positive, compare }: {
  label: string; value: string; desc: string; positive?: boolean; compare?: string;
}) {
  const valColor = positive === true ? 'text-green' : positive === false ? 'text-red' : 'text-text';
  return (
    <div>
      <div className="text-[11px] text-text-muted mb-0.5">{label}</div>
      <div className={`text-xl font-bold ${valColor}`}>{value}</div>
      <div className="text-[10px] text-text-faint mt-px">{desc}</div>
      {compare && <div className="text-[11px] text-orange mt-1 font-semibold">{compare}</div>}
    </div>
  );
}
