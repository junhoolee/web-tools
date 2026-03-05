import type { SimulatorInputs, SimulatorAction, ReasonBreakdown } from '../../types/simulator';
import ToggleSwitch from '../shared/ToggleSwitch';

interface Props {
  inputs: SimulatorInputs;
  dispatch: React.Dispatch<SimulatorAction>;
  reasonBreakdown: ReasonBreakdown | null;
}

export default function ReasonSegmentation({ inputs, dispatch, reasonBreakdown }: Props) {
  const d = (field: keyof SimulatorInputs) => (v: number) =>
    dispatch({ type: 'SET_FIELD', field, value: v });

  const damagePct = 100 - inputs.rrDefect - inputs.rrMind;
  const isError = damagePct < 0;

  const rows: { label: string; fields: [keyof SimulatorInputs, keyof SimulatorInputs, keyof SimulatorInputs] }[] = [
    { label: '잔존가치', fields: ['rmSalvDefect', 'rmSalvMind', 'rmSalvDamage'] },
    { label: '원가회수율', fields: ['rmRecovDefect', 'rmRecovMind', 'rmRecovDamage'] },
  ];

  return (
    <div className="mb-3 bg-bg border border-[#eef1f6] rounded-[10px] p-[14px_14px_10px]">
      <div className="flex items-center justify-between text-[13px] font-bold text-text tracking-[0.2px] mb-3 pb-[7px] border-b border-border">
        <span>반품 사유 세분화</span>
        <ToggleSwitch on={inputs.reasonMode} onToggle={() => dispatch({ type: 'TOGGLE_REASON' })} color="#0d9488" />
      </div>

      {inputs.reasonMode && (
        <div>
          {/* 사유별 비율 */}
          <div className="text-xs font-semibold text-text-secondary mb-2">사유별 발생 비율</div>
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
                  min={0}
                  max={100}
                  step={5}
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

          {isError && (
            <div className="text-[10px] text-red mb-[6px]">합계가 100%를 초과합니다</div>
          )}

          {/* 사유별 승수 설정 — always visible */}
          <div className="text-xs font-semibold text-text-secondary mb-2">사유별 승수 설정</div>
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
                          min={0}
                          max={3}
                          step={0.1}
                          onChange={e => d(f)(parseFloat(e.target.value) || 0)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 사유별 손실 분해 */}
          <div className="text-xs font-semibold text-text-secondary mt-3 mb-2">사유별 반품 손실 /건</div>
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
      )}
    </div>
  );
}
