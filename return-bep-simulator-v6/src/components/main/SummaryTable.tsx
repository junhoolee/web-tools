import type { SimulatorDerived, SimulatorInputs } from '../../types/simulator';
import { wR } from '../../lib/weibull';

interface Props {
  inputs: SimulatorInputs;
  derived: SimulatorDerived;
}

const PERIODS = [7, 14, 21, 30, 45, 60, 90];

export default function SummaryTable({ inputs, derived }: Props) {
  const { scenario, scenarioB } = derived;
  const { lam, BEP, G } = scenario;
  // Reconstruct Rinf from inputs
  const rinfVal = inputs.Rinf;
  const r14val = wR(14, rinfVal, inputs.k, lam);

  if (inputs.compareOn && scenarioB) {
    return (
      <div className="bg-surface rounded-[10px] p-4 border border-border mb-[14px]">
        <h3 className="text-[13px] font-semibold text-text mb-[10px]">주요 기간별 수치</h3>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th rowSpan={2} className="text-left py-[7px] px-[10px] border-b-2 border-border text-text-muted font-semibold text-[11px] align-bottom">반품기간</th>
              <th rowSpan={2} className="text-left py-[7px] px-[10px] border-b-2 border-border text-text-muted font-semibold text-[11px] align-bottom">반품률</th>
              <th colSpan={2} className="text-center py-[7px] px-[10px] border-b border-[#bfdbfe] bg-[#eff6ff] text-blue font-semibold text-[11px]">시나리오 A</th>
              <th colSpan={2} className="text-center py-[7px] px-[10px] border-b border-[#fed7aa] bg-[#fff7ed] text-orange font-semibold text-[11px]">시나리오 B</th>
            </tr>
            <tr>
              <th className="text-left py-[7px] px-[10px] bg-[#eff6ff] text-text-muted font-semibold text-[11px]">π/G</th>
              <th className="text-left py-[7px] px-[10px] bg-[#eff6ff] text-text-muted font-semibold text-[11px]">건당이익</th>
              <th className="text-left py-[7px] px-[10px] bg-[#fff7ed] text-text-muted font-semibold text-[11px]">π/G</th>
              <th className="text-left py-[7px] px-[10px] bg-[#fff7ed] text-text-muted font-semibold text-[11px]">건당이익</th>
            </tr>
          </thead>
          <tbody>
            {PERIODS.map(d => {
              const r = wR(d, rinfVal, inputs.k, lam);
              const piGA = (1 - r / BEP) * 100;
              const piUnitA = G * (1 - r / BEP);
              const piGB = (1 - r / scenarioB.BEPb) * 100;
              const piUnitB = scenarioB.Gb * (1 - r / scenarioB.BEPb);
              const clsA = piGA > 2 ? 'text-green font-semibold' : piGA < -2 ? 'text-red font-semibold' : '';
              const clsB = piGB > 2 ? 'text-green font-semibold' : piGB < -2 ? 'text-red font-semibold' : '';
              const isBep = Math.abs(piGA) <= 2 || Math.abs(piGB) <= 2;
              return (
                <tr key={d} className={isBep ? 'bg-[#fef3c7]' : ''}>
                  <td className="py-[7px] px-[10px] border-b border-border-light font-bold">{d}일</td>
                  <td className="py-[7px] px-[10px] border-b border-border-light">{(r * 100).toFixed(1)}%</td>
                  <td className={`py-[7px] px-[10px] border-b border-border-light ${clsA}`}>{piGA >= 0 ? '+' : ''}{piGA.toFixed(1)}%</td>
                  <td className={`py-[7px] px-[10px] border-b border-border-light ${clsA}`}>${piUnitA.toFixed(0)}</td>
                  <td className={`py-[7px] px-[10px] border-b border-border-light ${clsB}`}>{piGB >= 0 ? '+' : ''}{piGB.toFixed(1)}%</td>
                  <td className={`py-[7px] px-[10px] border-b border-border-light ${clsB}`}>${piUnitB.toFixed(0)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-[10px] p-4 border border-border mb-[14px]">
      <h3 className="text-[13px] font-semibold text-text mb-[10px]">주요 기간별 수치</h3>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="text-left py-[7px] px-[10px] border-b-2 border-border text-text-muted font-semibold text-[11px]">반품기간</th>
            <th className="text-left py-[7px] px-[10px] border-b-2 border-border text-text-muted font-semibold text-[11px]">누적 반품률</th>
            <th className="text-left py-[7px] px-[10px] border-b-2 border-border text-text-muted font-semibold text-[11px]">Δr (vs 14일)</th>
            <th className="text-left py-[7px] px-[10px] border-b-2 border-border text-text-muted font-semibold text-[11px]">π/G 수익률</th>
            <th className="text-left py-[7px] px-[10px] border-b-2 border-border text-text-muted font-semibold text-[11px]">건당 순이익</th>
            <th className="text-left py-[7px] px-[10px] border-b-2 border-border text-text-muted font-semibold text-[11px]">상태</th>
          </tr>
        </thead>
        <tbody>
          {PERIODS.map(d => {
            const r = wR(d, rinfVal, inputs.k, lam);
            const delta = r - r14val;
            const piG = (1 - r / BEP) * 100;
            const piUnit = G * (1 - r / BEP);
            const cls = piG > 2 ? 'text-green font-semibold' : piG < -2 ? 'text-red font-semibold' : '';
            const status = piG > 2 ? '흑자' : piG < -2 ? '적자' : 'BEP 근접';
            const isBep = Math.abs(piG) <= 2;
            return (
              <tr key={d} className={isBep ? 'bg-[#fef3c7]' : ''}>
                <td className="py-[7px] px-[10px] border-b border-border-light font-bold">{d}일</td>
                <td className="py-[7px] px-[10px] border-b border-border-light">{(r * 100).toFixed(1)}%</td>
                <td className="py-[7px] px-[10px] border-b border-border-light">{d === 14 ? '-' : (delta >= 0 ? '+' : '') + (delta * 100).toFixed(1) + 'pp'}</td>
                <td className={`py-[7px] px-[10px] border-b border-border-light ${cls}`}>{piG >= 0 ? '+' : ''}{piG.toFixed(1)}%</td>
                <td className={`py-[7px] px-[10px] border-b border-border-light ${cls}`}>${piUnit.toFixed(0)}</td>
                <td className="py-[7px] px-[10px] border-b border-border-light">{status}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
