# User guide

Start here. How to run the suite, choose an environment and read the results.

## Before you run

- You have the env file for the environment, and (with encrypted env files) the `.env.keys` file from the team password manager. See `credential-management.md`.
- You have the JWT key file for that org, at the path in `<WORKSTREAM>_JWT_KEY_FILE`.
- Nobody else is running the suite against the same org. Two runs at once seed and draw down the same data.

## Environments

A run targets one org, set with `TEST_ENV`. The default is `regression`.

| TEST_ENV | Org | Notes |
|---|---|---|
| `qa` | [SANDBOX NAME] | [What it is used for] |
| `regression` (default) | [SANDBOX NAME] | [What it is used for] |

To add one, see `new-environment-runbook.md`.

## Running

| What | Command |
|---|---|
| Everything | `npx playwright test` |
| Another environment (Windows) | `$env:TEST_ENV="qa"; npx playwright test` |
| Another environment (Mac) | `TEST_ENV=qa npx playwright test` |
| One workstream | `npx playwright test --project=<WS>-chromium --project=<WS>-chromium-serial` |
| One file | `npx playwright test tests/<WS>/<folder>/<file>.spec.ts` |
| Tests whose title matches | `npx playwright test -g "2.1"` |
| Watch it run | add `--headed`, or use `--ui` |
| List the tests without running | `npm run test:list` |

The `-chromium` project alone skips the journeys. Include the `-serial` project too, or run with no `--project`.

## Results

- `playwright-report/`: the HTML report. Open it with `npm run report`.
- `test-results/`: traces and screenshots for failed tests. Open a trace with `npx playwright show-trace <file>`.
- A test that passes on retry is marked flaky. Look into it: flaky tests hide real failures.

Record a run's result (date, environment, passed, failed, flaky, skipped) in the workstream's overview document.

## In the pipeline

The pipeline runs the suite after each deployment to the regression org when the `PLAYWRIGHT_ENABLED` repository variable is `true`. See the DevOps Set-up Guide and `credential-management.md` for the secrets it needs.
