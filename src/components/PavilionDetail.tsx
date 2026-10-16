import { formatNumber, formatPercent } from '../domain/format';
import type { ScoredPavilion } from '../domain/types';
import { fill } from '../i18n/strings';
import { useLang } from '../i18n/langContext';
import { illustrativeDailyYieldKwh, NORMALISATION, WEIGHTS, weightedContributions } from '../scoring/leaderboard';
import { Card } from './Card';
import { COMPONENT_COLORS } from './componentLegend';

interface Props {
  ranked: ScoredPavilion[];
  selectedId: string;
  onSelect: (id: string) => void;
}

/** Score breakdown for the selected (illustrative) pavilion. */
export function PavilionDetail({ ranked, selectedId, onSelect }: Props) {
  const { t, lang } = useLang();
  const entry = ranked.find((r) => r.pavilion.id === selectedId) ?? ranked[0];

  if (!entry) {
    return (
      <Card id="pavilion-detail" title={t.leaderboard.title} source="illustrative">
        <p className="card-note">—</p>
      </Card>
    );
  }

  const { pavilion, components } = entry;
  const w = weightedContributions(components);
  const n = NORMALISATION;
  const lb = t.leaderboard;
  const name = pavilion.name[lang];

  const rows = [
    {
      key: 'solarPerformance' as const,
      label: lb.componentPerformance,
      raw: formatNumber(pavilion.inputs.performanceRatio, lang, 3),
      bounds: fill(lb.boundsPerformance, {
        worst: formatNumber(n.solarPerformance.worst, lang, 2),
        best: formatNumber(n.solarPerformance.best, lang, 2),
      }),
    },
    {
      key: 'solarContribution' as const,
      label: lb.componentContribution,
      raw: formatPercent(pavilion.inputs.solarContributionPct, lang, 0),
      bounds: fill(lb.boundsContribution, {
        worst: formatPercent(n.solarContribution.worst, lang, 0),
        best: formatPercent(n.solarContribution.best, lang, 0),
      }),
    },
    {
      key: 'maintenance' as const,
      label: lb.componentMaintenance,
      raw: formatPercent(pavilion.inputs.avgSoilingLossPct, lang),
      bounds: fill(lb.boundsMaintenance, {
        worst: formatPercent(n.maintenance.worst, lang, 0),
        best: formatPercent(n.maintenance.best, lang, 0),
      }),
    },
  ];

  return (
    <Card
      id="pavilion-detail"
      title={fill(lb.breakdownTitle, { name })}
      subtitle={lb.breakdownSubtitle}
      source="illustrative"
    >
      <div className="pavilion-tabs" role="group" aria-label={lb.select}>
        {ranked.map((r) => (
          <button
            key={r.pavilion.id}
            type="button"
            className="pavilion-tab"
            aria-pressed={r.pavilion.id === pavilion.id}
            onClick={() => onSelect(r.pavilion.id)}
          >
            {r.pavilion.name[lang]}
          </button>
        ))}
      </div>

      <div className="stat-grid">
        <div className="stat">
          <span className="stat-label">{lb.score}</span>
          <span className="stat-value">
            {formatNumber(entry.total, lang)}
            <small>/ 100</small>
          </span>
          <span className="stat-hint">
            {lb.rank} #{entry.rank}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">{lb.capacity}</span>
          <span className="stat-value">
            {formatNumber(pavilion.capacityKwp, lang, 0)}
            <small>kWp</small>
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">{lb.dailyYield}</span>
          <span className="stat-value">
            {formatNumber(illustrativeDailyYieldKwh(pavilion), lang, 0)}
            <small>kWh</small>
          </span>
          <span className="stat-hint">{fill(lb.dailyYieldHint, { psh: formatNumber(pavilion.peakSunHours, lang) })}</span>
        </div>
      </div>

      <div className="table-wrap auto">
        <table className="data">
          <thead>
            <tr>
              <th>{lb.component}</th>
              <th className="num">{lb.rawInput}</th>
              <th className="num">{lb.componentScore}</th>
              <th className="num">{lb.weight}</th>
              <th className="num">{lb.weighted}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key}>
                <td className="wrap">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span className="legend-swatch block" style={{ background: COMPONENT_COLORS[r.key] }} />
                    <span>
                      {r.label}
                      <br />
                      <span className="muted" style={{ fontSize: 11.5 }}>
                        {r.bounds}
                      </span>
                    </span>
                  </span>
                </td>
                <td className="num">{r.raw}</td>
                <td className="num">{formatNumber(components[r.key], lang)}</td>
                <td className="num">{formatNumber(WEIGHTS[r.key], lang, 2)}</td>
                <td className="num">{formatNumber(w[r.key], lang)}</td>
              </tr>
            ))}
            <tr>
              <td>
                <strong>{lb.score}</strong>
              </td>
              <td />
              <td />
              <td className="num">{formatNumber(1, lang, 2)}</td>
              <td className="num">
                <strong>{formatNumber(entry.total, lang)}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <p className="card-note" style={{ marginBottom: 6 }}>
          {lb.formulaTitle}
        </p>
        <div className="formula" dir="ltr">
          {t.leaderboard.formula}
        </div>
        <p className="card-note" style={{ marginTop: 6 }}>
          {lb.normalisation}
        </p>
      </div>
    </Card>
  );
}
