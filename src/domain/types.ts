/** Where a displayed value comes from. Every value on screen carries one of these. */
export type DataSource = 'simulated' | 'illustrative' | 'reference' | 'unavailable';

export type CleaningPhase = 'standby' | 'cleaning' | 'verifying' | 'attention';

export type CleaningTrigger = 'manual' | 'auto';

export interface CleaningState {
  phase: CleaningPhase;
  /** Real seconds spent in the current phase. */
  elapsedS: number;
  /** Soiling when the current cycle started (for the linear ramp-down). */
  startSoilingPct: number;
  trigger: CleaningTrigger | null;
}

export interface Sample {
  /** Simulated clock time in hours (0–24). */
  timeH: number;
  powerW: number;
  /** Output a clean (0 % soiling) panel would give at the same modeled irradiance. */
  potentialW: number;
  soilingPct: number;
  /** True for the reconstructed morning that precedes the session. */
  backfilled: boolean;
}

export type SimEventKind =
  | 'session-start'
  | 'dust-event'
  | 'threshold'
  | 'cleaning-start'
  | 'cleaning-done'
  | 'auto-on'
  | 'auto-off'
  | 'new-day';

export interface SimEvent {
  id: number;
  timeH: number;
  day: number;
  kind: SimEventKind;
  /** Soiling at the time of the event. */
  soilingPct: number;
}

export interface SimState {
  day: number;
  timeH: number;
  soilingPct: number;
  energyWh: number;
  cleaning: CleaningState;
  autoClean: boolean;
  running: boolean;
  /** Simulated seconds per real second. */
  speed: number;
  history: Sample[];
  events: SimEvent[];
  cyclesCompleted: number;
  nextEventId: number;
}

export type SimAction =
  | { type: 'tick'; realDtS: number }
  | { type: 'dust-event' }
  | { type: 'start-cleaning' }
  | { type: 'toggle-auto' }
  | { type: 'toggle-running' }
  | { type: 'set-speed'; speed: number }
  | { type: 'reset' };

export interface PavilionRawInputs {
  /** Performance ratio (measured-style yield ÷ expected yield), 0–1. Illustrative. */
  performanceRatio: number;
  /** Share of pavilion electricity demand met by on-site solar, %. Illustrative. */
  solarContributionPct: number;
  /** Average soiling-related loss over the period, %. Lower is better. Illustrative. */
  avgSoilingLossPct: number;
}

export interface Pavilion {
  id: string;
  /** Display names; illustrative entries only. */
  name: { en: string; ar: string };
  /** Installed PV capacity, kWp. Illustrative. */
  capacityKwp: number;
  /** Peak-sun-hours assumption used for the illustrative daily yield. */
  peakSunHours: number;
  inputs: PavilionRawInputs;
}

export interface ComponentScores {
  solarPerformance: number;
  solarContribution: number;
  maintenance: number;
}

export interface ScoredPavilion {
  pavilion: Pavilion;
  components: ComponentScores;
  total: number;
  rank: number;
}
