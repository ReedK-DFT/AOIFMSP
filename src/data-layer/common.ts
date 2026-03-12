export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];

export interface JsonObject {
  [key: string]: JsonValue;
}

export type IsoUtcDateTime = string;
export type UlidString = string;
export type GuidString = string;
export type UrlString = string;
export type AzureResourceId = string;
export type BlobPath = string;
export type SecretReference = string;
export type PartitionKey = string;
export type RowKey = string;

export type ManagementMode = 'direct-ui' | 'workflow' | 'mixed';
export type FoundrySetupMode = 'basic' | 'standard';
export type ApprovalMode = 'suggest-only' | 'act-with-tools' | 'approval-required';
export type ApprovalState = 'not-required' | 'pending' | 'approved' | 'rejected';
export type ConnectionScopeType = 'msp' | 'client';
export type AdminAuthMode = 'gdap-obo' | 'platform-app' | 'delegated' | 'custom';
export type ConnectionAuthType =
  | 'oauth2-client-credentials'
  | 'oauth2-authorization-code'
  | 'oauth2-on-behalf-of'
  | 'api-key'
  | 'basic-auth'
  | 'certificate'
  | 'custom';
export type WorkflowTriggerType = 'manual' | 'schedule' | 'webhook' | 'polling' | 'queue';
export type StartedByType = 'user' | 'workflow' | 'system' | 'agent';
export type RequestedByType = 'user' | 'workflow' | 'system' | 'user-or-workflow' | 'user-or-system';

export interface TableEntityAddress {
  partitionKey: PartitionKey;
  rowKey: RowKey;
}

export interface TableSystemFields {
  etag?: string;
  timestamp?: IsoUtcDateTime;
}

export interface AuditedEntity {
  createdAt: IsoUtcDateTime;
  createdBy: string;
  updatedAt: IsoUtcDateTime;
  updatedBy: string;
}

export interface SchemaTrackedEntity {
  schemaVersion?: number;
  managementMode?: ManagementMode;
  tagsJson?: string;
}

export interface TenantScopedEntity {
  mspTenantId: string;
  clientTenantId?: string;
}

export interface DisplayNamedEntity {
  displayName: string;
}

export interface EntityReference<TResourceType extends string = string> {
  resourceType: TResourceType;
  resourceId: string;
  displayName?: string;
}

export interface QueueMessageEnvelope<TMessageType extends string> {
  messageType: TMessageType;
  correlationId: string;
  enqueuedAt: IsoUtcDateTime;
}

export interface WorkflowApprovalPolicy {
  required: boolean;
  approverRoles?: string[];
  timeoutSeconds?: number;
}

export interface UserBindingMap {
  actions: Record<string, string[]>;
  modifiers?: Record<string, string[]>;
  metadata?: JsonObject;
}
