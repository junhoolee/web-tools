import type { Plugin } from 'chart.js';

interface BepVolOpts { bepVolume?: number | null }

export const bepVolLinePlugin: Plugin<'line'> = {
  id: 'bepVolLine',
  afterDraw(chart) {
    const opts = (chart.options.plugins as Record<string, unknown>)?.bepVolLine as BepVolOpts | undefined;
    const bv = opts?.bepVolume;
    if (bv === null || bv === undefined) return;

    const yAxis = chart.scales.y;
    const xAxis = chart.scales.x;
    const y = yAxis.getPixelForValue(bv);
    if (y < yAxis.top || y > yAxis.bottom) return;

    const ctx = chart.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(xAxis.left, y);
    ctx.lineTo(xAxis.right, y);
    ctx.strokeStyle = '#15803d';
    ctx.setLineDash([6, 4]);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#15803d';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText('BEP 판매량 ' + Math.ceil(bv).toLocaleString() + '개', xAxis.left + 4, y - 4);
    ctx.restore();
  },
};
