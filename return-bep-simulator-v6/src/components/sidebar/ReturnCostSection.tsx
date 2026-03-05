import type { SimulatorInputs, SimulatorAction } from '../../types/simulator';
import FieldInput from '../shared/FieldInput';

interface Props {
  inputs: SimulatorInputs;
  dispatch: React.Dispatch<SimulatorAction>;
  totalCost: number;
  totalCostB: number | null;
}

export default function ReturnCostSection({ inputs, dispatch, totalCost, totalCostB }: Props) {
  const d = (field: keyof SimulatorInputs) => (v: number) =>
    dispatch({ type: 'SET_FIELD', field, value: v });

  return (
    <div className="mb-3 bg-bg border border-[#eef1f6] rounded-[10px] p-[14px_14px_10px]">
      <div className="flex items-center justify-between text-[13px] font-bold text-text tracking-[0.2px] mb-3 pb-[7px] border-b border-border">
        <span>반품 비용 <span className="text-red font-normal">(−)</span></span>
        <span className="flex items-baseline gap-1.5">
          <span className="text-[10px] text-text-faint font-normal">매출원가 포함</span>
          <span className="text-red text-[12px]">${totalCost.toFixed(0)}</span>
          {totalCostB !== null && <span className="text-orange text-[12px]">/ ${totalCostB.toFixed(0)}</span>}
        </span>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <FieldInput label="배송비 (왕복)" unit="$" value={inputs.ship} onChange={d('ship')} step={5}
            tooltip={{ title: '배송비 (Round-trip Shipping)', body: '반품 1건당 왕복 운송비. 소비자 회수 + 창고 입고까지의 물류 비용입니다.<br>▸ 영향: 반품 손실(L) 직접 증가, BEP 하락<br>▸ 기준: UPS/FedEx 편도 $12~18 합산', analogy: '헛걸음 택배처럼, 물건이 돌아오면 배달기사가 두 번 움직인 기름값을 내가 떠안는다.' }} />
        </div>
        <div className="flex-1">
          <FieldInput label="검수/재입고비" unit="$" value={inputs.labor} onChange={d('labor')} step={5}
            tooltip={{ title: '검수/재입고비 (Inspection & Restocking)', body: '반품 제품의 상태 확인, 분류, 재포장, 재고 업데이트 인건비입니다.<br>▸ 영향: 반품 손실(L) 직접 증가, BEP 하락<br>▸ 기준: 3PL 창고 반품 처리 단가 $15~25', analogy: '공항 입국심사처럼, 반품 상품도 재입고 전 \'신원 확인\'을 거쳐야 하고 그 인건비가 원가에 얹힌다.' }} />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <FieldInput label="포장재 손실" unit="$" value={inputs.pack} onChange={d('pack')} step={5}
            tooltip={{ title: '포장재 손실 (Packaging Loss)', body: '개봉 시 손상/재사용 불가된 포장재 원가 손실.<br>▸ 영향: L 직접 증가, BEP 하락', analogy: '생일 케이크 상자처럼, 한 번 뜯으면 원래대로 돌아갈 수 없다.' }} />
        </div>
        <div className="flex-1">
          <FieldInput label="리퍼브 비용" unit="$/건" value={inputs.refurbCost}
            onChange={d('refurbCost')} step={5} min={0}
            tooltip={{ title: '리퍼브 비용 (Refurbishment Cost)', body: '반품 제품을 재정비하여 재판매 가능 상태로 만드는 데 드는 비용입니다.', analogy: '중고차 수리비처럼, 재판매 가격을 높이려면 먼저 수리비를 투자해야 한다.' }} />
        </div>
      </div>
    </div>
  );
}
