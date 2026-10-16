/** Chart panels reused by more than one section, so each is defined once. */
import { ChartPanel } from '../components/ChartPanel';
import { CHART } from '../components/charts/chartTheme';
import { ComparisonChart, PerformanceChart, SoilingChart } from '../components/charts/lazy';
import { ComparisonSummary } from '../components/ComparisonSummary';
import { ComparisonTable, PerformanceTable, SoilingTable } from '../components/tables';
import { useLang } from '../i18n/langContext';
import { getComparison } from '../state/comparison';
import { useSim } from '../state/simContext';

export function PerformancePanel({ className }: { className?: string }) {
  const { state } = useSim();
  const { t } = useLang();
  const showBackfill = state.history.some((s) => s.backfilled);
  return (
    <ChartPanel
      id="performance"
      className={className}
      title={t.chart.performanceTitle}
      subtitle={t.chart.performanceSubtitle}
      source="simulated"
      legend={[
        { label: t.chart.seriesOutput, color: CHART.dhiya },
        { label: t.chart.seriesPotential, color: CHART.reference, dashed: true },
      ]}
      emptyMessage={state.history.length < 2 ? t.chart.empty : null}
      chart={<PerformanceChart history={state.history} nowH={state.timeH} showBackfill={showBackfill} />}
      table={<PerformanceTable history={state.history} />}
      footer={showBackfill ? <p className="card-note">{t.chart.backfillNote}</p> : undefined}
    />
  );
}

export function SoilingPanel({ className }: { className?: string }) {
  const { state } = useSim();
  const { t } = useLang();
  return (
    <ChartPanel
      id="soiling"
      className={className}
      title={t.chart.soilingTitle}
      subtitle={t.chart.soilingSubtitle}
      source="simulated"
      emptyMessage={state.history.length < 2 ? t.chart.empty : null}
      chart={<SoilingChart history={state.history} nowH={state.timeH} />}
      table={<SoilingTable history={state.history} />}
    />
  );
}

export function ComparisonPanel({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { t } = useLang();
  const comparison = getComparison();
  return (
    <ChartPanel
      id={compact ? 'comparison-compact' : 'comparison'}
      className={className}
      title={t.comparison.title}
      subtitle={t.comparison.subtitle}
      source="simulated"
      legend={[
        { label: t.comparison.dhiyaLong, color: CHART.dhiya },
        { label: t.comparison.conventionalLong, color: CHART.conventional },
      ]}
      chart={<ComparisonChart comparison={comparison} compact={compact} />}
      table={<ComparisonTable comparison={comparison} />}
      footer={<ComparisonSummary comparison={comparison} />}
    />
  );
}
