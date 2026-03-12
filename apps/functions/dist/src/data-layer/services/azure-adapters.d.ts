import type { TokenCredential } from '@azure/core-auth';
import type { BlobPath, SecretReference, TableEntityAddress } from '../common';
import { type BlobContainerName, type QueueMessage, type QueueName } from '../storage';
import { type DataLayerService } from './data-service';
import type { AzureDataLayerConfig } from './azure-config';
import type { BlobDocumentStore, DataLayerDependencies, QueueMessageStore, SecretValueStore, TableEntityStore } from './repository-ports';
export declare class AzureTableEntityStore implements TableEntityStore {
    private readonly endpoint;
    private readonly credential;
    private readonly options;
    private readonly serviceClient;
    private readonly tableClients;
    private readonly ensuredTables;
    constructor(endpoint: string, credential: TokenCredential, options?: {
        createTablesIfMissing?: boolean;
    });
    private getTableClient;
    ensureTable(tableName: string): Promise<void>;
    get<TEntity>(tableName: string, address: TableEntityAddress): Promise<TEntity | null>;
    upsert<TEntity extends TableEntityAddress>(tableName: string, entity: TEntity): Promise<TEntity>;
    delete(tableName: string, address: TableEntityAddress): Promise<void>;
    listByPartition<TEntity>(tableName: string, partitionKey: string): Promise<TEntity[]>;
}
export declare class AzureBlobDocumentStore implements BlobDocumentStore {
    private readonly options;
    private readonly serviceClient;
    private readonly ensuredContainers;
    constructor(endpoint: string, credential: TokenCredential, options?: {
        createContainersIfMissing?: boolean;
    });
    private getContainerClient;
    ensureContainer(containerName: BlobContainerName): Promise<void>;
    readJson<TDocument>(path: BlobPath): Promise<TDocument | null>;
    writeJson<TDocument>(path: BlobPath, document: TDocument): Promise<void>;
    delete(path: BlobPath): Promise<void>;
}
export declare class AzureQueueMessageStore implements QueueMessageStore {
    private readonly options;
    private readonly serviceClient;
    private readonly ensuredQueues;
    constructor(endpoint: string, credential: TokenCredential, options?: {
        createQueuesIfMissing?: boolean;
    });
    private getQueueClient;
    ensureQueue(queueName: QueueName): Promise<void>;
    send<TMessage extends QueueMessage>(queueName: QueueName, message: TMessage): Promise<void>;
}
export declare class AzureSecretValueStore implements SecretValueStore {
    private readonly client;
    constructor(vaultUrl: string, credential: TokenCredential);
    get<TValue>(secretName: SecretReference): Promise<TValue | null>;
    set<TValue>(secretName: SecretReference, value: TValue): Promise<void>;
    delete(secretName: SecretReference): Promise<void>;
}
export declare class AzureDataLayerProvisioner {
    private readonly tableStore;
    private readonly blobStore;
    private readonly queueStore;
    constructor(tableStore: AzureTableEntityStore, blobStore: AzureBlobDocumentStore, queueStore: AzureQueueMessageStore);
    ensureStorageStructure(): Promise<void>;
}
export interface AzureDataLayerRuntime {
    config: AzureDataLayerConfig;
    dependencies: DataLayerDependencies;
    service: DataLayerService;
    provisioner: AzureDataLayerProvisioner;
}
export declare function createAzureDataLayerDependencies(config: AzureDataLayerConfig): DataLayerDependencies;
export declare function createAzureDataLayerService(config: AzureDataLayerConfig): AzureDataLayerRuntime;
//# sourceMappingURL=azure-adapters.d.ts.map