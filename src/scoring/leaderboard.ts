/**
 * Illustrative pavilion leaderboard.
 *
 *   Total = 0.50 × Solar Performance + 0.30 × Solar Contribution + 0.20 × Maintenance
 *
 * Each component is normalised to 0–100 against FIXED bounds (not min–max across
 * the list), so a pavilion's score does not change when others are added or removed.
 */
import type { ComponentScores, Pavilion, PavilionRawInputs, ScoredPavilion } from '../domain/types';

export const WEIGHTS: Readonly<ComponentScores> = {
  solarPerformance: 0.5,
  solarContribution: 0.3,
  maintenance: 0.2,
};

/** Normalisation bounds: raw value at score 0 ("worst") and at score 100 ("best"). */
export const NORMALISATION = {
  /** Performance ratio. */
  solarPerformance: { worst: 0.6, best: 0.9 },
  /** Share of demand met by on-site solar, %. */
  solarContribution: { worst: 0, best: 50 },
  /** Average soiling loss, % (lower is better, so worst > best). */
  maintenance: { worst: 20, best: 0 },
} as const;

/** Linear 0–100 score between `worst` and `best`, clamped. Works for either direction. */
export function normalise(value: number, worst: number, best: number): number {
  if (worst === best) return 0;
  const score = ((value - worst) / (best - worst)) * 100;
  return Math.min(100, Math.max(0, score));
}

export function componentScores(inputs: PavilionRawInputs): ComponentScores {
  const n = NORMALISATION;
  return {
    solarPerformance: normalise(inputs.performanceRatio, n.solarPerformance.worst, n.solarPerformance.best),
    solarContribution: normalise(inputs.solarContributionPct, n.solarContribution.worst, n.solarContribution.best),
    maintenance: normalise(inputs.avgSoilingLossPct, n.maintenance.worst, n.maintenance.best),
  };
}

export function totalScore(c: ComponentScores): number {
  return (
    WEIGHTS.solarPerformance * c.solarPerformance +
    WEIGHTS.solarContribution * c.solarContribution +
    WEIGHTS.maintenance * c.maintenance
  );
}

/** Weighted contribution of each component to the total (sums to the total). */
export function weightedContributions(c: ComponentScores): ComponentScores {
  return {
    solarPerformance: WEIGHTS.solarPerformance * c.solarPerformance,
    solarContribution: WEIGHTS.solarContribution * c.solarContribution,
    maintenance: WEIGHTS.maintenance * c.maintenance,
  };
}

export function rankPavilions(pavilions: readonly Pavilion[]): ScoredPavilion[] {
  return pavilions
    .map((pavilion) => {
      const components = componentScores(pavilion.inputs);
      return { pavilion, components, total: totalScore(components), rank: 0 };
    })
    .sort((a, b) => b.total - a.total)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));
}

/** Illustrative daily yield for a pavilion array: kWp × peak-sun-hours × PR. */
export function illustrativeDailyYieldKwh(p: Pavilion): number {
  return p.capacityKwp * p.peakSunHours * p.inputs.performanceRatio;
}
