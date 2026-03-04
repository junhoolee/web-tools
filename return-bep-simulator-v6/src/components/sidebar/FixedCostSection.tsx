import type { SimulatorInputs, SimulatorAction } from '../../types/simulator';
import FieldInput from '../shared/FieldInput';

interface Props {
  inputs: SimulatorInputs;
  dispatch: React.Dispatch<SimulatorAction>;
  contribPerUnit: number;
  bepVol: number | null;
}

export default function FixedCostSection({ inputs, dispatch, contribPerUnit, bepVol }: Props) {
  const hasFC = (inputs.fixedCost || 0) > 0;

  return (
    <div className="mb-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-[10px] p-[14px_14px_10px]">
      <div className="text-[13px] font-bold text-green-dark tracking-[0.2px] mb-3 pb-[7px] border-b border-[#bbf7d0]">
        고정비 (v6)
      </div>
      <FieldInput
        label="월 고정비"
        unit="$/월"
        value={inputs.fixedCost}
        onChange={v => dispatch({ type: 'SET_FIELD', field: 'fixedCost', value: v })}
        step={1000}
        min={0}
        tooltip={{
          title: '월 고정비 (Monthly Fixed Cost)',
          body: '매월 판매량과 무관하게 발생하는 고정 비용(인건비, 임대료, SaaS 구독료, 보험 등).<br>▸ 영향: P&L 순이익에서 차감 / BEP 판매량 역산 기준',
          analogy: '매달 나가는 월세처럼, 손님이 한 명도 안 와도 반드시 내야 하는 고정 지출.',
        }}
      />
      {hasFC && (
        <div className="bg-white border border-[#e8ecf2] rounded-md p-[10px_12px] mt-2">
          <div className="flex justify-between text-xs mb-0.5">
            <span className="text-text-muted">건당 공헌이익</span>
            <span className="font-semibold text-blue text-[13px]">${contribPerUnit.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-text-muted">BEP 판매량</span>
            <span className={`font-semibold text-[13px] ${contribPerUnit <= 0 ? 'text-red' : 'text-blue'}`}>
              {contribPerUnit <= 0 ? '달성 불가' : `${Math.ceil(bepVol!).toLocaleString()} 개/월`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
