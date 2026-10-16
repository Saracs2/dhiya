import { useLang } from '../i18n/langContext';
import type { LegendItem } from './ChartPanel';
import { CHART } from './charts/chartTheme';

/** Leaderboard component colours — the validated three-slot series palette, in fixed order. */
export const COMPONENT_COLORS = {
  solarPerformance: CHART.dhiya,
  solarContribution: CHART.conventional,
  maintenance: CHART.third,
} as const;

export function useComponentLegend(): LegendItem[] {
  const { t } = useLang();
  return [
    { label: `${t.leaderboard.componentPerformance} (50%)`, color: COMPONENT_COLORS.solarPerformance },
    { label: `${t.leaderboard.componentContribution} (30%)`, color: COMPONENT_COLORS.solarContribution },
    { label: `${t.leaderboard.componentMaintenance} (20%)`, color: COMPONENT_COLORS.maintenance },
  ];
}
