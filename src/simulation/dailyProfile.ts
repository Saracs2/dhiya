import {
  CLEANING_THRESHOLD_PCT,
  DAYLIGHT_END_H,
  DAYLIGHT_START_H,
  POST_CLEAN_RESIDUAL_PCT,
  SAMPLE_INTERVAL_MIN,
} from '../domain/constants';
import { accumulateSoiling } from './soiling';
import { modeledPowerW, potentialPowerW } from './solarModel';

export type Strategy = 'conventional' | 'dhiya';

export interface ProfilePoint {
  timeH: number;
  powerW: number;
  potentialW: number;
  soilingPct: number;
}

export interface DailyProfile {
  points: ProfilePoint[];
  energyWh: number;
  peakW: number;
  peakTimeH: number;
  /** Clock times at which a threshold cleaning occurred (DHIYA strategy only). */
  cleaningTimesH: number[];
  endSoilingPct: number;
}

interface ProfileOptions {
  strategy: Strategy;
  startSoilingPct: number;
  startH?: number;
  endH?: number;
  /** Integration step, minutes. */
  stepMin?: number;
}

/**
 * Deterministic day model used for the comparison chart and the reconstructed
 * morning. Conventional operation never cleans; DHIYA cleans (instantaneously, in
 * this day-scale model) whenever estimated soiling reaches the threshold.
 */
export function simulateProfile({
  strategy,
  startSoilingPct,
  startH = DAYLIGHT_START_H,
  endH = DAYLIGHT_END_H,
  stepMin = 1,
}: ProfileOptions): DailyProfile {
  const dt = stepMin / 60;
  const samplesEvery = Math.max(1, Math.round(SAMPLE_INTERVAL_MIN / stepMin));
  const steps = Math.round((endH - startH) / dt);

  let soiling = startSoilingPct;
  let energyWh = 0;
  let peakW = 0;
  let peakTimeH = startH;
  const cleaningTimesH: number[] = [];
  const points: ProfilePoint[] = [];

  const record = (t: number) =>
    points.push({
      timeH: t,
      powerW: modeledPowerW(t, soiling),
      potentialW: potentialPowerW(t),
      soilingPct: soiling,
    });

  for (let i = 0; i < steps; i++) {
    const t0 = startH + i * dt;
    if (i % samplesEvery === 0) record(t0);

    const tMid = t0 + dt / 2;
    const p = modeledPowerW(tMid, soiling);
    energyWh += p * dt;
    if (p > peakW) {
      peakW = p;
      peakTimeH = tMid;
    }

    soiling = accumulateSoiling(soiling, t0, t0 + dt);
    if (strategy === 'dhiya' && soiling >= CLEANING_THRESHOLD_PCT - 1e-9) {
      cleaningTimesH.push(t0 + dt);
      soiling = POST_CLEAN_RESIDUAL_PCT;
    }
  }
  record(endH);

  return { points, energyWh, peakW, peakTimeH, cleaningTimesH, endSoilingPct: soiling };
}
