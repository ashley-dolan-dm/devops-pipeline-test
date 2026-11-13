import { test as teardown } from '@playwright/test';
import { salesforceService } from './services/salesforce-service';
import { getAccessToken } from './helpers/salesforce-auth';
import { API_ROLE, username } from './helpers/roles';
import { apexDrawdownBody } from './apex-companion';

/*
 * The SAMPLE-apex-teardown project. Runs once every test that depends on the seed has
 * finished, and removes the seeded data.
 */
teardown('SAMPLE: draw down test data', async () => {
  const { accessToken, instanceUrl } = await getAccessToken(username(API_ROLE.name));
  await salesforceService.connectViaToken(accessToken, instanceUrl);
  await salesforceService.executeAnonymous(apexDrawdownBody);
  console.log('[SAMPLE-apex-teardown] Test data drawn down');
});
