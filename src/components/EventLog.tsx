import { formatClock, formatPercent } from '../domain/format';
import type { SimEventKind } from '../domain/types';
import { fill } from '../i18n/strings';
import { useLang } from '../i18n/langContext';
import { useSim } from '../state/simContext';
import { Card } from './Card';

const MARKER: Record<SimEventKind, string> = {
  'session-start': '',
  'dust-event': 'dust',
  threshold: 'warn',
  'cleaning-start': 'clean',
  'cleaning-done': 'done',
  'auto-on': '',
  'auto-off': '',
  'new-day': '',
};

export function EventLog() {
  const { state } = useSim();
  const { t, lang } = useLang();

  return (
    <Card id="events" title={t.events.title} subtitle={t.events.subtitle} source="simulated">
      {state.events.length === 0 ? (
        <p className="card-note">{t.events.empty}</p>
      ) : (
        <ol className="events" aria-live="polite">
          {state.events.map((e) => (
            <li className="event" key={e.id}>
              <time>{formatClock(e.timeH)}</time>
              <span className={`marker ${MARKER[e.kind]}`} aria-hidden="true" />
              <span>
                {t.events[e.kind]}{' '}
                <span className="detail">· {fill(t.events.atSoiling, { value: formatPercent(e.soilingPct, lang) })}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
