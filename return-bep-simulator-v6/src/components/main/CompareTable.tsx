import type { SimulatorInputs, SimulatorDerived } from '../../types/simulator';
import { wR } from '../../lib/weibull';

interface Props {
  inputs: SimulatorInputs;
  derived: SimulatorDerived;
}

export default function CompareTable({ inputs, derived }: Props) {
  const { scenario, scenarioB } = derived;
  if (!inputs.compareOn || !scenarioB) return null;

  const { G, L, BEP, bd, lam } = scenario;
  const { Gb, Lb, BEPb, bdb } = scenarioB;
  const r30 = wR(30, inputs.Rinf, inputs.k, lam);
  const piGA = (1 - r30 / BEP) * 100;
  const piGB = (1 - r30 / BEPb) * 100;
  const piUnitA = G * (1 - r30 / BEP);
  const piUnitB = Gb * (1 - r30 / BEPb);

  const fmtBd = (b: number | null) => b === null ? '미도달 (안전)' : (b < 1 ? '즉시' : b.toFixed(0) + '일');

  const rows = [
    {
      label: '매출총이익 (G)',
      a: `$${G.toFixed(0)} (${(G / inputs.price * 100).toFixed(1)}%)`,
      b: `$${Gb.toFixed(0)} (${(Gb / inputs.priceB * 100).toFixed(1)}%)`,
      diff: (Gb - G) >= 0 ? `+$${(Gb - G).toFixed(0)}` : `-$${Math.abs(Gb - G).toFixed(0)}`,
      positive: (Gb - G) >= 0,
    },
    {
      label: '반품 손실 (L)',
      a: `$${L.toFixed(0)}`,
      b: `$${Lb.toFixed(0)}`,
      diff: (Lb - L) >= 0 ? `+$${(Lb - L).toFixed(0)}` : `-$${Math.abs(Lb - L).toFixed(0)}`,
      positive: (Lb - L) <= 0,
    },
    {
      label: 'BEP 반품률',
      a: `${(BEP * 100).toFixed(1)}%`,
      b: `${(BEPb * 100).toFixed(1)}%`,
      diff: `${((BEPb - BEP) * 100 >= 0 ? '+' : '')}${((BEPb - BEP) * 100).toFixed(1)}pp`,
      positive: (BEPb - BEP) >= 0,
    },
    { label: 'BEP 반품률 도달일', a: fmtBd(bd), b: fmtBd(bdb), diff: '—', positive: null as boolean | null },
    { label: '30일 반품률', a: `${(r30 * 100).toFixed(1)}%`, b: `${(r30 * 100).toFixed(1)}%`, diff: '동일', positive: null as boolean | null },
    {
      label: '30일 π/G',
      a: `${piGA >= 0 ? '+' : ''}${piGA.toFixed(1)}%`,
      b: `${piGB >= 0 ? '+' : ''}${piGB.toFixed(1)}%`,
      diff: `${(piGB - piGA) >= 0 ? '+' : ''}${(piGB - piGA).toFixed(1)}pp`,
      positive: (piGB - piGA) >= 0,
    },
    {
      label: '30일 건당이익',
      a: `${piUnitA >= 0 ? '+' : ''}$${Math.abs(piUnitA).toFixed(0)}`,
      b: `${piUnitB >= 0 ? '+' : '-'}$${Math.abs(piUnitB).toFixed(0)}`,
      diff: `${(piUnitB - piUnitA) >= 0 ? '+' : '-'}$${Math.abs(piUnitB - piUnitA).toFixed(0)}`,
      positive: (piUnitB - piUnitA) >= 0,
    },
  ];

  return (
    <div className="bg-surface rounded-[10px] p-4 border border-border mb-[14px]">
      <h3 className="text-[13px] font-semibold text-text mb-[10px]">시나리오 A vs B 비교</h3>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="text-left py-[7px] px-[10px] border-b-2 border-border text-text-muted font-semibold text-[11px]">지표</th>
            <th className="text-left py-[7px] px-[10px] border-b-2 border-border text-blue font-semibold text-[11px]">시나리오 A</th>
            <th className="text-left py-[7px] px-[10px] border-b-2 border-border text-orange font-semibold text-[11px]">시나리오 B</th>
            <th className="text-left py-[7px] px-[10px] border-b-2 border-border text-text-muted font-semibold text-[11px]">차이</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => {
            const diffCls = r.positive === null ? '' : r.positive ? 'text-[#22c55e] font-semibold' : 'text-[#ef4444] font-semibold';
            return (
              <tr key={r.label}>
                <td className="py-[7px] px-[10px] border-b border-border-light"><strong>{r.label}</strong></td>
                <td className="py-[7px] px-[10px] border-b border-border-light text-blue font-semibold">{r.a}</td>
                <td className="py-[7px] px-[10px] border-b border-border-light text-orange font-semibold">{r.b}</td>
                <td className={`py-[7px] px-[10px] border-b border-border-light ${diffCls}`}>{r.diff}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
