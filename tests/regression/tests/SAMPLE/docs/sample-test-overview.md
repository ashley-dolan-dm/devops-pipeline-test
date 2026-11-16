# SAMPLE test overview

Fill this in as the suite grows. Keep the known state section current.

## What the suite covers and why

[Describe the application under test, the business processes covered, and why these were chosen.]

## How a run works

1. `SAMPLE-apex-setup` draws down any old data, then runs `Regression_SAMPLE_Data.seed()` and waits for its async jobs.
2. `SAMPLE-setup` logs in every role in `roles.json` and saves the sessions.
3. The `SAMPLE-<browser>` projects run the suites in parallel; `SAMPLE-<browser>-serial` runs the journeys one at a time.
4. `SAMPLE-apex-teardown` draws the data down, and `teardown` deletes the saved logins.

## What the seed creates

| Record | How tests find it |
|---|---|
| [Object and name] | [Prefix or field value, as in test-data/test-env-vars.ts] |

## Areas and test counts

| Area | Folder | Tests |
|---|---|---|
| [Area] | [folder] | [n] |

## Known state

| Date | Environment | Passed | Failed | Flaky | Skipped | Notes |
|---|---|---|---|---|---|---|
| [DATE] | [env] | | | | | |

Known skips and org-side issues the suite works around:

- [None yet]
