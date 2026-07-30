// RGBPuzz infrastructure.
//
// Models the resources that currently exist in rgbpuzz-rg so that a first
// deployment against the live environment is a no-op. Validate any change with
// `az deployment group what-if` before applying -- the CI workflow does this
// automatically on pull requests.
//
// Deliberately NOT managed here:
//   - api.rgbpuzz.com custom hostname + managed certificate on the Function App.
//     Binding a managed cert requires the hostname to resolve and be bound
//     first, which is a chicken-and-egg that Bicep cannot express in a single
//     pass. Created once by hand; see infra/README.md.
//   - The "Failure Anomalies" smart detector alert, which Application Insights
//     creates implicitly.

targetScope = 'resourceGroup'

@description('Deployment region for all resources.')
param location string = resourceGroup().location

@description('Base name used to derive resource names.')
param baseName string = 'rgbpuzz'

@description('Name of the Function App.')
param functionAppName string = '${baseName}-api'

@description('Name of the Static Web App.')
param staticWebAppName string = '${baseName}-web'

@description('Name of the storage account backing the Function App.')
@minLength(3)
@maxLength(24)
param storageAccountName string = '${baseName}funcstorage'

@description('Name of the Key Vault holding the daily challenge salt.')
param keyVaultName string = '${baseName}-kv'

@description('Origins allowed to call the API, comma separated.')
param allowedOrigins string = 'https://rgbpuzz.com'

@description('''
GitHub repository linked to the Static Web App. Omitting these unlinks the SWA
from its repo, so they are modelled explicitly rather than left to default.
''')
param staticWebAppRepositoryUrl string = 'https://github.com/scarbrob/RGBPuzz'

@description('Branch the Static Web App tracks.')
param staticWebAppBranch string = 'main'

@description('Custom domains bound to the Static Web App.')
param staticWebAppDomains array = [
  'rgbpuzz.com'
  'www.rgbpuzz.com'
]

@description('''
Secret used to derive every colour token. Changing it invalidates all player
progress, so it is written to Key Vault only when explicitly supplied. Leave
empty on redeploys to preserve the existing secret.
''')
@secure()
param dailyChallengeSalt string = ''

@description('''
Name of the EXISTING App Service plan hosting the Function App. The plan is
referenced rather than created: pointing the app at a newly created plan is an
app migration, not a no-op, and orphans the original.
''')
param hostingPlanName string = 'ASP-rgbpuzzrg-813c'

@description('''
Name of the EXISTING blob container holding the deployed function package.
Azure appends a random suffix at creation time, so this cannot be derived and
must be supplied verbatim -- getting it wrong repoints the app away from its
own deployed code.
''')
param deploymentContainerName string = 'app-package-rgbpuzz-api-7d670a0'

@description('''
Enable HTTP/2 on the Function App. Live is currently false; flipping it is a
real behaviour change, so it is opt-in rather than smuggled in via a template
default.
''')
param http20Enabled bool = false

@description('''
Set true when the Key Vault salt secret already exists (every redeploy after
bootstrap). The appsettings resource replaces the settings block wholesale, so
DAILY_CHALLENGE_SALT must resolve to a real secret on every apply -- a dangling
Key Vault reference 500s every endpoint. Bootstrap supplies dailyChallengeSalt
instead, which creates the secret in the same deployment.
''')
param saltSecretExists bool = false

@description('''
Log Analytics workspace backing Application Insights. Defaults to the workspace
the component is already attached to -- repointing it is a data migration that
splits historical telemetry, so it must be an explicit choice.
''')
param logAnalyticsWorkspaceId string = '/subscriptions/12b2f854-eba5-4514-81d9-3bae9edf787b/resourceGroups/DefaultResourceGroup-EUS2/providers/Microsoft.OperationalInsights/workspaces/DefaultWorkspace-12b2f854-eba5-4514-81d9-3bae9edf787b-EUS2'

@description('Telemetry retention in days. Must match live to avoid silently shortening history.')
param appInsightsRetentionDays int = 90

@description('Memory per Flex Consumption instance, in MB.')
@allowed([512, 2048, 4096])
param instanceMemoryMB int = 2048

@description('Maximum Flex Consumption instances.')
@minValue(40)
@maxValue(1000)
param maximumInstanceCount int = 100

var tags = {
  application: baseName
  managedBy: 'bicep'
}

var writeSalt = !empty(dailyChallengeSalt)

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

resource storage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageAccountName
  location: location
  tags: tags
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    allowBlobPublicAccess: false
    // The Flex Consumption deployment container authenticates with a
    // connection string, which requires shared key access.
    allowSharedKeyAccess: true
    publicNetworkAccess: 'Enabled'
  }
}

resource blobServices 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' existing = {
  parent: storage
  name: 'default'
}

resource deploymentContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' existing = {
  parent: blobServices
  name: deploymentContainerName
}

// ---------------------------------------------------------------------------
// Observability
// ---------------------------------------------------------------------------

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: functionAppName
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalyticsWorkspaceId
    IngestionMode: 'LogAnalytics'
    RetentionInDays: appInsightsRetentionDays
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

// ---------------------------------------------------------------------------
// Secrets
// ---------------------------------------------------------------------------

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  tags: tags
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
    // The salt is unrecoverable if lost and breaks every player's saved
    // progress, so purge protection is non-negotiable.
    enablePurgeProtection: true
    publicNetworkAccess: 'Enabled'
  }
}

resource saltSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = if (writeSalt) {
  parent: keyVault
  name: 'daily-challenge-salt'
  properties: {
    value: dailyChallengeSalt
  }
}

// Key Vault Secrets User
var secretsUserRoleId = '4633458b-17de-408a-b874-0445c86b69e6'

resource saltAccess 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: keyVault
  name: guid(keyVault.id, functionApp.id, secretsUserRoleId)
  properties: {
    roleDefinitionId: subscriptionResourceId(
      'Microsoft.Authorization/roleDefinitions',
      secretsUserRoleId
    )
    principalId: functionApp.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

// ---------------------------------------------------------------------------
// Compute
// ---------------------------------------------------------------------------

resource hostingPlan 'Microsoft.Web/serverfarms@2023-12-01' existing = {
  name: hostingPlanName
}

var storageConnectionString = 'DefaultEndpointsProtocol=https;AccountName=${storage.name};EndpointSuffix=${environment().suffixes.storage};AccountKey=${storage.listKeys().keys[0].value}'

resource functionApp 'Microsoft.Web/sites@2023-12-01' = {
  name: functionAppName
  location: location
  tags: tags
  kind: 'functionapp,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: hostingPlan.id
    httpsOnly: true
    functionAppConfig: {
      deployment: {
        storage: {
          type: 'blobcontainer'
          value: '${storage.properties.primaryEndpoints.blob}${deploymentContainerName}'
          authentication: {
            type: 'storageaccountconnectionstring'
            storageAccountConnectionStringName: 'DEPLOYMENT_STORAGE_CONNECTION_STRING'
          }
        }
      }
      runtime: {
        name: 'node'
        version: '22'
      }
      scaleAndConcurrency: {
        instanceMemoryMB: instanceMemoryMB
        maximumInstanceCount: maximumInstanceCount
      }
    }
    siteConfig: {
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
      http20Enabled: http20Enabled
      cors: {
        allowedOrigins: split(allowedOrigins, ',')
        supportCredentials: false
      }
    }
  }
  dependsOn: [
    deploymentContainer
  ]
}

// Refuse to wire up a Key Vault reference that cannot resolve. Either this
// deployment creates the secret, or the caller confirms it already exists.
var saltAvailable = writeSalt || saltSecretExists

resource functionAppSettings 'Microsoft.Web/sites/config@2023-12-01' = if (saltAvailable) {
  parent: functionApp
  name: 'appsettings'
  properties: {
    AzureWebJobsStorage: storageConnectionString
    DEPLOYMENT_STORAGE_CONNECTION_STRING: storageConnectionString
    APPLICATIONINSIGHTS_CONNECTION_STRING: appInsights.properties.ConnectionString
    AzureWebJobsFeatureFlags: 'EnableWorkerIndexing'
    ALLOWED_ORIGINS: allowedOrigins
    DAILY_CHALLENGE_SALT: '@Microsoft.KeyVault(VaultName=${keyVault.name};SecretName=daily-challenge-salt)'
  }
  dependsOn: [
    saltAccess
  ]
}

// ---------------------------------------------------------------------------
// Frontend
// ---------------------------------------------------------------------------

resource staticWebApp 'Microsoft.Web/staticSites@2023-12-01' = {
  name: staticWebAppName
  location: location
  tags: tags
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    // Content is published by the GitHub Actions workflow, not by the SWA
    // build service, but the repo link is preserved so deployments and PR
    // preview environments keep working.
    repositoryUrl: staticWebAppRepositoryUrl
    branch: staticWebAppBranch
    provider: 'GitHub'
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
  }
}

resource staticWebAppCustomDomains 'Microsoft.Web/staticSites/customDomains@2023-12-01' = [
  for domain in staticWebAppDomains: {
    parent: staticWebApp
    name: domain
  }
]

// ---------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------

output functionAppName string = functionApp.name
output functionAppDefaultHostname string = functionApp.properties.defaultHostName
output functionAppPrincipalId string = functionApp.identity.principalId
output staticWebAppName string = staticWebApp.name
output staticWebAppDefaultHostname string = staticWebApp.properties.defaultHostname
output keyVaultName string = keyVault.name
output storageAccountName string = storage.name
