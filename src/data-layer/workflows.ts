import type {
  ApprovalMode,
  AuditedEntity,
  BlobPath,
  JsonObject,
  JsonValue,
  StartedByType,
  TableEntityAddress,
  TableSystemFields,
  WorkflowApprovalPolicy,
  WorkflowTriggerType,
} from './common';

export type WorkflowStatus = 'draft' | 'published' | 'disabled' | 'archived';
export type WorkflowDesignAssistantMode = 'manual' | 'ai-assisted' | 'mixed';
export type ExecutionStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled' | 'partial';
export type ExecutionStepStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'skipped' | 'cancelled';
export type WorkflowEdgeType = 'default' | 'true' | 'false' | 'error' | 'success';
export type WorkflowErrorStrategy = 'fail-workflow' | 'continue' | 'retry' | 'branch';
export type WorkflowNodeType =
  | 'trigger'
  | 'connector-action'
  | 'condition'
  | 'loop'
  | 'data-transform'
  | 'variable'
  | 'javascript'
  | 'ai-agent';

export interface WorkflowEntity extends TableEntityAddress, TableSystemFields, AuditedEntity {
  id: string;
  mspTenantId: string;
  displayName: string;
  description?: string;
  status: WorkflowStatus;
  draftBlobPath: BlobPath;
  publishedVersionId?: string;
  publishedVersionLabel?: string;
  defaultClientTenantId?: string;
  triggerModeSummary?: string;
  designAssistantMode: WorkflowDesignAssistantMode;
  lastPublishedAt?: string;
  lastRunAt?: string;
  lastRunStatus?: ExecutionStatus;
}

export interface WorkflowVersionEntity extends TableEntityAddress, TableSystemFields {
  id: string;
  mspTenantId: string;
  workflowId: string;
  workflowVersionId: string;
  versionLabel: string;
  status: 'published' | 'deprecated' | 'archived';
  artifactBlobPath: BlobPath;
  manifestJson?: string;
  triggerConfigHash?: string;
  connectionBindingsJson?: string;
  publishedAt: string;
  publishedBy: string;
  sourceDraftHash: string;
  schemaVersion: number;
  managementMode?: 'direct-ui' | 'workflow' | 'mixed';
}

export interface WorkflowTriggerEntity extends TableEntityAddress, TableSystemFields, AuditedEntity {
  id: string;
  mspTenantId: string;
  workflowId: string;
  workflowVersionId?: string;
  triggerType: WorkflowTriggerType;
  displayName: string;
  status: 'active' | 'disabled';
  scheduleCron?: string;
  webhookPath?: string;
  pollingConnectionId?: string;
  pollingCursorBlobPath?: BlobPath;
  configJson?: string;
  lastFiredAt?: string;
  lastSucceededAt?: string;
  lastFailedAt?: string;
}

export interface PollingCheckpointEntity extends TableEntityAddress, TableSystemFields {
  mspTenantId: string;
  workflowId: string;
  triggerId: string;
  cursorJson?: string;
  leaseOwner?: string;
  leaseExpiresAt?: string;
  lastPollStartedAt?: string;
  lastPollCompletedAt?: string;
  lastResultCount?: number;
  updatedAt: string;
}

export interface ExecutionEntity extends TableEntityAddress, TableSystemFields {
  id: string;
  executionId: string;
  mspTenantId: string;
  workflowId: string;
  workflowVersionId: string;
  clientTenantId?: string;
  triggerId?: string;
  triggerType: WorkflowTriggerType;
  status: ExecutionStatus;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  currentStepCount: number;
  successStepCount: number;
  failedStepCount: number;
  retryCount: number;
  correlationId: string;
  inputBlobPath?: BlobPath;
  outputBlobPath?: BlobPath;
  logBlobPath?: BlobPath;
  errorSummary?: string;
  startedByType: StartedByType;
  startedById: string;
}

export interface ExecutionStepEntity extends TableEntityAddress, TableSystemFields {
  executionId: string;
  stepId: string;
  stepIndex: number;
  attempt: number;
  nodeType: WorkflowNodeType;
  nodeLabel: string;
  status: ExecutionStepStatus;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  connectionId?: string;
  actionId?: string;
  agentId?: string;
  agentVersionId?: string;
  foundryRunId?: string;
  inputBlobPath?: BlobPath;
  outputBlobPath?: BlobPath;
  errorBlobPath?: BlobPath;
  retryable: boolean;
  correlationId: string;
}

export interface WorkflowNodeGroup {
  id: string;
  label: string;
  description?: string;
  nodeIds: string[];
  color?: string;
  collapsed?: boolean;
  bounds?: WorkflowCanvasRect;
}

export interface WorkflowAnnotation {
  id: string;
  kind: 'note' | 'step' | 'route';
  label: string;
  content?: string;
  position: WorkflowCanvasPosition;
  size?: WorkflowCanvasSize;
  nodeIds?: string[];
  edgeIds?: string[];
  groupId?: string;
  color?: string;
}

export interface WorkflowDocument {
  schemaVersion: number;
  workflowId: string;
  workflowVersionId?: string | null;
  displayName: string;
  trigger: WorkflowTriggerDefinition;
  errorHandling: WorkflowErrorHandlingSettings;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  groups?: WorkflowNodeGroup[];
  annotations?: WorkflowAnnotation[];
  variables: WorkflowVariableDefinition[];
  bindings: WorkflowBindings;
  ai: WorkflowAiMetadata;
  editor: WorkflowEditorState;
}

export interface WorkflowTriggerDefinition {
  type: WorkflowTriggerType;
  config: JsonObject;
}

export interface WorkflowCanvasPosition {
  x: number;
  y: number;
}

export interface WorkflowCanvasSize {
  width: number;
  height: number;
}

export interface WorkflowCanvasRect extends WorkflowCanvasPosition, WorkflowCanvasSize {}

export interface WorkflowEdge {
  id: string;
  sourceNodeId: string;
  sourcePort?: string;
  targetNodeId: string;
  targetPort?: string;
  edgeType?: WorkflowEdgeType;
  label?: string;
  conditionExpression?: string;
  annotation?: string;
}

export interface WorkflowErrorHandlingPolicy {
  strategy: WorkflowErrorStrategy;
  maxRetries?: number;
  retryDelaySeconds?: number;
  branchTargetNodeId?: string;
  captureAs?: string;
  notes?: string;
}

export interface WorkflowErrorHandlingSettings {
  defaultNodePolicy: WorkflowErrorHandlingPolicy;
  onTriggerFailure?: WorkflowErrorHandlingPolicy;
  onUnhandledError?: WorkflowErrorHandlingPolicy;
}

export interface WorkflowVariableDefinition {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'unknown';
  initialValue?: JsonValue;
}

export interface WorkflowBindings {
  connections: WorkflowConnectionBinding[];
}

export interface WorkflowConnectionBinding {
  connectionId: string;
  connectorId?: string;
  alias?: string;
  scopeType?: 'msp' | 'client';
  requiredActions?: string[];
}

export interface WorkflowAiMetadata {
  designSessionId?: string | null;
  draftSource: 'manual' | 'ai' | 'manual-or-ai';
  assumptions?: string[];
}

export interface WorkflowEditorState {
  viewport: JsonObject;
  selectedNodeIds?: string[];
  selectedGroupIds?: string[];
  selectedAnnotationIds?: string[];
  sidebarState?: JsonObject;
}

export interface WorkflowNodeBase {
  id: string;
  type: WorkflowNodeType;
  label: string;
  position?: WorkflowCanvasPosition;
  disabled?: boolean;
  documentation?: string;
  errorHandling?: WorkflowErrorHandlingPolicy;
}

export interface TriggerWorkflowNode extends WorkflowNodeBase {
  type: 'trigger';
  triggerType: WorkflowTriggerType;
  config: JsonObject;
}

export interface ConnectorActionWorkflowNode extends WorkflowNodeBase {
  type: 'connector-action';
  connectorId: string;
  connectorVersionId: string;
  actionId: string;
  connectionId: string;
  inputs: JsonObject;
  outputs?: Record<string, string>;
}

export interface ConditionWorkflowNode extends WorkflowNodeBase {
  type: 'condition';
  expression: string;
}

export interface LoopWorkflowNode extends WorkflowNodeBase {
  type: 'loop';
  collectionExpression: string;
  itemVariable: string;
}

export interface DataTransformWorkflowNode extends WorkflowNodeBase {
  type: 'data-transform';
  transform: JsonObject | string;
}

export interface VariableWorkflowNode extends WorkflowNodeBase {
  type: 'variable';
  variableName: string;
  valueExpression?: string;
}

export interface JavaScriptWorkflowNode extends WorkflowNodeBase {
  type: 'javascript';
  inlineScript?: string;
  scriptBlobPath?: BlobPath;
  inputBindings?: JsonObject;
  outputBindings?: Record<string, string>;
  timeoutSeconds?: number;
}

export interface AIAgentWorkflowNode extends WorkflowNodeBase {
  type: 'ai-agent';
  agentId: string;
  agentVersionId: string;
  foundryProjectRef: string;
  operatingMode: ApprovalMode;
  inputTemplate: JsonObject;
  outputSchema: JsonObject;
  toolPolicyRef?: string;
  approvalPolicy: WorkflowApprovalPolicy;
  timeoutSeconds: number;
  maxRetries: number;
}

export type WorkflowNode =
  | TriggerWorkflowNode
  | ConnectorActionWorkflowNode
  | ConditionWorkflowNode
  | LoopWorkflowNode
  | DataTransformWorkflowNode
  | VariableWorkflowNode
  | JavaScriptWorkflowNode
  | AIAgentWorkflowNode;

export interface ExecutionStateDocument {
  executionId: string;
  workflowId: string;
  workflowVersionId: string;
  mspTenantId: string;
  clientTenantId?: string;
  status: ExecutionStatus;
  variables: JsonObject;
  completedNodeIds: string[];
  pendingNodeIds: string[];
  failedNodeIds: string[];
  correlationId: string;
}








