import type { IconName } from '../components/Icon';

export const SECTIONS = ['overview', 'monitoring', 'cleaning', 'pavilions', 'insights', 'system'] as const;
export type SectionId = (typeof SECTIONS)[number];

export const SECTION_ICONS: Record<SectionId, IconName> = {
  overview: 'grid',
  monitoring: 'sun',
  cleaning: 'sparkle',
  pavilions: 'trophy',
  insights: 'leaf',
  system: 'info',
};

export function sectionFromHash(hash: string): SectionId {
  const id = hash.replace(/^#\/?/, '');
  return (SECTIONS as readonly string[]).includes(id) ? (id as SectionId) : 'overview';
}

/** Props every section receives from the app shell. */
export interface SectionProps {
  navigate: (id: SectionId) => void;
  selectedPavilionId: string;
  selectPavilion: (id: string) => void;
}
