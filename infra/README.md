# RGBPuzz Infrastructure

Bicep templates describing everything in the `rgbpuzz-rg` resource group.

## Layout

| Path | Purpose |
| --- | --- |
| `main.bicep` | All resources |
| `main.bicepparam` | Production parameter values |
| `scripts/summarize_whatif.py` | Renders what-if output; gates destructive changes |

## How it runs

`.github/workflows/infra.yml`:

- **Pull request / push touching `infra/**`** - lints, validates, runs `what-if`, posts the plan as a PR comment, and fails if anything would be deleted.
- **Manual dispatch with `apply=true`** - applies the deployment, then verifies `api.rgbpuzz.com/api/daily-challenge` returns 200.

`saltSecretExists` is resolved at runtime by querying Key Vault, not hardcoded, so the guard below actually guards something.

Applies are deliberately manual.
An infra change that looks harmless in a diff can take the API offline, so a human presses the button.

## Important: these templates were reverse-engineered from live resources

The resource group predates the templates.
`main.bicep` was written to reproduce what already exists so the first apply is a no-op rather than a migration.
Several parameters exist purely to pin values that must not drift:

- `hostingPlanName` - references the existing plan.
  Creating a new plan and repointing `serverFarmId` migrates the app and orphans the original.
- `deploymentContainerName` - Azure appended a random suffix at creation.
  It cannot be derived, and a wrong value points the app away from its own deployed package.
- `logAnalyticsWorkspaceId` - the component is attached to the subscription's default workspace.
  Repointing it splits historical telemetry.
- `appInsightsRetentionDays` - live is 90.
  The template default must match or history silently shortens.
- `http20Enabled` - live is `false`.
  Left off so the template does not smuggle in a behaviour change.

## Environment-specific values are not committed

This repository is public.
A full Log Analytics resource id embeds the subscription id, and the plan and deployment-container names are live infrastructure identifiers, so none of them carry a default in `main.bicep`.
`main.bicepparam` reads them from the environment via `readEnvironmentVariable`, and CI exports them from repository secrets:

| Parameter | Secret / env var |
| --- | --- |
| `hostingPlanName` | `AZURE_HOSTING_PLAN_NAME` |
| `deploymentContainerName` | `AZURE_DEPLOYMENT_CONTAINER_NAME` |
| `logAnalyticsWorkspaceId` | `AZURE_LOG_ANALYTICS_WORKSPACE_ID` |

Running anything locally requires exporting all three first:

```bash
export AZURE_HOSTING_PLAN_NAME=$(az functionapp show -g rgbpuzz-rg -n rgbpuzz-api --query 'serverFarmId' -o tsv | awk -F/ '{print $NF}')
export AZURE_DEPLOYMENT_CONTAINER_NAME=$(az functionapp show -g rgbpuzz-rg -n rgbpuzz-api --query 'functionAppConfig.deployment.storage.value' -o tsv | awk -F/ '{print $NF}')
export AZURE_LOG_ANALYTICS_WORKSPACE_ID=$(az monitor app-insights component show -g rgbpuzz-rg -a rgbpuzz-api --query 'workspaceResourceId' -o tsv)
```

Without them `az bicep build-params` fails outright rather than silently deploying a wrong value.

Always read the what-if output before applying.
`Modify` on `serverFarmId`, `functionAppConfig.deployment.storage.value`, or anything under `Microsoft.KeyVault` deserves scrutiny.

## The salt

`DAILY_CHALLENGE_SALT` derives every colour token.
Change it and every player's saved progress breaks permanently, because tokens stored in `localStorage` no longer match anything the server generates.

It lives in Key Vault (`rgbpuzz-kv`, secret `daily-challenge-salt`) and reaches the Function App as a Key Vault reference, resolved via the app's system-assigned managed identity.
The vault has purge protection and soft delete enabled.

The `appsettings` resource replaces the settings block wholesale, so the reference must resolve on every apply.
Two guards enforce this:

- `dailyChallengeSalt` - supply on bootstrap only; creates the secret in the same deployment.
- `saltSecretExists` - confirms the secret is already there on every subsequent apply. CI derives it from `az keyvault secret show`.

If neither is set, the `appsettings` resource is skipped entirely rather than writing a dangling reference that would 500 every endpoint.

### Bootstrapping into an empty subscription

```bash
az group create -n rgbpuzz-rg -l eastus2

export AZURE_HOSTING_PLAN_NAME=<new-plan-name>
export AZURE_DEPLOYMENT_CONTAINER_NAME=app-package-rgbpuzz-api
export AZURE_LOG_ANALYTICS_WORKSPACE_ID=<workspace-resource-id>

az deployment group create \
  -g rgbpuzz-rg \
  --template-file infra/main.bicep \
  --parameters infra/main.bicepparam \
  --parameters dailyChallengeSalt="$(openssl rand -hex 32)"
```

All three environment variables must point at the new subscription's resources, not the current one's.

## Not managed here

- **`api.rgbpuzz.com` custom hostname and managed certificate on the Function App.**
  Binding a managed cert requires the hostname to already resolve and be bound, which Bicep cannot express in a single pass.
  Created once by hand.
- **The "Failure Anomalies" smart detector alert and its action group.**
  Application Insights creates these implicitly; what-if reports them as `Ignore`.

## Known gap: auth is inconsistent across workflows

`infra.yml` uses OIDC federated credentials (`AZURE_CLIENT_ID` / `AZURE_TENANT_ID` / `AZURE_SUBSCRIPTION_ID`).

`azure-functions.yml` still uses a long-lived service principal secret (`AZURE_CREDENTIALS`) while also requesting `id-token: write` that it never uses.
Those should converge on OIDC.
Until then the federated credential must be registered on the app registration for this repo, or `infra.yml` will fail to log in.
