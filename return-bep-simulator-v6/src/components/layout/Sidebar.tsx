import type { SimulatorInputs, SimulatorAction, SimulatorDerived } from '../../types/simulator';
import MarginSection from '../sidebar/MarginSection';
import ReturnPolicySection from '../sidebar/ReturnPolicySection';
import ReturnCostSection from '../sidebar/ReturnCostSection';
import ReturnRecoverySection from '../sidebar/ReturnRecoverySection';
import ReasonSegmentation from '../sidebar/ReasonSegmentation';
import WeibullSection from '../sidebar/WeibullSection';
import VolumeSection from '../sidebar/VolumeSection';

import FormulaReference from '../sidebar/FormulaReference';

interface Props {
  inputs: SimulatorInputs;
  dispatch: React.Dispatch<SimulatorAction>;
  derived: SimulatorDerived;
  onHelpOpen: () => void;
  onTornadoOpen: () => void;
}

export default function Sidebar({ inputs, dispatch, derived, onHelpOpen, onTornadoOpen }: Props) {
  const { scenario } = derived;

  return (
    <div className="w-[320px] bg-surface border-r border-border p-5 overflow-y-auto shrink-0 max-desktop:w-full max-desktop:border-r-0 max-desktop:border-b max-desktop:border-border">
      <div className="flex items-center gap-2">
        <h1 className="text-[17px] font-bold mb-0.5">반품 BEP 시뮬레이터 v6</h1>
        <button
          onClick={onHelpOpen}
          className="w-[22px] h-[22px] rounded-full border-[1.5px] border-text-faint bg-white text-text-muted text-xs font-bold cursor-pointer flex items-center justify-center shrink-0 hover:bg-blue hover:text-white hover:border-blue transition-all"
          title="도움말"
        >
          ?
        </button>
      </div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs text-text-muted">변수를 조정하여 BEP 반품률과 수익률을 실시간 시뮬레이션</p>
        {derived.tornadoResults.length > 0 && (
          <button
            onClick={onTornadoOpen}
            className="shrink-0 py-1 px-2 text-[10px] font-semibold text-blue border border-blue rounded-md bg-white cursor-pointer hover:bg-blue hover:text-white transition-all"
            title="민감도 분석 (Tornado Chart)"
          >
            민감도
          </button>
        )}
      </div>

      <MarginSection inputs={inputs} dispatch={dispatch} marginPct={scenario.marginPct} />
      <ReturnPolicySection inputs={inputs} dispatch={dispatch} />

      <ReturnCostSection inputs={inputs} dispatch={dispatch} />
      <ReturnRecoverySection inputs={inputs} dispatch={dispatch} displayL={'$' + scenario.L.toFixed(0)} />
      <ReasonSegmentation inputs={inputs} dispatch={dispatch} reasonBreakdown={scenario.reasonBreakdown} />

      <WeibullSection inputs={inputs} dispatch={dispatch} />
      <VolumeSection inputs={inputs} dispatch={dispatch} vol={scenario.vol} />
      <FormulaReference />
    </div>
  );
}
