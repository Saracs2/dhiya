import { Card } from '../components/Card';
import { Icon } from '../components/Icon';
import {
  CLEANING_THRESHOLD_PCT,
  COMPARISON_CONVENTIONAL_START_SOILING_PCT,
  COMPARISON_DHIYA_START_SOILING_PCT,
  DUST_RATE_PP_PER_H,
  ILLUSTRATIVE_GRID_EMISSION_KG_PER_KWH,
  PANEL_RATING_W,
  POST_CLEAN_RESIDUAL_PCT,
  REFERENCE_PEAK_CONVENTIONAL_W,
  REFERENCE_PEAK_DHIYA_W,
} from '../domain/constants';
import { formatEnergy, formatNumber, formatPercent } from '../domain/format';
import { fill } from '../i18n/strings';
import { useLang } from '../i18n/langContext';
import { getComparison } from '../state/comparison';
import { ComparisonPanel } from './shared';

/** 1 MWp expressed as a multiple of the reference panel. */
const SCALE_PANELS = 1_000_000 / PANEL_RATING_W;

export function InsightsSection() {
  const { t, lang } = useLang();
  const { recoveredWh } = getComparison();
  const c = t.comparison;
  const ins = t.insights;

  const recovered = formatEnergy(recoveredWh, lang);
  const co2Grams = (recoveredWh / 1000) * ILLUSTRATIVE_GRID_EMISSION_KG_PER_KWH * 1000;
  const scaledKwh = (recoveredWh * SCALE_PANELS) / 1000;
  const pct = (v: number) => formatPercent(v, lang, 0);

  return (
    <div className="section">
      <div className="grid">
        <ComparisonPanel className="span-8" />
        <div className="span-4" style={{ display: 'grid', gap: 'var(--gap)', alignContent: 'start' }}>
          <Card id="reference" title={c.referenceTitle} source="reference">
            <p className="prose">
              {fill(c.referenceBody, {
                conv: `${REFERENCE_PEAK_CONVENTIONAL_W} W`,
                dhiya: `${REFERENCE_PEAK_DHIYA_W} W`,
              })}
            </p>
          </Card>
          <Card id="assumptions" title={c.assumptionsTitle} source="simulated">
            <ul className="bullets">
              <li>{fill(c.assumptionConvStart, { value: pct(COMPARISON_CONVENTIONAL_START_SOILING_PCT) })}</li>
              <li>{fill(c.assumptionDhiyaStart, { value: pct(COMPARISON_DHIYA_START_SOILING_PCT) })}</li>
              <li>{fill(c.assumptionDust, { value: DUST_RATE_PP_PER_H })}</li>
              <li>
                {fill(c.assumptionClean, {
                  residual: pct(POST_CLEAN_RESIDUAL_PCT),
                  threshold: pct(CLEANING_THRESHOLD_PCT),
                })}
              </li>
              <li>{c.assumptionModel}</li>
            </ul>
          </Card>
        </div>

        <Card id="impact" className="span-12" title={ins.recoveredTitle} subtitle={ins.recoveredHint} source="simulated">
          <div className="stat-grid">
            <div className="stat">
              <span className="stat-label">
                <Icon name="bolt" size={16} />
                {ins.recoveredTitle}
              </span>
              <span className="stat-value">
                {recovered.value}
                <small>{recovered.unit}</small>
              </span>
              <span className="stat-hint">{ins.recoveredHint}</span>
            </div>
            <div className="stat">
              <span className="stat-label">
                <Icon name="co2" size={16} />
                {ins.co2Title}
              </span>
              <span className="stat-value">
                {formatNumber(co2Grams, lang, 0)}
                <small>g CO₂e</small>
              </span>
              <span className="stat-hint">
                {fill(ins.co2Hint, { factor: formatNumber(ILLUSTRATIVE_GRID_EMISSION_KG_PER_KWH, lang, 2) })}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">
                <Icon name="grid" size={16} />
                {ins.scaleTitle}
              </span>
              <span className="stat-value">
                {formatNumber(scaledKwh, lang, 0)}
                <small>kWh</small>
              </span>
              <span className="stat-hint">{ins.scaleHint}</span>
            </div>
          </div>
        </Card>

        <div className="span-4 callout gold">
          <h3>
            <Icon name="dust" size={18} />
            {ins.whyTitle}
          </h3>
          <p>{ins.whyBody}</p>
        </div>
        <div className="span-4 callout leaf">
          <h3>
            <Icon name="leaf" size={18} />
            {ins.approachTitle}
          </h3>
          <p>{ins.approachBody}</p>
        </div>
        <div className="span-4 callout">
          <h3>
            <Icon name="info" size={18} />
            {ins.caveatTitle}
          </h3>
          <p>{ins.caveatBody}</p>
        </div>
      </div>
    </div>
  );
}
