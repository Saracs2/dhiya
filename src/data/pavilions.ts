/**
 * ILLUSTRATIVE DEMONSTRATION DATA — FICTIONAL.
 *
 * These are not measurements from any pavilion and not official Expo 2030 data or
 * rankings. Raw inputs were chosen so the scoring formula reproduces the example
 * scores from the DHIYA project brief (89.4 / 85.8 / 81.1). Replace with real,
 * sourced measurements before any non-demonstration use.
 */
import type { Pavilion } from '../domain/types';

export const ILLUSTRATIVE_PAVILIONS: readonly Pavilion[] = [
  {
    id: 'sa',
    name: { en: 'Saudi Arabia (example)', ar: 'السعودية (مثال)' },
    capacityKwp: 420,
    peakSunHours: 6.0,
    inputs: { performanceRatio: 0.876, solarContributionPct: 44, avgSoilingLossPct: 3.0 },
  },
  {
    id: 'jp',
    name: { en: 'Japan (example)', ar: 'اليابان (مثال)' },
    capacityKwp: 310,
    peakSunHours: 6.0,
    inputs: { performanceRatio: 0.87, solarContributionPct: 40, avgSoilingLossPct: 3.2 },
  },
  {
    id: 'de',
    name: { en: 'Germany (example)', ar: 'ألمانيا (مثال)' },
    capacityKwp: 280,
    peakSunHours: 6.0,
    inputs: { performanceRatio: 0.858, solarContributionPct: 36, avgSoilingLossPct: 3.5 },
  },
];
