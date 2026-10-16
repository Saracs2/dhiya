import { DAYLIGHT_END_H, DAYLIGHT_START_H, PANEL_RATING_W } from '../domain/constants';

/**
 * Normalised clear-sky irradiance (0–1): a half-sine across the simulated daylight
 * window, peaking at solar noon. A deliberately simple demonstration model — no
 * weather, temperature, tilt or inverter losses.
 */
export function irradianceFactor(timeH: number): number {
  const t = ((timeH % 24) + 24) % 24;
  if (t <= DAYLIGHT_START_H || t >= DAYLIGHT_END_H) return 0;
  return Math.sin((Math.PI * (t - DAYLIGHT_START_H)) / (DAYLIGHT_END_H - DAYLIGHT_START_H));
}

export function isDaylight(timeH: number): boolean {
  return irradianceFactor(timeH) > 0;
}

/** Output of a clean panel at the modeled irradiance (W). */
export function potentialPowerW(timeH: number): number {
  return PANEL_RATING_W * irradianceFactor(timeH);
}

/** Modeled output with soiling loss applied linearly (W). */
export function modeledPowerW(timeH: number, soilingPct: number): number {
  return potentialPowerW(timeH) * (1 - soilingPct / 100);
}

/** Hours of [fromH, toH] that fall inside the daylight window (single day, 0 ≤ from ≤ to ≤ 24). */
export function daylightOverlapH(fromH: number, toH: number): number {
  const start = Math.max(fromH, DAYLIGHT_START_H);
  const end = Math.min(toH, DAYLIGHT_END_H);
  return Math.max(0, end - start);
}
