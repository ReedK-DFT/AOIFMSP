targetScope = 'subscription'

@description('Azure region for the subscription-scope deployment record and primary resources.')
param location string = 'eastus'

@description('Resource group name for the AOIFMSP platform environment.')
param resourceGroupName string

@description('Short prefix used when naming AOIFMSP resources.')
@minLength(3)
param namePrefix string

@description('Environment label such as dev, test, or prod.')
@minLength(1)
param environmentName string = 'prod'

@description('Optional resource tags applied to created resources.')
param tags object = {}

@description('Optional object id of the GitHub deployment principal for static-site upload RBAC.')
param deploymentPrincipalObjectId string = ''

@allowed([
  'Enabled'
  'Disabled'
])
param storagePublicNetworkAccess string = 'Enabled'

@allowed([
  'Enabled'
  'Disabled'
])
param keyVaultPublicNetworkAccess string = 'Enabled'

@allowed([
  'Enabled'
  'Disabled'
])
param appServicePublicNetworkAccess string = 'Enabled'

resource resourceGroup 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: resourceGroupName
  location: location
  tags: union(tags, {
    workload: 'aoifmsp'
    environment: environmentName
    managedBy: 'github-actions'
  })
}

module platform './resource-group.bicep' = {
  name: 'aoifmsp-${environmentName}-platform'
  scope: resourceGroup
  params: {
    location: location
    namePrefix: namePrefix
    environmentName: environmentName
    tags: tags
    deploymentPrincipalObjectId: deploymentPrincipalObjectId
    storagePublicNetworkAccess: storagePublicNetworkAccess
    keyVaultPublicNetworkAccess: keyVaultPublicNetworkAccess
    appServicePublicNetworkAccess: appServicePublicNetworkAccess
  }
}

output platformResourceGroupName string = resourceGroup.name
output storageAccountName string = platform.outputs.storageAccountName
output keyVaultName string = platform.outputs.keyVaultName
output keyVaultUrl string = platform.outputs.keyVaultUrl
output functionAppName string = platform.outputs.functionAppName
output functionAppUrl string = platform.outputs.functionAppUrl
output functionPrincipalId string = platform.outputs.functionPrincipalId
output appInsightsName string = platform.outputs.appInsightsName
output logAnalyticsWorkspaceName string = platform.outputs.logAnalyticsWorkspaceName
output storageTableEndpoint string = platform.outputs.storageTableEndpoint
output storageBlobEndpoint string = platform.outputs.storageBlobEndpoint
output storageQueueEndpoint string = platform.outputs.storageQueueEndpoint
output staticWebsiteUrl string = platform.outputs.staticWebsiteUrl
