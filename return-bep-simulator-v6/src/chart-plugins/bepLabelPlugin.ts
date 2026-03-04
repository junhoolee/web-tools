import type { Plugin } from 'chart.js';

export const bepLabelPlugin: Plugin<'line'> = {
  id: 'bepLabel',
  afterDraw(chart) {
    const ctx = chart.ctx;
    const dsA = chart.data.datasets[1];
    if (dsA?.data?.length) {
      const bepVal = dsA.data[0] as number;
      const yAxis = chart.scales.y;
      const xAxis = chart.scales.x;
      const y = yAxis.getPixelForValue(bepVal);
      if (y >= yAxis.top && y <= yAxis.bottom) {
        ctx.save();
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText('BEP 반품률(A) ' + bepVal.toFixed(1) + '%', xAxis.right - 4, y - 4);
        ctx.restore();
      }
    }
    const dsB = chart.data.datasets.find(d => d.label === 'BEP 반품률 (B)');
    if (dsB?.data?.length) {
      const bepValB = dsB.data[0] as number;
      const yAxis = chart.scales.y;
      const xAxis = chart.scales.x;
      const y = yAxis.getPixelForValue(bepValB);
      if (y >= yAxis.top && y <= yAxis.bottom) {
        ctx.save();
        ctx.fillStyle = '#ea580c';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText('BEP 반품률(B) ' + bepValB.toFixed(1) + '%', xAxis.right - 4, y + 4);
        ctx.restore();
      }
    }
  },
};
