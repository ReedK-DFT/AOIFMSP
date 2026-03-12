import type {
  AdminAuthMode,
  AuditedEntity,
  BlobPath,
  JsonObject,
  RequestedByType,
  TableEntityAddress,
  TableSystemFields,
  WorkflowApprovalPolicy,
} from './common';

export type TenantGroupMembershipMode = 'static' | 'rule-based';
export type StandardRemediationMode = 'manual' | 'approval-required' | 'auto';
export type StandardTargetType = 'tenant' | 'tenant-group';
export type StandardResultStatus = 'compliant' | 'non-compliant' | 'excluded' | 'unknown';
export type ManagementAlertSeverity = 'informational' | 'low' | 'medium' | 'high' | 'critical';
export type ManagementAlertStatus = 'open' | 'acknowledged' | 'resolved';
export type SyncDatasetName = 'users' | 'licenses' | 'groups' | 'roles' | 'standards' | string;

export interface TenantManagementProfileEntity extends TableEntityAddress, TableSystemFields, AuditedEntity {
  id: string;
  mspTenantId: string;
  clientTenantId: string;
  gdapRelationshipState: string;
  gdapRolesJson?: string;
  gdapExpiresAt?: string;
  defaultAdminAuthMode: AdminAuthMode;
  oboServiceAccountRef?: string;
  platformAppRegistrationId?: string;
  platformPermissionScopeJson?: string;
  managementCapabilitiesJson?: string;
  lastValidatedAt?: string;
}

export interface ManagedUserEntity extends TableEntityAddress, TableSystemFields {
  id: string;
  mspTenantId: string;
  clientTenantId: string;
  managedUserId: string;
  entraObjectId: string;
  userPrincipalName: string;
  displayName: string;
  givenName?: string;
  surname?: string;
  mail?: string;
  accountEnabled: boolean;
  usageLocation?: string;
  userType?: string;
  licenseSummaryJson?: string;
  roleSummaryJson?: string;
  groupSummaryJson?: string;
  syncSource: string;
  lastGraphSyncAt?: string;
  lastManagedAt?: string;
  status: 'active' | 'disabled' | 'deleted' | 'guest';
}

export interface TenantGroupEntity extends TableEntityAddress, TableSystemFields, AuditedEntity {
  id: string;
  mspTenantId: string;
  displayName: string;
  description?: string;
  membershipMode: TenantGroupMembershipMode;
  criteriaJson?: string;
  status: 'active' | 'disabled';
}

export interface TenantGroupMemberEntity extends TableEntityAddress, TableSystemFields {
  mspTenantId: string;
  tenantGroupId: string;
  clientTenantId: string;
  membershipSource: 'static' | 'rule';
  resolvedAt: string;
}

export interface StandardsTemplateEntity extends TableEntityAddress, TableSystemFields, AuditedEntity {
  id: string;
  mspTenantId: string;
  displayName: string;
  description?: string;
  category: string;
  definitionBlobPath: BlobPath;
  defaultSeverity: ManagementAlertSeverity;
  remediationMode: StandardRemediationMode;
  status: 'draft' | 'active' | 'disabled' | 'archived';
}

export interface StandardsAssignmentEntity extends TableEntityAddress, TableSystemFields, AuditedEntity {
  id: string;
  mspTenantId: string;
  standardId: string;
  targetType: StandardTargetType;
  targetId: string;
  status: 'active' | 'disabled';
  overrideJson?: string;
}

export interface StandardsResultEntity extends TableEntityAddress, TableSystemFields {
  mspTenantId: string;
  clientTenantId: string;
  standardId: string;
  status: StandardResultStatus;
  severity: ManagementAlertSeverity;
  resultSummary?: string;
  resultBlobPath?: BlobPath;
  lastEvaluatedAt?: string;
  lastRemediatedAt?: string;
  excluded: boolean;
}

export interface ManagementAlertEntity extends TableEntityAddress, TableSystemFields {
  id: string;
  mspTenantId: string;
  clientTenantId?: string;
  alertType: string;
  severity: ManagementAlertSeverity;
  sourceType: string;
  sourceId: string;
  title: string;
  summary: string;
  status: ManagementAlertStatus;
  assignedTo?: string;
  detailsBlobPath?: BlobPath;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface ManagementSyncStateEntity extends TableEntityAddress, TableSystemFields {
  mspTenantId: string;
  clientTenantId: string;
  datasetName: SyncDatasetName;
  lastSuccessfulSyncAt?: string;
  lastAttemptedSyncAt?: string;
  status: 'idle' | 'running' | 'failed' | 'stale';
  recordCount?: number;
  cursorJson?: string;
  errorSummary?: string;
  updatedAt: string;
}

export interface ManagementOperationDocument {
  operationId: string;
  operationType: string;
  mspTenantId: string;
  clientTenantId: string;
  authMode: AdminAuthMode;
  target: ManagementOperationTarget;
  parameters: JsonObject;
  approval: WorkflowApprovalPolicy;
}

export interface ManagementOperationTarget extends JsonObject {
  userId?: string;
  groupId?: string;
  roleId?: string;
  deviceId?: string;
  tenantId?: string;
}

export interface ManagementOperationRequestContext {
  operationId: string;
  requestedByType: RequestedByType;
  requestedById: string;
  requestBlobPath: BlobPath;
  correlationId: string;
}
