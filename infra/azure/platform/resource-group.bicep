param location string
@minLength(3)
param namePrefix string
@minLength(1)
param environmentName string
param tags object = {}
param deploymentPrincipalObjectId string = ''

@allowed([
  'Enabled'
  'Disabled'
])
param storagePublicNetworkAccess string

@allowed([
  'Enabled'
  'Disabled'
])
param keyVaultPublicNetworkAccess string

@allowed([
  'Enabled'
  'Disabled'
])
param appServicePublicNetworkAccess string

var storageAccountName = toLower(take(replace('${namePrefix}${environmentName}stg', '-', ''), 24))
var keyVaultName = toLower(take('${namePrefix}-${environmentName}-kv', 24))
var functionPlanName = '${namePrefix}-${environmentName}-plan'
var functionAppName = toLower('${namePrefix}-${environmentName}-func')
var logAnalyticsWorkspaceName = '${namePrefix}-${environmentName}-law'
var appInsightsName = '${namePrefix}-${environmentName}-appi'

var storageBlobDataContributorRoleId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'ba92f5b4-2d11-453d-a403-e96b0029c9fe')
var storageQueueDataContributorRoleId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '974c5e8b-45b9-4653-ba55-5f855dd0fb88')
var storageTableDataContributorRoleId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '0a9a7e1f-b9d0-4cc4-a60d-0319b160aaa3')
var keyVaultSecretsUserRoleId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6')

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  tags: union(tags, {
    workload: 'aoifmsp'
    environment: environmentName
  })
  properties: {
    accessTier: 'Hot'
    allowBlobPublicAccess: false
    allowCrossTenantReplication: false
    allowSharedKeyAccess: false
    defaultToOAuthAuthentication: true
    minimumTlsVersion: 'TLS1_2'
    publicNetworkAccess: storagePublicNetworkAccess
    supportsHttpsTrafficOnly: true
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    cors: {
      corsRules: []
    }
    deleteRetentionPolicy: {
      enabled: true
      days: 7
    }
  }
}

resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsWorkspaceName
  location: location
  tags: union(tags, {
    workload: 'aoifmsp'
    environment: environmentName
  })
  properties: {
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
    retentionInDays: 30
    sku: {
      name: 'PerGB2018'
    }
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  tags: union(tags, {
    workload: 'aoifmsp'
    environment: environmentName
  })
  properties: {
    Application_Type: 'web'
    IngestionMode: 'LogAnalytics'
    WorkspaceResourceId: logAnalyticsWorkspace.id
  }
}

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  tags: union(tags, {
    workload: 'aoifmsp'
    environment: environmentName
  })
  properties: {
    enablePurgeProtection: true
    enableRbacAuthorization: true
    enabledForDeployment: false
    enabledForDiskEncryption: false
    enabledForTemplateDeployment: false
    publicNetworkAccess: keyVaultPublicNetworkAccess
    sku: {
      family: 'A'
      name: 'standard'
    }
    softDeleteRetentionInDays: 90
    tenantId: subscription().tenantId
  }
}

resource functionPlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: functionPlanName
  location: location
  kind: 'functionapp'
  sku: {
    name: 'Y1'
    tier: 'Dynamic'
  }
  tags: union(tags, {
    workload: 'aoifmsp'
    environment: environmentName
  })
  properties: {
    reserved: true
  }
}

resource functionApp 'Microsoft.Web/sites@2023-12-01' = {
  name: functionAppName
  location: location
  kind: 'functionapp,linux'
  identity: {
    type: 'SystemAssigned'
  }
  tags: union(tags, {
    workload: 'aoifmsp'
    environment: environmentName
  })
  properties: {
    serverFarmId: functionPlan.id
    httpsOnly: true
    publicNetworkAccess: appServicePublicNetworkAccess
    siteConfig: {
      ftpsState: 'Disabled'
      linuxFxVersion: 'Node|20'
      minTlsVersion: '1.2'
      appSettings: [
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'node'
        }
        {
          name: 'APPINSIGHTS_INSTRUMENTATIONKEY'
          value: appInsights.properties.InstrumentationKey
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
        {
          name: 'AzureWebJobsStorage__accountName'
          value: storageAccount.name
        }
        {
          name: 'AzureWebJobsStorage__blobServiceUri'
          value: storageAccount.properties.primaryEndpoints.blob
        }
        {
          name: 'AzureWebJobsStorage__queueServiceUri'
          value: storageAccount.properties.primaryEndpoints.queue
        }
        {
          name: 'AzureWebJobsStorage__tableServiceUri'
          value: storageAccount.properties.primaryEndpoints.table
        }
        {
          name: 'AzureWebJobsStorage__credential'
          value: 'managedidentity'
        }
        {
          name: 'AOIFMSP_RUNTIME_MODE'
          value: 'azure'
        }
        {
          name: 'AOIFMSP_ENABLE_DEMO_SEED'
          value: 'false'
        }
        {
          name: 'AOIFMSP_AZURE_STORAGE_ACCOUNT_NAME'
          value: storageAccount.name
        }
        {
          name: 'AOIFMSP_AZURE_TABLES_ENDPOINT'
          value: storageAccount.properties.primaryEndpoints.table
        }
        {
          name: 'AOIFMSP_AZURE_BLOBS_ENDPOINT'
          value: storageAccount.properties.primaryEndpoints.blob
        }
        {
          name: 'AOIFMSP_AZURE_QUEUES_ENDPOINT'
          value: storageAccount.properties.primaryEndpoints.queue
        }
        {
          name: 'AOIFMSP_AZURE_KEY_VAULT_URL'
          value: keyVault.properties.vaultUri
        }
      ]
    }
  }
}

resource functionBlobDataContributor 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storageAccount.id, functionApp.id, 'storage-blob-data-contributor')
  scope: storageAccount
  properties: {
    principalId: functionApp.identity.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: storageBlobDataContributorRoleId
  }
}

resource functionQueueDataContributor 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storageAccount.id, functionApp.id, 'storage-queue-data-contributor')
  scope: storageAccount
  properties: {
    principalId: functionApp.identity.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: storageQueueDataContributorRoleId
  }
}

resource functionTableDataContributor 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storageAccount.id, functionApp.id, 'storage-table-data-contributor')
  scope: storageAccount
  properties: {
    principalId: functionApp.identity.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: storageTableDataContributorRoleId
  }
}

resource functionKeyVaultSecretsUser 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, functionApp.id, 'key-vault-secrets-user')
  scope: keyVault
  properties: {
    principalId: functionApp.identity.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: keyVaultSecretsUserRoleId
  }
}

resource deploymentStorageBlobDataContributor 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (!empty(deploymentPrincipalObjectId)) {
  name: guid(storageAccount.id, deploymentPrincipalObjectId, 'deployment-storage-blob-data-contributor')
  scope: storageAccount
  properties: {
    principalId: deploymentPrincipalObjectId
    principalType: 'ServicePrincipal'
    roleDefinitionId: storageBlobDataContributorRoleId
  }
}

output storageAccountName string = storageAccount.name
output keyVaultName string = keyVault.name
output keyVaultUrl string = keyVault.properties.vaultUri
output functionAppName string = functionApp.name
output functionPrincipalId string = functionApp.identity.principalId
output appInsightsName string = appInsights.name
output logAnalyticsWorkspaceName string = logAnalyticsWorkspace.name
output storageTableEndpoint string = storageAccount.properties.primaryEndpoints.table
output storageBlobEndpoint string = storageAccount.properties.primaryEndpoints.blob
output storageQueueEndpoint string = storageAccount.properties.primaryEndpoints.queue
output staticWebsiteUrl string = storageAccount.properties.primaryEndpoints.web
output functionAppUrl string = 'https://${functionApp.name}.azurewebsites.net'

