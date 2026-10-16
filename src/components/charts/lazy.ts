import { lazy } from 'react';

// Recharts is the largest dependency; load it after the shell renders.
export const PerformanceChart = lazy(() => import('./PerformanceChart'));
export const SoilingChart = lazy(() => import('./SoilingChart'));
export const ComparisonChart = lazy(() => import('./ComparisonChart'));
