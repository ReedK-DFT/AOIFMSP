import { TableClient, TableServiceClient } from '@azure/data-tables';
import { SecretClient } from '@azure/keyvault-secrets';
import { BlobServiceClient } from '@azure/storage-blob';
import { QueueServiceClient } from '@azure/storage-queue';
import { blobContainers, queueNames } from '../storage';
import { createDataLayerService, tableNames } from './data-service';
import { createAzureCredential } from './azure-auth';
import { resolveStorageEndpoints } from './azure-config';
function isStatusCode(error, statusCode) {
    return typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === statusCode;
}
function ensureBlobPathParts(path) {
    const separatorIndex = path.indexOf('/');
    if (separatorIndex <= 0 || separatorIndex === path.length - 1) {
        throw new Error(`Invalid blob path: ${path}`);
    }
    return {
        containerName: path.slice(0, separatorIndex),
        blobName: path.slice(separatorIndex + 1),
    };
}
function tableFilterEquals(propertyName, value) {
    const escaped = value.replace(/'/g, "''");
    return `${propertyName} eq '${escaped}'`;
}
export class AzureTableEntityStore {
    endpoint;
    credential;
    options;
    serviceClient;
    tableClients = new Map();
    ensuredTables = new Set();
    constructor(endpoint, credential, options = {}) {
        this.endpoint = endpoint;
        this.credential = credential;
        this.options = options;
        this.serviceClient = new TableServiceClient(endpoint, credential);
    }
    async getTableClient(tableName) {
        let client = this.tableClients.get(tableName);
        if (!client) {
            client = new TableClient(this.endpoint, tableName, this.credential);
            this.tableClients.set(tableName, client);
        }
        if (this.options.createTablesIfMissing && !this.ensuredTables.has(tableName)) {
            await this.serviceClient.createTable(tableName).catch((error) => {
                if (!isStatusCode(error, 409)) {
                    throw error;
                }
            });
            this.ensuredTables.add(tableName);
        }
        return client;
    }
    async ensureTable(tableName) {
        await this.getTableClient(tableName);
    }
    async get(tableName, address) {
        const client = await this.getTableClient(tableName);
        try {
            const entity = await client.getEntity(address.partitionKey, address.rowKey);
            return entity;
        }
        catch (error) {
            if (isStatusCode(error, 404)) {
                return null;
            }
            throw error;
        }
    }
    async upsert(tableName, entity) {
        const client = await this.getTableClient(tableName);
        await client.upsertEntity(entity, 'Replace');
        return entity;
    }
    async delete(tableName, address) {
        const client = await this.getTableClient(tableName);
        try {
            await client.deleteEntity(address.partitionKey, address.rowKey);
        }
        catch (error) {
            if (!isStatusCode(error, 404)) {
                throw error;
            }
        }
    }
    async listByPartition(tableName, partitionKey) {
        const client = await this.getTableClient(tableName);
        const results = [];
        for await (const entity of client.listEntities({
            queryOptions: {
                filter: tableFilterEquals('PartitionKey', partitionKey),
            },
        })) {
            results.push(entity);
        }
        return results;
    }
}
export class AzureBlobDocumentStore {
    options;
    serviceClient;
    ensuredContainers = new Set();
    constructor(endpoint, credential, options = {}) {
        this.options = options;
        this.serviceClient = new BlobServiceClient(endpoint, credential);
    }
    async getContainerClient(containerName) {
        const client = this.serviceClient.getContainerClient(containerName);
        if (this.options.createContainersIfMissing && !this.ensuredContainers.has(containerName)) {
            await client.createIfNotExists();
            this.ensuredContainers.add(containerName);
        }
        return client;
    }
    async ensureContainer(containerName) {
        await this.getContainerClient(containerName);
    }
    async readJson(path) {
        const { containerName, blobName } = ensureBlobPathParts(path);
        const containerClient = await this.getContainerClient(containerName);
        const blobClient = containerClient.getBlockBlobClient(blobName);
        try {
            const buffer = await blobClient.downloadToBuffer();
            return JSON.parse(buffer.toString('utf8'));
        }
        catch (error) {
            if (isStatusCode(error, 404)) {
                return null;
            }
            throw error;
        }
    }
    async writeJson(path, document) {
        const { containerName, blobName } = ensureBlobPathParts(path);
        const containerClient = await this.getContainerClient(containerName);
        const blobClient = containerClient.getBlockBlobClient(blobName);
        const body = Buffer.from(JSON.stringify(document, null, 2), 'utf8');
        await blobClient.uploadData(body, {
            blobHTTPHeaders: {
                blobContentType: 'application/json; charset=utf-8',
            },
        });
    }
    async delete(path) {
        const { containerName, blobName } = ensureBlobPathParts(path);
        const containerClient = await this.getContainerClient(containerName);
        const blobClient = containerClient.getBlockBlobClient(blobName);
        await blobClient.deleteIfExists();
    }
}
export class AzureQueueMessageStore {
    options;
    serviceClient;
    ensuredQueues = new Set();
    constructor(endpoint, credential, options = {}) {
        this.options = options;
        this.serviceClient = new QueueServiceClient(endpoint, credential);
    }
    async getQueueClient(queueName) {
        const client = this.serviceClient.getQueueClient(queueName);
        if (this.options.createQueuesIfMissing && !this.ensuredQueues.has(queueName)) {
            await client.createIfNotExists();
            this.ensuredQueues.add(queueName);
        }
        return client;
    }
    async ensureQueue(queueName) {
        await this.getQueueClient(queueName);
    }
    async send(queueName, message) {
        const client = await this.getQueueClient(queueName);
        await client.sendMessage(JSON.stringify(message));
    }
}
export class AzureSecretValueStore {
    client;
    constructor(vaultUrl, credential) {
        this.client = new SecretClient(vaultUrl, credential);
    }
    async get(secretName) {
        try {
            const secret = await this.client.getSecret(secretName);
            return secret.value ? JSON.parse(secret.value) : null;
        }
        catch (error) {
            if (isStatusCode(error, 404)) {
                return null;
            }
            throw error;
        }
    }
    async set(secretName, value) {
        await this.client.setSecret(secretName, JSON.stringify(value));
    }
    async delete(secretName) {
        const poller = await this.client.beginDeleteSecret(secretName);
        await poller.pollUntilDone();
    }
}
export class AzureDataLayerProvisioner {
    tableStore;
    blobStore;
    queueStore;
    constructor(tableStore, blobStore, queueStore) {
        this.tableStore = tableStore;
        this.blobStore = blobStore;
        this.queueStore = queueStore;
    }
    async ensureStorageStructure() {
        await Promise.all([
            ...Object.values(tableNames).map((tableName) => this.tableStore.ensureTable(tableName)),
            ...blobContainers.map((containerName) => this.blobStore.ensureContainer(containerName)),
            ...queueNames.map((queueName) => this.queueStore.ensureQueue(queueName)),
        ]);
    }
}
export function createAzureDataLayerDependencies(config) {
    const endpoints = resolveStorageEndpoints(config.storage);
    const credential = createAzureCredential(config.auth);
    return {
        tables: new AzureTableEntityStore(endpoints.tableEndpoint, credential, config.createTablesIfMissing === undefined ? {} : { createTablesIfMissing: config.createTablesIfMissing }),
        blobs: new AzureBlobDocumentStore(endpoints.blobEndpoint, credential, config.createContainersIfMissing === undefined ? {} : { createContainersIfMissing: config.createContainersIfMissing }),
        queues: new AzureQueueMessageStore(endpoints.queueEndpoint, credential, config.createQueuesIfMissing === undefined ? {} : { createQueuesIfMissing: config.createQueuesIfMissing }),
        secrets: new AzureSecretValueStore(config.keyVaultUrl, credential),
    };
}
export function createAzureDataLayerService(config) {
    const dependencies = createAzureDataLayerDependencies(config);
    const service = createDataLayerService(dependencies);
    const provisioner = new AzureDataLayerProvisioner(dependencies.tables, dependencies.blobs, dependencies.queues);
    return {
        config,
        dependencies,
        service,
        provisioner,
    };
}
