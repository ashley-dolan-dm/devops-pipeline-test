import { test, expect } from '../fixtures';
import { waitForLightning } from '../helpers/sf-ui';
import { appUrl, listUrl } from '../helpers/sf-urls';
import { APP, OBJECT } from '../test-data/test-env-vars';

test.describe('1. App access (standard user)', () => {
  test('1.1 Standard user can open the CoE Sample App', async ({ asRole }) => {
    const page = await asRole('standard');
    await page.goto(appUrl(APP));
    await waitForLightning(page);
    await expect(page.getByRole('link', { name: 'CoE Sample Requests', exact: true })).toBeVisible();
  });

  test('1.2 Standard user can open the Sample Requests list', async ({ asRole }) => {
    const page = await asRole('standard');
    await page.goto(listUrl(OBJECT));
    await waitForLightning(page);
    await expect(page.getByRole('main').getByText('CoE Sample Requests').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'New' })).toBeVisible();
  });
});
