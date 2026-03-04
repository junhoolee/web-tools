import { Line } from 'react-chartjs-2';
import type { ChartOptions, ChartData, TooltipItem } from 'chart.js';
import type { SimulatorDerived } from '../../types/simulator';
import { vLinePlugin } from '../../chart-plugins/vLinePlugin';
import { bepLabelPlugin } from '../../chart-plugins/bepLabelPlugin';

interface Props {
  derived: SimulatorDerived;
  retWindow: number;
}

export default function ReturnChart({ derived, retWindow }: Props) {
  const { days, rr, bepArr, scenarioB } = derived;

  const datasets: ChartData<'line'>['datasets'] = [
    {
      label: '누적 반품률',
      data: rr,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.06)',
      fill: true,
      borderWidth: 2.5,
      pointRadius: 0,
      tension: 0.3,
    },
    {
      label: 'BEP 반품률 (A)',
      data: bepArr,
      borderColor: '#ef4444',
      borderWidth: 1.5,
      borderDash: [6, 4],
      pointRadius: 0,
      fill: false,
    },
  ];

  if (scenarioB) {
    datasets.push({
      label: 'BEP 반품률 (B)',
      data: scenarioB.bepArrB,
      borderColor: '#ea580c',
      backgroundColor: 'rgba(234,88,12,0.04)',
      borderWidth: 1.5,
      borderDash: [3, 3],
      pointRadius: 0,
      fill: false,
    });
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 16 } },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: true, position: 'top', labels: { boxWidth: 14, font: { size: 11 } } },
      tooltip: {
        callbacks: {
          title: (c: TooltipItem<'line'>[]) => c[0].label + '일',
          label: (c: TooltipItem<'line'>) => {
            const v = c.parsed.y;
            return c.dataset.label + ': ' + (v >= 0 && !c.dataset.label?.includes('BEP') ? '+' : '') + v.toFixed(1) + '%';
          },
        },
      },
      vlines: { retWindowDay: retWindow },
    } as ChartOptions<'line'>['plugins'],
    scales: {
      x: { title: { display: true, text: '반품기간 (일)', font: { size: 11 } }, ticks: { stepSize: 10 } },
      y: { title: { display: true, text: '누적 반품률 (%)', font: { size: 11 } }, ticks: { callback: v => v + '%' } },
    },
  };

  return (
    <div className="bg-surface rounded-[10px] p-4 border border-border mb-[14px]">
      <h3 className="text-[13px] font-semibold text-text mb-[10px]">반품기간별 누적 반품률</h3>
      <div className="relative h-[260px]">
        <Line data={{ labels: days, datasets }} options={options} plugins={[vLinePlugin, bepLabelPlugin]} />
      </div>
    </div>
  );
}
