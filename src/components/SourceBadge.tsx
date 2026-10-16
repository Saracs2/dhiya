import type { DataSource } from '../domain/types';
import { useLang } from '../i18n/langContext';
import { Icon, type IconName } from './Icon';

const ICONS: Record<DataSource, IconName> = {
  simulated: 'chip',
  illustrative: 'sparkle',
  reference: 'model',
  unavailable: 'sensor',
};

/** Labels where a value comes from. Shown next to every value group on the dashboard. */
export function SourceBadge({ source }: { source: DataSource }) {
  const { t } = useLang();
  const hint = t.source[`${source}Hint`];
  return (
    <span className={`source-badge ${source}`} title={hint}>
      <Icon name={ICONS[source]} />
      <span>{t.source[source]}</span>
      <span className="sr-only">: {hint}</span>
    </span>
  );
}
