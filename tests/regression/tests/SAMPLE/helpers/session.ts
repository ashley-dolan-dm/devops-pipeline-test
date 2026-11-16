import { statSync } from 'fs';
import type { Browser, BrowserContext } from '@playwright/test';
import { login } from './logins';
import { authFile, role as findRole, roleLabel } from './roles';

/*
 * Gives out browser contexts with a recent Salesforce session.
 *
 * auth.setup.ts logs every role in at the start, but a long run can outlast the org's session
 * timeout. A saved login older than MAX_AGE_MS is therefore replaced before it is used.
 * The file's modified time is the login time. Do not save the session again on close, or a
 * dead session would look new.
 *
 * <WORKSTREAM>_SESSION_MAX_AGE_MS overrides the default. 0 logs in again for every test.
 */
const MAX_AGE_MS = Number(process.env.SAMPLE_SESSION_MAX_AGE_MS ?? 10 * 60 * 1000);

function ageMs(name: string): number {
  try {
    return Date.now() - statSync(authFile(name)).mtimeMs;
  } catch {
    return Infinity;
  }
}

async function refresh(browser: Browser, name: string): Promise<void> {
  console.log(`[session] logging ${roleLabel(name)} in again`);
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await login(page, findRole(name));
    await context.storageState({ path: authFile(name) });
  } finally {
    await context.close();
  }
}

/** A browser context logged in as the role, with a session younger than MAX_AGE_MS. */
export async function sessionContext(browser: Browser, name: string): Promise<BrowserContext> {
  if (ageMs(name) > MAX_AGE_MS) await refresh(browser, name);
  return browser.newContext({ storageState: authFile(name) });
}
