import type { SimulatorInputs, SimulatorDerived } from '../../types/simulator';
import MetricCards from '../main/MetricCards';
import PLPanel from '../main/PLPanel';
import ReturnChart from '../main/ReturnChart';
import ProfitChart from '../main/ProfitChart';
import VolumeChart from '../main/VolumeChart';
import CompareTable from '../main/CompareTable';
import SummaryTable from '../main/SummaryTable';

interface Props {
  inputs: SimulatorInputs;
  derived: SimulatorDerived;
}

export default function MainPanel({ inputs, derived }: Props) {
  return (
    <div className="flex-1 p-5 overflow-y-auto">
      {derived.error && (
        <div className="bg-[#fef2f2] border border-[#fecaca] text-red py-2 px-3 rounded-md text-xs mb-[14px]">
          {derived.error}
        </div>
      )}

      {derived.warning && (
        <div className="bg-[#fff7ed] border border-[#fed7aa] text-[#c2410c] py-[10px] px-[14px] rounded-md text-xs mb-[14px] leading-relaxed">
          <strong className="text-[#9a3412]">구조적 적자 경고</strong> — {derived.warning.replace('구조적 적자 경고 — ', '')}
        </div>
      )}

      {!derived.error && (
        <>
          <section className="mb-[14px] border border-border rounded-[12px] p-4 bg-surface">
            <h2 className="text-[15px] font-bold text-text mb-3">임팩트</h2>
            <PLPanel inputs={inputs} derived={derived} />
            <MetricCards derived={derived} />
            <ReturnChart derived={derived} retWindow={inputs.retWindow} />
            <ProfitChart derived={derived} retWindow={inputs.retWindow} />
            <VolumeChart inputs={inputs} derived={derived} />
          </section>
          <CompareTable inputs={inputs} derived={derived} />
          <SummaryTable inputs={inputs} derived={derived} />
        </>
      )}
    </div>
  );
}
