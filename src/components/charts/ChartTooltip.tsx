import { formatClock } from '../../domain/format';

export interface TooltipRow {
  name: string;
  value: string;
  color?: string;
}

/** Shared tooltip body used by every chart. */
export function ChartTooltipBody({ timeH, rows, note }: { timeH: number; rows: TooltipRow[]; note?: string }) {
  return (
    <div className="tooltip">
      <div className="tooltip-title">
        {formatClock(timeH)}
        {note ? ` · ${note}` : ''}
      </div>
      {rows.map((r) => (
        <div className="tooltip-row" key={r.name}>
          {r.color && <span className="legend-swatch block" style={{ background: r.color }} />}
          <span className="name">{r.name}</span>
          <span className="val">{r.value}</span>
        </div>
      ))}
    </div>
  );
}
