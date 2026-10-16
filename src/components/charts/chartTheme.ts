/**
 * Chart colours as literal hex (SVG attributes set by Recharts can't resolve CSS
 * variables reliably). Keep in sync with the series tokens in styles/global.css.
 * Palette validated for dark mode against surface #111a2b, all pairs:
 * lightness band, chroma, CVD ΔE ≥ 8, normal-vision ΔE ≥ 15, contrast ≥ 3:1.
 */
export const CHART = {
  dhiya: '#c98500',
  conventional: '#3f7fdb',
  third: '#199e70',
  reference: '#5d6880',
  grid: '#1d2940',
  axis: '#2c3a55',
  tick: '#7f8a9d',
  surface: '#111a2b',
  text: '#edf1f7',
  textMuted: '#a9b3c4',
  threshold: '#edf1f7',
  backfill: 'rgba(255,255,255,0.025)',
} as const;

export const AXIS_TICK = { fill: CHART.tick, fontSize: 11 } as const;

/** Clock-hour ticks for a numeric time axis. */
export function hourTicks(from: number, to: number, step: number): number[] {
  const ticks: number[] = [];
  for (let h = from; h <= to; h += step) ticks.push(h);
  return ticks;
}
