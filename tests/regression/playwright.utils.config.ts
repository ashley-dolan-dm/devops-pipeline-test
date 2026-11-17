import { defineConfig, devices } from '@playwright/test';
import baseConfig from './playwright.config';

/*
 * Configuration for the discovery utilities in test-utils/. They are not tests: they visit
 * pages as a role and write what they find (headings, tabs, buttons, fields) to JSON, to help
 * when writing new tests. Run with: npm run discover
 *
 * They reuse the workstream login projects, so a run logs in first.
 */
const loginProjects = (baseConfig.projects ?? []).filter((p) => /-(setup|apex-setup|apex-teardown)$/.test(p.name ?? '') || p.name === 'teardown');

export default defineConfig({
  ...baseConfig,
  retries: 0,
  projects: [
    ...loginProjects,
    {
      name: 'discovery',
      testDir: './test-utils',
      testMatch: /.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: loginProjects.filter((p) => /-setup$/.test(p.name ?? '') && !/apex/.test(p.name ?? '')).map((p) => p.name as string),
    },
  ],
});
