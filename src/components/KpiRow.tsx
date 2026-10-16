import { CLEANING_THRESHOLD_PCT, PANEL_RATING_W } from '../domain/constants';
import { formatEnergy, formatNumber, formatPercent, formatPower, isolateLtr, joinValueUnit } from '../domain/format';
import { fill } from '../i18n/strings';
import { useLang } from '../i18n/langContext';
import { currentPotentialW, currentPowerW, soilingLossW } from '../simulation/engine';
import { useSim } from '../state/simContext';
import { CleaningStatus } from './CleaningStatus';
import { Icon, type IconName } from './Icon';
import { SourceBadge } from './SourceBadge';
import type { ReactNode } from 'react';

/** Soiling meter spans 0–2× the threshold so the threshold mark sits mid-bar. */
const SOILING_METER_MAX = CLEANING_THRESHOLD_PCT * 2;

function Kpi({ icon, label, children }: { icon: IconName; label: string; children: ReactNode }) {
  return (
    <section className="card kpi" aria-label={label}>
      <div className="kpi-head">
        <span className="kpi-icon">
          <Icon name={icon} />
        </span>
        <span className="kpi-label">{label}</span>
      </div>
      {children}
      <div className="kpi-foot">
        <SourceBadge source="simulated" />
      </div>
    </section>
  );
}

export function KpiRow() {
  const { state } = useSim();
  const { t, lang } = useLang();

  const power = currentPowerW(state);
  const potential = currentPotentialW(state);
  const loss = soilingLossW(state);
  const p = formatPower(power, lang);
  const e = formatEnergy(state.energyWh, lang);

  return (
    <div className="kpi-row">
      <Kpi icon="bolt" label={t.kpi.power}>
        <div className="kpi-value">
          {p.value}
          <span className="kpi-unit">{p.unit}</span>
        </div>
        <div className="meter" aria-hidden="true">
          <div className="meter-fill" style={{ width: `${(power / PANEL_RATING_W) * 100}%` }} />
        </div>
        <p className="kpi-sub">
          {potential > 0
            ? fill(t.kpi.lossVsClean, { value: isolateLtr(`−${joinValueUnit(formatPower(loss, lang))}`) })
            : t.clock.night}
        </p>
        <p className="kpi-hint">{t.kpi.powerHint}</p>
      </Kpi>

      <Kpi icon="battery" label={t.kpi.energy}>
        <div className="kpi-value">
          {e.value}
          <span className="kpi-unit">{e.unit}</span>
        </div>
        <p className="kpi-hint">{t.kpi.energyHint}</p>
      </Kpi>

      <Kpi icon="dust" label={t.kpi.soiling}>
        <div className="kpi-value">
          {formatNumber(state.soilingPct, lang)}
          <span className="kpi-unit">%</span>
        </div>
        <div className="meter" aria-hidden="true">
          <div
            className="meter-fill"
            style={{ width: `${Math.min(100, (state.soilingPct / SOILING_METER_MAX) * 100)}%` }}
          />
          <div
            className="meter-mark"
            style={{ insetInlineStart: `${(CLEANING_THRESHOLD_PCT / SOILING_METER_MAX) * 100}%` }}
          />
        </div>
        <p className="kpi-hint">
          {fill(t.kpi.soilingHint, { value: formatPercent(CLEANING_THRESHOLD_PCT, lang, 0) })}
        </p>
      </Kpi>

      <Kpi icon="sparkle" label={t.kpi.status}>
        <CleaningStatus />
      </Kpi>
    </div>
  );
}
