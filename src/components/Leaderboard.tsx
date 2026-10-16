import type { ReactNode } from 'react';
import { formatNumber } from '../domain/format';
import type { ScoredPavilion } from '../domain/types';
import { useLang } from '../i18n/langContext';
import { weightedContributions } from '../scoring/leaderboard';
import { Card } from './Card';
import { COMPONENT_COLORS, useComponentLegend } from './componentLegend';
import { Icon } from './Icon';

interface Props {
  ranked: ScoredPavilion[];
  selectedId: string;
  onSelect: (id: string) => void;
  /** Extra line under the card (e.g. a link to the full section). */
  footer?: ReactNode;
}

/** Ranked pavilions with a stacked bar of weighted points (segments sum to the score). */
export function Leaderboard({ ranked, selectedId, onSelect, footer }: Props) {
  const { t, lang } = useLang();
  const legend = useComponentLegend();

  return (
    <Card id="leaderboard" title={t.leaderboard.title} subtitle={t.leaderboard.subtitle} source="illustrative">
      <div className="legend">
        {legend.map((l) => (
          <span className="legend-item" key={l.label}>
            <span className="legend-swatch block" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>

      <div className="lb" role="group" aria-label={t.leaderboard.select}>
        {ranked.map((r) => {
          const w = weightedContributions(r.components);
          const name = r.pavilion.name[lang];
          return (
            <button
              key={r.pavilion.id}
              type="button"
              className="lb-row"
              aria-pressed={r.pavilion.id === selectedId}
              onClick={() => onSelect(r.pavilion.id)}
              title={t.leaderboard.viewDetails}
            >
              <span className="lb-rank">{r.rank}</span>
              <span className="lb-main">
                <span className="lb-name">{name}</span>
                <span className="lb-bar" dir="ltr" aria-hidden="true">
                  <span style={{ width: `${w.solarPerformance}%`, background: COMPONENT_COLORS.solarPerformance }} />
                  <span style={{ width: `${w.solarContribution}%`, background: COMPONENT_COLORS.solarContribution }} />
                  <span style={{ width: `${w.maintenance}%`, background: COMPONENT_COLORS.maintenance }} />
                </span>
              </span>
              <span className="lb-score">
                {formatNumber(r.total, lang)}
                <span className="sr-only"> / 100</span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="disclaimer">
        <Icon name="info" size={16} />
        <span>{t.leaderboard.disclaimer}</span>
      </p>
      {footer}
    </Card>
  );
}
