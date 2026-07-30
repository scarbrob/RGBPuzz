using './main.bicep'

param location = 'eastus2'
param baseName = 'rgbpuzz'
param functionAppName = 'rgbpuzz-api'
param staticWebAppName = 'rgbpuzz-web'
param storageAccountName = 'rgbpuzzfuncstorage'
param keyVaultName = 'rgbpuzz-kv'
param allowedOrigins = 'https://rgbpuzz.com'
param staticWebAppDomains = [
  'rgbpuzz.com'
  'www.rgbpuzz.com'
]
param instanceMemoryMB = 2048
param maximumInstanceCount = 100

// The salt is never committed. Supply it only on the initial bootstrap via:
//   az deployment group create ... --parameters dailyChallengeSalt=<value>
// Leaving it empty preserves whatever is already in Key Vault.
param dailyChallengeSalt = ''
