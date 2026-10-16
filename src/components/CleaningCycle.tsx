import { CLEANING_THRESHOLD_PCT, POST_CLEAN_RESIDUAL_PCT } from '../domain/constants';
import { formatNumber, formatPercent } from '../domain/format';
import type { CleaningPhase } from '../domain/types';
import { fill } from '../i18n/strings';
import { useLang } from '../i18n/langContext';
import { useSim } from '../state/simContext';
import { Card } from './Card';
import { CleaningStatus } from './CleaningStatus';

const GAUGE_MAX = CLEANING_THRESHOLD_PCT * 2;

const STEP_FOR_PHASE: Record<CleaningPhase, number> = {
  standby: 0,
  attention: 1,
  cleaning: 2,
  verifying: 3,
};

/** The simulated cleaning state machine with a soiling gauge. */
export function CleaningCycle() {
  const { state } = useSim();
  const { t, lang } = useLang();
  const activeStep = STEP_FOR_PHASE[state.cleaning.phase];
  const pct = (v: number) => `${Math.min(100, (v / GAUGE_MAX) * 100)}%`;

  const steps = [
    { title: t.cycle.monitor, hint: t.cycle.monitorHint },
    { title: t.cycle.trigger, hint: fill(t.cycle.triggerHint, { value: formatPercent(CLEANING_THRESHOLD_PCT, lang, 0) }) },
    { title: t.cycle.clean, hint: fill(t.cycle.cleanHint, { value: formatPercent(POST_CLEAN_RESIDUAL_PCT, lang, 0) }) },
    { title: t.cycle.verify, hint: t.cycle.verifyHint },
  ];

  return (
    <Card id="cycle" title={t.cycle.title} subtitle={t.cycle.subtitle} source="simulated">
      {/* Numeric scale reads left→right in both languages, like the charts. */}
      <div className="gauge" dir="ltr">
        <div
          className="gauge-track"
          role="meter"
          aria-label={t.cycle.gaugeLabel}
          aria-valuemin={0}
          aria-valuemax={GAUGE_MAX}
          aria-valuenow={Number(state.soilingPct.toFixed(1))}
          aria-valuetext={formatPercent(state.soilingPct, lang)}
        >
          <div className="gauge-fill" style={{ width: pct(state.soilingPct) }} />
          <div className="gauge-threshold" style={{ insetInlineStart: pct(CLEANING_THRESHOLD_PCT) }} />
        </div>
        <div className="gauge-scale" aria-hidden="true">
          <span style={{ left: 0 }}>0%</span>
          <span style={{ left: pct(CLEANING_THRESHOLD_PCT) }}>
            {fill(t.chart.threshold, { value: `${CLEANING_THRESHOLD_PCT}%` })}
          </span>
          <span style={{ left: '100%' }}>{formatNumber(GAUGE_MAX, lang, 0)}%</span>
        </div>
      </div>

      <ol className="steps">
        {steps.map((s, i) => (
          <li key={s.title} className="step" data-active={i === activeStep}>
            <span className="step-num">0{i + 1}</span>
            <strong>{s.title}</strong>
            <span>{s.hint}</span>
          </li>
        ))}
      </ol>

      <CleaningStatus />
    </Card>
  );
}
