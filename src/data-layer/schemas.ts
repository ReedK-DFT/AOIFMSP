import { z } from 'zod';

const nonEmptyStringSchema = z.string().trim().min(1);
const isoUtcDateTimeSchema = z.string().trim().min(1);
const urlSchema = z.string().trim().min(1);

const jsonValueSchema: z.ZodTypeAny = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ]),
);

export const jsonObjectSchema = z.record(z.string(), jsonValueSchema);

export const workflowApprovalPolicySchema = z
  .object({
    required: z.boolean(),
    approverRoles: z.array(nonEmptyStringSchema).optional(),
    timeoutSeconds: z.number().int().positive().optional(),
  })
  .strict();

export const userBindingMapSchema = z
  .object({
    actions: z.record(z.string(), z.array(nonEmptyStringSchema)),
    modifiers: z.record(z.string(), z.array(nonEmptyStringSchema)).optional(),
    metadata: jsonObjectSchema.optional(),
  })
  .strict();

const workflowCanvasPositionSchema = z
  .object({
    x: z.number(),
    y: z.number(),
  })
  .strict();

const workflowCanvasSizeSchema = z
  .object({
    width: z.number().positive(),
    height: z.number().positive(),
  })
  .strict();

const workflowCanvasRectSchema = workflowCanvasPositionSchema.extend({
  width: z.number().positive(),
  height: z.number().positive(),
});

const workflowErrorHandlingPolicySchema = z
  .object({
    strategy: z.enum(['fail-workflow', 'continue', 'retry', 'branch']),
    maxRetries: z.number().int().min(0).optional(),
    retryDelaySeconds: z.number().int().min(0).optional(),
    branchTargetNodeId: nonEmptyStringSchema.optional(),
    captureAs: nonEmptyStringSchema.optional(),
    notes: z.string().optional(),
  })
  .strict();

const workflowNodeBaseSchema = z.object({
  id: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  position: workflowCanvasPositionSchema.optional(),
  disabled: z.boolean().optional(),
  documentation: z.string().optional(),
  errorHandling: workflowErrorHandlingPolicySchema.optional(),
});

const triggerWorkflowNodeSchema = workflowNodeBaseSchema.extend({
  type: z.literal('trigger'),
  triggerType: z.enum(['manual', 'schedule', 'webhook', 'polling', 'queue']),
  config: jsonObjectSchema,
});

const connectorActionWorkflowNodeSchema = workflowNodeBaseSchema.extend({
  type: z.literal('connector-action'),
  connectorId: nonEmptyStringSchema,
  connectorVersionId: nonEmptyStringSchema,
  actionId: nonEmptyStringSchema,
  connectionId: nonEmptyStringSchema,
  inputs: jsonObjectSchema,
  outputs: z.record(z.string(), nonEmptyStringSchema).optional(),
});

const conditionWorkflowNodeSchema = workflowNodeBaseSchema.extend({
  type: z.literal('condition'),
  expression: nonEmptyStringSchema,
});

const loopWorkflowNodeSchema = workflowNodeBaseSchema.extend({
  type: z.literal('loop'),
  collectionExpression: nonEmptyStringSchema,
  itemVariable: nonEmptyStringSchema,
});

const dataTransformWorkflowNodeSchema = workflowNodeBaseSchema.extend({
  type: z.literal('data-transform'),
  transform: z.union([jsonObjectSchema, nonEmptyStringSchema]),
});

const variableWorkflowNodeSchema = workflowNodeBaseSchema.extend({
  type: z.literal('variable'),
  variableName: nonEmptyStringSchema,
  valueExpression: nonEmptyStringSchema.optional(),
});

const javaScriptWorkflowNodeSchema = workflowNodeBaseSchema.extend({
  type: z.literal('javascript'),
  inlineScript: z.string().optional(),
  scriptBlobPath: nonEmptyStringSchema.optional(),
  inputBindings: jsonObjectSchema.optional(),
  outputBindings: z.record(z.string(), nonEmptyStringSchema).optional(),
  timeoutSeconds: z.number().int().positive().optional(),
});

export const aiAgentWorkflowNodeSchema = workflowNodeBaseSchema.extend({
  type: z.literal('ai-agent'),
  agentId: nonEmptyStringSchema,
  agentVersionId: nonEmptyStringSchema,
  foundryProjectRef: nonEmptyStringSchema,
  operatingMode: z.enum(['suggest-only', 'act-with-tools', 'approval-required']),
  inputTemplate: jsonObjectSchema,
  outputSchema: jsonObjectSchema,
  toolPolicyRef: nonEmptyStringSchema.optional(),
  approvalPolicy: workflowApprovalPolicySchema,
  timeoutSeconds: z.number().int().positive(),
  maxRetries: z.number().int().min(0),
});

export const workflowNodeSchema = z.discriminatedUnion('type', [
  triggerWorkflowNodeSchema,
  connectorActionWorkflowNodeSchema,
  conditionWorkflowNodeSchema,
  loopWorkflowNodeSchema,
  dataTransformWorkflowNodeSchema,
  variableWorkflowNodeSchema,
  javaScriptWorkflowNodeSchema,
  aiAgentWorkflowNodeSchema,
]);

export const workflowEdgeSchema = z
  .object({
    id: nonEmptyStringSchema,
    sourceNodeId: nonEmptyStringSchema,
    sourcePort: nonEmptyStringSchema.optional(),
    targetNodeId: nonEmptyStringSchema,
    targetPort: nonEmptyStringSchema.optional(),
    edgeType: z.enum(['default', 'true', 'false', 'error', 'success']).optional(),
    label: nonEmptyStringSchema.optional(),
    conditionExpression: nonEmptyStringSchema.optional(),
    annotation: z.string().optional(),
  })
  .strict();

export const workflowVariableDefinitionSchema = z
  .object({
    id: nonEmptyStringSchema,
    name: nonEmptyStringSchema,
    type: z.enum(['string', 'number', 'boolean', 'object', 'array', 'unknown']),
    initialValue: jsonValueSchema.optional(),
  })
  .strict();

export const workflowConnectionBindingSchema = z
  .object({
    connectionId: nonEmptyStringSchema,
    connectorId: nonEmptyStringSchema.optional(),
    alias: nonEmptyStringSchema.optional(),
    scopeType: z.enum(['msp', 'client']).optional(),
    requiredActions: z.array(nonEmptyStringSchema).optional(),
  })
  .strict();

export const workflowBindingsSchema = z
  .object({
    connections: z.array(workflowConnectionBindingSchema),
  })
  .strict();

export const workflowTriggerDefinitionSchema = z
  .object({
    type: z.enum(['manual', 'schedule', 'webhook', 'polling', 'queue']),
    config: jsonObjectSchema,
  })
  .strict();

export const workflowAiMetadataSchema = z
  .object({
    designSessionId: z.string().nullable().optional(),
    draftSource: z.enum(['manual', 'ai', 'manual-or-ai']),
    assumptions: z.array(nonEmptyStringSchema).optional(),
  })
  .strict();

export const workflowNodeGroupSchema = z
  .object({
    id: nonEmptyStringSchema,
    label: nonEmptyStringSchema,
    description: z.string().optional(),
    nodeIds: z.array(nonEmptyStringSchema),
    color: nonEmptyStringSchema.optional(),
    collapsed: z.boolean().optional(),
    bounds: workflowCanvasRectSchema.optional(),
  })
  .strict();

export const workflowAnnotationSchema = z
  .object({
    id: nonEmptyStringSchema,
    kind: z.enum(['note', 'step', 'route']),
    label: nonEmptyStringSchema,
    content: z.string().optional(),
    position: workflowCanvasPositionSchema,
    size: workflowCanvasSizeSchema.optional(),
    nodeIds: z.array(nonEmptyStringSchema).optional(),
    edgeIds: z.array(nonEmptyStringSchema).optional(),
    groupId: nonEmptyStringSchema.optional(),
    color: nonEmptyStringSchema.optional(),
  })
  .strict();

export const workflowErrorHandlingSettingsSchema = z
  .object({
    defaultNodePolicy: workflowErrorHandlingPolicySchema,
    onTriggerFailure: workflowErrorHandlingPolicySchema.optional(),
    onUnhandledError: workflowErrorHandlingPolicySchema.optional(),
  })
  .strict();

export const workflowEditorStateSchema = z
  .object({
    viewport: jsonObjectSchema,
    selectedNodeIds: z.array(nonEmptyStringSchema).optional(),
    selectedGroupIds: z.array(nonEmptyStringSchema).optional(),
    selectedAnnotationIds: z.array(nonEmptyStringSchema).optional(),
    sidebarState: jsonObjectSchema.optional(),
  })
  .strict();

export const workflowDocumentSchema = z
  .object({
    schemaVersion: z.number().int().positive(),
    workflowId: nonEmptyStringSchema,
    workflowVersionId: z.string().nullable().optional(),
    displayName: nonEmptyStringSchema,
    trigger: workflowTriggerDefinitionSchema,
    errorHandling: workflowErrorHandlingSettingsSchema,
    nodes: z.array(workflowNodeSchema),
    edges: z.array(workflowEdgeSchema),
    groups: z.array(workflowNodeGroupSchema).optional(),
    annotations: z.array(workflowAnnotationSchema).optional(),
    variables: z.array(workflowVariableDefinitionSchema),
    bindings: workflowBindingsSchema,
    ai: workflowAiMetadataSchema,
    editor: workflowEditorStateSchema,
  })
  .strict();

export const managementOperationTargetSchema = z
  .object({
    userId: nonEmptyStringSchema.optional(),
    groupId: nonEmptyStringSchema.optional(),
    roleId: nonEmptyStringSchema.optional(),
    deviceId: nonEmptyStringSchema.optional(),
    tenantId: nonEmptyStringSchema.optional(),
  })
  .catchall(jsonValueSchema);

export const managementOperationDocumentSchema = z
  .object({
    operationId: nonEmptyStringSchema,
    operationType: nonEmptyStringSchema,
    mspTenantId: nonEmptyStringSchema,
    clientTenantId: nonEmptyStringSchema,
    authMode: z.enum(['gdap-obo', 'platform-app', 'delegated', 'custom']),
    target: managementOperationTargetSchema,
    parameters: jsonObjectSchema,
    approval: workflowApprovalPolicySchema,
  })
  .strict();

export const designTimeAssistantOutputSchema = z
  .object({
    goal: nonEmptyStringSchema,
    proposedWorkflowPatch: jsonObjectSchema,
    assumptions: z.array(nonEmptyStringSchema),
    warnings: z.array(nonEmptyStringSchema),
    recommendedConnections: z.array(nonEmptyStringSchema),
    recommendedTriggers: z.array(nonEmptyStringSchema),
  })
  .strict();

export const executionStateDocumentSchema = z
  .object({
    executionId: nonEmptyStringSchema,
    workflowId: nonEmptyStringSchema,
    workflowVersionId: nonEmptyStringSchema,
    mspTenantId: nonEmptyStringSchema,
    clientTenantId: nonEmptyStringSchema.optional(),
    status: z.enum(['queued', 'running', 'succeeded', 'failed', 'cancelled', 'partial']),
    variables: jsonObjectSchema,
    completedNodeIds: z.array(nonEmptyStringSchema),
    pendingNodeIds: z.array(nonEmptyStringSchema),
    failedNodeIds: z.array(nonEmptyStringSchema),
    correlationId: nonEmptyStringSchema,
  })
  .strict();

export const keyVaultSecretPayloadSchema = z
  .object({
    authType: z.enum([
      'oauth2-client-credentials',
      'oauth2-authorization-code',
      'oauth2-on-behalf-of',
      'api-key',
      'basic-auth',
      'certificate',
      'custom',
    ]),
    clientId: nonEmptyStringSchema.optional(),
    clientSecret: nonEmptyStringSchema.optional(),
    tokenUrl: urlSchema.optional(),
    scopes: z.array(nonEmptyStringSchema).optional(),
    username: nonEmptyStringSchema.optional(),
    password: nonEmptyStringSchema.optional(),
    apiKey: nonEmptyStringSchema.optional(),
    headers: z.record(z.string(), nonEmptyStringSchema).optional(),
  })
  .strict();

const queueEnvelopeSchema = z.object({
  correlationId: nonEmptyStringSchema,
  enqueuedAt: isoUtcDateTimeSchema,
});

export const workflowStartQueueMessageSchema = queueEnvelopeSchema.extend({
  messageType: z.literal('workflow-start'),
  executionId: nonEmptyStringSchema,
  mspTenantId: nonEmptyStringSchema,
  workflowId: nonEmptyStringSchema,
  workflowVersionId: nonEmptyStringSchema,
  clientTenantId: nonEmptyStringSchema.optional(),
  triggerId: nonEmptyStringSchema.optional(),
  triggerType: z.enum(['manual', 'schedule', 'webhook', 'polling', 'queue']),
  inputBlobPath: nonEmptyStringSchema.optional(),
});

export const workflowStepQueueMessageSchema = queueEnvelopeSchema.extend({
  messageType: z.literal('workflow-step'),
  executionId: nonEmptyStringSchema,
  stepId: nonEmptyStringSchema,
  stepIndex: z.number().int().min(0),
  attempt: z.number().int().min(1),
  mspTenantId: nonEmptyStringSchema,
  workflowId: nonEmptyStringSchema,
  workflowVersionId: nonEmptyStringSchema,
  clientTenantId: nonEmptyStringSchema.optional(),
  resumeFromNodeId: nonEmptyStringSchema,
  contextBlobPath: nonEmptyStringSchema.optional(),
});

export const aiAgentStepQueueMessageSchema = queueEnvelopeSchema.extend({
  messageType: z.literal('ai-agent-step'),
  aiAgentRunId: nonEmptyStringSchema,
  executionId: nonEmptyStringSchema,
  executionStepId: nonEmptyStringSchema,
  mspTenantId: nonEmptyStringSchema,
  workflowId: nonEmptyStringSchema,
  workflowVersionId: nonEmptyStringSchema,
  clientTenantId: nonEmptyStringSchema.optional(),
  agentId: nonEmptyStringSchema,
  agentVersionId: nonEmptyStringSchema,
  foundryProjectRef: nonEmptyStringSchema,
  inputBlobPath: nonEmptyStringSchema.optional(),
});

export const managementOperationQueueMessageSchema = queueEnvelopeSchema.extend({
  messageType: z.literal('management-operation'),
  operationId: nonEmptyStringSchema,
  mspTenantId: nonEmptyStringSchema,
  clientTenantId: nonEmptyStringSchema,
  operationType: nonEmptyStringSchema,
  authMode: z.enum(['gdap-obo', 'platform-app', 'delegated', 'custom']),
  connectionId: nonEmptyStringSchema.optional(),
  requestedByType: z.enum(['user', 'workflow', 'system', 'user-or-workflow', 'user-or-system']),
  requestedById: nonEmptyStringSchema,
  requestBlobPath: nonEmptyStringSchema,
});

export const technicianContextRefreshQueueMessageSchema = queueEnvelopeSchema.extend({
  messageType: z.literal('technician-context-refresh'),
  mspTenantId: nonEmptyStringSchema,
  contextType: z.enum(['ticket', 'device', 'documentation', 'tenant', 'user', 'alert', 'workflow']),
  contextId: nonEmptyStringSchema,
  sourceSystem: nonEmptyStringSchema,
  requestedByType: z.enum(['user', 'workflow', 'system', 'user-or-workflow', 'user-or-system']),
  requestedById: nonEmptyStringSchema,
});

export const directorySyncRefreshQueueMessageSchema = queueEnvelopeSchema.extend({
  messageType: z.literal('directory-sync-refresh'),
  mspTenantId: nonEmptyStringSchema,
  clientTenantId: nonEmptyStringSchema,
  datasetName: nonEmptyStringSchema,
  authMode: z.enum(['gdap-obo', 'platform-app', 'delegated', 'custom']),
  requestedByType: z.enum(['user', 'workflow', 'system', 'user-or-workflow', 'user-or-system']),
  requestedById: nonEmptyStringSchema,
});

export const standardsEvaluationQueueMessageSchema = queueEnvelopeSchema.extend({
  messageType: z.literal('standards-evaluation'),
  mspTenantId: nonEmptyStringSchema,
  targetType: z.enum(['tenant', 'tenant-group']),
  targetId: nonEmptyStringSchema,
  standardId: nonEmptyStringSchema,
  requestedByType: z.enum(['user', 'workflow', 'system', 'user-or-workflow', 'user-or-system']),
  requestedById: nonEmptyStringSchema,
});

export const pollingTriggerQueueMessageSchema = queueEnvelopeSchema.extend({
  messageType: z.literal('polling-trigger'),
  mspTenantId: nonEmptyStringSchema,
  workflowId: nonEmptyStringSchema,
  triggerId: nonEmptyStringSchema,
  connectionId: nonEmptyStringSchema,
  checkpointPartitionKey: nonEmptyStringSchema,
  checkpointRowKey: nonEmptyStringSchema,
});

export const deadLetterReviewQueueMessageSchema = queueEnvelopeSchema.extend({
  messageType: z.literal('dead-letter-review'),
  sourceQueue: z.enum([
    'workflow-start',
    'workflow-step',
    'ai-agent-step',
    'management-operation',
    'technician-context-refresh',
    'directory-sync-refresh',
    'standards-evaluation',
    'polling-trigger',
    'dead-letter-review',
  ]),
  executionId: nonEmptyStringSchema.optional(),
  stepId: nonEmptyStringSchema.optional(),
  failureCount: z.number().int().min(1),
  diagnosticBlobPath: nonEmptyStringSchema.optional(),
});

export const queueMessageSchema = z.discriminatedUnion('messageType', [
  workflowStartQueueMessageSchema,
  workflowStepQueueMessageSchema,
  aiAgentStepQueueMessageSchema,
  managementOperationQueueMessageSchema,
  technicianContextRefreshQueueMessageSchema,
  directorySyncRefreshQueueMessageSchema,
  standardsEvaluationQueueMessageSchema,
  pollingTriggerQueueMessageSchema,
  deadLetterReviewQueueMessageSchema,
]);

export function parseWorkflowDocument(input: unknown) {
  return workflowDocumentSchema.parse(input);
}

export function parseManagementOperationDocument(input: unknown) {
  return managementOperationDocumentSchema.parse(input);
}

export function parseQueueMessage(input: unknown) {
  return queueMessageSchema.parse(input);
}

export function parseKeyVaultSecretPayload(input: unknown) {
  return keyVaultSecretPayloadSchema.parse(input);
}



