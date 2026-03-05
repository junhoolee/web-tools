import { useState } from 'react';
import type { SimulatorInputs, SimulatorAction, ReasonBreakdown } from '../../types/simulator';
import FieldInput from '../shared/FieldInput';
import ToggleSwitch from '../shared/ToggleSwitch';

interface Props {
  inputs: SimulatorInputs;
  dispatch: React.Dispatch<SimulatorAction>;
  reasonBreakdown: ReasonBreakdown | null;
  totalRecovery: number;
  totalRecoveryB: number | null;
}

function ReasonContent({ inputs, dispatch, reasonBreakdown }: { inputs: SimulatorInputs; dispatch: React.Dispatch<SimulatorAction>; reasonBreakdown: ReasonBreakdown | null }) {
  const d = (field: keyof SimulatorInputs) => (v: number) =>
    dispatch({ type: 'SET_FIELD', field, value: v });

  const damagePct = 100 - inputs.rrDefect - inputs.rrMind;
  const isError = damagePct < 0;

  const rows: { label: string; fields: [keyof SimulatorInputs, keyof SimulatorInputs, keyof SimulatorInputs] }[] = [
    { label: '잔존가치', fields: ['rmSalvDefect', 'rmSalvMind', 'rmSalvDamage'] },
    { label: '원가회수율', fields: ['rmRecovDefect', 'rmRecovMind', 'rmRecovDamage'] },
  ];

  return (
    <div>
      <div className="text-[11px] font-medium text-text-secondary mb-1.5">사유별 발생 비율</div>
      <div className="flex gap-[6px] mb-3">
        {[
          { label: '불량', color: 'text-red', field: 'rrDefect' as const, value: inputs.rrDefect },
          { label: '변심', color: 'text-[#2563eb]', field: 'rrMind' as const, value: inputs.rrMind },
        ].map(r => (
          <div key={r.field} className="flex-1 bg-white border border-border rounded-md p-[6px_8px] text-center">
            <div className={`text-[10px] font-bold mb-[3px] ${r.color}`}>{r.label}</div>
            <input
              type="number"
              value={r.value}
              min={0} max={100} step={5}
              onChange={e => d(r.field)(parseFloat(e.target.value) || 0)}
              className={`w-full py-1 px-[6px] border rounded text-xs text-center outline-none bg-white focus:border-blue focus:shadow-[0_0_0_2px_rgba(59,130,246,0.1)] ${isError ? 'border-red' : 'border-border'}`}
            />
          </div>
        ))}
        <div className="flex-1 bg-white border border-border rounded-md p-[6px_8px] text-center">
          <div className="text-[10px] font-bold mb-[3px] text-amber">파손</div>
          <div className="text-[13px] font-semibold text-blue py-1">{damagePct}%</div>
        </div>
      </div>

      {isError && <div className="text-[10px] text-red mb-[6px]">합계가 100%를 초과합니다</div>}

      <div className="text-[11px] font-medium text-text-secondary mb-1.5">사유별 승수 설정</div>
      <div className="mb-2">
        <table className="reason-multiplier-table">
          <thead>
            <tr>
              <th></th>
              <th className="col-defect">불량</th>
              <th className="col-mind">변심</th>
              <th className="col-damage">파손</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.label}>
                <td>{row.label}</td>
                {row.fields.map(f => (
                  <td key={f}>
                    <input
                      type="number"
                      value={inputs[f] as number}
                      min={0} max={3} step={0.1}
                      onChange={e => d(f)(parseFloat(e.target.value) || 0)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-[11px] font-medium text-text-secondary mt-3 mb-1.5">사유별 반품 손실 /건</div>
      <div className="bg-white border border-border rounded-md p-[8px_10px]">
        {reasonBreakdown ? (
          <>
            {[
              { label: '불량', color: '#dc2626', pct: reasonBreakdown.defect.pct, L: reasonBreakdown.defect.L },
              { label: '변심', color: '#2563eb', pct: reasonBreakdown.mind.pct, L: reasonBreakdown.mind.L },
              { label: '파손', color: '#d97706', pct: reasonBreakdown.damage.pct, L: reasonBreakdown.damage.L },
            ].map(r => (
              <div key={r.label} className="flex justify-between items-center text-[11px] py-0.5">
                <span className="flex items-center gap-1 text-text-secondary">
                  <span className="w-[6px] h-[6px] rounded-full inline-block" style={{ background: r.color }} />
                  {r.label} ({Math.round(r.pct * 100)}%)
                </span>
                <span className="font-semibold text-red">${r.L.toFixed(0)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center text-xs font-bold pt-1 mt-1 border-t border-border">
              <span className="text-text">가중평균 손실 (L)</span>
              <span className="text-red text-[13px]">
                ${(reasonBreakdown.defect.pct * reasonBreakdown.defect.L + reasonBreakdown.mind.pct * reasonBreakdown.mind.L + reasonBreakdown.damage.pct * reasonBreakdown.damage.L).toFixed(0)}/건
              </span>
            </div>
          </>
        ) : (
          <div className="text-[11px] text-text-faint">비율을 입력하면 L 분해가 표시됩니다</div>
        )}
      </div>
    </div>
  );
}

export default function ReturnRecoverySection({ inputs, dispatch, reasonBreakdown, totalRecovery, totalRecoveryB }: Props) {
  const [guideOpen, setGuideOpen] = useState(false);

  const d = (field: keyof SimulatorInputs) => (v: number) =>
    dispatch({ type: 'SET_FIELD', field, value: v });

  const salvPct = Math.round(inputs.salvagePct * 100);
  const refurbPct = 100 - salvPct;

  const retention = inputs.cxvRepurchase / 100;
  const clv = inputs.cxvClv;
  const attribution = inputs.cxvPremium / 100;
  const recommended = retention * clv * attribution;
  const hasClv = clv > 0;

  return (
    <div className="mb-3 bg-bg border border-[#eef1f6] rounded-[10px] p-[14px_14px_10px]">
      <div className="flex items-center justify-between text-[13px] font-bold text-text tracking-[0.2px] mb-3 pb-[7px] border-b border-border">
        <span>반품 회수 <span className="text-green font-normal">(+)</span></span>
        <span className="flex items-baseline gap-1.5">
          <span className="text-green text-[12px]">${totalRecovery.toFixed(0)}</span>
          {totalRecoveryB !== null && <span className="text-orange text-[12px]">/ ${totalRecoveryB.toFixed(0)}</span>}
        </span>
      </div>

      {/* 처리 비율 배분 */}
      <div className="text-xs font-semibold text-text-secondary mb-2">처리 비율 배분</div>
      <div className="mb-3 px-1">
        <div className="flex justify-between text-[11px] mb-1.5">
          <span className={`font-semibold ${salvPct > 0 ? 'text-blue' : 'text-text-faint'}`}>부품/벌크 매각 {salvPct}%</span>
          <span className={`font-semibold ${refurbPct > 0 ? 'text-blue' : 'text-text-faint'}`}>리퍼브 판매 {refurbPct}%</span>
        </div>
        <input
          type="range"
          min={0} max={100} step={10}
          value={salvPct}
          onChange={e => dispatch({ type: 'SET_FIELD', field: 'salvagePct', value: Number(e.target.value) / 100 })}
          className="w-full h-1.5 accent-blue cursor-pointer"
        />
      </div>

      {/* 매각 / 리퍼브 변수 — 가로 배치 */}
      <div className="flex gap-2 mb-2">
        <div className={`flex-1 p-[10px] rounded-lg border transition-colors ${salvPct > 0 ? 'border-blue/30 bg-blue/[0.03]' : 'border-border-light bg-border-light/30'}`}>
          <div className={`text-[11px] font-semibold mb-2 ${salvPct > 0 ? 'text-blue' : 'text-text-faint'}`}>
            매각 변수
          </div>
          <FieldInput label="잔존가치" unit="$" value={inputs.salv} onChange={d('salv')} step={5}
            tooltip={{ title: '잔존가치 (Salvage Value)', body: '반품 제품에서 회수 가능한 금액. 부품 매각·B-Stock 재판매 등으로 반품 손실(L)을 줄여줍니다.<br>▸ 영향: L 감소 → BEP 반품률 상승(유리)', analogy: '중고 교과서처럼, 다 쓴 것 같아도 후배에게 팔면 커피 한 잔 값은 건진다.' }} />
        </div>
        <div className={`flex-1 p-[10px] rounded-lg border transition-colors ${refurbPct > 0 ? 'border-blue/30 bg-blue/[0.03]' : 'border-border-light bg-border-light/30'}`}>
          <div className={`text-[11px] font-semibold mb-2 ${refurbPct > 0 ? 'text-blue' : 'text-text-faint'}`}>
            리퍼브 변수
          </div>
          <FieldInput label="원가 회수율" unit="%"
            value={inputs.recoveryRate * 100}
            onChange={v => dispatch({ type: 'SET_FIELD', field: 'recoveryRate', value: v / 100 })}
            step={5} min={0} max={100}
            tooltip={{ title: '원가 회수율 (Cost Recovery Rate)', body: '반품 제품을 리퍼브(재정비)하여 재판매할 때 회수 가능한 매출원가 비율.', analogy: '자동차 사고 후 폐차(잔존가치)와 수리 후 재판매(회수율)는 서로 다른 경로다.' }} />
        </div>
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

      {/* 사유별 세분화 */}
      <div className={`mt-[10px] pt-[10px] ${inputs.reasonMode ? 'border-t border-border-light' : ''}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-text-muted">사유별 회수율 세분화</span>
          <ToggleSwitch on={inputs.reasonMode} onToggle={() => dispatch({ type: 'TOGGLE_REASON' })} color="#0d9488" />
        </div>

        {inputs.reasonMode && (
          <ReasonContent inputs={inputs} dispatch={dispatch} reasonBreakdown={reasonBreakdown} />
        )}
      </div>

    </div>
  );
}
