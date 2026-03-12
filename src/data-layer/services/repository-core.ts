import type { BlobPath, SecretReference, TableEntityAddress } from '../common';
import type { QueueMessage } from '../storage';
import type { BlobDocumentStore, QueueMessageStore, SecretValueStore, TableEntityStore } from './repository-ports';

export type ValueParser<TValue> = (input: unknown) => TValue;

function cloneValue<TValue>(value: TValue): TValue {
  return structuredClone(value);
}

export class EntityTableRepository<TEntity extends TableEntityAddress, TKeyArgs extends unknown[] = []> {
  constructor(
    private readonly tableStore: TableEntityStore,
    readonly tableName: string,
    private readonly buildAddress?: (...args: TKeyArgs) => TableEntityAddress,
  ) {}

  async getByKey(...args: TKeyArgs): Promise<TEntity | null> {
    if (!this.buildAddress) {
      throw new Error(`Repository ${this.tableName} does not define a key builder.`);
    }

    return this.tableStore.get<TEntity>(this.tableName, this.buildAddress(...args));
  }

  async upsert(entity: TEntity): Promise<TEntity> {
    return this.tableStore.upsert(this.tableName, entity);
  }

  async deleteByKey(...args: TKeyArgs): Promise<void> {
    if (!this.buildAddress) {
      throw new Error(`Repository ${this.tableName} does not define a key builder.`);
    }

    return this.tableStore.delete(this.tableName, this.buildAddress(...args));
  }

  async listByPartition(partitionKey: string): Promise<TEntity[]> {
    return this.tableStore.listByPartition<TEntity>(this.tableName, partitionKey);
  }
}

export class ValidatedBlobRepository<TDocument, TPathArgs extends unknown[]> {
  constructor(
    private readonly blobStore: BlobDocumentStore,
    private readonly buildPath: (...args: TPathArgs) => BlobPath,
    private readonly parse: ValueParser<TDocument>,
  ) {}

  async get(...args: TPathArgs): Promise<TDocument | null> {
    const document = await this.blobStore.readJson<unknown>(this.buildPath(...args));
    return document === null ? null : this.parse(document);
  }

  async put(value: TDocument, ...args: TPathArgs): Promise<TDocument> {
    const parsed = this.parse(value);
    await this.blobStore.writeJson(this.buildPath(...args), parsed);
    return parsed;
  }

  async delete(...args: TPathArgs): Promise<void> {
    await this.blobStore.delete(this.buildPath(...args));
  }
}

export class ValidatedSecretRepository<TValue, TNameArgs extends unknown[]> {
  constructor(
    private readonly secretStore: SecretValueStore,
    private readonly buildSecretName: (...args: TNameArgs) => SecretReference,
    private readonly parse: ValueParser<TValue>,
  ) {}

  async get(...args: TNameArgs): Promise<TValue | null> {
    const value = await this.secretStore.get<unknown>(this.buildSecretName(...args));
    return value === null ? null : this.parse(value);
  }

  async set(value: TValue, ...args: TNameArgs): Promise<TValue> {
    const parsed = this.parse(value);
    await this.secretStore.set(this.buildSecretName(...args), parsed);
    return parsed;
  }

  async delete(...args: TNameArgs): Promise<void> {
    await this.secretStore.delete(this.buildSecretName(...args));
  }
}

export class QueuePublisherService {
  constructor(
    private readonly queueStore: QueueMessageStore,
    private readonly parseMessage: ValueParser<QueueMessage>,
  ) {}

  async send<TMessage extends QueueMessage>(message: TMessage): Promise<TMessage> {
    const parsed = this.parseMessage(message) as TMessage;
    await this.queueStore.send(parsed.messageType, parsed);
    return parsed;
  }
}

export class InMemoryTableEntityStore implements TableEntityStore {
  private readonly items = new Map<string, TableEntityAddress & Record<string, unknown>>();

  async get<TEntity>(tableName: string, address: TableEntityAddress): Promise<TEntity | null> {
    const key = `${tableName}|${address.partitionKey}|${address.rowKey}`;
    const value = this.items.get(key);
    return value ? cloneValue(value as TEntity) : null;
  }

  async upsert<TEntity extends TableEntityAddress>(tableName: string, entity: TEntity): Promise<TEntity> {
    const key = `${tableName}|${entity.partitionKey}|${entity.rowKey}`;
    this.items.set(key, cloneValue(entity as TableEntityAddress & Record<string, unknown>));
    return cloneValue(entity);
  }

  async delete(tableName: string, address: TableEntityAddress): Promise<void> {
    const key = `${tableName}|${address.partitionKey}|${address.rowKey}`;
    this.items.delete(key);
  }

  async listByPartition<TEntity>(tableName: string, partitionKey: string): Promise<TEntity[]> {
    const prefix = `${tableName}|${partitionKey}|`;
    const results: TEntity[] = [];

    for (const [key, value] of this.items.entries()) {
      if (key.startsWith(prefix)) {
        results.push(cloneValue(value as TEntity));
      }
    }

    return results;
  }
}

export class InMemoryBlobDocumentStore implements BlobDocumentStore {
  private readonly documents = new Map<string, unknown>();

  async readJson<TDocument>(path: BlobPath): Promise<TDocument | null> {
    const value = this.documents.get(path);
    return value === undefined ? null : cloneValue(value as TDocument);
  }

  async writeJson<TDocument>(path: BlobPath, document: TDocument): Promise<void> {
    this.documents.set(path, cloneValue(document));
  }

  async delete(path: BlobPath): Promise<void> {
    this.documents.delete(path);
  }
}

export class InMemoryQueueMessageStore implements QueueMessageStore {
  private readonly queues = new Map<string, QueueMessage[]>();

  async send<TMessage extends QueueMessage>(queueName: string, message: TMessage): Promise<void> {
    const queue = this.queues.get(queueName) ?? [];
    queue.push(cloneValue(message));
    this.queues.set(queueName, queue);
  }

  list(queueName?: string): QueueMessage[] {
    if (queueName) {
      return (this.queues.get(queueName) ?? []).map((message) => cloneValue(message));
    }

    return [...this.queues.values()].flatMap((messages) => messages.map((message) => cloneValue(message)));
  }
}

export class InMemorySecretValueStore implements SecretValueStore {
  private readonly secrets = new Map<string, unknown>();

  async get<TValue>(secretName: SecretReference): Promise<TValue | null> {
    const value = this.secrets.get(secretName);
    return value === undefined ? null : cloneValue(value as TValue);
  }

  async set<TValue>(secretName: SecretReference, value: TValue): Promise<void> {
    this.secrets.set(secretName, cloneValue(value));
  }

  async delete(secretName: SecretReference): Promise<void> {
    this.secrets.delete(secretName);
  }
}
