import { useMemo } from 'react';
import { Icon } from '../components/Icon';
import { KpiRow } from '../components/KpiRow';
import { Leaderboard } from '../components/Leaderboard';
import { ProjectOverview } from '../components/ProjectOverview';
import { QuickActions } from '../components/QuickActions';
import { SystemStatus } from '../components/SystemStatus';
import { ILLUSTRATIVE_PAVILIONS } from '../data/pavilions';
import { useLang } from '../i18n/langContext';
import { rankPavilions } from '../scoring/leaderboard';
import type { SectionProps } from './sections';
import { ComparisonPanel, PerformancePanel } from './shared';

export function OverviewSection({ navigate, selectedPavilionId, selectPavilion }: SectionProps) {
  const { t } = useLang();
  const ranked = useMemo(() => rankPavilions(ILLUSTRATIVE_PAVILIONS), []);

  return (
    <div className="section">
      <KpiRow />
      <div className="grid">
        <PerformancePanel className="span-8" />
        <div className="span-4" style={{ display: 'grid' }}>
          <QuickActions />
        </div>
        <ComparisonPanel className="span-7" compact />
        <div className="span-5" style={{ display: 'grid' }}>
          <Leaderboard
            ranked={ranked}
            selectedId={selectedPavilionId}
            onSelect={(id) => {
              selectPavilion(id);
              navigate('pavilions');
            }}
            footer={
              <button type="button" className="link-btn" onClick={() => navigate('pavilions')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {t.leaderboard.viewDetails}
                  <Icon name="arrowRight" size={16} className="flip-rtl" />
                </span>
              </button>
            }
          />
        </div>
        <div className="span-6" style={{ display: 'grid' }}>
          <SystemStatus />
        </div>
        <div className="span-6" style={{ display: 'grid' }}>
          <ProjectOverview onLearnMore={() => navigate('system')} />
        </div>
      </div>
    </div>
  );
}
