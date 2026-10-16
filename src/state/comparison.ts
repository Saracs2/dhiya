import {
  COMPARISON_CONVENTIONAL_START_SOILING_PCT,
  COMPARISON_DHIYA_START_SOILING_PCT,
} from '../domain/constants';
import { simulateProfile, type DailyProfile } from '../simulation/dailyProfile';

export interface Comparison {
  conventional: DailyProfile;
  dhiya: DailyProfile;
  /** Modeled DHIYA − conventional daily energy (Wh). */
  recoveredWh: number;
  /** Modeled relative difference in daily energy (%). */
  differencePct: number;
}

let cached: Comparison | null = null;

/** The comparison scenario is deterministic, so compute it once. */
export function getComparison(): Comparison {
  if (cached) return cached;
  const conventional = simulateProfile({
    strategy: 'conventional',
    startSoilingPct: COMPARISON_CONVENTIONAL_START_SOILING_PCT,
  });
  const dhiya = simulateProfile({ strategy: 'dhiya', startSoilingPct: COMPARISON_DHIYA_START_SOILING_PCT });
  const recoveredWh = dhiya.energyWh - conventional.energyWh;
  cached = {
    conventional,
    dhiya,
    recoveredWh,
    differencePct: (recoveredWh / conventional.energyWh) * 100,
  };
  return cached;
}
