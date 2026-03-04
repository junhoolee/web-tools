import type { SimulatorDerived } from '../../types/simulator';
import SafetyGauge from './SafetyGauge';

interface Props {
  derived: SimulatorDerived;
}

function cardClass(type: string) {
  if (type === 'positive') return 'text-green';
  if (type === 'negative') return 'text-red';
  if (type === 'warn') return 'text-amber';
  return 'text-blue';
}

export default function MetricCards({ derived }: Props) {
  const { scenario, scenarioB, safetyPP } = derived;
  const { G, L, BEP, bd } = scenario;
  const rinfFromInputs = BEP - safetyPP / 100;

  const bepColor = BEP > 0.45 ? 'positive' : BEP > 0.25 ? 'warn' : 'negative';
  const dayColor = bd === null ? 'positive' : bd <= 30 ? 'negative' : 'warn';

  const fmtBd = (b: number | null) => {
    if (b === null) return '미도달';
    if (b < 1) return '즉시';
    return b.toFixed(0) + '일';
  };

  const fmtBdDesc = (b: number | null) => {
    if (b === null) return '90일 내 BEP 반품률 미도달 (안전)';
    if (b < 1) return '판매 즉시 반품률이 BEP 초과';
    if (b <= 14) return '14일 이내 BEP 반품률 도달';
    if (b <= 30) return '30일 이내 BEP 반품률 도달';
    return b.toFixed(0) + '일 후 BEP 반품률 도달';
  };

  return (
    <div className="grid gap-3 mb-5 grid-cols-5 max-desktop:grid-cols-2">
      <Card label="G 매출 총이익 /건" value={'$' + G.toFixed(0)} desc="판매가 - 매출원가" colorType="neutral"
        compare={scenarioB ? `B: $${scenarioB.Gb.toFixed(0)} (${scenarioB.marginBPct}%)` : undefined} />

      <Card label="L 반품 손실 /건" value={'$' + L.toFixed(0)} desc={`L/G = ${(L / G).toFixed(2)}`}
        colorType={L > G ? 'negative' : 'neutral'}
        compare={scenarioB ? `B: $${scenarioB.Lb.toFixed(0)}` : undefined} />

      <Card label="BEP 반품률" value={(BEP * 100).toFixed(1) + '%'} desc={`L/G = ${(L / G).toFixed(2)}`}
        colorType={bepColor}
        compare={scenarioB ? `B: ${(scenarioB.BEPb * 100).toFixed(1)}%` : undefined} />

      <Card label="BEP 반품률 도달일" value={fmtBd(bd)} desc={fmtBdDesc(bd)} colorType={dayColor}
        compare={scenarioB ? `B: ${fmtBd(scenarioB.bdb)}` : undefined} />

      <div className="bg-surface rounded-[10px] p-[14px] border border-border">
        <div className="text-[11px] text-text-muted mb-0.5">안전마진</div>
        <SafetyGauge safetyPP={safetyPP} rinf={rinfFromInputs} bep={BEP} />
      </div>
    </div>
  );
}

function Card({ label, value, desc, colorType, compare }: {
  label: string; value: string; desc: string; colorType: string; compare?: string;
}) {
  return (
    <div className="bg-surface rounded-[10px] p-[14px] border border-border">
      <div className="text-[11px] text-text-muted mb-0.5">{label}</div>
      <div className={`text-[22px] font-bold ${cardClass(colorType)}`}>{value}</div>
      <div className="text-[11px] text-text-faint mt-px">{desc}</div>
      {compare && <div className="text-[11px] text-orange mt-1 font-semibold">{compare}</div>}
    </div>
  );
}
