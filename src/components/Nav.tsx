import { useLang } from '../i18n/langContext';
import { SECTION_ICONS, SECTIONS, type SectionId } from '../sections/sections';
import { Icon } from './Icon';

interface NavProps {
  current: SectionId;
  className: string;
  /** Distinguishes the sidebar and mobile navs for assistive tech. */
  labelSuffix?: string;
}

/** Section links. Plain hash links so the browser's back/forward and refresh just work. */
export function Nav({ current, className, labelSuffix = '' }: NavProps) {
  const { t } = useLang();
  return (
    <nav className={className} aria-label={`${t.nav.label}${labelSuffix}`}>
      {SECTIONS.map((id) => (
        <a key={id} href={`#${id}`} className="nav-item" aria-current={id === current ? 'page' : undefined}>
          <Icon name={SECTION_ICONS[id]} />
          <span>{t.nav[id]}</span>
        </a>
      ))}
    </nav>
  );
}
