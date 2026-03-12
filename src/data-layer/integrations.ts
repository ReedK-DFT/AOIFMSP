import type {
  AuditedEntity,
  BlobPath,
  ConnectionAuthType,
  ConnectionScopeType,
  SchemaTrackedEntity,
  TableEntityAddress,
  TableSystemFields,
} from './common';

export type ConnectorStatus = 'draft' | 'active' | 'disabled' | 'archived';
export type ConnectorSourceType = 'openapi-upload' | 'openapi-url' | 'manual-adapter';
export type ConnectorVisibility = 'private' | 'shared';
export type ConnectionStatus = 'active' | 'inactive' | 'error' | 'expired';
export type ConnectionHealthStatus = 'unknown' | 'healthy' | 'warning' | 'error';

export interface ConnectorEntity extends TableEntityAddress, TableSystemFields, AuditedEntity, SchemaTrackedEntity {
  id: string;
  mspTenantId: string;
  displayName: string;
  providerName: string;
  category: string;
  sourceType: ConnectorSourceType;
  defaultAuthType: ConnectionAuthType;
  latestVersion?: string;
  status: ConnectorStatus;
  visibility: ConnectorVisibility;
  iconBlobPath?: BlobPath;
  summary?: string;
}

export interface ConnectorVersionEntity extends TableEntityAddress, TableSystemFields {
  id: string;
  mspTenantId: string;
  connectorId: string;
  connectorVersionId: string;
  versionLabel: string;
  status: 'imported' | 'published' | 'deprecated' | 'failed';
  importSource: string;
  openApiBlobPath: BlobPath;
  artifactBlobPath: BlobPath;
  actionsCount: number;
  schemasCount: number;
  authSchemesJson?: string;
  hashSha256: string;
  importedAt: string;
  importedBy: string;
  publishedAt?: string;
  schemaVersion: number;
  managementMode?: 'direct-ui' | 'workflow' | 'mixed';
}

export interface ConnectorActionEntity extends TableEntityAddress, TableSystemFields {
  id: string;
  mspTenantId: string;
  connectorId: string;
  connectorVersionId: string;
  actionId: string;
  operationId: string;
  displayName: string;
  category?: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
  pathTemplate: string;
  inputSchemaRef?: string;
  outputSchemaRef?: string;
  authRequirement?: string;
  isTriggerCapable: boolean;
  isDeprecated: boolean;
  summary?: string;
}

export interface ConnectionEntity extends TableEntityAddress, TableSystemFields, AuditedEntity {
  id: string;
  mspTenantId: string;
  clientTenantId?: string;
  scopeType: ConnectionScopeType;
  connectorId: string;
  connectorVersionId: string;
  displayName: string;
  authType: ConnectionAuthType;
  secretRef: string;
  baseUrlOverride?: string;
  status: ConnectionStatus;
  healthStatus: ConnectionHealthStatus;
  lastTestedAt?: string;
  lastTokenRefreshAt?: string;
  capabilitiesJson?: string;
}
