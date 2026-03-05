import { useState, useEffect, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import type { ChartOptions, ChartData, Plugin, TooltipItem } from 'chart.js';
import type { SimulatorInputs, MonteCarloResult } from '../../types/simulator';
import { runMonteCarlo } from '../../lib/montecarlo';

/* -- helpers -------------------------------------------------- */

interface Bin { lo: number; hi: number; count: number }

function buildHistogram(samples: number[], bins = 30): Bin[] {
  if (samples.length === 0) return [];
  let min = Infinity, max = -Infinity;
  for (const v of samples) { if (v < min) min = v; if (v > max) max = v; }
  const range = max - min || 1;
  const step = range / bins;
  const result: Bin[] = Array.from({ length: bins }, (_, i) => ({
    lo: min + step * i,
    hi: min + step * (i + 1),
    count: 0,
  }));
  for (const v of samples) {
    let idx = Math.floor((v - min) / step);
    if (idx >= bins) idx = bins - 1;
    result[idx].count++;
  }
  return result;
}

function fmtPct(v: number): string {
  return (v * 100).toFixed(1) + '%';
}

function fmtProfit(v: number): string {
  const abs = Math.abs(v);
  const str = abs >= 1000 ? '$' + (abs / 1000).toFixed(1) + 'k' : '$' + abs.toFixed(0);
  return (v >= 0 ? '+' : '-') + str;
}

/* -- ref-line custom plugin ----------------------------------- */

const refLinePlugin: Plugin<'bar'> = {
  id: 'refLine',
  afterDraw(chart, _args, options: Record<string, unknown>) {
    const value = options?.['value'] as number | undefined;
    if (value === undefined) return;
    const label = (options?.['label'] as string) ?? '';
    const { ctx, chartArea, scales } = chart;
    const xScale = scales['x'];
    if (!xScale) return;

    const labels = chart.data.labels as string[];
    if (!labels || labels.length === 0) return;

    const binData = (options?.['bins'] as Bin[]) ?? [];
    if (binData.length === 0) return;

    const binCentres = binData.map(b => (b.lo + b.hi) / 2);
    let pixelX: number;
    if (value <= binCentres[0]) {
      pixelX = xScale.getPixelForValue(0);
    } else if (value >= binCentres[binCentres.length - 1]) {
      pixelX = xScale.getPixelForValue(binCentres.length - 1);
    } else {
      let idx = 0;
      for (let i = 0; i < binCentres.length - 1; i++) {
        if (value >= binCentres[i] && value < binCentres[i + 1]) { idx = i; break; }
      }
      const t = (value - binCentres[idx]) / (binCentres[idx + 1] - binCentres[idx]);
      const px0 = xScale.getPixelForValue(idx);
      const px1 = xScale.getPixelForValue(idx + 1);
      pixelX = px0 + t * (px1 - px0);
    }

    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pixelX, chartArea.top);
    ctx.lineTo(pixelX, chartArea.bottom);
    ctx.stroke();

    if (label) {
      ctx.setLineDash([]);
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, pixelX, chartArea.top - 4);
    }
    ctx.restore();
  },
};

/* -- HistogramChart ------------------------------------------- */

interface HistogramChartProps {
  bins: Bin[];
  refValue: number;
  refLabel: string;
  color: string;
  redColor: string;
  isRedBin: (bin: Bin) => boolean;
  formatTooltipX: (bin: Bin) => string;
}

function HistogramChart({ bins, refValue, refLabel, color, redColor, isRedBin, formatTooltipX }: HistogramChartProps) {
  const labels = bins.map((_, i) => i.toString());
  const bgColors = bins.map(b => isRedBin(b) ? redColor : color);

  const data: ChartData<'bar'> = {
    labels,
    datasets: [{
      data: bins.map(b => b.count),
      backgroundColor: bgColors,
      borderRadius: 2,
      barPercentage: 1.0,
      categoryPercentage: 1.0,
    }],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items: TooltipItem<'bar'>[]) => {
            const idx = items[0]?.dataIndex ?? 0;
            return formatTooltipX(bins[idx]);
          },
          label: (ctx: TooltipItem<'bar'>) => `${ctx.parsed.y}회`,
        },
      },
      refLine: {
        value: refValue,
        label: refLabel,
        bins,
      } as Record<string, unknown>,
    },
    scales: {
      x: {
        ticks: {
          callback: function (_val: string | number, index: number) {
            if (index % 5 !== 0) return '';
            const b = bins[index];
            if (!b) return '';
            const mid = (b.lo + b.hi) / 2;
            if (Math.abs(mid) < 1) return (mid * 100).toFixed(0) + '%';
            if (Math.abs(mid) >= 1000) return (mid / 1000).toFixed(0) + 'k';
            return mid.toFixed(0);
          },
          font: { size: 10 },
          maxRotation: 0,
        },
        grid: { display: false },
      },
      y: {
        ticks: { font: { size: 10 } },
        grid: { color: 'rgba(0,0,0,0.06)' },
      },
    },
  };

  return <Bar data={data} options={options} plugins={[refLinePlugin]} />;
}

/* -- PercentileTable ------------------------------------------ */

function PercentileTable({ result }: { result: MonteCarloResult }) {
  const { percentiles: p } = result;
  const cols = [
    { key: 'p5', label: '5%', data: p.p5 },
    { key: 'p25', label: '25%', data: p.p25 },
    { key: 'p50', label: '50%', data: p.p50 },
    { key: 'p75', label: '75%', data: p.p75 },
    { key: 'p95', label: '95%', data: p.p95 },
  ];

  const highlightCls = 'bg-blue/[0.06]';

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-[11px] border-collapse">
        <thead>
          <tr>
            <th className="text-left py-1.5 px-2 border-b border-border font-semibold text-text-muted"></th>
            {cols.map(c => (
              <th
                key={c.key}
                className={`text-center py-1.5 px-2 border-b border-border font-semibold text-text-muted ${c.key === 'p50' ? highlightCls : ''}`}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-1.5 px-2 border-b border-border text-text-secondary font-medium">BEP 반품률</td>
            {cols.map(c => (
              <td
                key={c.key}
                className={`text-center py-1.5 px-2 border-b border-border tabular-nums ${c.key === 'p50' ? highlightCls : ''}`}
              >
                {fmtPct(c.data.bep)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="py-1.5 px-2 border-b border-border text-text-secondary font-medium">월 순이익</td>
            {cols.map(c => (
              <td
                key={c.key}
                className={`text-center py-1.5 px-2 border-b border-border tabular-nums ${c.key === 'p50' ? highlightCls : ''}`}
              >
                {fmtProfit(c.data.profit)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* -- RangeSelector -------------------------------------------- */

function RangeSelector({ label, options, value, onChange }: {
  label: string;
  options: number[];
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[12px] text-text-secondary font-medium whitespace-nowrap">{label}</span>
      <div className="flex gap-1">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`py-[4px] px-[10px] text-[11px] font-semibold rounded-full cursor-pointer transition-all border ${
              value === opt
                ? 'bg-blue text-white border-blue'
                : 'bg-white text-text-secondary border-border hover:bg-border-light'
            }`}
          >
            ±{opt}%
          </button>
        ))}
      </div>
    </div>
  );
}

/* -- UncertaintyModal (main) ---------------------------------- */

interface Props {
  open: boolean;
  onClose: () => void;
  inputs: SimulatorInputs;
}

export default function UncertaintyModal({ open, onClose, inputs }: Props) {
  const [otherRange, setOtherRange] = useState(10);
  const [cogsRange, setCogsRange] = useState(20);
  const [result, setResult] = useState<MonteCarloResult | null>(null);

  // Escape key closes modal
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Auto-run on mount + every 1 second
  useEffect(() => {
    if (!open) return;

    const run = () => {
      const mc = runMonteCarlo(inputs, otherRange, cogsRange, 10000);
      setResult(mc);
    };

    run(); // immediate first run
    const id = setInterval(run, 1000);
    return () => clearInterval(id);
  }, [open, inputs, otherRange, cogsRange]);

  const bepBins = useMemo(() => result ? buildHistogram(result.bepSamples, 30) : [], [result]);
  const profitBins = useMemo(() => result ? buildHistogram(result.profitSamples, 30) : [], [result]);

  if (!open) return null;

  return (
    <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ width: 1100, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
        <button className="float-right bg-transparent border-none text-xl cursor-pointer text-text-faint hover:text-text p-0 leading-none" onClick={onClose}>&times;</button>

        <h3 className="text-[15px] font-bold text-text mb-4">불확실성 분석</h3>

        <div className="flex flex-wrap gap-4 mb-3">
          <RangeSelector label="기타 변수 변동 폭" options={[5, 10, 15]} value={otherRange} onChange={setOtherRange} />
          <RangeSelector label="매출원가 변동 폭" options={[10, 20, 30]} value={cogsRange} onChange={setCogsRange} />
        </div>

        <p className="text-[11px] text-text-faint mb-4">
          기타 변수 ±{otherRange}%, 매출원가 ±{cogsRange}% 범위에서 10,000회 시뮬레이션 (1초마다 자동 갱신)
        </p>

        {result && result.runCount > 0 && (
          <>
            <p className="text-[11px] text-text-secondary mb-3">
              {result.runCount.toLocaleString()}회 시뮬레이션 (1초마다 자동 갱신)
            </p>

            <div className="grid grid-cols-2 gap-[14px] max-desktop:grid-cols-1">
              <div>
                <h4 className="text-[11px] font-semibold text-text-muted mb-[6px] text-center">BEP 반품률 분포</h4>
                <div className="relative h-[220px]">
                  <HistogramChart
                    bins={bepBins}
                    refValue={inputs.Rinf}
                    refLabel={`R∞ ${fmtPct(inputs.Rinf)}`}
                    color="#3b82f680"
                    redColor="#ef444480"
                    isRedBin={b => (b.lo + b.hi) / 2 > inputs.Rinf}
                    formatTooltipX={b => `${fmtPct(b.lo)} – ${fmtPct(b.hi)}`}
                  />
                </div>
              </div>
              <div>
                <h4 className="text-[11px] font-semibold text-text-muted mb-[6px] text-center">월간 순이익 분포</h4>
                <div className="relative h-[220px]">
                  <HistogramChart
                    bins={profitBins}
                    refValue={0}
                    refLabel="0"
                    color="#22c55e80"
                    redColor="#ef444480"
                    isRedBin={b => (b.lo + b.hi) / 2 < 0}
                    formatTooltipX={b => `${fmtProfit(b.lo)} – ${fmtProfit(b.hi)}`}
                  />
                </div>
              </div>
            </div>

            <PercentileTable result={result} />
          </>
        )}
      </div>
    </div>
  );
}
