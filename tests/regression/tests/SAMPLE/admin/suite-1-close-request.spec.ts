import { test, expect } from '../fixtures';
import { recordField, waitForLightning } from '../helpers/sf-ui';
import { recordUrl } from '../helpers/sf-urls';
import { OBJECT, REQUESTS, requestId } from '../test-data/test-env-vars';

test.describe('1. Closing requests (admin)', () => {
  test('1.1 The Close sample requests action sets the status to Done', async ({ asRole, sfService }) => {
    const id = await requestId(sfService, REQUESTS.TO_CLOSE.reference);
    // Calls the Apex action the way a flow would, then checks the page shows the result.
    await sfService.executeAnonymous(`CoESampleRequestService.closeRequests(new List<Id>{ '${id}' });`);
    const page = await asRole('admin');
    await page.goto(recordUrl(OBJECT, id));
    await waitForLightning(page);
    await expect(recordField(page, 'Status')).toContainText('Done');
  });
});
