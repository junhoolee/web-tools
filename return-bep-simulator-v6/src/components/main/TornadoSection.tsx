import { Bar } from 'react-chartjs-2';
import type { ChartOptions, ChartData, TooltipItem } from 'chart.js';
import type { SimulatorInputs, SimulatorAction, TornadoResult } from '../../types/simulator';

interface Props {
  inputs: SimulatorInputs;
  dispatch: React.Dispatch<SimulatorAction>;
  results: TornadoResult[];
}

export default function TornadoSection({ inputs, dispatch, results }: Props) {
  if (!results.length) return null;

  const bepSorted = [...results].sort((a, b) => b.bepSpan - a.bepSpan);
  const profitSorted = [...results].sort((a, b) => b.profitSpan - a.profitSpan);

  return (
    <div>
      <div className="flex justify-between items-center mb-[10px]">
        <h3 className="text-[15px] font-bold text-text">민감도 분석 (Tornado Chart)</h3>
        <div className="flex items-center gap-2">
          <select
            value={inputs.tornadoPct}
            onChange={e => dispatch({ type: 'SET_FIELD', field: 'tornadoPct', value: parseFloat(e.target.value) })}
            className="py-1 px-2 border border-border rounded-md text-[11px] text-text-secondary bg-white cursor-pointer"
          >
            <option value={10}>±10%</option>
            <option value={20}>±20%</option>
            <option value={30}>±30%</option>
          </select>
          <span className="text-[10px] text-text-faint">각 변수를 현재값 대비 ±{inputs.tornadoPct}% 변동</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-[14px] max-desktop:grid-cols-1">
        <div>
          <h4 className="text-[11px] font-semibold text-text-muted mb-[6px] text-center">BEP 반품률 영향도 (pp)</h4>
          <div className="relative h-[220px]">
            <TornadoChart sorted={bepSorted} mode="bep" />
          </div>
        </div>
        <div>
          <h4 className="text-[11px] font-semibold text-text-muted mb-[6px] text-center">월간 순이익 영향도 ($)</h4>
          <div className="relative h-[220px]">
            <TornadoChart sorted={profitSorted} mode="profit" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TornadoChart({ sorted, mode }: { sorted: TornadoResult[]; mode: 'bep' | 'profit' }) {
  const labels = sorted.map(r => r.label);
  const negData = sorted.map(r => mode === 'bep' ? r.bepLow : r.profitLow);
  const posData = sorted.map(r => mode === 'bep' ? r.bepHigh : r.profitHigh);
  const negColors = negData.map(v => v < 0 ? '#ef4444' : '#22c55e');
  const posColors = posData.map(v => v >= 0 ? '#22c55e' : '#ef4444');

  const data: ChartData<'bar'> = {
    labels,
    datasets: [
      {
        label: '불리 (-)',
        data: negData,
        backgroundColor: negColors,
        borderRadius: 3,
        barPercentage: 0.7,
      },
      {
        label: '유리 (+)',
        data: posData,
        backgroundColor: posColors,
        borderRadius: 3,
        barPercentage: 0.7,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { left: 4, right: 12 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<'bar'>) => {
            const v = ctx.parsed.x;
            if (mode === 'bep') return (v >= 0 ? '+' : '') + v.toFixed(2) + 'pp';
            return (v >= 0 ? '+' : '') + '$' + Math.abs(v).toLocaleString(undefined, { maximumFractionDigits: 0 });
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          callback: v => {
            const n = Number(v);
            if (mode === 'bep') return (n >= 0 ? '+' : '') + n.toFixed(1) + 'pp';
            const abs = Math.abs(n);
            const str = abs >= 1000 ? '$' + Math.round(abs / 1000) + 'k' : '$' + abs.toFixed(0);
            return (n < 0 ? '-' : '+') + str;
          },
          font: { size: 10 },
        },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      y: {
        ticks: { font: { size: 11 } },
        grid: { display: false },
      },
    },
  };

  return <Bar data={data} options={options} />;
}
