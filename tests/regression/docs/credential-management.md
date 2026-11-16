# Credential management

What the suite needs to log in, where each item lives, and how to change it.

## What is where

| Item | Where | In Git? |
|---|---|---|
| Env file per workstream and environment (`tests/<WS>/.envx/.env.<env>`): org host, login URL, consumer key, usernames, key file path | The repository | Yes, encrypted |
| dotenvx key (`.envx/.env.keys`), only with encrypted env files | Team password manager, and your machine | Never |
| JWT private key | Team password manager, and your machine outside the repository | Never |
| JWT certificate | The org's external client app | Not needed |
| Saved logins (`.auth/`) | Created and deleted during each run | Never |

## Encrypted env files (dotenvx)

- See a value: `npx dotenvx get <NAME> -f tests/<WS>/.envx/.env.<env>`. Take care during screen shares.
- Change a value: `npx dotenvx set <NAME> "<value>" -f tests/<WS>/.envx/.env.<env>`. It is encrypted as it is written.
- Rotate the key after a suspected exposure: `npx dotenvx encrypt --rotate -f tests/<WS>/.envx/.env.<env>` (check the command for your dotenvx version with `npx dotenvx help`), then update the password manager and the CI secret.

## In the pipeline

Set these as secrets on the GitHub environment the suite runs against (for example Regression):

| Secret | Value |
|---|---|
| `DOTENV_PRIVATE_KEY_<ENV>_<WORKSTREAM>` | The key for that env file, from `.env.keys` (encrypted env files only) |
| `SF_JWT_KEY` | Already set by the DevOps set-up. The suite uses it when the test users are pre-authorised for the same app |
| `SF_CONSUMER_KEY` | Already set by the DevOps set-up |

## If something is exposed

Treat it as a security incident. Tell the team lead, replace the key or certificate, update the password manager, the env files and the CI secrets, then remove the old certificate from the app.
