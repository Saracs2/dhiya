import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PANEL_RATING_W } from '../../domain/constants';
import { formatClock, formatNumber } from '../../domain/format';
import { useLang } from '../../i18n/langContext';
import type { Comparison } from '../../state/comparison';
import { AXIS_TICK, CHART, hourTicks } from './chartTheme';
import { ChartTooltipBody } from './ChartTooltip';

interface Row {
  timeH: number;
  conventional: number;
  dhiya: number;
}

export default function ComparisonChart({ comparison, compact = false }: { comparison: Comparison; compact?: boolean }) {
  const { t, lang } = useLang();
  const { conventional, dhiya } = comparison;

  const data = useMemo<Row[]>(
    () =>
      conventional.points.map((p, i) => ({
        timeH: p.timeH,
        conventional: p.powerW,
        dhiya: dhiya.points[i].powerW,
      })),
    [conventional, dhiya],
  );

  const peakOf = (key: 'conventional' | 'dhiya') =>
    data.reduce((best, r) => (r[key] > best[key] ? r : best), data[0]);
  const convPeak = peakOf('conventional');
  const dhiyaPeak = peakOf('dhiya');

  return (
    <div className={`chart-box ${compact ? 'short' : 'tall'}`} dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 22, right: 16, bottom: 4, left: -8 }}>
          <CartesianGrid stroke={CHART.grid} vertical={false} />
          <XAxis
            dataKey="timeH"
            type="number"
            domain={[6, 18]}
            ticks={hourTicks(6, 18, compact ? 3 : 2)}
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
              const r = payload[0].payload as Row;
              return (
                <ChartTooltipBody
                  timeH={r.timeH}
                  rows={[
                    { name: t.comparison.dhiya, value: `${formatNumber(r.dhiya, lang)} W`, color: CHART.dhiya },
                    {
                      name: t.comparison.conventional,
                      value: `${formatNumber(r.conventional, lang)} W`,
                      color: CHART.conventional,
                    },
                  ]}
                />
              );
            }}
          />
          {dhiya.cleaningTimesH.map((h) => (
            <ReferenceLine key={h} x={h} stroke={CHART.axis} strokeDasharray="3 3" />
          ))}
          <Line
            type="monotone"
            dataKey="conventional"
            stroke={CHART.conventional}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, stroke: CHART.surface, strokeWidth: 2 }}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="dhiya"
            stroke={CHART.dhiya}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, stroke: CHART.surface, strokeWidth: 2 }}
            isAnimationActive={false}
          />
          {/* Selective direct labels: each series' modeled peak only. */}
          <ReferenceDot
            x={dhiyaPeak.timeH}
            y={dhiyaPeak.dhiya}
            r={4}
            fill={CHART.dhiya}
            stroke={CHART.surface}
            strokeWidth={2}
            label={{ value: `${formatNumber(dhiyaPeak.dhiya, lang)} W`, position: 'top', fill: CHART.text, fontSize: 11 }}
          />
          <ReferenceDot
            x={convPeak.timeH}
            y={convPeak.conventional}
            r={4}
            fill={CHART.conventional}
            stroke={CHART.surface}
            strokeWidth={2}
            label={{
              value: `${formatNumber(convPeak.conventional, lang)} W`,
              position: 'bottom',
              fill: CHART.text,
              fontSize: 11,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
