import { Line } from 'react-chartjs-2';
import type { ChartOptions, ChartData, TooltipItem } from 'chart.js';
import type { SimulatorInputs, SimulatorDerived } from '../../types/simulator';
import { REF_PRICE, REF_WINDOW } from '../../constants/presets';
import { volumeMarkerPlugin } from '../../chart-plugins/volumeMarkerPlugin';

interface Props {
  inputs: SimulatorInputs;
  derived: SimulatorDerived;
}

export default function VolumeChart({ inputs, derived }: Props) {
  const { scenarioB } = derived;
  const baseVol = inputs.baseVol > 0 ? inputs.baseVol : 1000;

  const windowDays: number[] = [];
  const adjVolData: number[] = [];
  const baseVolData: number[] = [];
  const adjVolDataB: number[] = [];

  for (let d = 0; d <= 90; d++) {
    windowDays.push(d);
    const wRatio = Math.pow(d / REF_WINDOW, inputs.retElast);
    const pRatio = inputs.price > 0 ? Math.pow(inputs.price / REF_PRICE, inputs.priceElast) : 1;
    adjVolData.push(+(baseVol * pRatio * wRatio).toFixed(0));
    baseVolData.push(baseVol);
    if (scenarioB && inputs.priceB > 0) {
      const pRatioB = Math.pow(inputs.priceB / REF_PRICE, inputs.priceElast);
      adjVolDataB.push(+(baseVol * pRatioB * wRatio).toFixed(0));
    }
  }

  const datasets: ChartData<'line'>['datasets'] = [
    {
      label: '예상 판매량 (A)',
      data: adjVolData,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.08)',
      fill: true,
      borderWidth: 2.5,
      pointRadius: 0,
      tension: 0.3,
    },
    {
      label: '기준 판매량',
      data: baseVolData,
      borderColor: '#94a3b8',
      borderWidth: 1.5,
      borderDash: [6, 4],
      pointRadius: 0,
    },
  ];

  if (adjVolDataB.length) {
    datasets.push({
      label: '예상 판매량 (B)',
      data: adjVolDataB,
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
      legend: { display: true, position: 'top', labels: { boxWidth: 14, font: { size: 11 } } },
      tooltip: {
        callbacks: {
          title: (c: TooltipItem<'line'>[]) => c[0].label + '일',
          label: (c: TooltipItem<'line'>) => c.dataset.label + ': ' + Math.round(c.parsed.y).toLocaleString() + ' 개/월',
        },
      },
      volumeMarker: { retWindowDay: inputs.retWindow },
    } as ChartOptions<'line'>['plugins'],
    scales: {
      x: { title: { display: true, text: '반품허용기간 (일)', font: { size: 11 } }, ticks: { stepSize: 10 } },
      y: { title: { display: true, text: '판매량 (개/월)', font: { size: 11 } }, ticks: { callback: v => Number(v).toLocaleString() } },
    },
  };

  return (
    <div className="bg-surface rounded-[10px] p-4 border border-border mb-[14px]">
      <div className="flex items-baseline gap-2 mb-[10px]">
        <h3 className="text-[13px] font-semibold text-text">반품허용기간별 판매량</h3>
        <span className="text-[11px] text-text-faint">반품허용기간 정책이 판매량에 미치는 영향 (탄력성 모델)</span>
      </div>
      <div className="relative h-[260px]">
        <Line data={{ labels: windowDays, datasets }} options={options} plugins={[volumeMarkerPlugin]} />
      </div>
    </div>
  );
}
