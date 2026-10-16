import { Card } from '../components/Card';
import { KpiRow } from '../components/KpiRow';
import { formatClock, formatEnergy, formatNumber, formatPower } from '../domain/format';
import { fill } from '../i18n/strings';
import { useLang } from '../i18n/langContext';
import { currentPotentialW, currentPowerW, soilingLossW } from '../simulation/engine';
import { irradianceFactor } from '../simulation/solarModel';
import { useSim } from '../state/simContext';
import { PerformancePanel } from './shared';

function ModelReadout() {
  const { state } = useSim();
  const { t, lang } = useLang();
  const potential = formatPower(currentPotentialW(state), lang);
  const output = formatPower(currentPowerW(state), lang);
  const loss = formatPower(soilingLossW(state), lang);
  const energy = formatEnergy(state.energyWh, lang);

  const stats = [
    { label: t.clock.label, value: formatClock(state.timeH), unit: fill(t.clock.day, { n: state.day }) },
    { label: t.chart.seriesPotential, value: potential.value, unit: potential.unit },
    { label: t.chart.seriesOutput, value: output.value, unit: output.unit },
    { label: t.monitoring.lossW, value: loss.value, unit: loss.unit },
    { label: t.monitoring.irradiance, value: formatNumber(irradianceFactor(state.timeH), lang, 2), unit: '' },
    { label: t.kpi.energy, value: energy.value, unit: energy.unit },
  ];

  return (
    <Card id="readout" title={t.monitoring.readoutTitle} subtitle={t.monitoring.readoutSubtitle} source="simulated">
      <div className="stat-grid">
        {stats.map((s) => (
          <div className="stat" key={s.label}>
            <span className="stat-label">{s.label}</span>
            <span className="stat-value">
              {s.value}
              {s.unit && <small>{s.unit}</small>}
            </span>
          </div>
        ))}
      </div>
      <p className="card-note">{t.comparison.assumptionModel}</p>
    </Card>
  );
}

export function MonitoringSection() {
  return (
    <div className="section">
      <KpiRow />
      <div className="grid">
        <PerformancePanel className="span-8" />
        <div className="span-4" style={{ display: 'grid' }}>
          <ModelReadout />
        </div>
      </div>
    </div>
  );
}
