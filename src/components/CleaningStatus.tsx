import { fill } from '../i18n/strings';
import { useLang } from '../i18n/langContext';
import { cycleProgress, isCycleActive } from '../simulation/engine';
import { useSim } from '../state/simContext';

/** Current cleaning phase: pill + explanation + progress while a cycle runs. */
export function CleaningStatus() {
  const { state } = useSim();
  const { t } = useLang();
  const { phase, trigger } = state.cleaning;
  const active = isCycleActive(state);

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div>
        <span className={`status-pill ${phase}`} role="status" aria-live="polite">
          <span className="dot" aria-hidden="true" />
          {t.phase[phase]}
        </span>
      </div>
      {active && (
        <div className="progress" aria-hidden="true">
          <div style={{ width: `${cycleProgress(state) * 100}%` }} />
        </div>
      )}
      <p className="kpi-sub">{t.phase[`${phase}Hint`]}</p>
      <p className="kpi-hint">
        {active && trigger
          ? trigger === 'auto'
            ? t.phase.triggerAuto
            : t.phase.triggerManual
          : fill(t.kpi.cycles, { n: state.cyclesCompleted })}
      </p>
    </div>
  );
}
