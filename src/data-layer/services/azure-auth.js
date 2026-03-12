import { ClientSecretCredential, DefaultAzureCredential, ManagedIdentityCredential } from '@azure/identity';
export function createAzureCredential(config) {
    switch (config.mode) {
        case 'managed-identity':
            return config.clientId ? new ManagedIdentityCredential(config.clientId) : new ManagedIdentityCredential();
        case 'client-secret':
            return new ClientSecretCredential(config.tenantId, config.clientId, config.clientSecret);
        case 'default':
        default: {
            const options = {};
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
