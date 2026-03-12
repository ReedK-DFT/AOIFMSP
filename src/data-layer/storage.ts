import type {
  AdminAuthMode,
  BlobPath,
  ConnectionAuthType,
  QueueMessageEnvelope,
  RequestedByType,
  UrlString,
  WorkflowTriggerType,
} from './common';

export const blobContainers = [
  'connector-specs',
  'connector-artifacts',
  'ai-agent-definitions',
  'ai-agent-runs',
  'management-snapshots',
  'technician-context',
  'standards-artifacts',
  'management-alerts',
  'workflow-drafts',
  'workflow-versions',
  'execution-data',
  'audit-details',
  'tenant-data',
] as const;

export type BlobContainerName = (typeof blobContainers)[number];

export const queueNames = [
  'workflow-start',
  'workflow-step',
  'ai-agent-step',
  'management-operation',
  'technician-context-refresh',
  'directory-sync-refresh',
  'standards-evaluation',
  'polling-trigger',
  'dead-letter-review',
] as const;

export type QueueName = (typeof queueNames)[number];

export interface WorkflowStartQueueMessage extends QueueMessageEnvelope<'workflow-start'> {
  executionId: string;
  mspTenantId: string;
  workflowId: string;
  workflowVersionId: string;
  clientTenantId?: string;
  triggerId?: string;
  triggerType: WorkflowTriggerType;
  inputBlobPath?: BlobPath;
}

export interface WorkflowStepQueueMessage extends QueueMessageEnvelope<'workflow-step'> {
  executionId: string;
  stepId: string;
  stepIndex: number;
  attempt: number;
  mspTenantId: string;
  workflowId: string;
  workflowVersionId: string;
  clientTenantId?: string;
  resumeFromNodeId: string;
  contextBlobPath?: BlobPath;
}

export interface AIAgentStepQueueMessage extends QueueMessageEnvelope<'ai-agent-step'> {
  aiAgentRunId: string;
  executionId: string;
  executionStepId: string;
  mspTenantId: string;
  workflowId: string;
  workflowVersionId: string;
  clientTenantId?: string;
  agentId: string;
  agentVersionId: string;
  foundryProjectRef: string;
  inputBlobPath?: BlobPath;
}

export interface ManagementOperationQueueMessage extends QueueMessageEnvelope<'management-operation'> {
  operationId: string;
  mspTenantId: string;
  clientTenantId: string;
  operationType: string;
  authMode: AdminAuthMode;
  connectionId?: string;
  requestedByType: RequestedByType;
  requestedById: string;
  requestBlobPath: BlobPath;
}

export interface TechnicianContextRefreshQueueMessage extends QueueMessageEnvelope<'technician-context-refresh'> {
  mspTenantId: string;
  contextType: 'ticket' | 'device' | 'documentation' | 'tenant' | 'user' | 'alert' | 'workflow';
  contextId: string;
  sourceSystem: string;
  requestedByType: RequestedByType;
  requestedById: string;
}

export interface DirectorySyncRefreshQueueMessage extends QueueMessageEnvelope<'directory-sync-refresh'> {
  mspTenantId: string;
  clientTenantId: string;
  datasetName: string;
  authMode: AdminAuthMode;
  requestedByType: RequestedByType;
  requestedById: string;
}

export interface StandardsEvaluationQueueMessage extends QueueMessageEnvelope<'standards-evaluation'> {
  mspTenantId: string;
  targetType: 'tenant' | 'tenant-group';
  targetId: string;
  standardId: string;
  requestedByType: RequestedByType;
  requestedById: string;
}

export interface PollingTriggerQueueMessage extends QueueMessageEnvelope<'polling-trigger'> {
  mspTenantId: string;
  workflowId: string;
  triggerId: string;
  connectionId: string;
  checkpointPartitionKey: string;
  checkpointRowKey: string;
}

export interface DeadLetterReviewQueueMessage extends QueueMessageEnvelope<'dead-letter-review'> {
  sourceQueue: QueueName;
  executionId?: string;
  stepId?: string;
  failureCount: number;
  diagnosticBlobPath?: BlobPath;
}

export type QueueMessage =
  | WorkflowStartQueueMessage
  | WorkflowStepQueueMessage
  | AIAgentStepQueueMessage
  | ManagementOperationQueueMessage
  | TechnicianContextRefreshQueueMessage
  | DirectorySyncRefreshQueueMessage
  | StandardsEvaluationQueueMessage
  | PollingTriggerQueueMessage
  | DeadLetterReviewQueueMessage;

export interface KeyVaultSecretPayload {
  authType: ConnectionAuthType;
  clientId?: string;
  clientSecret?: string;
  tokenUrl?: UrlString;
  scopes?: string[];
  username?: string;
  password?: string;
  apiKey?: string;
  headers?: Record<string, string>;
}
