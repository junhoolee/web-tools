import type { Plugin } from 'chart.js';

interface VLineOpts { retWindowDay?: number }

export const vLinePlugin: Plugin<'line'> = {
  id: 'vlines',
  afterDraw(chart) {
    const { ctx } = chart;
    const xAxis = chart.scales.x;
    const yAxis = chart.scales.y;
    const opts = (chart.options.plugins as Record<string, unknown>)?.vlines as VLineOpts | undefined;
    const rw = opts?.retWindowDay;

    [14, 30].filter(d => d !== rw).forEach(d => {
      const x = xAxis.getPixelForValue(d);
      if (x < xAxis.left || x > xAxis.right) return;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, yAxis.top);
      ctx.lineTo(x, yAxis.bottom);
      ctx.strokeStyle = 'rgba(0,0,0,0.08)';
      ctx.setLineDash([4, 3]);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d + '일', x, yAxis.top - 5);
      ctx.restore();
    });

    if (rw !== undefined) {
      const x = xAxis.getPixelForValue(rw);
      if (x >= xAxis.left && x <= xAxis.right) {
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
        ctx.fillText('반품기간 ' + rw + '일', x, yAxis.top - 5);
        ctx.restore();
      }
    }
  },
};
