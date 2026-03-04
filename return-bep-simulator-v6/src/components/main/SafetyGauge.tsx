interface Props {
  safetyPP: number;
  rinf: number;
  bep: number;
}

export default function SafetyGauge({ safetyPP, rinf, bep }: Props) {
  const smColor = safetyPP >= 20 ? '#16a34a' : safetyPP >= 10 ? '#d97706' : '#dc2626';
  const smText = safetyPP >= 0
    ? `${safetyPP.toFixed(1)}pp`
    : `−${Math.abs(safetyPP).toFixed(1)}pp`;

  const rinfPct = Math.min(rinf * 100, 100);
  const bepPct = Math.min(bep * 100, 100);
  const safeColor = safetyPP >= 20 ? 'rgba(34,197,94,0.15)' : safetyPP >= 10 ? 'rgba(217,119,6,0.15)' : 'rgba(220,38,38,0.15)';

  const fillLeft = bep > rinf ? rinfPct : bepPct;
  const fillWidth = Math.abs(bepPct - rinfPct);

  return (
    <>
      <div className="flex items-center gap-[6px] text-[22px] font-bold" style={{ color: smColor }}>
        {smText}
      </div>
      <div className="safety-gauge">
        <div className="gauge-fill" style={{ left: fillLeft + '%', width: fillWidth + '%', background: safeColor }} />
        <div className="gauge-marker" style={{ left: rinfPct + '%', background: '#f59e0b' }} />
        <div className="gauge-marker" style={{ left: bepPct + '%', background: '#3b82f6' }} />
        <span className="gauge-label" style={{ left: rinfPct + '%', color: '#f59e0b' }}>R∞</span>
        <span className="gauge-label" style={{ left: bepPct + '%', color: '#3b82f6' }}>BEP 반품률</span>
      </div>
    </>
  );
}
