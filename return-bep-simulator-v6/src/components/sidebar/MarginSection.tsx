import type { SimulatorInputs, SimulatorAction } from '../../types/simulator';
import FieldInput from '../shared/FieldInput';
import PresetButtons from '../shared/PresetButtons';
import ToggleSwitch from '../shared/ToggleSwitch';

const MARGIN_PRESETS = [
  { key: 'low', label: '저마진 ~22%' },
  { key: 'mid', label: '중마진 ~40%' },
  { key: 'high', label: '프리미엄 ~60%' },
];

function getActivePreset(price: number, cogs: number): string {
  if (price === 550 && cogs === 220) return 'high';
  if (price === 550 && cogs === 330) return 'mid';
  if (price === 550 && cogs === 429) return 'low';
  return '';
}

interface Props {
  inputs: SimulatorInputs;
  dispatch: React.Dispatch<SimulatorAction>;
  marginPct: string;
}

export default function MarginSection({ inputs, dispatch, marginPct }: Props) {
  return (
    <>
      {/* Scenario A */}
      <div className="mb-3 bg-bg border border-[#eef1f6] rounded-[10px] p-[14px_14px_10px]">
        <div className="flex items-center justify-between text-[13px] font-bold text-text tracking-[0.2px] mb-3 pb-[7px] border-b border-border">
          <span>마진 설정{inputs.compareOn ? ' (A)' : ''}</span>
          <div className="flex items-center gap-[6px]">
            <span className="text-[10px] font-normal text-text-faint">비교</span>
            <ToggleSwitch on={inputs.compareOn} onToggle={() => dispatch({ type: 'TOGGLE_COMPARE' })} />
          </div>
        </div>
        <PresetButtons
          presets={MARGIN_PRESETS}
          active={getActivePreset(inputs.price, inputs.cogs)}
          onSelect={key => dispatch({ type: 'APPLY_MARGIN', preset: key as 'low' | 'mid' | 'high' })}
        />
        <div className="flex gap-2">
          <div className="flex-1">
            <FieldInput
              label="판매가"
              unit="$"
              value={inputs.price}
              onChange={v => dispatch({ type: 'SET_FIELD', field: 'price', value: v })}
              step={10}
              tooltip={{
                title: '판매가 (Price)',
                body: '판매 단위당 수익. G(이익)과 가격 탄력성 모델의 기준점으로 사용됩니다.<br>▸ 영향: 마진, BEP, 탄력성 통한 판매량<br>▸ 기준: Gentle Monster 등 프리미엄 아이웨어 가격대',
                analogy: '택시 미터기처럼, 요금을 올리면 주머니엔 더 들어오지만 손님이 다른 앱을 켜기 시작한다.',
              }}
            />
          </div>
          <div className="flex-1">
            <FieldInput
              label="매출원가"
              unit="$"
              value={inputs.cogs}
              onChange={v => dispatch({ type: 'SET_FIELD', field: 'cogs', value: v })}
              step={10}
              tooltip={{
                title: '매출원가 (COGS)',
                body: '제품 한 개당 원가. G(이익)을 줄이면서 동시에 L(반품 손실)을 늘리는 이중 타격 구조입니다.<br>▸ 영향: 마진(G↓), 반품 손실(L↑), BEP<br>▸ 기준: 프리미엄 아이웨어 ~60% 매출총이익률',
                analogy: '댐의 균열처럼, 원가가 오르면 마진에서도 새고 반품 손실에서도 동시에 새어나간다.',
              }}
            />
          </div>
        </div>
        <div className="mb-2">
          <label className="text-xs text-text-secondary">매출총이익률</label>
          <div className="text-sm font-semibold text-blue py-1">{marginPct}%</div>
        </div>
      </div>

      {/* Scenario B (visible only when compare is on) */}
      {inputs.compareOn && (
        <div className="mb-3 bg-[#fff7ed] border border-[#fed7aa] rounded-[10px] p-[14px_14px_10px]">
          <div className="text-[13px] font-bold text-orange tracking-[0.2px] mb-3 pb-[7px] border-b border-[#fed7aa]">
            마진 설정 (B)
          </div>
          <PresetButtons
            presets={MARGIN_PRESETS}
            active={getActivePreset(inputs.priceB, inputs.cogsB)}
            onSelect={key => dispatch({ type: 'APPLY_MARGIN_B', preset: key as 'low' | 'mid' | 'high' })}
            activeColor="#ea580c"
          />
          <div className="flex gap-2">
            <div className="flex-1">
              <FieldInput
                label="판매가 B"
                unit="$"
                value={inputs.priceB}
                onChange={v => dispatch({ type: 'SET_FIELD', field: 'priceB', value: v })}
                step={10}
              />
            </div>
            <div className="flex-1">
              <FieldInput
                label="매출원가 B"
                unit="$"
                value={inputs.cogsB}
                onChange={v => dispatch({ type: 'SET_FIELD', field: 'cogsB', value: v })}
                step={10}
              />
            </div>
          </div>
          <div className="mb-2">
            <label className="text-xs text-text-secondary">매출총이익률 B</label>
            <div className="text-sm font-semibold text-orange py-1">
              {inputs.priceB > 0 ? ((inputs.priceB - inputs.cogsB) / inputs.priceB * 100).toFixed(1) : '0.0'}%
            </div>
          </div>
        </div>
      )}
    </>
  );
}
