function cloneValue(value) {
    return structuredClone(value);
}
export class EntityTableRepository {
    tableStore;
    tableName;
    buildAddress;
    constructor(tableStore, tableName, buildAddress) {
        this.tableStore = tableStore;
        this.tableName = tableName;
        this.buildAddress = buildAddress;
    }
    async getByKey(...args) {
        if (!this.buildAddress) {
            throw new Error(`Repository ${this.tableName} does not define a key builder.`);
        }
        return this.tableStore.get(this.tableName, this.buildAddress(...args));
    }
    async upsert(entity) {
        return this.tableStore.upsert(this.tableName, entity);
    }
    async deleteByKey(...args) {
        if (!this.buildAddress) {
            throw new Error(`Repository ${this.tableName} does not define a key builder.`);
        }
        return this.tableStore.delete(this.tableName, this.buildAddress(...args));
    }
    async listByPartition(partitionKey) {
        return this.tableStore.listByPartition(this.tableName, partitionKey);
    }
}
export class ValidatedBlobRepository {
    blobStore;
    buildPath;
    parse;
    constructor(blobStore, buildPath, parse) {
        this.blobStore = blobStore;
        this.buildPath = buildPath;
        this.parse = parse;
    }
    async get(...args) {
        const document = await this.blobStore.readJson(this.buildPath(...args));
        return document === null ? null : this.parse(document);
    }
    async put(value, ...args) {
        const parsed = this.parse(value);
        await this.blobStore.writeJson(this.buildPath(...args), parsed);
        return parsed;
    }
    async delete(...args) {
        await this.blobStore.delete(this.buildPath(...args));
    }
}
export class ValidatedSecretRepository {
    secretStore;
    buildSecretName;
    parse;
    constructor(secretStore, buildSecretName, parse) {
        this.secretStore = secretStore;
        this.buildSecretName = buildSecretName;
        this.parse = parse;
    }
    async get(...args) {
        const value = await this.secretStore.get(this.buildSecretName(...args));
        return value === null ? null : this.parse(value);
    }
    async set(value, ...args) {
        const parsed = this.parse(value);
        await this.secretStore.set(this.buildSecretName(...args), parsed);
        return parsed;
    }
    async delete(...args) {
        await this.secretStore.delete(this.buildSecretName(...args));
    }
}
export class QueuePublisherService {
    queueStore;
    parseMessage;
    constructor(queueStore, parseMessage) {
        this.queueStore = queueStore;
        this.parseMessage = parseMessage;
    }
    async send(message) {
        const parsed = this.parseMessage(message);
        await this.queueStore.send(parsed.messageType, parsed);
        return parsed;
    }
}
export class InMemoryTableEntityStore {
    items = new Map();
    async get(tableName, address) {
        const key = `${tableName}|${address.partitionKey}|${address.rowKey}`;
        const value = this.items.get(key);
        return value ? cloneValue(value) : null;
    }
    async upsert(tableName, entity) {
        const key = `${tableName}|${entity.partitionKey}|${entity.rowKey}`;
        this.items.set(key, cloneValue(entity));
        return cloneValue(entity);
    }
    async delete(tableName, address) {
        const key = `${tableName}|${address.partitionKey}|${address.rowKey}`;
        this.items.delete(key);
    }
    async listByPartition(tableName, partitionKey) {
        const prefix = `${tableName}|${partitionKey}|`;
        const results = [];
        for (const [key, value] of this.items.entries()) {
            if (key.startsWith(prefix)) {
                results.push(cloneValue(value));
            }
        }
        return results;
    }
}
export class InMemoryBlobDocumentStore {
    documents = new Map();
    async readJson(path) {
        const value = this.documents.get(path);
        return value === undefined ? null : cloneValue(value);
    }
    async writeJson(path, document) {
        this.documents.set(path, cloneValue(document));
    }
    async delete(path) {
        this.documents.delete(path);
    }
}
export class InMemoryQueueMessageStore {
    queues = new Map();
    async send(queueName, message) {
        const queue = this.queues.get(queueName) ?? [];
        queue.push(cloneValue(message));
        this.queues.set(queueName, queue);
    }
    list(queueName) {
        if (queueName) {
            return (this.queues.get(queueName) ?? []).map((message) => cloneValue(message));
        }
        return [...this.queues.values()].flatMap((messages) => messages.map((message) => cloneValue(message)));
    }
}
export class InMemorySecretValueStore {
    secrets = new Map();
    async get(secretName) {
        const value = this.secrets.get(secretName);
        return value === undefined ? null : cloneValue(value);
    }
    async set(secretName, value) {
        this.secrets.set(secretName, cloneValue(value));
    }
    async delete(secretName) {
        this.secrets.delete(secretName);
    }
}
