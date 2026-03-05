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
  onUncertaintyOpen: () => void;
}

export default function MainPanel({ inputs, derived, onUncertaintyOpen }: Props) {
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
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-bold text-text">임팩트</h2>
              <button
                onClick={onUncertaintyOpen}
                className="flex items-center gap-1 py-[5px] px-[10px] text-[11px] font-semibold border rounded-md cursor-pointer transition-all text-text-secondary border-border bg-white hover:bg-border-light"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="12" width="4" height="9" rx="1" />
                  <rect x="10" y="5" width="4" height="16" rx="1" />
                  <rect x="17" y="9" width="4" height="12" rx="1" />
                </svg>
                불확실성 분석{inputs.compareOn && <span className="text-orange"> (A/B)</span>}
              </button>
            </div>
            <PLPanel derived={derived} />
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
