import { expect, type Locator, type Page } from '@playwright/test';

/*
 * Lightning helpers for SAMPLE. Patterns that hold up in Salesforce:
 *  - never wait for networkidle (Lightning keeps polling)
 *  - look for headings inside main, not anywhere on the page
 *  - find fields by their label, never by position (no nth())
 */

/** Waits for a Lightning page to finish drawing its main content. */
export async function waitForLightning(page: Page): Promise<void> {
  await expect(page.locator('.slds-spinner_container:visible')).toHaveCount(0, { timeout: 30_000 });
  await expect(page.getByRole('main')).toBeVisible();
}

/** The value shown for a field on a record page, found by its label. */
export function recordField(page: Page, label: string): Locator {
  return page
    .locator('records-record-layout-item')
    .filter({ has: page.locator('.slds-form-element__label', { hasText: new RegExp(`^${escapeRegExp(label)}$`) }) })
    .locator('.slds-form-element__control')
    .first();
}

/** Picks a value in a Lightning combobox (picklist) on a form, by the field label. */
export async function pickValue(page: Page, label: string, value: string): Promise<void> {
  await page.getByRole('combobox', { name: label }).click();
  await page.getByRole('option', { name: value, exact: true }).click();
}

/** Waits for the success toast after saving a record. */
export async function expectSaved(page: Page): Promise<void> {
  await expect(page.locator('.toastMessage, .forceToastMessage').first()).toContainText(/was (created|saved)/i);
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
