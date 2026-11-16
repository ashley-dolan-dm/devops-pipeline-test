import { test, expect } from '../fixtures';
import { recordField, waitForLightning } from '../helpers/sf-ui';
import { recordUrl } from '../helpers/sf-urls';
import { formatDate } from '../helpers/sf-format';
import { OBJECT, REQUESTS, requestId } from '../test-data/test-env-vars';

test.describe('2. Request record (standard user)', () => {
  test('2.1 Seeded request shows its priority and status', async ({ asRole, sfService }) => {
    const id = await requestId(sfService, REQUESTS.HIGH.reference);
    const page = await asRole('standard');
    await page.goto(recordUrl(OBJECT, id));
    await waitForLightning(page);
    await expect(recordField(page, 'Priority')).toContainText(REQUESTS.HIGH.priority);
    await expect(recordField(page, 'Status')).toContainText(REQUESTS.HIGH.status);
    await expect(recordField(page, 'Reference')).toContainText(REQUESTS.HIGH.reference);
  });

  test('2.2 The flow sets the due date from the priority', async ({ asRole, sfService }) => {
    const id = await requestId(sfService, REQUESTS.HIGH.reference);
    const page = await asRole('standard');
    await page.goto(recordUrl(OBJECT, id));
    await waitForLightning(page);
    await expect(recordField(page, 'Due Date')).toContainText(formatDate(REQUESTS.HIGH.dueDate()));
  });

  test('2.3 The flow keeps a due date the user entered', async ({ asRole, sfService }) => {
    const id = await requestId(sfService, REQUESTS.LOW.reference);
    const page = await asRole('standard');
    await page.goto(recordUrl(OBJECT, id));
    await waitForLightning(page);
    await expect(recordField(page, 'Due Date')).toContainText(formatDate(REQUESTS.LOW.dueDate()));
  });
});
