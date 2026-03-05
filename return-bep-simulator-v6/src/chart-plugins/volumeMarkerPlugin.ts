import type { Plugin } from 'chart.js';

interface VolMarkerOpts { retWindowDay?: number }

export const volumeMarkerPlugin: Plugin<'line'> = {
  id: 'volumeMarker',
  afterDraw(chart) {
    const opts = (chart.options.plugins as Record<string, unknown>)?.volumeMarker as VolMarkerOpts | undefined;
    const day = opts?.retWindowDay;
    if (day === undefined) return;

    const xAxis = chart.scales.x;
    const yAxis = chart.scales.y;
    const x = xAxis.getPixelForValue(day);
    if (x < xAxis.left || x > xAxis.right) return;

    const ctx = chart.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, yAxis.top);
    ctx.lineTo(x, yAxis.bottom);
    ctx.strokeStyle = '#111111';
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#111111';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('반품기간 ' + day + '일', x, yAxis.top - 5);
    ctx.restore();
  },
};
