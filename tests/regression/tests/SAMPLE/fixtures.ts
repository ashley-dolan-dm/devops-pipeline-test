import { test as base, type Page } from '@playwright/test';
import { salesforceService, type SalesforceService } from './services/salesforce-service';
import { getAccessToken } from './helpers/salesforce-auth';
import { sessionContext } from './helpers/session';
import { API_ROLE, role, username } from './helpers/roles';

/*
 * Fixtures for SAMPLE tests. Import test and expect from here, not from @playwright/test.
 *
 *   asRole('standard')  a page logged in as that role (roles.json). Use it for every user under
 *                       test. Never use the raw page fixture.
 *   sfService           API access as the API role, for setting up and checking data.
 */
type TestFixtures = { asRole: (name: string) => Promise<Page> };
type WorkerFixtures = { sfService: SalesforceService };

export const test = base.extend<TestFixtures, WorkerFixtures>({
  asRole: async ({ browser }, use) => {
    const contexts: Awaited<ReturnType<typeof sessionContext>>[] = [];
    await use(async (name: string) => {
      role(name); // fails early on an unknown role
      const context = await sessionContext(browser, name);
      contexts.push(context);
      return context.newPage();
    });
    for (const context of contexts) await context.close();
  },

  // Worker-scoped, so it can also be used in beforeAll and afterAll (for clean-up).
  sfService: [async ({}, use) => {
    const { accessToken, instanceUrl } = await getAccessToken(username(API_ROLE.name));
    await salesforceService.connectViaToken(accessToken, instanceUrl);
    await use(salesforceService);
  }, { scope: 'worker' }],
});

export { expect } from '@playwright/test';
