import { useState } from 'react';
import type { SimulatorInputs, SimulatorAction } from '../../types/simulator';
import FieldInput from '../shared/FieldInput';

interface Props {
  inputs: SimulatorInputs;
  dispatch: React.Dispatch<SimulatorAction>;
}

export default function CxvSection({ inputs, dispatch }: Props) {
  const [guideOpen, setGuideOpen] = useState(false);

  const d = (field: keyof SimulatorInputs) => (v: number) =>
    dispatch({ type: 'SET_FIELD', field, value: v });

  const retention = inputs.cxvRepurchase / 100;
  const clv = inputs.cxvClv;
  const attribution = inputs.cxvPremium / 100;
  const recommended = retention * clv * attribution;
  const hasClv = clv > 0;

  return (
    <div className="mb-3 bg-bg border border-[#eef1f6] rounded-[10px] p-[14px_14px_10px]">
      <div className="text-[13px] font-bold text-text tracking-[0.2px] mb-3 pb-[7px] border-b border-border">
        정성적 고객 가치
      </div>
      <FieldInput
        label="고객경험 가치 (CXV)"
        unit="$/건"
        value={inputs.cxv}
        onChange={d('cxv')}
        step={5}
        min={0}
        tooltip={{
          title: '고객경험 가치 (Customer Experience Value)',
          body: '관대한 반품 정책이 만드는 무형의 고객 가치를 금액으로 환산한 값입니다. 반품 손실(L)에서 차감되어 BEP를 개선합니다.<br><br><strong>포함 항목:</strong><br>▸ 재구매율 상승<br>▸ 브랜드 신뢰도<br>▸ 입소문 효과<br>▸ 고객 이탈 비용 절감<br><br>▸ 기본값: $0 (보수적). 휴리스틱: 판매가의 5~15%',
          analogy: '면세점 VIP 라운지처럼, 당장 수익은 아니지만 \'여기서 사면 안심\' 이라는 신뢰가 장기 매출로 돌아온다.',
        }}
      />

      <div
        className={`flex items-center gap-[6px] mt-2 py-[6px] cursor-pointer text-[11px] text-[#92400e] font-semibold select-none`}
        onClick={() => setGuideOpen(!guideOpen)}
      >
        <span className={`inline-block text-[10px] transition-transform ${guideOpen ? 'rotate-90' : ''}`}>▶</span>
        CXV 추천값 가이드
      </div>

      {guideOpen && (
        <div className="mt-[6px] p-[10px_12px] bg-white border border-[#fde68a] rounded-md">
          <div className="mb-[6px]">
            <FieldInput label="Δ_retention 리텐션 증가분" unit="%" value={inputs.cxvRepurchase}
              onChange={d('cxvRepurchase')} step={1} min={0} max={100}
              tooltip={{
                title: 'Δ_retention 리텐션 증가분',
                body: '관대한 반품 정책으로 인해 추가로 재구매하는 고객 비율입니다. 예: 10%이면 반품 고객 100명 중 10명이 추가 재구매합니다.<br><br>▸ 보수적: 5%<br>▸ 중립적: 10%<br>▸ 적극적: 15%',
                analogy: '무료 반품 정책을 본 고객이 "이 가게는 안심이네" 하고 다시 찾아오는 비율.',
              }}
            />
          </div>
          <div className="mb-[6px]">
            <FieldInput label="고객 생애 가치 (CLV)" unit="$" value={inputs.cxvClv}
              onChange={d('cxvClv')} step={50} min={0}
              tooltip={{
                title: '고객 생애 가치 (Customer Lifetime Value)',
                body: '한 고객이 전체 거래 기간 동안 가져다주는 총 수익입니다. 재구매 횟수 × 건당 이익으로 추정합니다.<br><br>▸ 프리미엄 아이웨어: $1,000~$3,000<br>▸ 일반 패션: $300~$800',
                analogy: '단골 고객 한 명이 앞으로 얼마나 더 사 줄지에 대한 기대값.',
              }}
            />
          </div>
          <div className="mb-[6px]">
            <FieldInput label="Attribution Factor 귀인 계수" unit="%" value={inputs.cxvPremium}
              onChange={d('cxvPremium')} step={5} min={0} max={100}
              tooltip={{
                title: 'Attribution Factor 귀인 계수',
                body: '반품 정책 개선이 재구매에 기여한 비율입니다. 100%이면 재구매 증가분 전부가 반품 정책 덕분이라는 의미.<br><br>▸ 보수적: 30% (다른 요인도 많다)<br>▸ 중립적: 40%<br>▸ 적극적: 50% (반품 정책이 핵심 차별점)',
                analogy: '팀 승리에서 에이스 투수의 기여도처럼, 재구매 증가를 반품 정책에 얼마나 귀속시킬지의 비율.',
              }}
            />
          </div>

          <div className="flex gap-1 mb-2">
            {[
              { label: '보수적', ret: 5, att: 30 },
              { label: '중립적', ret: 10, att: 40 },
              { label: '적극적', ret: 15, att: 50 },
            ].map(p => {
              const isActive = inputs.cxvRepurchase === p.ret && inputs.cxvPremium === p.att;
              return (
                <button key={p.label}
                  onClick={() => dispatch({ type: 'SET_CXV_PRESET', retention: p.ret, attribution: p.att })}
                  className={`flex-1 py-1 px-[6px] text-[10px] border rounded cursor-pointer transition-colors ${isActive ? 'font-bold border-[#d97706] bg-[#fbbf24] text-[#78350f] shadow-sm' : 'border-[#fde68a] bg-white text-[#92400e] hover:bg-[#fffbeb]'}`}>
                  {p.label}
                </button>
              );
            })}
          </div>

          {hasClv ? (
            <div className="flex justify-between items-center mt-2 p-[8px_10px] bg-[#fef3c7] rounded-md">
              <div className="flex-1">
                <div className="text-[11px] text-[#78350f]">CXV 추천값</div>
                <div className="text-base font-bold text-[#92400e]">${recommended.toFixed(2)}</div>
                <div className="text-[10px] text-[#a16207] font-mono mt-0.5">
                  {(retention * 100).toFixed(0)}% × ${clv.toLocaleString()} × {(attribution * 100).toFixed(0)}% = ${recommended.toFixed(2)}
                </div>
              </div>
              <button
                onClick={() => dispatch({ type: 'APPLY_CXV_RECOMMEND' })}
                className="py-[5px] px-3 border border-[#d97706] rounded-md bg-[#fbbf24] text-[#78350f] text-[11px] font-semibold cursor-pointer hover:bg-[#f59e0b] transition-all"
              >
                추천값 적용
              </button>
            </div>
          ) : (
            <div className="text-[11px] text-[#92400e] mt-[6px] p-[6px_8px] bg-[#fef9c3] rounded">
              CLV(고객 생애 가치)를 입력하면 CXV 추천값이 계산됩니다. 아직 CLV 데이터가 없으면 CXV 필드에 직접 입력하세요.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
