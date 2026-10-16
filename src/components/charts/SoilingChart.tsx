import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CLEANING_THRESHOLD_PCT } from '../../domain/constants';
import { formatClock, formatNumber } from '../../domain/format';
import type { Sample } from '../../domain/types';
import { fill } from '../../i18n/strings';
import { useLang } from '../../i18n/langContext';
import { AXIS_TICK, CHART, hourTicks } from './chartTheme';
import { ChartTooltipBody } from './ChartTooltip';

interface Props {
  history: Sample[];
  nowH: number;
}

export default function SoilingChart({ history, nowH }: Props) {
  const { t, lang } = useLang();
  const yMax = useMemo(() => {
    const peak = Math.max(CLEANING_THRESHOLD_PCT, ...history.map((s) => s.soilingPct));
    return Math.ceil((peak + 5) / 5) * 5;
  }, [history]);

  return (
    <div className="chart-box" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={history} margin={{ top: 16, right: 12, bottom: 4, left: -8 }}>
          <CartesianGrid stroke={CHART.grid} vertical={false} />
          <XAxis
            dataKey="timeH"
            type="number"
            domain={[0, 24]}
            ticks={hourTicks(0, 24, 3)}
            tickFormatter={formatClock}
            tick={AXIS_TICK}
            axisLine={{ stroke: CHART.axis }}
            tickLine={false}
          />
          <YAxis
            domain={[0, yMax]}
            ticks={Array.from({ length: yMax / 5 + 1 }, (_, i) => i * 5)}
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
            unit="%"
            width={48}
          />
          <Tooltip
            cursor={{ stroke: CHART.axis, strokeWidth: 1 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const s = payload[0].payload as Sample;
              return (
                <ChartTooltipBody
                  timeH={s.timeH}
                  note={s.backfilled ? t.chart.reconstructed : undefined}
                  rows={[
                    { name: t.chart.seriesSoiling, value: `${formatNumber(s.soilingPct, lang)}%`, color: CHART.dhiya },
                    { name: t.chart.seriesOutput, value: `${formatNumber(s.powerW, lang)} W` },
                  ]}
                />
              );
            }}
          />
          <ReferenceLine
            y={CLEANING_THRESHOLD_PCT}
            stroke={CHART.threshold}
            strokeOpacity={0.6}
            strokeDasharray="4 4"
            label={{
              value: fill(t.chart.threshold, { value: `${CLEANING_THRESHOLD_PCT}%` }),
              position: 'insideTopRight',
              fill: CHART.textMuted,
              fontSize: 11,
            }}
          />
          <ReferenceLine
            x={nowH}
            stroke={CHART.textMuted}
            label={{ value: t.chart.now, position: 'top', fill: CHART.textMuted, fontSize: 11 }}
          />
          <Line
            type="linear"
            dataKey="soilingPct"
            stroke={CHART.dhiya}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, stroke: CHART.surface, strokeWidth: 2, fill: CHART.dhiya }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
