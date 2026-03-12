import { TableClient, TableServiceClient, type TableEntity } from '@azure/data-tables';
import { SecretClient } from '@azure/keyvault-secrets';
import { BlobServiceClient } from '@azure/storage-blob';
import { QueueServiceClient } from '@azure/storage-queue';
import type { TokenCredential } from '@azure/core-auth';

import type { BlobPath, SecretReference, TableEntityAddress } from '../common';
import { blobContainers, type BlobContainerName, type QueueMessage, queueNames, type QueueName } from '../storage';
import { createDataLayerService, tableNames, type DataLayerService } from './data-service';
import { createAzureCredential } from './azure-auth';
import type { AzureDataLayerConfig } from './azure-config';
import { resolveStorageEndpoints } from './azure-config';
import type { BlobDocumentStore, DataLayerDependencies, QueueMessageStore, SecretValueStore, TableEntityStore } from './repository-ports';

function isStatusCode(error: unknown, statusCode: number): boolean {
  return typeof error === 'object' && error !== null && 'statusCode' in error && (error as { statusCode?: number }).statusCode === statusCode;
}

function ensureBlobPathParts(path: BlobPath): { containerName: string; blobName: string } {
  const separatorIndex = path.indexOf('/');

  if (separatorIndex <= 0 || separatorIndex === path.length - 1) {
    throw new Error(`Invalid blob path: ${path}`);
  }

  return {
    containerName: path.slice(0, separatorIndex),
    blobName: path.slice(separatorIndex + 1),
  };
}

function tableFilterEquals(propertyName: string, value: string): string {
  const escaped = value.replace(/'/g, "''");
  return `${propertyName} eq '${escaped}'`;
}

export class AzureTableEntityStore implements TableEntityStore {
  private readonly serviceClient: TableServiceClient;
  private readonly tableClients = new Map<string, TableClient>();
  private readonly ensuredTables = new Set<string>();

  constructor(
    private readonly endpoint: string,
    private readonly credential: TokenCredential,
    private readonly options: { createTablesIfMissing?: boolean } = {},
  ) {
    this.serviceClient = new TableServiceClient(endpoint, credential);
  }

  private async getTableClient(tableName: string): Promise<TableClient> {
    let client = this.tableClients.get(tableName);

    if (!client) {
      client = new TableClient(this.endpoint, tableName, this.credential);
      this.tableClients.set(tableName, client);
    }

    if (this.options.createTablesIfMissing && !this.ensuredTables.has(tableName)) {
      await this.serviceClient.createTable(tableName).catch((error: unknown) => {
        if (!isStatusCode(error, 409)) {
          throw error;
        }
      });
      this.ensuredTables.add(tableName);
    }

    return client;
  }

  async ensureTable(tableName: string): Promise<void> {
    await this.getTableClient(tableName);
  }

  async get<TEntity>(tableName: string, address: TableEntityAddress): Promise<TEntity | null> {
    const client = await this.getTableClient(tableName);

    try {
      const entity = await client.getEntity<Record<string, unknown>>(address.partitionKey, address.rowKey);
      return entity as TEntity;
    } catch (error) {
      if (isStatusCode(error, 404)) {
        return null;
      }

      throw error;
    }
  }

  async upsert<TEntity extends TableEntityAddress>(tableName: string, entity: TEntity): Promise<TEntity> {
    const client = await this.getTableClient(tableName);
    await client.upsertEntity(entity as unknown as TableEntity<Record<string, unknown>>, 'Replace');
    return entity;
  }

  async delete(tableName: string, address: TableEntityAddress): Promise<void> {
    const client = await this.getTableClient(tableName);

    try {
      await client.deleteEntity(address.partitionKey, address.rowKey);
    } catch (error) {
      if (!isStatusCode(error, 404)) {
        throw error;
      }
    }
  }

  async listByPartition<TEntity>(tableName: string, partitionKey: string): Promise<TEntity[]> {
    const client = await this.getTableClient(tableName);
    const results: TEntity[] = [];

    for await (const entity of client.listEntities<Record<string, unknown>>({
      queryOptions: {
        filter: tableFilterEquals('PartitionKey', partitionKey),
      },
    })) {
      results.push(entity as TEntity);
    }

    return results;
  }
}

export class AzureBlobDocumentStore implements BlobDocumentStore {
  private readonly serviceClient: BlobServiceClient;
  private readonly ensuredContainers = new Set<string>();

  constructor(
    endpoint: string,
    credential: TokenCredential,
    private readonly options: { createContainersIfMissing?: boolean } = {},
  ) {
    this.serviceClient = new BlobServiceClient(endpoint, credential);
  }

  private async getContainerClient(containerName: string) {
    const client = this.serviceClient.getContainerClient(containerName);

    if (this.options.createContainersIfMissing && !this.ensuredContainers.has(containerName)) {
      await client.createIfNotExists();
      this.ensuredContainers.add(containerName);
    }

    return client;
  }

  async ensureContainer(containerName: BlobContainerName): Promise<void> {
    await this.getContainerClient(containerName);
  }

  async readJson<TDocument>(path: BlobPath): Promise<TDocument | null> {
    const { containerName, blobName } = ensureBlobPathParts(path);
    const containerClient = await this.getContainerClient(containerName);
    const blobClient = containerClient.getBlockBlobClient(blobName);

    try {
      const buffer = await blobClient.downloadToBuffer();
      return JSON.parse(buffer.toString('utf8')) as TDocument;
    } catch (error) {
      if (isStatusCode(error, 404)) {
        return null;
      }

      throw error;
    }
  }

  async writeJson<TDocument>(path: BlobPath, document: TDocument): Promise<void> {
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

  async delete(path: BlobPath): Promise<void> {
    const { containerName, blobName } = ensureBlobPathParts(path);
    const containerClient = await this.getContainerClient(containerName);
    const blobClient = containerClient.getBlockBlobClient(blobName);
    await blobClient.deleteIfExists();
  }
}

export class AzureQueueMessageStore implements QueueMessageStore {
  private readonly serviceClient: QueueServiceClient;
  private readonly ensuredQueues = new Set<string>();

  constructor(
    endpoint: string,
    credential: TokenCredential,
    private readonly options: { createQueuesIfMissing?: boolean } = {},
  ) {
    this.serviceClient = new QueueServiceClient(endpoint, credential);
  }

  private async getQueueClient(queueName: QueueName) {
    const client = this.serviceClient.getQueueClient(queueName);

    if (this.options.createQueuesIfMissing && !this.ensuredQueues.has(queueName)) {
      await client.createIfNotExists();
      this.ensuredQueues.add(queueName);
    }

    return client;
  }

  async ensureQueue(queueName: QueueName): Promise<void> {
    await this.getQueueClient(queueName);
  }

  async send<TMessage extends QueueMessage>(queueName: QueueName, message: TMessage): Promise<void> {
    const client = await this.getQueueClient(queueName);
    await client.sendMessage(JSON.stringify(message));
  }
}

export class AzureSecretValueStore implements SecretValueStore {
  private readonly client: SecretClient;

  constructor(vaultUrl: string, credential: TokenCredential) {
    this.client = new SecretClient(vaultUrl, credential);
  }

  async get<TValue>(secretName: SecretReference): Promise<TValue | null> {
    try {
      const secret = await this.client.getSecret(secretName);
      return secret.value ? (JSON.parse(secret.value) as TValue) : null;
    } catch (error) {
      if (isStatusCode(error, 404)) {
        return null;
      }

      throw error;
    }
  }

  async set<TValue>(secretName: SecretReference, value: TValue): Promise<void> {
    await this.client.setSecret(secretName, JSON.stringify(value));
  }

  async delete(secretName: SecretReference): Promise<void> {
    const poller = await this.client.beginDeleteSecret(secretName);
    await poller.pollUntilDone();
  }
}

export class AzureDataLayerProvisioner {
  constructor(
    private readonly tableStore: AzureTableEntityStore,
    private readonly blobStore: AzureBlobDocumentStore,
    private readonly queueStore: AzureQueueMessageStore,
  ) {}

  async ensureStorageStructure(): Promise<void> {
    await Promise.all([
      ...Object.values(tableNames).map((tableName) => this.tableStore.ensureTable(tableName)),
      ...blobContainers.map((containerName) => this.blobStore.ensureContainer(containerName)),
      ...queueNames.map((queueName) => this.queueStore.ensureQueue(queueName)),
    ]);
  }
}

export interface AzureDataLayerRuntime {
  config: AzureDataLayerConfig;
  dependencies: DataLayerDependencies;
  service: DataLayerService;
  provisioner: AzureDataLayerProvisioner;
}

export function createAzureDataLayerDependencies(config: AzureDataLayerConfig): DataLayerDependencies {
  const endpoints = resolveStorageEndpoints(config.storage);
  const credential = createAzureCredential(config.auth);

  return {
    tables: new AzureTableEntityStore(
      endpoints.tableEndpoint,
      credential,
      config.createTablesIfMissing === undefined ? {} : { createTablesIfMissing: config.createTablesIfMissing },
    ),
    blobs: new AzureBlobDocumentStore(
      endpoints.blobEndpoint,
      credential,
      config.createContainersIfMissing === undefined ? {} : { createContainersIfMissing: config.createContainersIfMissing },
    ),
    queues: new AzureQueueMessageStore(
      endpoints.queueEndpoint,
      credential,
      config.createQueuesIfMissing === undefined ? {} : { createQueuesIfMissing: config.createQueuesIfMissing },
    ),
    secrets: new AzureSecretValueStore(config.keyVaultUrl, credential),
  };
}

export function createAzureDataLayerService(config: AzureDataLayerConfig): AzureDataLayerRuntime {
  const dependencies = createAzureDataLayerDependencies(config);
  const service = createDataLayerService(dependencies);
  const provisioner = new AzureDataLayerProvisioner(
    dependencies.tables as AzureTableEntityStore,
    dependencies.blobs as AzureBlobDocumentStore,
    dependencies.queues as AzureQueueMessageStore,
  );

  return {
    config,
    dependencies,
    service,
    provisioner,
  };
}
