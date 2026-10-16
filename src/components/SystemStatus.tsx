import { useLang } from '../i18n/langContext';
import { useSim } from '../state/simContext';
import { Card } from './Card';
import { Icon, type IconName } from './Icon';

interface Subsystem {
  icon: IconName;
  name: string;
  state: string;
  note: string;
  active: boolean;
}

/**
 * What is and isn't running. Hardware and MATLAB entries are fixed "not connected"
 * because nothing in this repository integrates them.
 */
export function SystemStatus({ showSensors = true }: { showSensors?: boolean }) {
  const { state } = useSim();
  const { t } = useLang();
  const s = t.system;

  const items: Subsystem[] = [
    {
      icon: 'chip',
      name: s.engine,
      state: state.running ? s.engineRunning : s.enginePaused,
      note: t.source.simulatedHint,
      active: state.running,
    },
    { icon: 'chip', name: s.esp32, state: s.notConnected, note: s.hardwareNote, active: false },
    { icon: 'servo', name: s.servo, state: s.notConnected, note: s.hardwareNote, active: false },
    { icon: 'screen', name: s.touchscreen, state: s.notConnected, note: s.hardwareNote, active: false },
    { icon: 'model', name: s.matlab, state: s.notIntegrated, note: s.matlabNote, active: false },
  ];

  return (
    <Card id="system-status" title={s.statusTitle} subtitle={s.statusSubtitle}>
      <ul className="sys-list">
        {items.map((item) => (
          <li key={item.name} className={`sys-item ${item.active ? 'active' : ''}`}>
            <span className="sys-icon">
              <Icon name={item.icon} />
            </span>
            <span>
              <span className="sys-name">{item.name}</span>
              <br />
              <span className="sys-note">{item.note}</span>
            </span>
            <span className="sys-state">
              <span className="dot" aria-hidden="true" />
              {item.state}
            </span>
          </li>
        ))}
      </ul>

      {showSensors && (
        <div>
          <p className="card-note" style={{ marginBottom: 8, fontWeight: 600, color: 'var(--text-2)' }}>
            {s.sensorTitle}
          </p>
          <div className="empty" role="status">
            <Icon name="sensor" size={20} />
            <span>{s.sensorEmpty}</span>
          </div>
        </div>
      )}
    </Card>
  );
}
