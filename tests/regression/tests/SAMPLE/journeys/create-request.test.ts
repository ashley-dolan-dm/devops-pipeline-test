import { test, expect } from '../fixtures';
import { expectSaved, pickValue, waitForLightning } from '../helpers/sf-ui';
import { newRecordUrl } from '../helpers/sf-urls';
import { isoDatePlusDays } from '../helpers/sf-format';
import { OBJECT, uiReference } from '../test-data/test-env-vars';

/*
 * A journey: steps that build on each other, so they run in order in the serial project
 * (journeys/*.test.ts). Anything the journey creates is deleted at the end, even if a step fails.
 */
test.describe.serial('Create a request', () => {
  const reference = uiReference();
  let createdId: string | undefined;

  test('1. Standard user creates a high priority request', async ({ asRole }) => {
    const page = await asRole('standard');
    await page.goto(newRecordUrl(OBJECT));
    await waitForLightning(page);
    const dialog = page.getByRole('dialog');
    await pickValue(page, 'Priority', 'High');
    await dialog.getByRole('textbox', { name: 'Reference' }).fill(reference);
    await dialog.getByRole('button', { name: 'Save', exact: true }).click();
    await expectSaved(page);
  });

  test('2. The flow set the status and due date', async ({ sfService }) => {
    const [row] = await sfService.query<{ Id: string; Status__c: string; Due_Date__c: string }>(
      `SELECT Id, Status__c, Due_Date__c FROM ${OBJECT} WHERE Reference__c = '${reference}' LIMIT 1`,
    );
    expect(row, 'the request created in step 1').toBeTruthy();
    createdId = row.Id;
    expect(row.Status__c).toBe('New');
    expect(row.Due_Date__c).toBe(isoDatePlusDays(2));
  });

  test.afterAll(async ({ sfService }) => {
    if (!createdId) {
      const [row] = await sfService.query<{ Id: string }>(`SELECT Id FROM ${OBJECT} WHERE Reference__c = '${reference}' LIMIT 1`);
      createdId = row?.Id;
    }
    if (createdId) {
      await sfService.delete(OBJECT, createdId).catch((e) => console.warn(`[clean-up] Could not delete ${reference}: ${e}`));
    }
  });
});
