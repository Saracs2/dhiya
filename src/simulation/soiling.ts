import {
  CLEANING_THRESHOLD_PCT,
  DUST_EVENT_PP,
  DUST_RATE_PP_PER_H,
  MAX_SOILING_PCT,
  POST_CLEAN_RESIDUAL_PCT,
} from '../domain/constants';
import { daylightOverlapH } from './solarModel';

export function clampSoiling(pct: number): number {
  return Math.min(MAX_SOILING_PCT, Math.max(0, pct));
}

/** Demonstration dust accumulation between two clock times on the same day. */
export function accumulateSoiling(soilingPct: number, fromH: number, toH: number): number {
  return clampSoiling(soilingPct + DUST_RATE_PP_PER_H * daylightOverlapH(fromH, toH));
}

export function applyDustEvent(soilingPct: number): number {
  return clampSoiling(soilingPct + DUST_EVENT_PP);
}

export function isAboveThreshold(soilingPct: number): boolean {
  return soilingPct >= CLEANING_THRESHOLD_PCT;
}

/** Linear ramp from the cycle's starting soiling down to the post-clean residual. */
export function soilingDuringCleaning(startPct: number, progress: number): number {
  const p = Math.min(1, Math.max(0, progress));
  const target = Math.min(startPct, POST_CLEAN_RESIDUAL_PCT);
  return startPct + (target - startPct) * p;
}
