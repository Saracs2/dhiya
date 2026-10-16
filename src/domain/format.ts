/**
 * Number and unit formatting. Latin digits in both languages so values read the
 * same on the English and Arabic layouts.
 */
import type { Lang } from '../i18n/strings';

const locale = (lang: Lang) => (lang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-GB');

export function formatNumber(value: number, lang: Lang, fractionDigits = 1): string {
  return new Intl.NumberFormat(locale(lang), {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatPower(watts: number, lang: Lang): { value: string; unit: string } {
  return { value: formatNumber(watts, lang, 1), unit: 'W' };
}

/** Wh below 1 kWh, kWh above — one decimal in Wh, two in kWh. */
export function formatEnergy(wattHours: number, lang: Lang): { value: string; unit: string } {
  if (Math.abs(wattHours) >= 1000) {
    return { value: formatNumber(wattHours / 1000, lang, 2), unit: 'kWh' };
  }
  return { value: formatNumber(wattHours, lang, 1), unit: 'Wh' };
}

export function formatPercent(pct: number, lang: Lang, fractionDigits = 1): string {
  return `${formatNumber(pct, lang, fractionDigits)}%`;
}

/** 13.5 → "13:30". Wraps at 24 h. */
export function formatClock(hours: number): string {
  const totalMin = Math.round((((hours % 24) + 24) % 24) * 60) % (24 * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function joinValueUnit({ value, unit }: { value: string; unit: string }): string {
  return `${value} ${unit}`;
}

/** Wrap in Unicode LTR isolates so "−6.2 W" keeps its order inside Arabic sentences. */
export function isolateLtr(text: string): string {
  return `⁦${text}⁩`;
}
