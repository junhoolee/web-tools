import type { SimulatorInputs, SimulatorAction } from '../../types/simulator';
import FieldInput from '../shared/FieldInput';

interface Props {
  inputs: SimulatorInputs;
  dispatch: React.Dispatch<SimulatorAction>;
}

export default function WeibullSection({ inputs, dispatch }: Props) {
  const d = (field: keyof SimulatorInputs) => (v: number) =>
    dispatch({ type: 'SET_FIELD', field, value: v });

  return (
    <div className="mb-3 bg-bg border border-[#eef1f6] rounded-[10px] p-[14px_14px_10px]">
      <div className="text-[13px] font-bold text-text tracking-[0.2px] mb-3 pb-[7px] border-b border-border">
        반품 모델 (Weibull)
      </div>
      <div className="mb-2">
        <label className="text-xs text-text-secondary mb-0.5 block">카테고리 프리셋</label>
        <select
          value={inputs.category}
          onChange={e => dispatch({ type: 'SET_CATEGORY', category: e.target.value })}
          className="w-full py-[7px] px-[10px] border border-border rounded-md text-[13px] outline-none bg-white focus:border-blue"
        >
          <option value="electronics">전자기기 (초기 집중형, k=1.5)</option>
          <option value="hybrid">하이브리드 (아이웨어+전자기기, k=1.3)</option>
          <option value="eyewear">아이웨어 (이중 파형, k=1.1)</option>
          <option value="fashion">패션웨어 (분산형, k=0.85)</option>
          <option value="custom">직접 입력</option>
        </select>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <FieldInput label="R∞ 최대 반품률" unit="%" value={inputs.Rinf * 100}
            onChange={v => dispatch({ type: 'SET_FIELD', field: 'Rinf', value: v / 100 })}
            step={1} min={1} max={95}
            tooltip={{ title: 'R∞ 최대 반품률 (Asymptotic Return Rate)', body: '시간이 무한히 흐를 때 도달하는 이론적 최대 반품률. Weibull CDF의 점근선입니다.<br>▸ 영향: 각 시점 반품률, λ 역산, 곡선 형태', analogy: '수조의 만수위선처럼, R∞는 반품이 차오를 수 있는 최대 수위다.' }} />
        </div>
        <div className="flex-1">
          <FieldInput label="k 형상 파라미터" value={inputs.k}
            onChange={d('k')} step={0.05} min={0.1} max={5}
            tooltip={{ title: 'k 형상 파라미터 (Weibull Shape)', body: '반품이 시간축에서 어떻게 집중되는지 결정. k>1이면 초반 집중, k<1이면 장기 분산.', analogy: '버스 파업 뉴스처럼, k가 크면 당일 민원 폭주 후 잠잠, k가 작으면 며칠에 걸쳐 드문드문 불평.' }} />
        </div>
      </div>
      <FieldInput label="14일 기준 반품률" unit="%" value={inputs.r14 * 100}
        onChange={v => dispatch({ type: 'SET_FIELD', field: 'r14', value: v / 100 })}
        step={1} min={1} max={90}
        tooltip={{ title: 'r14 기준 반품률 (14-day Observed Rate)', body: '구매 후 14일 시점의 실측 누적 반품률. R∞·k와 함께 λ(척도 파라미터)를 역산합니다.', analogy: '검진 중간 결과지처럼, 14일 차 수치 하나로 전체 반품 곡선의 \'속도\'를 역추적하는 단서.' }} />
    </div>
  );
}
