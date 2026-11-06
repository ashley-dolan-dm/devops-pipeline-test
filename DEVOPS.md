# How changes reach production

This repository holds the Salesforce source for coe-e2e. Every change goes through a pull request and the GitHub Actions pipeline. Nobody deploys to the shared orgs by hand.

The full guide is the DevOps Set-up Guide in the CoE documents ([DOCUMENT LOCATION]).

## Branches

| Branch | Deploys to | How changes arrive |
|---|---|---|
| `feature/*`, `bugfix/*` | Your own development org | You push your work |
| `develop` | QA | Pull request from a feature branch |
| `uat` | UAT | Pull request from `develop` |
| `release` | Regression, then the regression tests run | Pull request from `uat` |
| `main` | Production, after approval | Pull request from `release` or a `hotfix/*` branch |
| `hotfix/*` | Nowhere directly | Branch from `main`, pull request back into `main` |

After each production deployment the pipeline tags the release and opens back-sync pull requests into `release`, `uat`, `develop`. Merge them promptly.

## Making a change

1. Create a branch from `develop`: `git switch -c feature/[work item]-[short description] origin/develop`.
2. Build and test in your development org. Retrieve your changes into `force-app`.
3. Push the branch and raise a pull request into `develop`. Fill in the template.
4. Wait for **PR checks passed** to go green and for a review. Fix anything the checks report.
5. Merge. The pipeline deploys to QA.

## Pipeline checks on every pull request

- The source branch is allowed for that target.
- Static analysis (Salesforce Code Analyzer) on the changed files only.
- Check-only deployment of the changed components, with tests.
- A red **Destructive changes** label if the change deletes components.

## Workflows

| File | When it runs |
|---|---|
| `pr-develop.yml`, `pr-uat.yml`, `pr-release.yml`, `pr-main.yml` | A pull request into that branch |
| `deploy-develop.yml`, `deploy-uat.yml`, `deploy-release.yml`, `deploy-main.yml` | A merge into that branch |
| `manual-deploy.yml` | On request, to deploy a branch to a sandbox |
| `manual-regression.yml` | On request, to run the regression tests |
| `reusable-*.yml` | Called by the workflows above |

## Never commit

Keys, certificates, passwords, tokens or `.env` files. The `.gitignore` blocks the common ones. If a secret is committed by mistake, tell Ashley Dolan straight away: the secret must be replaced, not just deleted.
