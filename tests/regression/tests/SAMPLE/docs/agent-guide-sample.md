# SAMPLE agent guide

Context for anyone (person or AI agent) writing SAMPLE tests. The rules in the suite's `AGENTS.md` come first.

## The application

[What it does, the main objects and pages, and the users.]

## Roles and how to use them

| Role | Who it represents | Login | Use for |
|---|---|---|---|
| `admin` | [Who it represents] | JWT (API role) | [What to test with it] |
| `standard` | [Who it represents] | JWT | [What to test with it] |

Use `asRole('<role>')` from `fixtures.ts`. Use `sfService` for setting up and checking data.

## Records

Seeded records and how they are named are in `test-data/test-env-vars.ts`. Records a test creates must start with the same prefix, so the drawdown removes them if the test's own clean-up fails.

## Helpers

| Helper | Use for |
|---|---|
| `helpers/sf-urls.ts` | Every URL |
| `helpers/sf-ui.ts` | Waiting for Lightning, reading record fields, picklists, save toasts |
| `helpers/sf-format.ts` | Formatting API values the way the page shows them |

## Selector patterns that work

- [Add patterns as you find them.]

## Out of scope

Standard Salesforce features that Salesforce maintains: list view pinning and sorting, favourites, the App Launcher, global search previews, standard header actions, help and notifications.
