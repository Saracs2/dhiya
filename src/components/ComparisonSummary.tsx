import { formatClock, formatEnergy, formatNumber, formatPower, joinValueUnit } from '../domain/format';
import { fill } from '../i18n/strings';
import { useLang } from '../i18n/langContext';
import type { Comparison } from '../state/comparison';
import { CHART } from './charts/chartTheme';

/** Stat tiles for the modeled comparison: energy and peak per strategy, plus the modeled difference. */
export function ComparisonSummary({ comparison }: { comparison: Comparison }) {
  const { t, lang } = useLang();
  const { conventional, dhiya, differencePct } = comparison;
  const c = t.comparison;

  const tile = (label: string, color: string, energyWh: number, peakW: number) => {
    const e = formatEnergy(energyWh, lang);
    return (
      <div className="stat">
        <span className="stat-label">
          <span className="legend-swatch block" style={{ background: color }} />
          {label}
        </span>
        <span className="stat-value">
          {e.value}
          <small>{e.unit}</small>
        </span>
        <span className="stat-hint">
          {c.peak}: {joinValueUnit(formatPower(peakW, lang))}
        </span>
      </div>
    );
  };

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div className="stat-grid">
        {tile(c.conventionalLong, CHART.conventional, conventional.energyWh, conventional.peakW)}
        {tile(c.dhiyaLong, CHART.dhiya, dhiya.energyWh, dhiya.peakW)}
        <div className="stat">
          <span className="stat-label">{c.difference}</span>
          <span className="stat-value delta-up">
            +{formatNumber(differencePct, lang)}
            <small>%</small>
          </span>
          <span className="stat-hint">{c.energy}</span>
        </div>
      </div>
      <p className="card-note">
        {dhiya.cleaningTimesH.length > 0 &&
          `${fill(c.cleanedAt, { times: dhiya.cleaningTimesH.map(formatClock).join(', ') })} · `}
        {c.differenceNote}
      </p>
    </div>
  );
}
