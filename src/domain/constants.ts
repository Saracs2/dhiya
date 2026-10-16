/**
 * DHIYA modelling assumptions.
 *
 * Every number here is a DEMONSTRATION ASSUMPTION or a REFERENCE VALUE taken from
 * earlier project simulations. None of them is a field measurement. Change them
 * here only — the simulation, charts and copy all read from this file.
 */

/** Reference simulated panel rating (W) at full modeled irradiance and 0 % soiling. */
export const PANEL_RATING_W = 100;

/** Simulated daylight window, local clock hours. Irradiance is a half-sine across it. */
export const DAYLIGHT_START_H = 6;
export const DAYLIGHT_END_H = 18;

/** Demonstration dust accumulation rate (percentage points per simulated hour, daylight only). */
export const DUST_RATE_PP_PER_H = 2;

/** Demonstration cleaning threshold (% estimated soiling). */
export const CLEANING_THRESHOLD_PCT = 20;

/** Assumed estimated soiling left immediately after a simulated cleaning cycle. */
export const POST_CLEAN_RESIDUAL_PCT = 2;

/** Soiling added by the "Simulate dust event" quick action. */
export const DUST_EVENT_PP = 5;

/** Upper clamp for the soiling model so repeated dust events stay physically plausible. */
export const MAX_SOILING_PCT = 60;

/**
 * Simulated cleaning cycle timing, in real (wall-clock) seconds so the demo is
 * watchable regardless of the simulation speed.
 */
export const CLEANING_DURATION_S = 6;
export const VERIFYING_DURATION_S = 2;

/** History sampling interval for charts (simulated minutes). */
export const SAMPLE_INTERVAL_MIN = 5;

/**
 * Example initial state, taken from the existing MATLAB dashboard example
 * (95.0 W, 5 % soiling, Standby at solar noon). Accumulated energy is recomputed
 * by this model rather than copied — see MATLAB_EXAMPLE below.
 */
export const EXAMPLE_START_TIME_H = 12;
export const EXAMPLE_START_SOILING_PCT = 5;

/**
 * Reconstructed morning used to back-fill the chart before the example snapshot:
 * starts at 11 % soiling at 06:00, accumulates at the demo rate, is cleaned at the
 * 20 % threshold (10:30) and reaches the example 5 % at 12:00.
 */
export const MORNING_START_SOILING_PCT = 11;

/** Values shown by the existing MATLAB dashboard example (reference only). */
export const MATLAB_EXAMPLE = {
  powerW: 95.0,
  soilingPct: 5,
  energyWh: 343.2,
  status: 'Standby',
} as const;

/**
 * Representative simulated peaks reported by earlier DHIYA project simulations.
 * Reference values — not recomputed by this dashboard and not measured.
 */
export const REFERENCE_PEAK_CONVENTIONAL_W = 76;
export const REFERENCE_PEAK_DHIYA_W = 95;

/**
 * Daily comparison scenario. Conventional operation has no automated cleaning, so
 * it is assumed to start the day with carried-over soiling. 12 % was chosen so the
 * modeled conventional noon output equals the earlier reference peak (~76 W).
 */
export const COMPARISON_CONVENTIONAL_START_SOILING_PCT = 12;
export const COMPARISON_DHIYA_START_SOILING_PCT = EXAMPLE_START_SOILING_PCT;

/**
 * Grid emission factor used only to express modeled energy as an illustrative CO₂
 * equivalent. Assumption for demonstration; replace with an authoritative factor
 * before using in any report.
 */
export const ILLUSTRATIVE_GRID_EMISSION_KG_PER_KWH = 0.57;

/** Simulation speed presets: simulated seconds per real second. */
export const SPEED_PRESETS = [60, 300, 900] as const;
export const DEFAULT_SPEED = 300;
