/**
 * Live demonstration engine: a pure reducer over SimState. The React layer only
 * dispatches actions on a timer — all behaviour lives here and is unit-tested.
 */
import {
  CLEANING_DURATION_S,
  DAYLIGHT_START_H,
  DEFAULT_SPEED,
  EXAMPLE_START_SOILING_PCT,
  EXAMPLE_START_TIME_H,
  MORNING_START_SOILING_PCT,
  POST_CLEAN_RESIDUAL_PCT,
  SAMPLE_INTERVAL_MIN,
  VERIFYING_DURATION_S,
} from '../domain/constants';
import type { CleaningTrigger, SimAction, SimEventKind, SimState } from '../domain/types';
import { simulateProfile } from './dailyProfile';
import { accumulateSoiling, applyDustEvent, isAboveThreshold, soilingDuringCleaning } from './soiling';
import { modeledPowerW, potentialPowerW } from './solarModel';

const MAX_EVENTS = 40;
/** Largest simulated step integrated at once (hours) — keeps energy integration accurate at high speed. */
const MAX_SUBSTEP_H = 1 / 60;
const SAMPLE_H = SAMPLE_INTERVAL_MIN / 60;

export function createInitialState(speed: number = DEFAULT_SPEED): SimState {
  const morning = simulateProfile({
    strategy: 'dhiya',
    startSoilingPct: MORNING_START_SOILING_PCT,
    startH: DAYLIGHT_START_H,
    endH: EXAMPLE_START_TIME_H,
  });

  const history = morning.points.map((p) => ({ ...p, backfilled: true }));

  return {
    day: 1,
    timeH: EXAMPLE_START_TIME_H,
    // The reconstructed morning lands on the example value; pin it exactly.
    soilingPct: EXAMPLE_START_SOILING_PCT,
    energyWh: morning.energyWh,
    cleaning: { phase: 'standby', elapsedS: 0, startSoilingPct: 0, trigger: null },
    autoClean: true,
    running: true,
    speed,
    history,
    events: [
      { id: 0, day: 1, timeH: EXAMPLE_START_TIME_H, kind: 'session-start', soilingPct: EXAMPLE_START_SOILING_PCT },
    ],
    cyclesCompleted: 0,
    nextEventId: 1,
  };
}

function logEvent(state: SimState, kind: SimEventKind): SimState {
  const event = { id: state.nextEventId, day: state.day, timeH: state.timeH, kind, soilingPct: state.soilingPct };
  return {
    ...state,
    events: [event, ...state.events].slice(0, MAX_EVENTS),
    nextEventId: state.nextEventId + 1,
  };
}

function startCleaning(state: SimState, trigger: CleaningTrigger): SimState {
  const next: SimState = {
    ...state,
    cleaning: { phase: 'cleaning', elapsedS: 0, startSoilingPct: state.soilingPct, trigger },
  };
  return logEvent(next, 'cleaning-start');
}

/** After soiling changes: start an automatic cycle, or flag that attention is needed. */
function checkThreshold(state: SimState): SimState {
  if (state.cleaning.phase !== 'standby' || !isAboveThreshold(state.soilingPct)) return state;
  const flagged = logEvent(state, 'threshold');
  if (state.autoClean) return startCleaning(flagged, 'auto');
  return { ...flagged, cleaning: { ...flagged.cleaning, phase: 'attention' } };
}

export function canStartCleaning(state: SimState): boolean {
  const { phase } = state.cleaning;
  return (phase === 'standby' || phase === 'attention') && state.soilingPct > POST_CLEAN_RESIDUAL_PCT;
}

export function isCycleActive(state: SimState): boolean {
  return state.cleaning.phase === 'cleaning' || state.cleaning.phase === 'verifying';
}

/** Progress the real-time cleaning cycle. */
function advanceCleaning(state: SimState, realDtS: number): SimState {
  const { cleaning } = state;
  if (cleaning.phase === 'cleaning') {
    const elapsedS = cleaning.elapsedS + realDtS;
    const soilingPct = soilingDuringCleaning(cleaning.startSoilingPct, elapsedS / CLEANING_DURATION_S);
    if (elapsedS >= CLEANING_DURATION_S) {
      return { ...state, soilingPct, cleaning: { ...cleaning, phase: 'verifying', elapsedS: 0 } };
    }
    return { ...state, soilingPct, cleaning: { ...cleaning, elapsedS } };
  }
  if (cleaning.phase === 'verifying') {
    const elapsedS = cleaning.elapsedS + realDtS;
    if (elapsedS >= VERIFYING_DURATION_S) {
      const done: SimState = {
        ...state,
        cleaning: { phase: 'standby', elapsedS: 0, startSoilingPct: 0, trigger: null },
        cyclesCompleted: state.cyclesCompleted + 1,
      };
      return logEvent(done, 'cleaning-done');
    }
    return { ...state, cleaning: { ...cleaning, elapsedS } };
  }
  return state;
}

function pushSample(state: SimState, timeH: number): SimState {
  const sample = {
    timeH,
    powerW: modeledPowerW(timeH, state.soilingPct),
    potentialW: potentialPowerW(timeH),
    soilingPct: state.soilingPct,
    backfilled: false,
  };
  return { ...state, history: [...state.history, sample] };
}

/** Advance the simulated clock by dtH (≤ MAX_SUBSTEP_H), integrating energy and dust. */
function advanceClock(state: SimState, dtH: number): SimState {
  let s = state;
  const t0 = s.timeH;
  let t1 = t0 + dtH;

  // Energy: midpoint rule with the soiling at the start of the step.
  s = { ...s, energyWh: s.energyWh + modeledPowerW(t0 + dtH / 2, s.soilingPct) * dtH };

  if (!isCycleActive(s)) {
    s = { ...s, soilingPct: accumulateSoiling(s.soilingPct, t0, Math.min(t1, 24)) };
  }

  // Record a chart sample at each sampling boundary crossed.
  const nextBoundary = (Math.floor(t0 / SAMPLE_H + 1e-9) + 1) * SAMPLE_H;
  if (t1 >= nextBoundary - 1e-9 && nextBoundary <= 24) {
    s = pushSample(s, nextBoundary);
  }

  if (t1 >= 24) {
    t1 -= 24;
    s = { ...s, day: s.day + 1, energyWh: 0, history: [] };
    s = logEvent({ ...s, timeH: 0 }, 'new-day');
  }

  return checkThreshold({ ...s, timeH: t1 });
}

export function simReducer(state: SimState, action: SimAction): SimState {
  switch (action.type) {
    case 'tick': {
      if (!state.running || action.realDtS <= 0) return state;
      let s = advanceCleaning(state, action.realDtS);
      let remainingH = (action.realDtS * s.speed) / 3600;
      while (remainingH > 1e-12) {
        const dtH = Math.min(remainingH, MAX_SUBSTEP_H);
        s = advanceClock(s, dtH);
        remainingH -= dtH;
      }
      return s;
    }
    case 'dust-event': {
      if (isCycleActive(state)) return state;
      const dusted = logEvent({ ...state, soilingPct: applyDustEvent(state.soilingPct) }, 'dust-event');
      return checkThreshold(dusted);
    }
    case 'start-cleaning':
      return canStartCleaning(state) ? startCleaning(state, 'manual') : state;
    case 'toggle-auto': {
      const autoClean = !state.autoClean;
      let s = logEvent({ ...state, autoClean }, autoClean ? 'auto-on' : 'auto-off');
      if (autoClean && s.cleaning.phase === 'attention') {
        s = startCleaning({ ...s, cleaning: { ...s.cleaning, phase: 'standby' } }, 'auto');
      }
      return s;
    }
    case 'toggle-running':
      return { ...state, running: !state.running };
    case 'set-speed':
      return { ...state, speed: action.speed };
    case 'reset':
      return createInitialState(state.speed);
  }
}

// ---- Selectors -------------------------------------------------------------

export function currentPowerW(state: SimState): number {
  return modeledPowerW(state.timeH, state.soilingPct);
}

export function currentPotentialW(state: SimState): number {
  return potentialPowerW(state.timeH);
}

/** Watts lost to modeled soiling right now, versus a clean panel at the same irradiance. */
export function soilingLossW(state: SimState): number {
  return currentPotentialW(state) - currentPowerW(state);
}

/** 0–1 progress through the active cleaning cycle (cleaning + verifying). */
export function cycleProgress(state: SimState): number {
  const { phase, elapsedS } = state.cleaning;
  const total = CLEANING_DURATION_S + VERIFYING_DURATION_S;
  if (phase === 'cleaning') return elapsedS / total;
  if (phase === 'verifying') return (CLEANING_DURATION_S + elapsedS) / total;
  return 0;
}
