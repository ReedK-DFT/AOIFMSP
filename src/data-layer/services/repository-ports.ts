import type { BlobPath, SecretReference, TableEntityAddress } from '../common';
import type { QueueMessage, QueueName } from '../storage';

export interface TableEntityStore {
  get<TEntity>(tableName: string, address: TableEntityAddress): Promise<TEntity | null>;
  upsert<TEntity extends TableEntityAddress>(tableName: string, entity: TEntity): Promise<TEntity>;
  delete(tableName: string, address: TableEntityAddress): Promise<void>;
  listByPartition<TEntity>(tableName: string, partitionKey: string): Promise<TEntity[]>;
}

export interface BlobDocumentStore {
  readJson<TDocument>(path: BlobPath): Promise<TDocument | null>;
  writeJson<TDocument>(path: BlobPath, document: TDocument): Promise<void>;
  delete(path: BlobPath): Promise<void>;
}

export interface QueueMessageStore {
  send<TMessage extends QueueMessage>(queueName: QueueName, message: TMessage): Promise<void>;
}

export interface SecretValueStore {
  get<TValue>(secretName: SecretReference): Promise<TValue | null>;
  set<TValue>(secretName: SecretReference, value: TValue): Promise<void>;
  delete(secretName: SecretReference): Promise<void>;
}

export interface DataLayerDependencies {
  tables: TableEntityStore;
  blobs: BlobDocumentStore;
  queues: QueueMessageStore;
  secrets: SecretValueStore;
}
