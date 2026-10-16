import { describe, expect, it } from 'vitest';
import { ILLUSTRATIVE_PAVILIONS } from '../data/pavilions';
import { componentScores, normalise, rankPavilions, totalScore, weightedContributions, WEIGHTS } from './leaderboard';

describe('normalise', () => {
  it('maps bounds to 0 and 100 and clamps', () => {
    expect(normalise(0.6, 0.6, 0.9)).toBe(0);
    expect(normalise(0.9, 0.6, 0.9)).toBeCloseTo(100, 9);
    expect(normalise(2, 0.6, 0.9)).toBe(100);
    expect(normalise(-1, 0.6, 0.9)).toBe(0);
  });

  it('supports lower-is-better metrics', () => {
    expect(normalise(0, 20, 0)).toBe(100);
    expect(normalise(20, 20, 0)).toBe(0);
    expect(normalise(5, 20, 0)).toBe(75);
  });
});

describe('total score', () => {
  it('uses 50 / 30 / 20 weights', () => {
    expect(WEIGHTS.solarPerformance + WEIGHTS.solarContribution + WEIGHTS.maintenance).toBeCloseTo(1, 12);
    expect(totalScore({ solarPerformance: 100, solarContribution: 0, maintenance: 0 })).toBe(50);
    expect(totalScore({ solarPerformance: 0, solarContribution: 100, maintenance: 0 })).toBe(30);
    expect(totalScore({ solarPerformance: 0, solarContribution: 0, maintenance: 100 })).toBe(20);
  });

  it('weighted contributions sum to the total', () => {
    const c = componentScores(ILLUSTRATIVE_PAVILIONS[0].inputs);
    const w = weightedContributions(c);
    expect(w.solarPerformance + w.solarContribution + w.maintenance).toBeCloseTo(totalScore(c), 9);
  });
});

describe('illustrative leaderboard', () => {
  const ranked = rankPavilions(ILLUSTRATIVE_PAVILIONS);

  it('reproduces the example scores from the project brief', () => {
    const byId = Object.fromEntries(ranked.map((r) => [r.pavilion.id, Number(r.total.toFixed(1))]));
    expect(byId).toEqual({ sa: 89.4, jp: 85.8, de: 81.1 });
  });

  it('ranks by descending total score', () => {
    expect(ranked.map((r) => r.rank)).toEqual([1, 2, 3]);
    expect(ranked[0].total).toBeGreaterThanOrEqual(ranked[1].total);
    expect(ranked[1].total).toBeGreaterThanOrEqual(ranked[2].total);
  });
});
