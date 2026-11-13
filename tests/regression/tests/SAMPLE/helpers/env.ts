/*
 * Settings for the SAMPLE workstream, read from its env file (tests/SAMPLE/.envx/.env.<env>).
 *
 * Every variable is prefixed with the workstream name, because the config loads every
 * workstream's env file into the same process. A few can also come from CI without the
 * prefix (see the names in brackets): the pipeline passes them from GitHub secrets.
 */
export const WORKSTREAM = 'SAMPLE';
export const TEST_ENV = (process.env.TEST_ENV ?? 'regression').toLowerCase();

export function wsEnv(name: string, fallback?: string): string {
  const value = process.env[`${WORKSTREAM}_${name}`] || (fallback ? process.env[fallback] : undefined) || '';
  return value.trim();
}

export function requireWsEnv(name: string, fallback?: string): string {
  const value = wsEnv(name, fallback);
  if (!value) {
    throw new Error(
      `${WORKSTREAM}_${name} is not set for TEST_ENV=${TEST_ENV}. Add it to tests/${WORKSTREAM}/.envx/.env.${TEST_ENV}` +
      (fallback ? `, or set ${fallback} in CI.` : '.'),
    );
  }
  return value;
}
