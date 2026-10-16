import { Suspense, useState, type ReactNode } from 'react';
import type { DataSource } from '../domain/types';
import { useLang } from '../i18n/langContext';
import { Card } from './Card';
import { ErrorBoundary } from './ErrorBoundary';
import { Icon } from './Icon';

export interface LegendItem {
  label: string;
  color: string;
  dashed?: boolean;
}

interface ChartPanelProps {
  id: string;
  title: ReactNode;
  subtitle?: ReactNode;
  source: DataSource;
  legend?: LegendItem[];
  chart: ReactNode;
  table: ReactNode;
  /** Shown instead of the chart when there is nothing to plot yet. */
  emptyMessage?: string | null;
  footer?: ReactNode;
  className?: string;
}

/** A chart card with a chart/table toggle, lazy-load skeleton, empty and error states. */
export function ChartPanel({
  id,
  title,
  subtitle,
  source,
  legend,
  chart,
  table,
  emptyMessage,
  footer,
  className,
}: ChartPanelProps) {
  const { t } = useLang();
  const [view, setView] = useState<'chart' | 'table'>('chart');

  const toggle = (
    <div className="seg" role="group" aria-label={t.chart.viewLabel}>
      <button type="button" aria-pressed={view === 'chart'} onClick={() => setView('chart')}>
        {t.chart.viewChart}
      </button>
      <button type="button" aria-pressed={view === 'table'} onClick={() => setView('table')}>
        {t.chart.viewTable}
      </button>
    </div>
  );

  let body: ReactNode;
  if (emptyMessage) {
    body = (
      <div className="chart-state" role="status">
        <Icon name="chart" size={22} />
        <span>{emptyMessage}</span>
      </div>
    );
  } else if (view === 'table') {
    body = table;
  } else {
    body = (
      <ErrorBoundary message={t.chart.error} retryLabel={t.chart.retry}>
        <Suspense
          fallback={
            <div className="chart-box tall" role="status" aria-label={t.chart.loading}>
              <div className="skeleton" />
            </div>
          }
        >
          {chart}
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <Card id={id} title={title} subtitle={subtitle} source={source} tools={toggle} className={className}>
      {legend && legend.length > 1 && view === 'chart' && !emptyMessage && (
        <div className="legend">
          {legend.map((item) => (
            <span className="legend-item" key={item.label}>
              <span
                className={`legend-swatch ${item.dashed ? 'dashed' : ''}`}
                style={{ background: item.color, color: item.color }}
              />
              {item.label}
            </span>
          ))}
        </div>
      )}
      {body}
      {footer}
    </Card>
  );
}
