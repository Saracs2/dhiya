import { describe, expect, it } from 'vitest';
import {
  CLEANING_DURATION_S,
  CLEANING_THRESHOLD_PCT,
  COMPARISON_CONVENTIONAL_START_SOILING_PCT,
  COMPARISON_DHIYA_START_SOILING_PCT,
  DUST_EVENT_PP,
  MATLAB_EXAMPLE,
  POST_CLEAN_RESIDUAL_PCT,
  REFERENCE_PEAK_CONVENTIONAL_W,
  VERIFYING_DURATION_S,
} from '../domain/constants';
import type { SimState } from '../domain/types';
import { simulateProfile } from './dailyProfile';
import { createInitialState, currentPowerW, simReducer } from './engine';
import { irradianceFactor, modeledPowerW } from './solarModel';

/** Run the reducer with many small ticks, like the UI timer does. */
function runFor(state: SimState, realSeconds: number, tickS = 0.25): SimState {
  let s = state;
  for (let t = 0; t < realSeconds; t += tickS) s = simReducer(s, { type: 'tick', realDtS: tickS });
  return s;
}

describe('solar model', () => {
  it('is zero outside 06:00–18:00 and peaks at noon', () => {
    expect(irradianceFactor(5)).toBe(0);
    expect(irradianceFactor(19)).toBe(0);
    expect(irradianceFactor(12)).toBeCloseTo(1, 10);
  });

  it('reproduces the MATLAB example power at noon with 5 % soiling', () => {
    expect(modeledPowerW(12, MATLAB_EXAMPLE.soilingPct)).toBeCloseTo(MATLAB_EXAMPLE.powerW, 6);
  });
});

describe('initial state', () => {
  const s = createInitialState();

  it('matches the MATLAB example snapshot (power, soiling, status)', () => {
    expect(currentPowerW(s)).toBeCloseTo(95.0, 6);
    expect(s.soilingPct).toBe(5);
    expect(s.cleaning.phase).toBe('standby');
  });

  it('back-fills a reconstructed morning that ends at the example soiling', () => {
    const last = s.history[s.history.length - 1];
    expect(last.timeH).toBe(12);
    expect(last.soilingPct).toBeCloseTo(5, 6);
    expect(s.history.every((p) => p.backfilled)).toBe(true);
    // Recomputed energy is close to, but not copied from, the MATLAB example.
    expect(s.energyWh).toBeGreaterThan(330);
    expect(s.energyWh).toBeLessThan(MATLAB_EXAMPLE.energyWh);
  });
});

describe('dust event', () => {
  it('raises soiling and lowers output at the same clock time', () => {
    const before = { ...createInitialState(), running: false };
    const after = simReducer(before, { type: 'dust-event' });
    expect(after.soilingPct).toBeCloseTo(before.soilingPct + DUST_EVENT_PP, 9);
    expect(after.timeH).toBe(before.timeH);
    expect(currentPowerW(after)).toBeLessThan(currentPowerW(before));
    expect(after.events[0].kind).toBe('dust-event');
  });

  it('triggers an automatic cleaning cycle at the threshold when auto-clean is on', () => {
    let s = createInitialState();
    while (s.soilingPct < CLEANING_THRESHOLD_PCT) s = simReducer(s, { type: 'dust-event' });
    expect(s.cleaning.phase).toBe('cleaning');
    expect(s.cleaning.trigger).toBe('auto');
  });

  it('flags attention instead of cleaning when auto-clean is off', () => {
    let s = simReducer(createInitialState(), { type: 'toggle-auto' });
    while (s.soilingPct < CLEANING_THRESHOLD_PCT) s = simReducer(s, { type: 'dust-event' });
    expect(s.cleaning.phase).toBe('attention');
    // Re-enabling auto-clean starts the cycle.
    s = simReducer(s, { type: 'toggle-auto' });
    expect(s.cleaning.phase).toBe('cleaning');
  });

  it('is ignored during an active cleaning cycle', () => {
    const cleaning = simReducer(createInitialState(), { type: 'start-cleaning' });
    expect(simReducer(cleaning, { type: 'dust-event' })).toBe(cleaning);
  });
});

describe('cleaning cycle', () => {
  it('runs Cleaning → Verifying → Standby and restores output', () => {
    let s = createInitialState();
    s = simReducer(s, { type: 'dust-event' });
    s = simReducer(s, { type: 'dust-event' }); // 15 %
    s = simReducer(s, { type: 'set-speed', speed: 0.0001 }); // freeze the clock effectively
    const dirtyPower = currentPowerW(s);

    s = simReducer(s, { type: 'start-cleaning' });
    expect(s.cleaning.phase).toBe('cleaning');
    expect(s.cleaning.trigger).toBe('manual');

    s = runFor(s, CLEANING_DURATION_S / 2);
    expect(s.soilingPct).toBeLessThan(15);
    expect(s.soilingPct).toBeGreaterThan(POST_CLEAN_RESIDUAL_PCT);

    s = runFor(s, CLEANING_DURATION_S / 2 + 0.01);
    expect(s.cleaning.phase).toBe('verifying');
    expect(s.soilingPct).toBeCloseTo(POST_CLEAN_RESIDUAL_PCT, 6);

    s = runFor(s, VERIFYING_DURATION_S + 0.25);
    expect(s.cleaning.phase).toBe('standby');
    expect(s.cyclesCompleted).toBe(1);
    expect(currentPowerW(s)).toBeGreaterThan(dirtyPower);
  });

  it('cannot start when already at the residual level', () => {
    const clean = { ...createInitialState(), soilingPct: POST_CLEAN_RESIDUAL_PCT };
    expect(simReducer(clean, { type: 'start-cleaning' })).toBe(clean);
  });
});

describe('live clock', () => {
  it('accumulates dust at 2 pp per simulated hour in daylight and integrates energy', () => {
    const s0 = createInitialState(3600); // 1 real second = 1 simulated hour
    const s1 = simReducer(s0, { type: 'tick', realDtS: 1 });
    expect(s1.timeH).toBeCloseTo(13, 9);
    expect(s1.soilingPct).toBeCloseTo(7, 6);
    expect(s1.energyWh - s0.energyWh).toBeGreaterThan(85);
    expect(s1.energyWh - s0.energyWh).toBeLessThan(95);
  });

  it('does nothing while paused', () => {
    const paused = simReducer(createInitialState(), { type: 'toggle-running' });
    expect(simReducer(paused, { type: 'tick', realDtS: 5 })).toBe(paused);
  });

  it('rolls over to a new day at midnight, resetting daily energy', () => {
    let s = createInitialState(3600);
    s = runFor(s, 12.5, 0.5);
    expect(s.day).toBe(2);
    expect(s.energyWh).toBe(0);
    expect(s.events.some((e) => e.kind === 'new-day')).toBe(true);
  });
});

describe('daily comparison', () => {
  const conventional = simulateProfile({
    strategy: 'conventional',
    startSoilingPct: COMPARISON_CONVENTIONAL_START_SOILING_PCT,
  });
  const dhiya = simulateProfile({ strategy: 'dhiya', startSoilingPct: COMPARISON_DHIYA_START_SOILING_PCT });

  it('conventional noon output is near the earlier reference peak', () => {
    const noon = conventional.points.find((p) => p.timeH === 12)!;
    expect(noon.powerW).toBeCloseTo(REFERENCE_PEAK_CONVENTIONAL_W, 0);
  });

  it('DHIYA cleans at the threshold and yields more modeled energy', () => {
    expect(conventional.cleaningTimesH).toHaveLength(0);
    expect(dhiya.cleaningTimesH.length).toBeGreaterThan(0);
    expect(dhiya.energyWh).toBeGreaterThan(conventional.energyWh);
    expect(Math.max(...dhiya.points.map((p) => p.soilingPct))).toBeLessThan(CLEANING_THRESHOLD_PCT);
  });
});
