import { Line } from 'react-chartjs-2';
import type { ChartOptions, ChartData, ScriptableLineSegmentContext, TooltipItem } from 'chart.js';
import type { SimulatorDerived } from '../../types/simulator';
import { vLinePlugin } from '../../chart-plugins/vLinePlugin';

interface Props {
  derived: SimulatorDerived;
  retWindow: number;
}

export default function ProfitChart({ derived, retWindow }: Props) {
  const { days, pr, scenarioB } = derived;

  const datasets: ChartData<'line'>['datasets'] = [
    {
      label: 'π/G 수익률 (A)',
      data: pr,
      borderWidth: 2.5,
      pointRadius: 0,
      tension: 0.3,
      fill: { target: 'origin', above: 'rgba(34,197,94,0.10)', below: 'rgba(239,68,68,0.10)' } as unknown as boolean,
      segment: {
        borderColor: ((ctx: ScriptableLineSegmentContext) => {
          const y0 = ctx.p0.parsed.y, y1 = ctx.p1.parsed.y;
          if (y0 >= 0 && y1 >= 0) return '#22c55e';
          if (y0 < 0 && y1 < 0) return '#ef4444';
          return '#94a3b8';
        }) as unknown as string,
      },
    },
  ];

  if (scenarioB) {
    datasets.push({
      label: 'π/G 수익률 (B)',
      data: scenarioB.prB,
      borderColor: '#ea580c',
      borderWidth: 2,
      borderDash: [6, 4],
      pointRadius: 0,
      tension: 0.3,
      fill: false,
    });
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 16 } },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: !!scenarioB, position: 'top', labels: { boxWidth: 14, font: { size: 11 } } },
      tooltip: {
        callbacks: {
          title: (c: TooltipItem<'line'>[]) => c[0].label + '일',
          label: (c: TooltipItem<'line'>) => {
            const v = c.parsed.y;
            return c.dataset.label + ': ' + (v >= 0 ? '+' : '') + v.toFixed(1) + '%';
          },
        },
      },
      vlines: { retWindowDay: retWindow },
    } as ChartOptions<'line'>['plugins'],
    scales: {
      x: { title: { display: true, text: '반품기간 (일)', font: { size: 11 } }, ticks: { stepSize: 10 } },
      y: { title: { display: true, text: '수익률 π/G (%)', font: { size: 11 } }, ticks: { callback: v => (Number(v) >= 0 ? '+' : '') + v + '%' } },
    },
  };

  return (
    <div className="bg-surface rounded-[10px] p-4 border border-border mb-[14px]">
      <div className="flex items-baseline gap-2 mb-[10px]">
        <h3 className="text-[13px] font-semibold text-text">반품기간별 수익률 (π/G)</h3>
        <span className="text-[11px] text-text-faint">이론상 최대 이익(G) 대비 몇 %를 지켜냈는가</span>
      </div>
      <div className="relative h-[260px]">
        <Line data={{ labels: days, datasets }} options={options} plugins={[vLinePlugin]} />
      </div>
    </div>
  );
}
