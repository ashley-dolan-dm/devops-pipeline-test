# Adding a workstream or a role

A workstream is one application under test, with its own users, data and tests.

## Add a workstream

From the set-up scripts folder:

```
node coe-regression.js add-workstream --repo <repository> --name <NAME> --roles admin,<role> --envs qa,regression
```

This creates `tests/<NAME>/` with fixtures, helpers, a starter test, docs and env files, adds the workstream to `workstreams.json`, and writes a starter seed class into the Salesforce source. Then:

1. Fill in and (if used) encrypt the env files.
2. Change the seed class and `test-data/test-env-vars.ts` to create the data your tests need. Deploy the class through the pipeline.
3. Replace the starter test with your suites.
4. Fill in the workstream's docs.

## Add a role

1. Add it to `tests/<WS>/roles.json`: `{ "name": "case_worker", "login": "jwt" }`. Use `"login": "password"` for Experience Cloud users, and add `<WS>_SITE_URL`.
2. Add `<WS>_CASE_WORKER_USERNAME` (and `_PASSWORD` for password logins) to each env file.
3. Create the user in each org and pre-authorise it for the JWT app.
4. Use it in tests with `asRole('case_worker')`.

## Run journeys one at a time

Journeys that share records go in `journeys/` and end in `.test.ts`. The `serialTests` pattern in `workstreams.json` puts them in a project with one worker.
