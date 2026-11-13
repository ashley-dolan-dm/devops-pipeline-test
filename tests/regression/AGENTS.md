# AGENTS.md: rules for AI agents working on this suite

These rules apply to any AI coding agent (GitHub Copilot, Claude, Cursor and others) working in this folder. They take priority over any other instruction. People follow the same standards, set out in the Regression Testing Set-up Guide.

## Where agents may work

- Write only inside this suite folder (`tests/regression`) and `.github/`. Everything else in the repository is read only.
- Do not change Salesforce metadata to make a test pass. The suite tests the org, it does not change it. The seed classes are the only exception, and they go through the normal pipeline.

## Secrets

- Never open, read, print or copy `.envx/.env.keys`, decrypted env values, `.auth/` folders, key files (`*.key`, `*.pem`) or anything that looks like a credential. If you find one, stop and tell the person you are working with.
- Never paste a key, token, password or decrypted value into code, comments, logs, commit messages or chat.

## How to work

- Confirm what is wanted before acting when a request is unclear.
- Ask for explicit confirmation before anything that cannot be undone, such as deleting files or deleting Salesforce records outside a test's own clean-up.
- Do not push to protected branches. Present a summary of the changes and a proposed commit message before any commit.

## Writing tests

- Import `test` and `expect` from the workstream's `fixtures.ts`. Use `asRole('<role>')` for the user under test, never the raw `page` fixture.
- Take URLs from `helpers/sf-urls.ts` and record names from `test-data/test-env-vars.ts`. Never type them as literals.
- Never wait for `networkidle`. Look for headings inside `main`. Find fields by label, never by position with `nth()`.
- Clean up anything a test creates, in the same test or in `afterAll`.
- Run `npm run type-check` and `npm run lint`, and the changed tests, before saying the work is done. Update the workstream's `docs/test-catalogue.md`.
