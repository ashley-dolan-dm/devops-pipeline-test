import { config as loadEnv } from '@dotenvx/dotenvx';
import fs from 'fs';
import path from 'path';
import { defineConfig, devices, type PlaywrightTestProject } from '@playwright/test';

/*
 * Regression suite configuration.
 *
 * Workstreams, browsers and the default environment are listed in workstreams.json, so adding
 * a workstream (node coe-regression.js add-workstream) does not mean editing this file.
 *
 * A run targets one environment (org), chosen with TEST_ENV. Each workstream keeps one env file
 * per environment in tests/<WORKSTREAM>/.envx/.env.<environment>.
 */

type WorkstreamConfig = { name: string; seed: boolean; serialTests?: string; workers?: number };
type SuiteConfig = { defaultEnv: string; browsers: string[]; workstreams: WorkstreamConfig[] };

const suite: SuiteConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'workstreams.json'), 'utf8'));
const env = (process.env.TEST_ENV ?? suite.defaultEnv).toLowerCase();

// Publish the resolved value so helpers read the same environment as the config.
process.env.TEST_ENV = env;

/*
 * Load each workstream's env file for this environment. In CI the dotenvx key arrives as the
 * secret DOTENV_PRIVATE_KEY_<ENV>_<WORKSTREAM> and is handed to dotenvx under the name it
 * expects, one workstream at a time. Locally, dotenvx finds .envx/.env.keys next to the file.
 * Plain (unencrypted) env files load the same way.
 */
for (const ws of suite.workstreams) {
  const envFile = path.resolve(__dirname, `tests/${ws.name}/.envx/.env.${env}`);
  if (!fs.existsSync(envFile)) {
    console.warn(`[config] ${ws.name}: no env file for TEST_ENV=${env} (${path.relative(__dirname, envFile)}). Its tests will fail at login.`);
    continue;
  }
  const ciKey = process.env[`DOTENV_PRIVATE_KEY_${env.toUpperCase()}_${ws.name}`];
  const dotenvxKeyVar = `DOTENV_PRIVATE_KEY_${env.toUpperCase()}`;
  if (ciKey) process.env[dotenvxKeyVar] = ciKey;
  loadEnv({ path: envFile, quiet: true });
  if (ciKey) delete process.env[dotenvxKeyVar];
}

console.log(`[config] Running against the ${env.toUpperCase()} environment`);

const browserDevices: Record<string, object> = {
  chromium: { ...devices['Desktop Chrome'] },
  firefox: { ...devices['Desktop Firefox'] },
  webkit: { ...devices['Desktop Safari'] },
};

function workstreamProjects(ws: WorkstreamConfig): PlaywrightTestProject[] {
  const projects: PlaywrightTestProject[] = [];
  const loginProject = `${ws.name}-setup`;

  if (ws.seed) {
    // Seed first, then log in, then test. The drawdown runs once every dependent has finished.
    projects.push(
      { name: `${ws.name}-apex-setup`, testMatch: new RegExp(`tests[\\\\/]${ws.name}[\\\\/]apex-data\\.setup\\.ts`), teardown: `${ws.name}-apex-teardown` },
      { name: `${ws.name}-apex-teardown`, testMatch: new RegExp(`tests[\\\\/]${ws.name}[\\\\/]apex-data\\.teardown\\.ts`) },
    );
  }
  projects.push({
    name: loginProject,
    testMatch: new RegExp(`tests[\\\\/]${ws.name}[\\\\/]auth\\.setup\\.ts`),
    dependencies: ws.seed ? [`${ws.name}-apex-setup`] : [],
  });

  const serial = ws.serialTests ? new RegExp(ws.serialTests) : undefined;
  for (const browser of suite.browsers) {
    const shared: PlaywrightTestProject = {
      use: { ...browserDevices[browser] },
      testDir: `./tests/${ws.name}`,
      dependencies: [loginProject],
      teardown: 'teardown',
    };
    if (serial) {
      // Journeys that share records or sessions run one at a time in their own project.
      projects.push({ ...shared, name: `${ws.name}-${browser}-serial`, testMatch: serial, workers: 1 });
    }
    projects.push({ ...shared, name: `${ws.name}-${browser}`, testMatch: /.*\.spec\.ts/, testIgnore: serial, workers: ws.workers });
  }
  return projects;
}

export default defineConfig({
  testDir: './tests',
  outputDir: 'test-results',
  timeout: 60_000,
  // Lightning renders the page shell first and loads components after, so allow longer than
  // Playwright's 5 second default. Raise it further in a single assertion only when needed.
  expect: { timeout: 15_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  maxFailures: process.env.CI ? 20 : undefined,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit.xml' }]] : [['list'], ['html']],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Deletes saved logins after each workstream run. See tests/global.teardown.ts.
    { name: 'teardown', testMatch: /global\.teardown\.ts/ },
    ...suite.workstreams.flatMap(workstreamProjects),
  ],
});
