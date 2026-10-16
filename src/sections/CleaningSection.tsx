import { CleaningCycle } from '../components/CleaningCycle';
import { EventLog } from '../components/EventLog';
import { QuickActions } from '../components/QuickActions';
import SolarHardwarePanel from '../components/SolarHardwarePanel';
import { SoilingPanel } from './shared';

export function CleaningSection() {
  return (
    <div className="section">
      <div className="grid">
        <div className="span-7" style={{ display: 'grid' }}>
          <CleaningCycle />
        </div>
        <div className="span-5" style={{ display: 'grid' }}>
          <QuickActions />
        </div>
        <div className="span-12" style={{ display: 'grid' }}>
          <SolarHardwarePanel />
        </div>
        <SoilingPanel className="span-8" />
        <div className="span-4" style={{ display: 'grid' }}>
          <EventLog />
        </div>
      </div>
    </div>
  );
}
