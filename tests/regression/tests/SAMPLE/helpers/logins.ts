import { expect, type Page } from '@playwright/test';
import { frontdoorUrl } from './salesforce-auth';
import { password, roleLabel, username, type RoleConfig } from './roles';
import { requireWsEnv } from './env';

/*
 * The two ways a SAMPLE user logs in. Used by auth.setup.ts and session.ts. Neither saves the
 * session: the caller does that.
 */

/** Internal users: JWT bearer flow, then frontdoor.jsp. No password needed. */
export async function jwtLogin(page: Page, role: RoleConfig): Promise<void> {
  await page.goto(await frontdoorUrl(username(role.name)));
  await page.waitForURL((url) => !url.href.includes('frontdoor.jsp'));
  // A positive check: the Lightning header is there, so the session is really usable.
  await expect(page.getByRole('button', { name: /View profile/i })).toBeVisible({ timeout: 30_000 });
  console.log(`[login] ${roleLabel(role.name)} logged in with JWT`);
}

/*
 * Experience Cloud (portal) users: the site login form. frontdoor.jsp would land them in the
 * internal app instead of the site. The site URL is <WORKSTREAM>_SITE_URL in the env file.
 */
export async function passwordLogin(page: Page, role: RoleConfig): Promise<void> {
  const siteUrl = requireWsEnv('SITE_URL');
  await page.goto(siteUrl);
  await page.getByRole('textbox', { name: /Username/i }).fill(username(role.name));
  await page.getByRole('textbox', { name: /Password/i }).fill(password(role.name));
  await page.getByRole('button', { name: /Log in/i }).click();
  // Being on a site page is the evidence, not the login box disappearing.
  try {
    await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toBeVisible({ timeout: 30_000 });
  } catch {
    throw new Error(`[login] ${roleLabel(role.name)} did not reach the site. Landed on ${page.url()}. Check the user is active, not frozen, and the site is published.`);
  }
  console.log(`[login] ${roleLabel(role.name)} logged in through the site form`);
}

export async function login(page: Page, role: RoleConfig): Promise<void> {
  if (role.login === 'password') await passwordLogin(page, role);
  else await jwtLogin(page, role);
}
