import { useMemo } from 'react';
import { Leaderboard } from '../components/Leaderboard';
import { PavilionDetail } from '../components/PavilionDetail';
import { ILLUSTRATIVE_PAVILIONS } from '../data/pavilions';
import { rankPavilions } from '../scoring/leaderboard';
import type { SectionProps } from './sections';

export function PavilionsSection({ selectedPavilionId, selectPavilion }: SectionProps) {
  const ranked = useMemo(() => rankPavilions(ILLUSTRATIVE_PAVILIONS), []);
  return (
    <div className="section">
      <div className="grid">
        <div className="span-5" style={{ display: 'grid' }}>
          <Leaderboard ranked={ranked} selectedId={selectedPavilionId} onSelect={selectPavilion} />
        </div>
        <div className="span-7" style={{ display: 'grid' }}>
          <PavilionDetail ranked={ranked} selectedId={selectedPavilionId} onSelect={selectPavilion} />
        </div>
      </div>
    </div>
  );
}
