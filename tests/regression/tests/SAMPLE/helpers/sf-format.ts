import { wsEnv } from './env';

/*
 * Formats values from the API the way Lightning shows them, so tests can compare the two.
 * Lightning uses the running user's locale. Set <WORKSTREAM>_LOCALE (default en-GB) to match
 * the test users.
 */
const LOCALE = wsEnv('LOCALE') || 'en-GB';

/** 2026-10-15 -> 15/10/2026 (en-GB). */
export function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Intl.DateTimeFormat(LOCALE, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** Today plus a number of days, as YYYY-MM-DD in UTC. */
export function isoDatePlusDays(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
