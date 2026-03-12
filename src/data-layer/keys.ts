import type { BlobPath, IsoUtcDateTime, RowKey, SecretReference, TableEntityAddress } from './common';
import type { BlobContainerName } from './storage';

const MAX_DATE_MS = 253402300799999;

function dateToMs(value: Date | string | number): number {
  if (value instanceof Date) {
    return value.getTime();
  }

  return new Date(value).getTime();
}

function normalizeSegment(value: string): string {
  return value.trim().replace(/^\/+|\/+$/g, '');
}

function joinKeySegments(...segments: string[]): string {
  return segments.filter(Boolean).join('|');
}

function joinPathSegments(...segments: string[]): string {
  return segments.filter(Boolean).map(normalizeSegment).join('/');
}

function address(partitionKey: string, rowKey: string): TableEntityAddress {
  return { partitionKey, rowKey };
}

function reverseTicks(value: Date | string | number = new Date()): string {
  const ms = dateToMs(value);
  return String(MAX_DATE_MS - ms).padStart(15, '0');
}

function padded(value: number, width: number): string {
  return String(value).padStart(width, '0');
}

function blobPath(container: BlobContainerName, ...segments: string[]): BlobPath {
  const suffix = joinPathSegments(...segments);
  return suffix ? `${container}/${suffix}` : container;
}

function secretName(name: string): SecretReference {
  return name;
}

export const keyBuilders = {
  partition: {
    msp: (mspTenantId: string) => `MSP#${mspTenantId}`,
    mspClient: (mspTenantId: string, clientTenantId: string) => joinKeySegments(`MSP#${mspTenantId}`, `CLIENT#${clientTenantId}`),
    mspUser: (mspTenantId: string, userObjectId: string) => joinKeySegments(`MSP#${mspTenantId}`, `USER#${userObjectId}`),
    mspConnector: (mspTenantId: string, connectorId: string) => joinKeySegments(`MSP#${mspTenantId}`, `CONNECTOR#${connectorId}`),
    mspWorkflow: (mspTenantId: string, workflowId: string) => joinKeySegments(`MSP#${mspTenantId}`, `WORKFLOW#${workflowId}`),
    mspAgent: (mspTenantId: string, agentId: string) => joinKeySegments(`MSP#${mspTenantId}`, `AGENT#${agentId}`),
    execution: (executionId: string) => `EXEC#${executionId}`,
    trigger: (mspTenantId: string, triggerId: string) => joinKeySegments(`MSP#${mspTenantId}`, `TRIGGER#${triggerId}`),
    context: (mspTenantId: string, contextType: string, contextId: string) => joinKeySegments(`MSP#${mspTenantId}`, `CTX#${contextType}#${contextId}`),
    standard: (mspTenantId: string, standardId: string) => joinKeySegments(`MSP#${mspTenantId}`, `STANDARD#${standardId}`),
    tenantGroup: (mspTenantId: string, tenantGroupId: string) => joinKeySegments(`MSP#${mspTenantId}`, `TGROUP#${tenantGroupId}`),
  },
  row: {
    profile: () => 'PROFILE',
    state: () => 'STATE',
    user: (userObjectId: string) => `USER#${userObjectId}`,
    preference: (userObjectId: string) => `PREF#${userObjectId}`,
    inputProfile: (profileId: string) => `INPUT#${profileId}`,
    client: (clientTenantId: string) => `CLIENT#${clientTenantId}`,
    appRegistration: (appRegistrationId: string) => `APPREG#${appRegistrationId}`,
    foundryProject: (environmentName: string) => `FOUNDRY#${environmentName}`,
    managementProfile: (clientTenantId: string) => `MGMT#${clientTenantId}`,
    device: (deviceId: string) => `DEVICE#${deviceId}`,
    ticket: (ticketId: string) => `TICKET#${ticketId}`,
    documentation: (documentationRecordId: string) => `DOC#${documentationRecordId}`,
    link: (linkedType: string, linkedId: string) => `LINK#${linkedType}#${linkedId}`,
    standard: (standardId: string) => `STANDARD#${standardId}`,
    assignment: (assignmentId: string) => `ASSIGN#${assignmentId}`,
    sync: (datasetName: string) => `SYNC#${datasetName}`,
    connector: (connectorId: string) => `CONNECTOR#${connectorId}`,
    version: (versionId: string) => `VER#${versionId}`,
    action: (actionId: string) => `ACTION#${actionId}`,
    agent: (agentId: string) => `AGENT#${agentId}`,
    connection: (connectionId: string) => `CONNECTION#${connectionId}`,
    workflow: (workflowId: string) => `WORKFLOW#${workflowId}`,
    trigger: (triggerId: string) => `TRIGGER#${triggerId}`,
    run: (executionId: string, at: Date | string | number = new Date()) => `RUN#${reverseTicks(at)}#${executionId}`,
    executionStep: (stepIndex: number, attempt: number) => `STEP#${padded(stepIndex, 6)}#${padded(attempt, 4)}`,
    aiRun: (aiAgentRunId: string, at: Date | string | number = new Date()) => `AIRUN#${reverseTicks(at)}#${aiAgentRunId}`,
    alert: (alertId: string, at: Date | string | number = new Date()) => `ALERT#${reverseTicks(at)}#${alertId}`,
    audit: (auditEventId: string, at: Date | string | number = new Date()) => `AUDIT#${reverseTicks(at)}#${auditEventId}`,
  },
  entity: {
    mspTenant: (mspTenantId: string) => address(`MSP#${mspTenantId}`, 'PROFILE'),
    mspUser: (mspTenantId: string, userObjectId: string) => address(`MSP#${mspTenantId}`, `USER#${userObjectId}`),
    userPreferences: (mspTenantId: string, userObjectId: string) => address(`MSP#${mspTenantId}`, `PREF#${userObjectId}`),
    userInputProfile: (mspTenantId: string, userObjectId: string, profileId: string) => address(joinKeySegments(`MSP#${mspTenantId}`, `USER#${userObjectId}`), `INPUT#${profileId}`),
    clientTenant: (mspTenantId: string, clientTenantId: string) => address(`MSP#${mspTenantId}`, `CLIENT#${clientTenantId}`),
    clientAppRegistration: (mspTenantId: string, clientTenantId: string, appRegistrationId: string) => address(joinKeySegments(`MSP#${mspTenantId}`, `CLIENT#${clientTenantId}`), `APPREG#${appRegistrationId}`),
    foundryProject: (mspTenantId: string, environmentName: string) => address(`MSP#${mspTenantId}`, `FOUNDRY#${environmentName}`),
    tenantManagementProfile: (mspTenantId: string, clientTenantId: string) => address(`MSP#${mspTenantId}`, `MGMT#${clientTenantId}`),
    managedUser: (mspTenantId: string, clientTenantId: string, managedUserId: string) => address(joinKeySegments(`MSP#${mspTenantId}`, `CLIENT#${clientTenantId}`), `USER#${managedUserId}`),
    ticket: (mspTenantId: string, ticketId: string) => address(`MSP#${mspTenantId}`, `TICKET#${ticketId}`),
    device: (mspTenantId: string, clientTenantId: string, deviceId: string) => address(joinKeySegments(`MSP#${mspTenantId}`, `CLIENT#${clientTenantId}`), `DEVICE#${deviceId}`),
    documentationRecord: (mspTenantId: string, clientTenantId: string, documentationRecordId: string) => address(joinKeySegments(`MSP#${mspTenantId}`, `CLIENT#${clientTenantId}`), `DOC#${documentationRecordId}`),
    technicianContextLink: (mspTenantId: string, contextType: string, contextId: string, linkedType: string, linkedId: string) => address(joinKeySegments(`MSP#${mspTenantId}`, `CTX#${contextType}#${contextId}`), `LINK#${linkedType}#${linkedId}`),
    tenantGroup: (mspTenantId: string, tenantGroupId: string) => address(`MSP#${mspTenantId}`, `TGROUP#${tenantGroupId}`),
    tenantGroupMember: (mspTenantId: string, tenantGroupId: string, clientTenantId: string) => address(joinKeySegments(`MSP#${mspTenantId}`, `TGROUP#${tenantGroupId}`), `CLIENT#${clientTenantId}`),
    standardsTemplate: (mspTenantId: string, standardId: string) => address(`MSP#${mspTenantId}`, `STANDARD#${standardId}`),
    standardsAssignment: (mspTenantId: string, standardId: string, assignmentId: string) => address(joinKeySegments(`MSP#${mspTenantId}`, `STANDARD#${standardId}`), `ASSIGN#${assignmentId}`),
    standardsResult: (mspTenantId: string, clientTenantId: string, standardId: string) => address(joinKeySegments(`MSP#${mspTenantId}`, `CLIENT#${clientTenantId}`), `STANDARD#${standardId}`),
    managementAlert: (mspTenantId: string, alertId: string, at: Date | string | number = new Date()) => address(`MSP#${mspTenantId}`, `ALERT#${reverseTicks(at)}#${alertId}`),
    managementSyncState: (mspTenantId: string, clientTenantId: string, datasetName: string) => address(joinKeySegments(`MSP#${mspTenantId}`, `CLIENT#${clientTenantId}`), `SYNC#${datasetName}`),
    connector: (mspTenantId: string, connectorId: string) => address(`MSP#${mspTenantId}`, `CONNECTOR#${connectorId}`),
    connectorVersion: (mspTenantId: string, connectorId: string, connectorVersionId: string) => address(joinKeySegments(`MSP#${mspTenantId}`, `CONNECTOR#${connectorId}`), `VER#${connectorVersionId}`),
    connectorAction: (mspTenantId: string, connectorId: string, connectorVersionId: string, actionId: string) => address(joinKeySegments(`MSP#${mspTenantId}`, `CONNECTOR#${connectorId}`, `VER#${connectorVersionId}`), `ACTION#${actionId}`),
    aiAgent: (mspTenantId: string, agentId: string) => address(`MSP#${mspTenantId}`, `AGENT#${agentId}`),
    aiAgentVersion: (mspTenantId: string, agentId: string, agentVersionId: string) => address(joinKeySegments(`MSP#${mspTenantId}`, `AGENT#${agentId}`), `VER#${agentVersionId}`),
    connection: (mspTenantId: string, connectionId: string, clientTenantId?: string) => address(clientTenantId ? joinKeySegments(`MSP#${mspTenantId}`, `CLIENT#${clientTenantId}`) : `MSP#${mspTenantId}`, `CONNECTION#${connectionId}`),
    workflow: (mspTenantId: string, workflowId: string) => address(`MSP#${mspTenantId}`, `WORKFLOW#${workflowId}`),
    workflowVersion: (mspTenantId: string, workflowId: string, workflowVersionId: string) => address(joinKeySegments(`MSP#${mspTenantId}`, `WORKFLOW#${workflowId}`), `VER#${workflowVersionId}`),
    workflowTrigger: (mspTenantId: string, workflowId: string, triggerId: string) => address(joinKeySegments(`MSP#${mspTenantId}`, `WORKFLOW#${workflowId}`), `TRIGGER#${triggerId}`),
    pollingCheckpoint: (mspTenantId: string, triggerId: string) => address(joinKeySegments(`MSP#${mspTenantId}`, `TRIGGER#${triggerId}`), 'STATE'),
    execution: (mspTenantId: string, workflowId: string, executionId: string, at: Date | string | number = new Date()) => address(joinKeySegments(`MSP#${mspTenantId}`, `WORKFLOW#${workflowId}`), `RUN#${reverseTicks(at)}#${executionId}`),
    executionStep: (executionId: string, stepIndex: number, attempt: number) => address(`EXEC#${executionId}`, `STEP#${padded(stepIndex, 6)}#${padded(attempt, 4)}`),
    aiAgentRun: (mspTenantId: string, aiAgentRunId: string, at: Date | string | number = new Date(), workflowId?: string) => address(workflowId ? joinKeySegments(`MSP#${mspTenantId}`, `WORKFLOW#${workflowId}`) : joinKeySegments(`MSP#${mspTenantId}`, 'DESIGN'), `AIRUN#${reverseTicks(at)}#${aiAgentRunId}`),
    auditEvent: (mspTenantId: string, auditEventId: string, at: Date | string | number = new Date()) => address(`MSP#${mspTenantId}`, `AUDIT#${reverseTicks(at)}#${auditEventId}`),
  },
};

export const blobPathBuilders = {
  connectorOpenApi: (mspTenantId: string, connectorId: string, connectorVersionId: string) => blobPath('connector-specs', mspTenantId, connectorId, connectorVersionId, 'openapi.json'),
  connectorSourceMetadata: (mspTenantId: string, connectorId: string, connectorVersionId: string) => blobPath('connector-specs', mspTenantId, connectorId, connectorVersionId, 'source-metadata.json'),
  connectorActions: (mspTenantId: string, connectorId: string, connectorVersionId: string) => blobPath('connector-artifacts', mspTenantId, connectorId, connectorVersionId, 'actions.json'),
  connectorSchemas: (mspTenantId: string, connectorId: string, connectorVersionId: string) => blobPath('connector-artifacts', mspTenantId, connectorId, connectorVersionId, 'schemas.json'),
  connectorManifest: (mspTenantId: string, connectorId: string, connectorVersionId: string) => blobPath('connector-artifacts', mspTenantId, connectorId, connectorVersionId, 'manifest.json'),
  aiAgentInstructions: (mspTenantId: string, agentId: string, agentVersionId: string) => blobPath('ai-agent-definitions', mspTenantId, agentId, agentVersionId, 'instructions.md'),
  aiAgentTools: (mspTenantId: string, agentId: string, agentVersionId: string) => blobPath('ai-agent-definitions', mspTenantId, agentId, agentVersionId, 'tools.json'),
  aiAgentEvaluationPolicy: (mspTenantId: string, agentId: string, agentVersionId: string) => blobPath('ai-agent-definitions', mspTenantId, agentId, agentVersionId, 'evaluation-policy.json'),
  aiAgentRunInput: (mspTenantId: string, agentId: string, aiAgentRunId: string) => blobPath('ai-agent-runs', mspTenantId, agentId, aiAgentRunId, 'input.json'),
  aiAgentRunOutput: (mspTenantId: string, agentId: string, aiAgentRunId: string) => blobPath('ai-agent-runs', mspTenantId, agentId, aiAgentRunId, 'output.json'),
  aiAgentRunTraceSummary: (mspTenantId: string, agentId: string, aiAgentRunId: string) => blobPath('ai-agent-runs', mspTenantId, agentId, aiAgentRunId, 'trace-summary.json'),
  managementFullUserSync: (mspTenantId: string, clientTenantId: string, timestamp: IsoUtcDateTime | string) => blobPath('management-snapshots', mspTenantId, clientTenantId, 'users', `full-sync-${timestamp}.json`),
  managementOperationRequest: (mspTenantId: string, clientTenantId: string, operationId: string) => blobPath('management-snapshots', mspTenantId, clientTenantId, 'management-ops', operationId, 'request.json'),
  managementOperationResult: (mspTenantId: string, clientTenantId: string, operationId: string) => blobPath('management-snapshots', mspTenantId, clientTenantId, 'management-ops', operationId, 'result.json'),
  technicianTicketContext: (mspTenantId: string, ticketId: string) => blobPath('technician-context', mspTenantId, 'tickets', ticketId, 'context.json'),
  technicianDeviceContext: (mspTenantId: string, clientTenantId: string, deviceId: string) => blobPath('technician-context', mspTenantId, 'clients', clientTenantId, 'devices', deviceId, 'context.json'),
  technicianDocumentationContext: (mspTenantId: string, clientTenantId: string, documentationRecordId: string) => blobPath('technician-context', mspTenantId, 'clients', clientTenantId, 'docs', documentationRecordId, 'context.json'),
  standardDefinition: (mspTenantId: string, standardId: string) => blobPath('standards-artifacts', mspTenantId, standardId, 'definition.json'),
  standardResult: (mspTenantId: string, clientTenantId: string, standardId: string) => blobPath('standards-artifacts', mspTenantId, clientTenantId, standardId, 'result.json'),
  standardRemediation: (mspTenantId: string, clientTenantId: string, standardId: string) => blobPath('standards-artifacts', mspTenantId, clientTenantId, standardId, 'remediation.json'),
  managementAlertDetails: (mspTenantId: string, alertId: string) => blobPath('management-alerts', mspTenantId, alertId, 'details.json'),
  workflowDraft: (mspTenantId: string, workflowId: string) => blobPath('workflow-drafts', mspTenantId, workflowId, 'draft.json'),
  workflowDraftLayout: (mspTenantId: string, workflowId: string) => blobPath('workflow-drafts', mspTenantId, workflowId, 'draft-layout.json'),
  workflowVersionWorkflow: (mspTenantId: string, workflowId: string, workflowVersionId: string) => blobPath('workflow-versions', mspTenantId, workflowId, workflowVersionId, 'workflow.json'),
  workflowVersionManifest: (mspTenantId: string, workflowId: string, workflowVersionId: string) => blobPath('workflow-versions', mspTenantId, workflowId, workflowVersionId, 'manifest.json'),
  workflowVersionBindings: (mspTenantId: string, workflowId: string, workflowVersionId: string) => blobPath('workflow-versions', mspTenantId, workflowId, workflowVersionId, 'bindings.json'),
  executionInput: (mspTenantId: string, workflowId: string, executionId: string) => blobPath('execution-data', mspTenantId, workflowId, executionId, 'input.json'),
  executionOutput: (mspTenantId: string, workflowId: string, executionId: string) => blobPath('execution-data', mspTenantId, workflowId, executionId, 'output.json'),
  executionLogs: (mspTenantId: string, workflowId: string, executionId: string) => blobPath('execution-data', mspTenantId, workflowId, executionId, 'logs.ndjson'),
  executionState: (mspTenantId: string, workflowId: string, executionId: string) => blobPath('execution-data', mspTenantId, workflowId, executionId, 'state.json'),
  executionStepInput: (mspTenantId: string, workflowId: string, executionId: string, stepIndex: number, attempt: number) => blobPath('execution-data', mspTenantId, workflowId, executionId, 'steps', `${stepIndex}-${attempt}-input.json`),
  executionStepOutput: (mspTenantId: string, workflowId: string, executionId: string, stepIndex: number, attempt: number) => blobPath('execution-data', mspTenantId, workflowId, executionId, 'steps', `${stepIndex}-${attempt}-output.json`),
  executionStepError: (mspTenantId: string, workflowId: string, executionId: string, stepIndex: number, attempt: number) => blobPath('execution-data', mspTenantId, workflowId, executionId, 'steps', `${stepIndex}-${attempt}-error.json`),
  auditDetails: (mspTenantId: string, auditEventId: string) => blobPath('audit-details', mspTenantId, auditEventId, 'details.json'),
  tenantSettings: (mspTenantId: string) => blobPath('tenant-data', mspTenantId, 'settings.json'),
  clientNotes: (mspTenantId: string, clientTenantId: string) => blobPath('tenant-data', mspTenantId, 'clients', clientTenantId, 'notes.json'),
};

export const secretNameBuilders = {
  connection: (connectionId: string) => secretName(`aoifmsp-connection-${connectionId}`),
  clientAppRegistration: (appRegistrationId: string) => secretName(`aoifmsp-clientapp-${appRegistrationId}`),
  webhook: (triggerId: string) => secretName(`aoifmsp-webhook-${triggerId}`),
};

export const storageNaming = {
  reverseTicks,
  blobPath,
  joinKeySegments,
  joinPathSegments,
  padded,
};

