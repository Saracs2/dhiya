/** Table-view twins of the charts, so no value is reachable only by hovering. */
import { formatClock, formatNumber } from '../domain/format';
import type { Sample } from '../domain/types';
import { useLang } from '../i18n/langContext';
import type { Comparison } from '../state/comparison';

/** Keep whole-hour samples (plus the latest) so tables stay readable. */
function hourly<T extends { timeH: number }>(rows: T[], keepLast = true): T[] {
  const picked = rows.filter((r) => Math.abs(r.timeH - Math.round(r.timeH)) < 1e-6);
  const last = rows[rows.length - 1];
  if (keepLast && last && picked[picked.length - 1] !== last) picked.push(last);
  return picked;
}

export function PerformanceTable({ history }: { history: Sample[] }) {
  const { t, lang } = useLang();
  return (
    <div className="table-wrap">
      <table className="data">
        <thead>
          <tr>
            <th>{t.chart.time}</th>
            <th className="num">{t.chart.seriesOutput} (W)</th>
            <th className="num">{t.chart.seriesPotential} (W)</th>
            <th className="num">{t.chart.soilingPct}</th>
          </tr>
        </thead>
        <tbody>
          {hourly(history).map((s) => (
            <tr key={s.timeH}>
              <td>
                {formatClock(s.timeH)} {s.backfilled && <span className="muted">· {t.chart.reconstructed}</span>}
              </td>
              <td className="num">{formatNumber(s.powerW, lang)}</td>
              <td className="num">{formatNumber(s.potentialW, lang)}</td>
              <td className="num">{formatNumber(s.soilingPct, lang)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SoilingTable({ history }: { history: Sample[] }) {
  const { t, lang } = useLang();
  return (
    <div className="table-wrap">
      <table className="data">
        <thead>
          <tr>
            <th>{t.chart.time}</th>
            <th className="num">{t.chart.soilingPct}</th>
            <th className="num">{t.chart.powerW}</th>
          </tr>
        </thead>
        <tbody>
          {hourly(history).map((s) => (
            <tr key={s.timeH}>
              <td>
                {formatClock(s.timeH)} {s.backfilled && <span className="muted">· {t.chart.reconstructed}</span>}
              </td>
              <td className="num">{formatNumber(s.soilingPct, lang)}</td>
              <td className="num">{formatNumber(s.powerW, lang)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ComparisonTable({ comparison }: { comparison: Comparison }) {
  const { t, lang } = useLang();
  const rows = hourly(comparison.conventional.points, false).map((p) => {
    const d = comparison.dhiya.points.find((q) => q.timeH === p.timeH)!;
    return { timeH: p.timeH, conv: p, dhiya: d };
  });
  return (
    <div className="table-wrap">
      <table className="data">
        <thead>
          <tr>
            <th>{t.chart.time}</th>
            <th className="num">{t.comparison.conventional} (W)</th>
            <th className="num">{t.comparison.dhiya} (W)</th>
            <th className="num">{t.comparison.conventional} (%)</th>
            <th className="num">{t.comparison.dhiya} (%)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.timeH}>
              <td>{formatClock(r.timeH)}</td>
              <td className="num">{formatNumber(r.conv.powerW, lang)}</td>
              <td className="num">{formatNumber(r.dhiya.powerW, lang)}</td>
              <td className="num">{formatNumber(r.conv.soilingPct, lang)}</td>
              <td className="num">{formatNumber(r.dhiya.soilingPct, lang)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
