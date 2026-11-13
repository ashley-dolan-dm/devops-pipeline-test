# New environment runbook

Pointing the suite at a new org, or at a sandbox after a refresh. Allow half a day for a new org, mostly Salesforce admin work.

## 1. In the org (Salesforce admin)

1. Deploy the Salesforce source, including each workstream's seed class (`Regression_<WS>_Data`), through the pipeline.
2. Create or check the test users for every role in each workstream's `roles.json`. Internal users need the right profile and permission sets. Usernames are unique across all Salesforce orgs, so use a pattern such as `role@regression.<project>.<env>`.
3. Set up JWT login: an external client app (or connected app) with digital signatures switched on and the certificate uploaded, OAuth scopes `api`, `web` and `refresh_token`, and "Admin approved users are pre-authorized". Pre-authorise every test user through a permission set. The DevOps pipeline's app can be reused if its policies allow these users.
4. Note the org's My Domain host and the app's consumer key.

## 2. In the suite

1. Create the env file for each workstream: `node coe-regression.js add-env --repo <repository> --workstream <WS> --env <name>` from the set-up scripts folder, or copy an existing `.env.<env>` and change the values.
2. Fill in the values. Never use `$` in a value.
3. With encrypted env files: `npx dotenvx encrypt -f tests/<WS>/.envx/.env.<env>`. Store the new key from `.env.keys` in the team password manager.
4. Add the environment to the table in `user-guide.md`.

## 3. Check it

1. Run the seed and logins only: `npx playwright test --project=<WS>-setup` with `TEST_ENV` set.
2. Then the full workstream. Record the result as the new baseline in the workstream overview.

## 4. In the pipeline (if this environment runs there)

Add the GitHub environment secrets listed in `credential-management.md`.
