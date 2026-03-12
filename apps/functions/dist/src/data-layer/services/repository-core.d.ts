import type { BlobPath, SecretReference, TableEntityAddress } from '../common';
import type { QueueMessage } from '../storage';
import type { BlobDocumentStore, QueueMessageStore, SecretValueStore, TableEntityStore } from './repository-ports';
export type ValueParser<TValue> = (input: unknown) => TValue;
export declare class EntityTableRepository<TEntity extends TableEntityAddress, TKeyArgs extends unknown[] = []> {
    private readonly tableStore;
    readonly tableName: string;
    private readonly buildAddress?;
    constructor(tableStore: TableEntityStore, tableName: string, buildAddress?: ((...args: TKeyArgs) => TableEntityAddress) | undefined);
    getByKey(...args: TKeyArgs): Promise<TEntity | null>;
    upsert(entity: TEntity): Promise<TEntity>;
    deleteByKey(...args: TKeyArgs): Promise<void>;
    listByPartition(partitionKey: string): Promise<TEntity[]>;
}
export declare class ValidatedBlobRepository<TDocument, TPathArgs extends unknown[]> {
    private readonly blobStore;
    private readonly buildPath;
    private readonly parse;
    constructor(blobStore: BlobDocumentStore, buildPath: (...args: TPathArgs) => BlobPath, parse: ValueParser<TDocument>);
    get(...args: TPathArgs): Promise<TDocument | null>;
    put(value: TDocument, ...args: TPathArgs): Promise<TDocument>;
    delete(...args: TPathArgs): Promise<void>;
}
export declare class ValidatedSecretRepository<TValue, TNameArgs extends unknown[]> {
    private readonly secretStore;
    private readonly buildSecretName;
    private readonly parse;
    constructor(secretStore: SecretValueStore, buildSecretName: (...args: TNameArgs) => SecretReference, parse: ValueParser<TValue>);
    get(...args: TNameArgs): Promise<TValue | null>;
    set(value: TValue, ...args: TNameArgs): Promise<TValue>;
    delete(...args: TNameArgs): Promise<void>;
}
export declare class QueuePublisherService {
    private readonly queueStore;
    private readonly parseMessage;
    constructor(queueStore: QueueMessageStore, parseMessage: ValueParser<QueueMessage>);
    send<TMessage extends QueueMessage>(message: TMessage): Promise<TMessage>;
}
export declare class InMemoryTableEntityStore implements TableEntityStore {
    private readonly items;
    get<TEntity>(tableName: string, address: TableEntityAddress): Promise<TEntity | null>;
    upsert<TEntity extends TableEntityAddress>(tableName: string, entity: TEntity): Promise<TEntity>;
    delete(tableName: string, address: TableEntityAddress): Promise<void>;
    listByPartition<TEntity>(tableName: string, partitionKey: string): Promise<TEntity[]>;
}
export declare class InMemoryBlobDocumentStore implements BlobDocumentStore {
    private readonly documents;
    readJson<TDocument>(path: BlobPath): Promise<TDocument | null>;
    writeJson<TDocument>(path: BlobPath, document: TDocument): Promise<void>;
    delete(path: BlobPath): Promise<void>;
}
export declare class InMemoryQueueMessageStore implements QueueMessageStore {
    private readonly queues;
    send<TMessage extends QueueMessage>(queueName: string, message: TMessage): Promise<void>;
    list(queueName?: string): QueueMessage[];
}
export declare class InMemorySecretValueStore implements SecretValueStore {
    private readonly secrets;
    get<TValue>(secretName: SecretReference): Promise<TValue | null>;
    set<TValue>(secretName: SecretReference, value: TValue): Promise<void>;
    delete(secretName: SecretReference): Promise<void>;
}
//# sourceMappingURL=repository-core.d.ts.map