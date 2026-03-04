import type { SimulatorInputs, SimulatorAction } from '../../types/simulator';
import FieldInput from '../shared/FieldInput';

interface Props {
  inputs: SimulatorInputs;
  dispatch: React.Dispatch<SimulatorAction>;
}

export default function ReturnPolicySection({ inputs, dispatch }: Props) {
  return (
    <div className="mb-3 bg-bg border border-[#eef1f6] rounded-[10px] p-[14px_14px_10px]">
      <div className="text-[13px] font-bold text-text tracking-[0.2px] mb-3 pb-[7px] border-b border-border">
        반품 정책
      </div>
      <FieldInput
        label="반품허용기간"
        unit="일"
        value={inputs.retWindow}
        onChange={v => dispatch({ type: 'SET_FIELD', field: 'retWindow', value: v })}
        step={1}
        min={1}
        max={365}
        tooltip={{
          title: '반품허용기간 (Return Window)',
          body: '소비자가 반품 가능한 정책 기간. 반품률, 판매량, P&L에 동시 영향을 미치는 가장 강력한 정책 레버입니다.<br>▸ 영향: Weibull 기간 내 반품률 / 탄력성 통한 판매량 / 총 반품 건수 변동<br>▸ 기준: 30일 — e-커머스 업계 표준 정책',
          analogy: '수영장 무료 체험처럼, 이용 기간이 짧으면 망설이다 등록을 안 한다.',
        }}
      />
    </div>
  );
}
