export type AzureDataLayerAuthMode = 'default' | 'managed-identity' | 'client-secret';
export interface AzureDefaultCredentialConfig {
    mode: 'default';
    tenantId?: string;
    managedIdentityClientId?: string;
    additionallyAllowedTenants?: string[];
}
export interface AzureManagedIdentityConfig {
    mode: 'managed-identity';
    clientId?: string;
}
export interface AzureClientSecretCredentialConfig {
    mode: 'client-secret';
    tenantId: string;
    clientId: string;
    clientSecret: string;
}
export type AzureCredentialConfig = AzureDefaultCredentialConfig | AzureManagedIdentityConfig | AzureClientSecretCredentialConfig;
export interface AzureStorageServiceConfig {
    accountName?: string;
    tableEndpoint?: string;
    blobEndpoint?: string;
    queueEndpoint?: string;
}
export interface AzureDataLayerConfig {
    auth: AzureCredentialConfig;
    storage: AzureStorageServiceConfig;
    keyVaultUrl: string;
    createTablesIfMissing?: boolean;
    createContainersIfMissing?: boolean;
    createQueuesIfMissing?: boolean;
}
export declare function loadAzureDataLayerConfigFromEnv(): AzureDataLayerConfig;
export declare function resolveStorageEndpoints(storage: AzureStorageServiceConfig): Required<Pick<AzureStorageServiceConfig, 'tableEndpoint' | 'blobEndpoint' | 'queueEndpoint'>>;
//# sourceMappingURL=azure-config.d.ts.map