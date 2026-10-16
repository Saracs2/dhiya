import { useLang } from '../i18n/langContext';
import { Card } from './Card';
import { Icon } from './Icon';

export function ProjectOverview({ onLearnMore }: { onLearnMore: () => void }) {
  const { t } = useLang();
  return (
    <Card id="about" title={t.overview.title} subtitle={t.overview.subtitle}>
      <div className="prose">
        <p>{t.overview.body1}</p>
        <p>{t.overview.body2}</p>
        <p>{t.overview.body3}</p>
      </div>
      <button type="button" className="link-btn" onClick={onLearnMore}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {t.overview.learnMore}
          <Icon name="arrowRight" size={16} className="flip-rtl" />
        </span>
      </button>
    </Card>
  );
}
