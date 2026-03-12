import type {
  ApprovalMode,
  ApprovalState,
  AuditedEntity,
  BlobPath,
  JsonObject,
  TableEntityAddress,
  TableSystemFields,
} from './common';

export type AIAgentType = 'design' | 'runtime';
export type AIAgentStatus = 'draft' | 'active' | 'disabled' | 'archived';
export type AIAgentRunStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';

export interface AIAgentEntity extends TableEntityAddress, TableSystemFields, AuditedEntity {
  id: string;
  mspTenantId: string;
  displayName: string;
  agentType: AIAgentType;
  purpose: string;
  foundryProjectRef: string;
  foundryAgentId?: string;
  defaultModelDeployment: string;
  latestVersionId?: string;
  instructionBlobPath?: BlobPath;
  toolPolicyBlobPath?: BlobPath;
  outputSchemaJson?: string;
  approvalMode: ApprovalMode;
  status: AIAgentStatus;
}

export interface AIAgentVersionEntity extends TableEntityAddress, TableSystemFields {
  id: string;
  mspTenantId: string;
  agentId: string;
  agentVersionId: string;
  versionLabel: string;
  foundryAgentId?: string;
  modelDeploymentName: string;
  instructionBlobPath: BlobPath;
  toolDefinitionBlobPath?: BlobPath;
  outputSchemaJson?: string;
  safetyPolicyJson?: string;
  evaluationPolicyJson?: string;
  publishedAt?: string;
  publishedBy?: string;
  status: 'draft' | 'published' | 'deprecated' | 'archived';
}

export interface AIAgentRunEntity extends TableEntityAddress, TableSystemFields {
  id: string;
  aiAgentRunId: string;
  mspTenantId: string;
  workflowId?: string;
  workflowVersionId?: string;
  executionId?: string;
  executionStepId?: string;
  agentId: string;
  agentVersionId: string;
  foundryProjectRef: string;
  foundryAgentId?: string;
  foundryThreadId?: string;
  foundryRunId?: string;
  traceId?: string;
  modelDeploymentName: string;
  operatingMode: ApprovalMode;
  status: AIAgentRunStatus;
  toolCallsCount?: number;
  approvalState: ApprovalState;
  inputBlobPath?: BlobPath;
  outputBlobPath?: BlobPath;
  traceSummaryBlobPath?: BlobPath;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  startedByType: 'user' | 'workflow' | 'system';
  startedById: string;
}

export interface DesignTimeAssistantOutput {
  goal: string;
  proposedWorkflowPatch: JsonObject;
  assumptions: string[];
  warnings: string[];
  recommendedConnections: string[];
  recommendedTriggers: string[];
}
