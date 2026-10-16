import { useMemo } from 'react';
import { Card } from '../components/Card';
import { SourceBadge } from '../components/SourceBadge';
import { SystemStatus } from '../components/SystemStatus';
import {
  CLEANING_DURATION_S,
  CLEANING_THRESHOLD_PCT,
  DAYLIGHT_END_H,
  DAYLIGHT_START_H,
  DUST_EVENT_PP,
  DUST_RATE_PP_PER_H,
  EXAMPLE_START_TIME_H,
  ILLUSTRATIVE_GRID_EMISSION_KG_PER_KWH,
  MATLAB_EXAMPLE,
  PANEL_RATING_W,
  POST_CLEAN_RESIDUAL_PCT,
  VERIFYING_DURATION_S,
} from '../domain/constants';
import { formatClock, formatNumber, formatPercent } from '../domain/format';
import type { DataSource } from '../domain/types';
import { fill } from '../i18n/strings';
import { useLang } from '../i18n/langContext';
import { createInitialState, currentPowerW } from '../simulation/engine';

const SOURCES: DataSource[] = ['simulated', 'illustrative', 'reference', 'unavailable'];

export function SystemSection() {
  const { t, lang } = useLang();
  const s = t.system;
  const pct = (v: number) => formatPercent(v, lang, 0);

  // The model's own starting snapshot, for comparison with the MATLAB example.
  const initial = useMemo(() => createInitialState(), []);

  const assumptions = [
    { k: s.rating, v: `${PANEL_RATING_W} W` },
    { k: s.daylight, v: `${formatClock(DAYLIGHT_START_H)}–${formatClock(DAYLIGHT_END_H)}` },
    { k: s.dustRate, v: fill(s.ppPerHour, { value: DUST_RATE_PP_PER_H }) },
    { k: s.threshold, v: pct(CLEANING_THRESHOLD_PCT) },
    { k: s.residual, v: pct(POST_CLEAN_RESIDUAL_PCT) },
    { k: s.dustEvent, v: `+${DUST_EVENT_PP} pp` },
    { k: s.cycleTime, v: fill(s.cycleValue, { clean: CLEANING_DURATION_S, verify: VERIFYING_DURATION_S }) },
    { k: s.emission, v: `${formatNumber(ILLUSTRATIVE_GRID_EMISSION_KG_PER_KWH, lang, 2)} kg/kWh` },
  ];

  const matlabRows = [
    {
      k: t.kpi.power,
      a: `${formatNumber(MATLAB_EXAMPLE.powerW, lang)} W`,
      b: `${formatNumber(currentPowerW(initial), lang)} W`,
    },
    { k: t.kpi.soiling, a: pct(MATLAB_EXAMPLE.soilingPct), b: pct(initial.soilingPct) },
    {
      k: t.kpi.energy,
      a: `${formatNumber(MATLAB_EXAMPLE.energyWh, lang)} Wh`,
      b: `${formatNumber(initial.energyWh, lang)} Wh`,
    },
    { k: t.kpi.status, a: t.phase.standby, b: t.phase[initial.cleaning.phase] },
  ];

  return (
    <div className="section">
      <div className="grid">
        <div className="span-6" style={{ display: 'grid' }}>
          <SystemStatus />
        </div>
        <div className="span-6" style={{ display: 'grid' }}>
          <Card id="sources" title={s.sourcesTitle} subtitle={s.sourcesSubtitle}>
            <ul className="sys-list">
              {SOURCES.map((src) => (
                <li key={src} className="sys-item" style={{ gridTemplateColumns: '120px minmax(0,1fr)' }}>
                  <span>
                    <SourceBadge source={src} />
                  </span>
                  <span className="sys-note">{t.source[`${src}Hint`]}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card id="assumptions-table" className="span-6" title={s.assumptionsTitle} subtitle={s.assumptionsSubtitle} source="simulated">
          <div className="table-wrap auto">
            <table className="data">
              <thead>
                <tr>
                  <th>{s.parameter}</th>
                  <th className="num">{s.value}</th>
                </tr>
              </thead>
              <tbody>
                {assumptions.map((row) => (
                  <tr key={row.k}>
                    <td>{row.k}</td>
                    <td className="num">{row.v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card id="matlab" className="span-6" title={s.matlabTitle} subtitle={s.matlabSubtitle} source="reference">
          <div className="table-wrap auto">
            <table className="data">
              <thead>
                <tr>
                  <th />
                  <th className="num">{s.matlabValue}</th>
                  <th className="num">
                    {s.modelValue.replace('12:00', formatClock(EXAMPLE_START_TIME_H))}
                  </th>
                </tr>
              </thead>
              <tbody>
                {matlabRows.map((row) => (
                  <tr key={row.k}>
                    <td>{row.k}</td>
                    <td className="num">{row.a}</td>
                    <td className="num">{row.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="card-note">{s.matlabEnergyNote}</p>
        </Card>

        <Card id="about-build" className="span-12" title={s.aboutTitle}>
          <ul className="bullets">
            <li>{s.aboutRuns}</li>
            <li>{s.aboutHardware}</li>
            <li>{s.aboutStack}</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
