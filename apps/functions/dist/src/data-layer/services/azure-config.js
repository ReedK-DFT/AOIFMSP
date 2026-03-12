function readEnv(name) {
    const value = process.env[name]?.trim();
    return value ? value : undefined;
}
function requiredEnv(name) {
    const value = readEnv(name);
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}
function parseCsvEnv(name) {
    const value = readEnv(name);
    return value ? value.split(',').map((item) => item.trim()).filter(Boolean) : undefined;
}
function buildStorageConfig() {
    const storage = {};
    const accountName = readEnv('AOIFMSP_AZURE_STORAGE_ACCOUNT_NAME');
    const tableEndpoint = readEnv('AOIFMSP_AZURE_TABLES_ENDPOINT');
    const blobEndpoint = readEnv('AOIFMSP_AZURE_BLOBS_ENDPOINT');
    const queueEndpoint = readEnv('AOIFMSP_AZURE_QUEUES_ENDPOINT');
    if (accountName) {
        storage.accountName = accountName;
    }
    if (tableEndpoint) {
        storage.tableEndpoint = tableEndpoint;
    }
    if (blobEndpoint) {
        storage.blobEndpoint = blobEndpoint;
    }
    if (queueEndpoint) {
        storage.queueEndpoint = queueEndpoint;
    }
    return storage;
}
export function loadAzureDataLayerConfigFromEnv() {
    const authMode = (readEnv('AOIFMSP_AZURE_AUTH_MODE') ?? 'default');
    let auth;
    if (authMode === 'client-secret') {
        auth = {
            mode: 'client-secret',
            tenantId: requiredEnv('AOIFMSP_AZURE_TENANT_ID'),
            clientId: requiredEnv('AOIFMSP_AZURE_CLIENT_ID'),
            clientSecret: requiredEnv('AOIFMSP_AZURE_CLIENT_SECRET'),
        };
    }
    else if (authMode === 'managed-identity') {
        const clientId = readEnv('AOIFMSP_AZURE_MANAGED_IDENTITY_CLIENT_ID') ?? readEnv('AOIFMSP_AZURE_CLIENT_ID');
        auth = clientId
            ? { mode: 'managed-identity', clientId }
            : { mode: 'managed-identity' };
    }
    else {
        const tenantId = readEnv('AOIFMSP_AZURE_TENANT_ID');
        const managedIdentityClientId = readEnv('AOIFMSP_AZURE_MANAGED_IDENTITY_CLIENT_ID') ?? readEnv('AOIFMSP_AZURE_CLIENT_ID');
        const additionallyAllowedTenants = parseCsvEnv('AOIFMSP_AZURE_ALLOWED_TENANTS') ?? parseCsvEnv('AZURE_ADDITIONALLY_ALLOWED_TENANTS');
        auth = {
            mode: 'default',
            ...(tenantId ? { tenantId } : {}),
            ...(managedIdentityClientId ? { managedIdentityClientId } : {}),
            ...(additionallyAllowedTenants?.length ? { additionallyAllowedTenants } : {}),
        };
    }
    return {
        auth,
        storage: buildStorageConfig(),
        keyVaultUrl: requiredEnv('AOIFMSP_AZURE_KEY_VAULT_URL'),
        createTablesIfMissing: (readEnv('AOIFMSP_AZURE_CREATE_TABLES_IF_MISSING') ?? 'true').toLowerCase() === 'true',
        createContainersIfMissing: (readEnv('AOIFMSP_AZURE_CREATE_CONTAINERS_IF_MISSING') ?? 'true').toLowerCase() === 'true',
        createQueuesIfMissing: (readEnv('AOIFMSP_AZURE_CREATE_QUEUES_IF_MISSING') ?? 'true').toLowerCase() === 'true',
    };
}
export function resolveStorageEndpoints(storage) {
    const accountName = storage.accountName;
    const tableEndpoint = storage.tableEndpoint ?? (accountName ? `https://${accountName}.table.core.windows.net` : undefined);
    const blobEndpoint = storage.blobEndpoint ?? (accountName ? `https://${accountName}.blob.core.windows.net` : undefined);
    const queueEndpoint = storage.queueEndpoint ?? (accountName ? `https://${accountName}.queue.core.windows.net` : undefined);
    if (!tableEndpoint || !blobEndpoint || !queueEndpoint) {
        throw new Error('Azure storage endpoints are incomplete. Provide AOIFMSP_AZURE_STORAGE_ACCOUNT_NAME or explicit table/blob/queue endpoints.');
    }
    return {
        tableEndpoint,
        blobEndpoint,
        queueEndpoint,
    };
}
