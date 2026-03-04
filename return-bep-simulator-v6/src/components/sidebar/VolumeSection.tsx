import type { SimulatorInputs, SimulatorAction, VolumeResult } from '../../types/simulator';
import FieldInput from '../shared/FieldInput';

interface Props {
  inputs: SimulatorInputs;
  dispatch: React.Dispatch<SimulatorAction>;
  vol: VolumeResult;
}

export default function VolumeSection({ inputs, dispatch, vol }: Props) {
  const d = (field: keyof SimulatorInputs) => (v: number) =>
    dispatch({ type: 'SET_FIELD', field, value: v });

  const baseVol = inputs.baseVol > 0 ? inputs.baseVol : 1000;
  const volPct = ((vol.adjVol - baseVol) / baseVol * 100);
  let volText = Math.round(vol.adjVol).toLocaleString() + ' 개/월';
  if (Math.abs(volPct) >= 0.5) {
    volText += ' (' + (volPct > 0 ? '▲' : '▼') + Math.abs(volPct).toFixed(0) + '%)';
  }

  return (
    <div className="mb-3 bg-bg border border-[#eef1f6] rounded-[10px] p-[14px_14px_10px]">
      <div className="text-[13px] font-bold text-text tracking-[0.2px] mb-3 pb-[7px] border-b border-border">
        판매량 모델 (탄력성)
      </div>
      <FieldInput label="기준 판매량" unit="개/월" value={inputs.baseVol} onChange={d('baseVol')} step={100} min={0}
        tooltip={{ title: '기준 판매량 (Base Volume)', body: '참조 조건(판매가 $550, 반품기간 30일)에서의 월 판매량. 탄력성 모델의 기준점입니다.', analogy: '체중계의 \'표준 체중\'처럼, 모든 변화를 이 기준 대비로 환산한다.' }} />
      <div className="flex gap-2">
        <div className="flex-1">
          <FieldInput label="가격 탄력성 (εp)" value={inputs.priceElast} onChange={d('priceElast')} step={0.1}
            tooltip={{ title: 'εp 가격 탄력성 (Price Elasticity)', body: '가격 변화 대비 수요 변화 민감도. 음수 = 가격↑ 수요↓.', analogy: '고무줄에 묶인 돌멩이처럼, 가격을 올리면 수요가 더 크게 반대로 튕겨나간다.' }} />
        </div>
        <div className="flex-1">
          <FieldInput label="반품기간 탄력성 (εw)" value={inputs.retElast} onChange={d('retElast')} step={0.05}
            tooltip={{ title: 'εw 반품기간 탄력성 (Window Elasticity)', body: '반품기간 변화 대비 판매량 변화 민감도. 양수 = 기간↑ 판매↑.', analogy: '온천 온도처럼, 조금 더 따뜻하면 손님이 살짝 더 오지만 주된 이유는 아니다.' }} />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <FieldInput label="비용 규모효과 (α)" value={inputs.costScale} onChange={d('costScale')} step={0.05}
            tooltip={{ title: 'α 비용 규모효과 (Cost Scale Effect)', body: '판매량 변화 대비 단위 원가 변화. 음수 = 물량↑ 단가↓.', analogy: '대량 구매 할인처럼, 물량이 늘면 단가가 깎인다.' }} />
        </div>
        <div className="flex-1">
          <FieldInput label="잔존가치 규모효과 (β)" value={inputs.salvScale} onChange={d('salvScale')} step={0.05}
            tooltip={{ title: 'β 잔존가치 규모효과 (Salvage Scale Effect)', body: '판매량 변화 대비 잔존가치 회수율 변화. 양수 = 물량↑ 회수율↑.', analogy: '중고차 딜러 경매처럼, 매물이 많으면 입찰 경쟁이 붙고 대당 낙찰가가 올라간다.' }} />
        </div>
      </div>
    </div>
  );
}
