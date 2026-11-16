import fs from 'fs';
import path from 'path';
import { test } from '@playwright/test';

/*
 * Discovery utility (not a test). Logs in as a role, visits the pages listed in
 * test-utils/pages.json and writes what each page shows (headings, tabs, buttons, field
 * labels) to discovery-output/. Use it when writing tests for pages you do not know well.
 *
 *   npm run discover
 *
 * pages.json: [{ "workstream": "SAMPLE", "role": "standard", "name": "sample-list", "url": "/lightning/o/CoE_Sample_Request__c/list" }]
 * The url is added to the workstream's <WS>_SF_URL.
 */
type PageToVisit = { workstream: string; role: string; name: string; url: string };

const listFile = path.join(__dirname, 'pages.json');
const pages: PageToVisit[] = fs.existsSync(listFile) ? JSON.parse(fs.readFileSync(listFile, 'utf8')) : [];
const outDir = path.join(__dirname, '..', 'discovery-output');

for (const target of pages) {
  test(`discover ${target.workstream} ${target.role} ${target.name}`, async ({ browser }) => {
    const authFile = path.join(__dirname, '..', 'tests', target.workstream, '.auth', `${target.role}.json`);
    const host = (process.env[`${target.workstream}_SF_URL`] ?? '').replace(/^https?:\/\//, '').replace(/\/+$/, '');
    const context = await browser.newContext({ storageState: authFile });
    const page = await context.newPage();
    await page.goto(`https://${host}${target.url}`);
    await page.getByRole('main').waitFor();
    await page.waitForTimeout(3000); // let Lightning finish drawing; acceptable here, never in tests

    const textsOf = async (selector: string) =>
      (await page.locator(selector).allInnerTexts()).map((t) => t.trim()).filter(Boolean);

    const result = {
      url: page.url(),
      title: await page.title(),
      headings: await textsOf('main h1, main h2, main h3'),
      tabs: await textsOf('[role="tab"]'),
      buttons: await textsOf('main button'),
      fieldLabels: await textsOf('main .slds-form-element__label'),
    };
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, `${target.workstream}-${target.role}-${target.name}.json`), JSON.stringify(result, null, 2));
    await context.close();
  });
}
