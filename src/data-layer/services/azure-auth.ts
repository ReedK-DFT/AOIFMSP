import { ClientSecretCredential, DefaultAzureCredential, ManagedIdentityCredential, type DefaultAzureCredentialClientIdOptions } from '@azure/identity';
import type { TokenCredential } from '@azure/core-auth';

import type { AzureCredentialConfig } from './azure-config';

export function createAzureCredential(config: AzureCredentialConfig): TokenCredential {
  switch (config.mode) {
    case 'managed-identity':
      return config.clientId ? new ManagedIdentityCredential(config.clientId) : new ManagedIdentityCredential();
    case 'client-secret':
      return new ClientSecretCredential(config.tenantId, config.clientId, config.clientSecret);
    case 'default':
    default: {
      const options: DefaultAzureCredentialClientIdOptions = {};

      if (config.tenantId) {
        options.tenantId = config.tenantId;
      }

      if (config.managedIdentityClientId) {
        options.managedIdentityClientId = config.managedIdentityClientId;
      }

      if (config.additionallyAllowedTenants?.length) {
        options.additionallyAllowedTenants = config.additionallyAllowedTenants;
      }

      return new DefaultAzureCredential(options);
    }
  }
}
