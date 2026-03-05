import { useState, useCallback, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import type { ChartOptions, ChartData, Plugin, TooltipItem } from 'chart.js';
import type { SimulatorInputs, MonteCarloResult } from '../../types/simulator';
import { runMonteCarlo } from '../../lib/montecarlo';

/* ── helpers ─────────────────────────────────────────────── */

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

/* ── ref-line custom plugin ──────────────────────────────── */

const refLinePlugin: Plugin<'bar'> = {
  id: 'refLine',
  afterDraw(chart, _args, options: Record<string, unknown>) {
    const value = options?.['value'] as number | undefined;
    if (value === undefined) return;
    const label = (options?.['label'] as string) ?? '';
    const { ctx, chartArea, scales } = chart;
    const xScale = scales['x'];
    if (!xScale) return;

    // Map data value to pixel via category index interpolation
    const labels = chart.data.labels as string[];
    if (!labels || labels.length === 0) return;

    // Bins are stored in dataset metadata; we use the chart data structure
    const binData = (options?.['bins'] as Bin[]) ?? [];
    if (binData.length === 0) return;

    // Find pixel position: interpolate between bin centres
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

/* ── HistogramChart ──────────────────────────────────────── */

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
            // Format based on magnitude
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

/* ── PercentileTable ─────────────────────────────────────── */

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

/* ── MonteCarloSection (main) ────────────────────────────── */

export default function MonteCarloSection({ inputs }: { inputs: SimulatorInputs }) {
  const [result, setResult] = useState<MonteCarloResult | null>(null);
  const [running, setRunning] = useState(false);

  const handleRun = useCallback(() => {
    setRunning(true);
    requestAnimationFrame(() => {
      const mc = runMonteCarlo(inputs, inputs.tornadoPct, 10000);
      setResult(mc);
      setRunning(false);
    });
  }, [inputs]);

  const bepBins = useMemo(() => result ? buildHistogram(result.bepSamples, 30) : [], [result]);
  const profitBins = useMemo(() => result ? buildHistogram(result.profitSamples, 30) : [], [result]);

  return (
    <div className="mt-6 pt-5 border-t border-border">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-[15px] font-bold text-text">몬테카를로 시뮬레이션</h3>
        <button
          onClick={handleRun}
          disabled={running}
          className="py-1.5 px-4 bg-blue text-white text-[12px] font-medium rounded-md border-none cursor-pointer hover:bg-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {running ? '계산 중...' : result ? '재실행 (10,000회)' : '실행 (10,000회)'}
        </button>
      </div>

      <p className="text-[11px] text-text-faint mb-4">
        위 토네이도의 변동 폭(±{inputs.tornadoPct}%)을 기반으로 모든 변수를 동시에 변동시켜 10,000회 시뮬레이션합니다.
      </p>

      {result && result.runCount > 0 && (
        <>
          <p className="text-[11px] text-text-secondary mb-3">
            {result.runCount.toLocaleString()}회 시뮬레이션 완료 (변동 폭 ±{inputs.tornadoPct}%)
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
  );
}
