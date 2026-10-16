import { useCallback, useEffect, useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Icon } from './components/Icon';
import { Nav } from './components/Nav';
import { Topbar } from './components/Topbar';
import { ILLUSTRATIVE_PAVILIONS } from './data/pavilions';
import { useLang } from './i18n/langContext';
import { CleaningSection } from './sections/CleaningSection';
import { InsightsSection } from './sections/InsightsSection';
import { MonitoringSection } from './sections/MonitoringSection';
import { OverviewSection } from './sections/OverviewSection';
import { PavilionsSection } from './sections/PavilionsSection';
import { sectionFromHash, type SectionId, type SectionProps } from './sections/sections';
import { SystemSection } from './sections/SystemSection';

function useHashSection(): [SectionId, (id: SectionId) => void] {
  const [section, setSection] = useState<SectionId>(() => sectionFromHash(window.location.hash));

  useEffect(() => {
    const onHash = () => {
      setSection(sectionFromHash(window.location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = useCallback((id: SectionId) => {
    window.location.hash = id;
  }, []);

  return [section, navigate];
}

function renderSection(id: SectionId, props: SectionProps) {
  switch (id) {
    case 'overview':
      return <OverviewSection {...props} />;
    case 'monitoring':
      return <MonitoringSection />;
    case 'cleaning':
      return <CleaningSection />;
    case 'pavilions':
      return <PavilionsSection {...props} />;
    case 'insights':
      return <InsightsSection />;
    case 'system':
      return <SystemSection />;
  }
}

export default function App() {
  const { t } = useLang();
  const [section, navigate] = useHashSection();
  const [selectedPavilionId, selectPavilion] = useState(ILLUSTRATIVE_PAVILIONS[0].id);

  return (
    <>
      <a className="skip-link" href="#main">
        {t.app.skipToContent}
      </a>
      <div className="shell">
        <aside className="sidebar">
          <div className="brand">
            <span className="brand-mark">
              <Icon name="sun" size={20} />
            </span>
            <span>
              <span className="brand-name">
                {t.app.name} <span className="alt">{t.app.nameAlt}</span>
              </span>
              <span className="brand-tagline">{t.app.tagline}</span>
            </span>
          </div>
          <Nav current={section} className="nav" />
          <div className="sidebar-foot">{t.app.demoBanner}</div>
        </aside>

        <div className="main">
          <header className="top-wrap">
            <Topbar title={t.nav[section]} />
            <Nav current={section} className="mobile-nav" labelSuffix=" (mobile)" />
          </header>

          <main className="content" id="main" tabIndex={-1}>
            <p className="banner" role="note">
              <Icon name="info" size={16} />
              {t.app.demoBanner}
            </p>
            <ErrorBoundary key={section} message={t.chart.error} retryLabel={t.chart.retry}>
              {renderSection(section, { navigate, selectedPavilionId, selectPavilion })}
            </ErrorBoundary>
          </main>

          <footer className="footer">{t.app.footer}</footer>
        </div>
      </div>
    </>
  );
}
