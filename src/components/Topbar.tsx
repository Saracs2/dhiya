import { SPEED_PRESETS } from '../domain/constants';
import { formatClock } from '../domain/format';
import { fill } from '../i18n/strings';
import { useLang } from '../i18n/langContext';
import { useSim } from '../state/simContext';
import { Icon } from './Icon';

function SimClock() {
  const { state, dispatch } = useSim();
  const { t } = useLang();

  return (
    <div className="clock" role="group" aria-label={t.clock.label}>
      <div className="clock-time">
        <strong aria-live="off">{formatClock(state.timeH)}</strong>
        <span>
          {fill(t.clock.day, { n: state.day })} · {state.running ? t.source.simulated : t.clock.paused}
        </span>
      </div>
      <button
        type="button"
        className="icon-btn"
        onClick={() => dispatch({ type: 'toggle-running' })}
        aria-label={state.running ? t.clock.pause : t.clock.resume}
        title={state.running ? t.clock.pause : t.clock.resume}
      >
        <Icon name={state.running ? 'pause' : 'play'} size={16} />
      </button>
      <label className="sr-only" htmlFor="sim-speed">
        {t.clock.speed}
      </label>
      <select
        id="sim-speed"
        className="select"
        value={state.speed}
        onChange={(e) => dispatch({ type: 'set-speed', speed: Number(e.target.value) })}
        title={t.clock.speed}
      >
        {SPEED_PRESETS.map((s) => (
          <option key={s} value={s}>
            {fill(t.clock.speedOption, { n: s / 60 })}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="icon-btn"
        onClick={() => dispatch({ type: 'reset' })}
        aria-label={t.clock.resetLabel}
        title={t.clock.resetLabel}
      >
        <Icon name="reset" size={16} />
      </button>
    </div>
  );
}

export function Topbar({ title }: { title: string }) {
  const { t, toggleLang } = useLang();
  return (
    <div className="topbar">
      <div className="topbar-title">
        <h1>{title}</h1>
        <div className="mobile-brand brand" style={{ padding: 0 }}>
          <span className="brand-mark" style={{ width: 32, height: 32 }}>
            <Icon name="sun" size={18} />
          </span>
          <span className="brand-name">
            {t.app.name} <span className="alt">{t.app.nameAlt}</span>
          </span>
        </div>
      </div>
      <span className="demo-badge">
        <span className="dot" aria-hidden="true" />
        {t.app.demoBadge}
      </span>
      <SimClock />
      <button type="button" className="btn btn-ghost" onClick={toggleLang} aria-label={t.app.switchLanguageLabel}>
        <Icon name="globe" size={16} />
        {t.app.switchLanguage}
      </button>
    </div>
  );
}
