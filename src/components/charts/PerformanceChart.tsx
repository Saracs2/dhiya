import { useMemo } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DAYLIGHT_START_H, EXAMPLE_START_TIME_H, PANEL_RATING_W, SAMPLE_INTERVAL_MIN } from '../../domain/constants';
import { formatClock, formatNumber } from '../../domain/format';
import type { Sample } from '../../domain/types';
import { useLang } from '../../i18n/langContext';
import { potentialPowerW } from '../../simulation/solarModel';
import { AXIS_TICK, CHART, hourTicks } from './chartTheme';
import { ChartTooltipBody } from './ChartTooltip';

const X_FROM = 5;
const X_TO = 19;

interface Row {
  timeH: number;
  potential: number;
  output?: number;
  soiling?: number;
  backfilled?: boolean;
}

interface Props {
  history: Sample[];
  nowH: number;
  showBackfill: boolean;
}

export default function PerformanceChart({ history, nowH, showBackfill }: Props) {
  const { t, lang } = useLang();

  const data = useMemo(() => {
    const step = SAMPLE_INTERVAL_MIN / 60;
    const byKey = new Map(history.map((s) => [Math.round(s.timeH / step), s]));
    const rows: Row[] = [];
    for (let h = X_FROM; h <= X_TO + 1e-9; h += step) {
      const sample = byKey.get(Math.round(h / step));
      rows.push({
        timeH: h,
        potential: potentialPowerW(h),
        output: sample?.powerW,
        soiling: sample?.soilingPct,
        backfilled: sample?.backfilled,
      });
    }
    return rows;
  }, [history]);

  const nowVisible = nowH >= X_FROM && nowH <= X_TO;

  return (
    <div className="chart-box tall" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 16, right: 12, bottom: 4, left: -8 }}>
          <defs>
            <linearGradient id="outputFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART.dhiya} stopOpacity={0.28} />
              <stop offset="100%" stopColor={CHART.dhiya} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={CHART.grid} vertical={false} />
          {showBackfill && (
            <ReferenceArea
              x1={DAYLIGHT_START_H}
              x2={EXAMPLE_START_TIME_H}
              fill={CHART.backfill}
              stroke="none"
              label={{ value: t.chart.reconstructed, position: 'insideTop', fill: CHART.tick, fontSize: 11 }}
            />
          )}
          <XAxis
            dataKey="timeH"
            type="number"
            domain={[X_FROM, X_TO]}
            ticks={hourTicks(6, 18, 2)}
            tickFormatter={formatClock}
            tick={AXIS_TICK}
            axisLine={{ stroke: CHART.axis }}
            tickLine={false}
          />
          <YAxis
            domain={[0, PANEL_RATING_W]}
            ticks={[0, 25, 50, 75, 100]}
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
            unit=" W"
            width={52}
          />
          <Tooltip
            cursor={{ stroke: CHART.axis, strokeWidth: 1 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const row = payload[0].payload as Row;
              return (
                <ChartTooltipBody
                  timeH={row.timeH}
                  note={row.backfilled ? t.chart.reconstructed : undefined}
                  rows={[
                    ...(row.output !== undefined
                      ? [{ name: t.chart.seriesOutput, value: `${formatNumber(row.output, lang)} W`, color: CHART.dhiya }]
                      : []),
                    {
                      name: t.chart.seriesPotential,
                      value: `${formatNumber(row.potential, lang)} W`,
                      color: CHART.reference,
                    },
                    ...(row.soiling !== undefined
                      ? [{ name: t.kpi.soiling, value: `${formatNumber(row.soiling, lang)}%` }]
                      : []),
                  ]}
                />
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="potential"
            stroke={CHART.reference}
            strokeWidth={1.5}
            strokeDasharray="5 4"
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="output"
            stroke={CHART.dhiya}
            strokeWidth={2}
            fill="url(#outputFill)"
            connectNulls={false}
            dot={false}
            activeDot={{ r: 4, stroke: CHART.surface, strokeWidth: 2, fill: CHART.dhiya }}
            isAnimationActive={false}
          />
          {nowVisible && (
            <ReferenceLine
              x={nowH}
              stroke={CHART.textMuted}
              strokeWidth={1}
              label={{ value: t.chart.now, position: 'top', fill: CHART.textMuted, fontSize: 11 }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
