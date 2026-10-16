import {
  CLEANING_DURATION_S,
  DUST_EVENT_PP,
  POST_CLEAN_RESIDUAL_PCT,
  VERIFYING_DURATION_S,
} from '../domain/constants';
import { formatPercent } from '../domain/format';
import { fill } from '../i18n/strings';
import { useLang } from '../i18n/langContext';
import { canStartCleaning, isCycleActive } from '../simulation/engine';
import { useSim } from '../state/simContext';
import { Card } from './Card';
import { Icon } from './Icon';

export function QuickActions() {
  const { state, dispatch } = useSim();
  const { t, lang } = useLang();

  const active = isCycleActive(state);
  const canClean = canStartCleaning(state);

  let reason = '';
  if (active) reason = t.actions.disabledActive;
  else if (!canClean) reason = fill(t.actions.disabledResidual, { value: formatPercent(POST_CLEAN_RESIDUAL_PCT, lang, 0) });

  return (
    <Card id="actions" title={t.actions.title} subtitle={t.actions.subtitle} source="simulated">
      <div className="actions">
        <button
          type="button"
          className="action-btn"
          onClick={() => dispatch({ type: 'dust-event' })}
          disabled={active}
          aria-describedby="actions-reason"
        >
          <span className="ab-icon">
            <Icon name="dust" />
          </span>
          <span className="ab-text">
            <strong>{t.actions.dust}</strong>
            <span>{fill(t.actions.dustDetail, { value: `${DUST_EVENT_PP} pp` })}</span>
          </span>
        </button>

        <button
          type="button"
          className="action-btn primary"
          onClick={() => dispatch({ type: 'start-cleaning' })}
          disabled={!canClean}
          aria-describedby="actions-reason"
        >
          <span className="ab-icon">
            <Icon name="sparkle" />
          </span>
          <span className="ab-text">
            <strong>{t.actions.clean}</strong>
            <span>{fill(t.actions.cleanDetail, { n: CLEANING_DURATION_S + VERIFYING_DURATION_S })}</span>
          </span>
        </button>

        <div className="switch-row">
          <span id="auto-clean-label">{t.actions.autoClean}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <span className="card-note">{state.autoClean ? t.actions.on : t.actions.off}</span>
            <button
              type="button"
              role="switch"
              className="switch"
              aria-checked={state.autoClean}
              aria-labelledby="auto-clean-label"
              onClick={() => dispatch({ type: 'toggle-auto' })}
            />
          </span>
        </div>

        <p className="disabled-reason" id="actions-reason" aria-live="polite">
          {reason}
        </p>
      </div>
      <p className="card-note">{t.actions.note}</p>
    </Card>
  );
}
