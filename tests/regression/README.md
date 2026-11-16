# coe-e2e-regression regression suite

Playwright tests that check the Salesforce org still works after each release. Created by the CoE regression set-up scripts. The full guide is the Regression Testing Set-up Guide in the CoE documents ([DOCUMENT LOCATION]).

## Run it

Commands are for PowerShell on Windows. On a Mac, use the same commands in Terminal, apart from setting variables (shown second).

```powershell
cd tests/regression
npm ci
npx playwright install chromium

# Run everything against the default environment (regression)
npx playwright test

# Run against another environment
$env:TEST_ENV="qa"; npx playwright test        # Windows
TEST_ENV=qa npx playwright test                # Mac

# One workstream, or one file
npx playwright test --project=SAMPLE-chromium --project=SAMPLE-chromium-serial
npx playwright test tests/SAMPLE/standard/suite-2-request-record.spec.ts

# See the report
npm run report
```

## How it fits together

- `workstreams.json` lists the workstreams, browsers and the default environment.
- `tests/<WORKSTREAM>/` holds one application under test: its roles (`roles.json`), env files (`.envx/`), fixtures, helpers, test data and tests.
- Each run: seed the test data, log every role in, run the tests, then draw the data down and delete the saved logins.
- Journeys (`journeys/*.test.ts`) run one at a time. Everything else runs in parallel.

## Documents

| File | What it covers |
|---|---|
| `docs/user-guide.md` | Running tests, environments and reports |
| `docs/new-environment-runbook.md` | Pointing the suite at a new or refreshed org |
| `docs/credential-management.md` | Env files, keys and rotating them |
| `docs/adding-a-workstream.md` | Adding a workstream or a role |
| `docs/troubleshooting.md` | Common failures and what to check |
| `AGENTS.md` | Rules for AI coding agents |
| `tests/<WORKSTREAM>/docs/` | What each workstream covers, its test catalogue and its agent guide |
