import { useState } from 'react';
import type { SimulatorInputs, SimulatorAction, RecoveryPath } from '../../types/simulator';
import FieldInput from '../shared/FieldInput';

interface Props {
  inputs: SimulatorInputs;
  dispatch: React.Dispatch<SimulatorAction>;
  displayL: string;
}

export default function ReturnRecoverySection({ inputs, dispatch, displayL }: Props) {
  const [guideOpen, setGuideOpen] = useState(false);

  const d = (field: keyof SimulatorInputs) => (v: number) =>
    dispatch({ type: 'SET_FIELD', field, value: v });

  const path = inputs.recoveryPath;
  const isSalvage = path === 'salvage';
  const isRefurb = path === 'refurb';
  const isMixed = path === 'mixed';

  const paths: { value: RecoveryPath; id: string; label: string; desc: string }[] = [
    { value: 'salvage', id: 'rp-salvage', label: '경로 1: 부품/벌크 매각', desc: '잔존가치로 L 차감' },
    { value: 'refurb', id: 'rp-refurb', label: '경로 2: 리퍼브 재판매', desc: '원가 회수 - 리퍼브 비용' },
    { value: 'mixed', id: 'rp-mixed', label: '경로 3: 혼합', desc: '두 경로 비율 분배' },
  ];

  const descL = isSalvage ? '매출원가 + 운영비 - 잔존가치 - CXV'
    : isRefurb ? '매출원가 × (1-회수율) + 운영비 + 리퍼브비 - CXV'
    : '매각/리퍼브 혼합 비율 적용 - CXV';

  const retention = inputs.cxvRepurchase / 100;
  const clv = inputs.cxvClv;
  const attribution = inputs.cxvPremium / 100;
  const recommended = retention * clv * attribution;
  const hasClv = clv > 0;

  return (
    <div className="mb-3 bg-bg border border-[#eef1f6] rounded-[10px] p-[14px_14px_10px]">
      <div className="text-[13px] font-bold text-text tracking-[0.2px] mb-3 pb-[7px] border-b border-border">
        반품 회수
      </div>

      {/* 회수 경로 선택 */}
      <div className="text-xs font-semibold text-text-secondary mb-2">회수 경로</div>
      <div className="mb-2">
        {paths.map(p => (
          <label
            key={p.value}
            className={`flex items-center gap-2 py-[6px] px-[10px] rounded-md cursor-pointer text-xs transition-colors mb-0.5 ${path === p.value ? 'bg-[#eff6ff] text-[#1e40af] font-semibold' : 'text-text-secondary hover:bg-border-light'}`}
          >
            <input
              type="radio"
              name="recoveryPath"
              value={p.value}
              checked={path === p.value}
              onChange={() => dispatch({ type: 'SET_RECOVERY_PATH', path: p.value })}
              className="accent-blue m-0"
            />
            <span className="flex-1">
              {p.label}<br />
              <span className="text-[10px] text-text-faint font-normal">{p.desc}</span>
            </span>
          </label>
        ))}
      </div>

      {/* 경로 1: 부품/벌크 매각 */}
      <div className={`mb-2 p-[10px] rounded-lg border transition-colors ${isSalvage ? 'border-blue/30 bg-blue/[0.03]' : isRefurb ? 'border-border-light bg-border-light/30' : 'border-border-light bg-white'}`}>
        <div className={`text-[11px] font-semibold mb-2 ${isRefurb ? 'text-text-faint' : 'text-blue'}`}>
          경로 1 전용 — 부품/벌크 매각
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <FieldInput label="잔존가치" unit="$" value={inputs.salv} onChange={d('salv')} step={5} disabled={isRefurb}
              tooltip={{ title: '잔존가치 (Salvage Value)', body: '반품 제품에서 회수 가능한 금액. 부품 매각·B-Stock 재판매 등으로 반품 손실(L)을 줄여줍니다.<br>▸ 영향: L 감소 → BEP 반품률 상승(유리)', analogy: '중고 교과서처럼, 다 쓴 것 같아도 후배에게 팔면 커피 한 잔 값은 건진다.' }} />
          </div>
          <div className="flex-1">
            <FieldInput label="매각 비율" unit="%"
              value={inputs.salvagePct * 100}
              onChange={v => dispatch({ type: 'SET_FIELD', field: 'salvagePct', value: v / 100 })}
              step={10} min={0} max={100} disabled={!isMixed}
              tooltip={{ title: '매각 비율 (Salvage Percentage)', body: '반품 제품 중 부품/벌크 매각 경로로 처리하는 비율. 경로 3(혼합) 선택 시 활성화됩니다.', analogy: '파이를 나누는 것처럼, 반품 제품을 \'부품으로 팔 것\'과 \'고쳐서 다시 팔 것\'으로 비율을 정한다.' }} />
          </div>
        </div>
      </div>

      {/* 경로 2: 리퍼브 재판매 */}
      <div className={`mb-2 p-[10px] rounded-lg border transition-colors ${isRefurb ? 'border-blue/30 bg-blue/[0.03]' : isSalvage ? 'border-border-light bg-border-light/30' : 'border-border-light bg-white'}`}>
        <div className={`text-[11px] font-semibold mb-2 ${isSalvage ? 'text-text-faint' : 'text-blue'}`}>
          경로 2 전용 — 리퍼브 재판매
        </div>
        <FieldInput label="원가 회수율" unit="%"
          value={inputs.recoveryRate * 100}
          onChange={v => dispatch({ type: 'SET_FIELD', field: 'recoveryRate', value: v / 100 })}
          step={5} min={0} max={100} disabled={isSalvage}
          tooltip={{ title: '원가 회수율 (Cost Recovery Rate)', body: '반품 제품을 리퍼브(재정비)하여 재판매할 때 회수 가능한 매출원가 비율.', analogy: '자동차 사고 후 폐차(잔존가치)와 수리 후 재판매(회수율)는 서로 다른 경로다.' }} />
      </div>

      {/* CXV */}
      <div className="text-xs font-semibold text-text-secondary mt-[10px] mb-2 pb-[5px] border-t border-border-light pt-[10px]">
        고객경험 가치 (CXV)
      </div>
      <FieldInput
        label="CXV"
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
        className="flex items-center gap-[6px] mt-1 py-[6px] cursor-pointer text-[11px] text-text-muted font-semibold select-none"
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
                body: '관대한 반품 정책으로 인해 추가로 재구매하는 고객 비율입니다.<br><br>▸ 보수적: 5%<br>▸ 중립적: 10%<br>▸ 적극적: 15%',
                analogy: '무료 반품 정책을 본 고객이 "이 가게는 안심이네" 하고 다시 찾아오는 비율.',
              }}
            />
          </div>
          <div className="mb-[6px]">
            <FieldInput label="고객 생애 가치 (CLV)" unit="$" value={inputs.cxvClv}
              onChange={d('cxvClv')} step={50} min={0}
              tooltip={{
                title: '고객 생애 가치 (Customer Lifetime Value)',
                body: '한 고객이 전체 거래 기간 동안 가져다주는 총 수익입니다.<br><br>▸ 프리미엄 아이웨어: $1,000~$3,000<br>▸ 일반 패션: $300~$800',
                analogy: '단골 고객 한 명이 앞으로 얼마나 더 사 줄지에 대한 기대값.',
              }}
            />
          </div>
          <div className="mb-[6px]">
            <FieldInput label="Attribution Factor 귀인 계수" unit="%" value={inputs.cxvPremium}
              onChange={d('cxvPremium')} step={5} min={0} max={100}
              tooltip={{
                title: 'Attribution Factor 귀인 계수',
                body: '반품 정책 개선이 재구매에 기여한 비율입니다.<br><br>▸ 보수적: 30%<br>▸ 중립적: 40%<br>▸ 적극적: 50%',
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
              CLV를 입력하면 CXV 추천값이 계산됩니다.
            </div>
          )}
        </div>
      )}

      {/* 순 반품비용 요약 */}
      <div className="mb-2 mt-3 pt-[10px] border-t border-border-light">
        <label className="text-xs text-text-secondary">순 반품비용 <span className="text-[11px] text-text-faint">/건</span></label>
        <div className="text-sm font-semibold text-blue py-1">{displayL}</div>
        <div className="text-[10px] text-text-faint">{descL}</div>
      </div>
    </div>
  );
}
