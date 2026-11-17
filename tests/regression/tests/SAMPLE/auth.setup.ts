import { test as setup } from '@playwright/test';
import { login } from './helpers/logins';
import { authFile, ROLES } from './helpers/roles';

/*
 * The SAMPLE-setup project: logs every role in once and saves the session to .auth/<role>.json.
 * Tests reuse these sessions, and helpers/session.ts refreshes any that get old.
 */
for (const role of ROLES) {
  setup(`SAMPLE: log in as ${role.name}`, async ({ page }) => {
    await login(page, role);
    await page.context().storageState({ path: authFile(role.name) });
  });
}
