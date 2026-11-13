import { test as setup } from '@playwright/test';
import { salesforceService } from './services/salesforce-service';
import { getAccessToken } from './helpers/salesforce-auth';
import { API_ROLE, username } from './helpers/roles';
import { APEX_COMPANION_CLASS, apexDrawdownBody, apexSeedBody } from './apex-companion';
import { SEED_MARKER } from './test-data/test-env-vars';

/*
 * The SAMPLE-apex-setup project. Every run builds its own test data, so tests check known
 * records rather than whatever is in the org. Logins and tests wait for this to pass.
 */
setup('SAMPLE: seed test data', async () => {
  setup.setTimeout(300_000);
  const { accessToken, instanceUrl } = await getAccessToken(username(API_ROLE.name));
  await salesforceService.connectViaToken(accessToken, instanceUrl);

  // Draw down first: a crashed run skips its teardown and leaves records behind.
  await salesforceService.executeAnonymous(apexDrawdownBody);
  await salesforceService.waitForApexJobs(APEX_COMPANION_CLASS);

  await salesforceService.executeAnonymous(apexSeedBody);
  await salesforceService.waitForApexJobs(APEX_COMPANION_CLASS);

  // Fail here, once, rather than in every test, if the seed created nothing.
  const count = await SEED_MARKER.count(salesforceService);
  if (count === 0) throw new Error(`[SAMPLE-apex-setup] The seed ran but no records carry the marker. Check the ${APEX_COMPANION_CLASS} class in this org.`);
  console.log(`[SAMPLE-apex-setup] Seeded ${count} record(s)`);
});
