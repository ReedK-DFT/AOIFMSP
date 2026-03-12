const MAX_DATE_MS = 253402300799999;
function dateToMs(value) {
    if (value instanceof Date) {
        return value.getTime();
    }
    return new Date(value).getTime();
}
function normalizeSegment(value) {
    return value.trim().replace(/^\/+|\/+$/g, '');
}
function joinKeySegments(...segments) {
    return segments.filter(Boolean).join('|');
}
function joinPathSegments(...segments) {
    return segments.filter(Boolean).map(normalizeSegment).join('/');
}
function address(partitionKey, rowKey) {
    return { partitionKey, rowKey };
}
function reverseTicks(value = new Date()) {
    const ms = dateToMs(value);
    return String(MAX_DATE_MS - ms).padStart(15, '0');
}
function padded(value, width) {
    return String(value).padStart(width, '0');
}
function blobPath(container, ...segments) {
    const suffix = joinPathSegments(...segments);
    return suffix ? `${container}/${suffix}` : container;
}
function secretName(name) {
    return name;
}
export const keyBuilders = {
    partition: {
        msp: (mspTenantId) => `MSP#${mspTenantId}`,
        mspClient: (mspTenantId, clientTenantId) => joinKeySegments(`MSP#${mspTenantId}`, `CLIENT#${clientTenantId}`),
        mspUser: (mspTenantId, userObjectId) => joinKeySegments(`MSP#${mspTenantId}`, `USER#${userObjectId}`),
        mspConnector: (mspTenantId, connectorId) => joinKeySegments(`MSP#${mspTenantId}`, `CONNECTOR#${connectorId}`),
        mspWorkflow: (mspTenantId, workflowId) => joinKeySegments(`MSP#${mspTenantId}`, `WORKFLOW#${workflowId}`),
        mspAgent: (mspTenantId, agentId) => joinKeySegments(`MSP#${mspTenantId}`, `AGENT#${agentId}`),
        execution: (executionId) => `EXEC#${executionId}`,
        trigger: (mspTenantId, triggerId) => joinKeySegments(`MSP#${mspTenantId}`, `TRIGGER#${triggerId}`),
        context: (mspTenantId, contextType, contextId) => joinKeySegments(`MSP#${mspTenantId}`, `CTX#${contextType}#${contextId}`),
        standard: (mspTenantId, standardId) => joinKeySegments(`MSP#${mspTenantId}`, `STANDARD#${standardId}`),
        tenantGroup: (mspTenantId, tenantGroupId) => joinKeySegments(`MSP#${mspTenantId}`, `TGROUP#${tenantGroupId}`),
    },
    row: {
        profile: () => 'PROFILE',
        state: () => 'STATE',
        user: (userObjectId) => `USER#${userObjectId}`,
        preference: (userObjectId) => `PREF#${userObjectId}`,
        inputProfile: (profileId) => `INPUT#${profileId}`,
        client: (clientTenantId) => `CLIENT#${clientTenantId}`,
        appRegistration: (appRegistrationId) => `APPREG#${appRegistrationId}`,
        foundryProject: (environmentName) => `FOUNDRY#${environmentName}`,
        managementProfile: (clientTenantId) => `MGMT#${clientTenantId}`,
        device: (deviceId) => `DEVICE#${deviceId}`,
        ticket: (ticketId) => `TICKET#${ticketId}`,
        documentation: (documentationRecordId) => `DOC#${documentationRecordId}`,
        link: (linkedType, linkedId) => `LINK#${linkedType}#${linkedId}`,
        standard: (standardId) => `STANDARD#${standardId}`,
        assignment: (assignmentId) => `ASSIGN#${assignmentId}`,
        sync: (datasetName) => `SYNC#${datasetName}`,
        connector: (connectorId) => `CONNECTOR#${connectorId}`,
        version: (versionId) => `VER#${versionId}`,
        action: (actionId) => `ACTION#${actionId}`,
        agent: (agentId) => `AGENT#${agentId}`,
        connection: (connectionId) => `CONNECTION#${connectionId}`,
        workflow: (workflowId) => `WORKFLOW#${workflowId}`,
        trigger: (triggerId) => `TRIGGER#${triggerId}`,
        run: (executionId, at = new Date()) => `RUN#${reverseTicks(at)}#${executionId}`,
        executionStep: (stepIndex, attempt) => `STEP#${padded(stepIndex, 6)}#${padded(attempt, 4)}`,
        aiRun: (aiAgentRunId, at = new Date()) => `AIRUN#${reverseTicks(at)}#${aiAgentRunId}`,
        alert: (alertId, at = new Date()) => `ALERT#${reverseTicks(at)}#${alertId}`,
        audit: (auditEventId, at = new Date()) => `AUDIT#${reverseTicks(at)}#${auditEventId}`,
    },
    entity: {
        mspTenant: (mspTenantId) => address(`MSP#${mspTenantId}`, 'PROFILE'),
        mspUser: (mspTenantId, userObjectId) => address(`MSP#${mspTenantId}`, `USER#${userObjectId}`),
        userPreferences: (mspTenantId, userObjectId) => address(`MSP#${mspTenantId}`, `PREF#${userObjectId}`),
        userInputProfile: (mspTenantId, userObjectId, profileId) => address(joinKeySegments(`MSP#${mspTenantId}`, `USER#${userObjectId}`), `INPUT#${profileId}`),
        clientTenant: (mspTenantId, clientTenantId) => address(`MSP#${mspTenantId}`, `CLIENT#${clientTenantId}`),
        clientAppRegistration: (mspTenantId, clientTenantId, appRegistrationId) => address(joinKeySegments(`MSP#${mspTenantId}`, `CLIENT#${clientTenantId}`), `APPREG#${appRegistrationId}`),
        foundryProject: (mspTenantId, environmentName) => address(`MSP#${mspTenantId}`, `FOUNDRY#${environmentName}`),
        tenantManagementProfile: (mspTenantId, clientTenantId) => address(`MSP#${mspTenantId}`, `MGMT#${clientTenantId}`),
        managedUser: (mspTenantId, clientTenantId, managedUserId) => address(joinKeySegments(`MSP#${mspTenantId}`, `CLIENT#${clientTenantId}`), `USER#${managedUserId}`),
        ticket: (mspTenantId, ticketId) => address(`MSP#${mspTenantId}`, `TICKET#${ticketId}`),
        device: (mspTenantId, clientTenantId, deviceId) => address(joinKeySegments(`MSP#${mspTenantId}`, `CLIENT#${clientTenantId}`), `DEVICE#${deviceId}`),
        documentationRecord: (mspTenantId, clientTenantId, documentationRecordId) => address(joinKeySegments(`MSP#${mspTenantId}`, `CLIENT#${clientTenantId}`), `DOC#${documentationRecordId}`),
        technicianContextLink: (mspTenantId, contextType, contextId, linkedType, linkedId) => address(joinKeySegments(`MSP#${mspTenantId}`, `CTX#${contextType}#${contextId}`), `LINK#${linkedType}#${linkedId}`),
        tenantGroup: (mspTenantId, tenantGroupId) => address(`MSP#${mspTenantId}`, `TGROUP#${tenantGroupId}`),
        tenantGroupMember: (mspTenantId, tenantGroupId, clientTenantId) => address(joinKeySegments(`MSP#${mspTenantId}`, `TGROUP#${tenantGroupId}`), `CLIENT#${clientTenantId}`),
        standardsTemplate: (mspTenantId, standardId) => address(`MSP#${mspTenantId}`, `STANDARD#${standardId}`),
        standardsAssignment: (mspTenantId, standardId, assignmentId) => address(joinKeySegments(`MSP#${mspTenantId}`, `STANDARD#${standardId}`), `ASSIGN#${assignmentId}`),
        standardsResult: (mspTenantId, clientTenantId, standardId) => address(joinKeySegments(`MSP#${mspTenantId}`, `CLIENT#${clientTenantId}`), `STANDARD#${standardId}`),
        managementAlert: (mspTenantId, alertId, at = new Date()) => address(`MSP#${mspTenantId}`, `ALERT#${reverseTicks(at)}#${alertId}`),
        managementSyncState: (mspTenantId, clientTenantId, datasetName) => address(joinKeySegments(`MSP#${mspTenantId}`, `CLIENT#${clientTenantId}`), `SYNC#${datasetName}`),
        connector: (mspTenantId, connectorId) => address(`MSP#${mspTenantId}`, `CONNECTOR#${connectorId}`),
        connectorVersion: (mspTenantId, connectorId, connectorVersionId) => address(joinKeySegments(`MSP#${mspTenantId}`, `CONNECTOR#${connectorId}`), `VER#${connectorVersionId}`),
        connectorAction: (mspTenantId, connectorId, connectorVersionId, actionId) => address(joinKeySegments(`MSP#${mspTenantId}`, `CONNECTOR#${connectorId}`, `VER#${connectorVersionId}`), `ACTION#${actionId}`),
        aiAgent: (mspTenantId, agentId) => address(`MSP#${mspTenantId}`, `AGENT#${agentId}`),
        aiAgentVersion: (mspTenantId, agentId, agentVersionId) => address(joinKeySegments(`MSP#${mspTenantId}`, `AGENT#${agentId}`), `VER#${agentVersionId}`),
        connection: (mspTenantId, connectionId, clientTenantId) => address(clientTenantId ? joinKeySegments(`MSP#${mspTenantId}`, `CLIENT#${clientTenantId}`) : `MSP#${mspTenantId}`, `CONNECTION#${connectionId}`),
        workflow: (mspTenantId, workflowId) => address(`MSP#${mspTenantId}`, `WORKFLOW#${workflowId}`),
        workflowVersion: (mspTenantId, workflowId, workflowVersionId) => address(joinKeySegments(`MSP#${mspTenantId}`, `WORKFLOW#${workflowId}`), `VER#${workflowVersionId}`),
        workflowTrigger: (mspTenantId, workflowId, triggerId) => address(joinKeySegments(`MSP#${mspTenantId}`, `WORKFLOW#${workflowId}`), `TRIGGER#${triggerId}`),
        pollingCheckpoint: (mspTenantId, triggerId) => address(joinKeySegments(`MSP#${mspTenantId}`, `TRIGGER#${triggerId}`), 'STATE'),
        execution: (mspTenantId, workflowId, executionId, at = new Date()) => address(joinKeySegments(`MSP#${mspTenantId}`, `WORKFLOW#${workflowId}`), `RUN#${reverseTicks(at)}#${executionId}`),
        executionStep: (executionId, stepIndex, attempt) => address(`EXEC#${executionId}`, `STEP#${padded(stepIndex, 6)}#${padded(attempt, 4)}`),
        aiAgentRun: (mspTenantId, aiAgentRunId, at = new Date(), workflowId) => address(workflowId ? joinKeySegments(`MSP#${mspTenantId}`, `WORKFLOW#${workflowId}`) : joinKeySegments(`MSP#${mspTenantId}`, 'DESIGN'), `AIRUN#${reverseTicks(at)}#${aiAgentRunId}`),
        auditEvent: (mspTenantId, auditEventId, at = new Date()) => address(`MSP#${mspTenantId}`, `AUDIT#${reverseTicks(at)}#${auditEventId}`),
    },
};
export const blobPathBuilders = {
    connectorOpenApi: (mspTenantId, connectorId, connectorVersionId) => blobPath('connector-specs', mspTenantId, connectorId, connectorVersionId, 'openapi.json'),
    connectorSourceMetadata: (mspTenantId, connectorId, connectorVersionId) => blobPath('connector-specs', mspTenantId, connectorId, connectorVersionId, 'source-metadata.json'),
    connectorActions: (mspTenantId, connectorId, connectorVersionId) => blobPath('connector-artifacts', mspTenantId, connectorId, connectorVersionId, 'actions.json'),
    connectorSchemas: (mspTenantId, connectorId, connectorVersionId) => blobPath('connector-artifacts', mspTenantId, connectorId, connectorVersionId, 'schemas.json'),
    connectorManifest: (mspTenantId, connectorId, connectorVersionId) => blobPath('connector-artifacts', mspTenantId, connectorId, connectorVersionId, 'manifest.json'),
    aiAgentInstructions: (mspTenantId, agentId, agentVersionId) => blobPath('ai-agent-definitions', mspTenantId, agentId, agentVersionId, 'instructions.md'),
    aiAgentTools: (mspTenantId, agentId, agentVersionId) => blobPath('ai-agent-definitions', mspTenantId, agentId, agentVersionId, 'tools.json'),
    aiAgentEvaluationPolicy: (mspTenantId, agentId, agentVersionId) => blobPath('ai-agent-definitions', mspTenantId, agentId, agentVersionId, 'evaluation-policy.json'),
    aiAgentRunInput: (mspTenantId, agentId, aiAgentRunId) => blobPath('ai-agent-runs', mspTenantId, agentId, aiAgentRunId, 'input.json'),
    aiAgentRunOutput: (mspTenantId, agentId, aiAgentRunId) => blobPath('ai-agent-runs', mspTenantId, agentId, aiAgentRunId, 'output.json'),
    aiAgentRunTraceSummary: (mspTenantId, agentId, aiAgentRunId) => blobPath('ai-agent-runs', mspTenantId, agentId, aiAgentRunId, 'trace-summary.json'),
    managementFullUserSync: (mspTenantId, clientTenantId, timestamp) => blobPath('management-snapshots', mspTenantId, clientTenantId, 'users', `full-sync-${timestamp}.json`),
    managementOperationRequest: (mspTenantId, clientTenantId, operationId) => blobPath('management-snapshots', mspTenantId, clientTenantId, 'management-ops', operationId, 'request.json'),
    managementOperationResult: (mspTenantId, clientTenantId, operationId) => blobPath('management-snapshots', mspTenantId, clientTenantId, 'management-ops', operationId, 'result.json'),
    technicianTicketContext: (mspTenantId, ticketId) => blobPath('technician-context', mspTenantId, 'tickets', ticketId, 'context.json'),
    technicianDeviceContext: (mspTenantId, clientTenantId, deviceId) => blobPath('technician-context', mspTenantId, 'clients', clientTenantId, 'devices', deviceId, 'context.json'),
    technicianDocumentationContext: (mspTenantId, clientTenantId, documentationRecordId) => blobPath('technician-context', mspTenantId, 'clients', clientTenantId, 'docs', documentationRecordId, 'context.json'),
    standardDefinition: (mspTenantId, standardId) => blobPath('standards-artifacts', mspTenantId, standardId, 'definition.json'),
    standardResult: (mspTenantId, clientTenantId, standardId) => blobPath('standards-artifacts', mspTenantId, clientTenantId, standardId, 'result.json'),
    standardRemediation: (mspTenantId, clientTenantId, standardId) => blobPath('standards-artifacts', mspTenantId, clientTenantId, standardId, 'remediation.json'),
    managementAlertDetails: (mspTenantId, alertId) => blobPath('management-alerts', mspTenantId, alertId, 'details.json'),
    workflowDraft: (mspTenantId, workflowId) => blobPath('workflow-drafts', mspTenantId, workflowId, 'draft.json'),
    workflowDraftLayout: (mspTenantId, workflowId) => blobPath('workflow-drafts', mspTenantId, workflowId, 'draft-layout.json'),
    workflowVersionWorkflow: (mspTenantId, workflowId, workflowVersionId) => blobPath('workflow-versions', mspTenantId, workflowId, workflowVersionId, 'workflow.json'),
    workflowVersionManifest: (mspTenantId, workflowId, workflowVersionId) => blobPath('workflow-versions', mspTenantId, workflowId, workflowVersionId, 'manifest.json'),
    workflowVersionBindings: (mspTenantId, workflowId, workflowVersionId) => blobPath('workflow-versions', mspTenantId, workflowId, workflowVersionId, 'bindings.json'),
    executionInput: (mspTenantId, workflowId, executionId) => blobPath('execution-data', mspTenantId, workflowId, executionId, 'input.json'),
    executionOutput: (mspTenantId, workflowId, executionId) => blobPath('execution-data', mspTenantId, workflowId, executionId, 'output.json'),
    executionLogs: (mspTenantId, workflowId, executionId) => blobPath('execution-data', mspTenantId, workflowId, executionId, 'logs.ndjson'),
    executionState: (mspTenantId, workflowId, executionId) => blobPath('execution-data', mspTenantId, workflowId, executionId, 'state.json'),
    executionStepInput: (mspTenantId, workflowId, executionId, stepIndex, attempt) => blobPath('execution-data', mspTenantId, workflowId, executionId, 'steps', `${stepIndex}-${attempt}-input.json`),
    executionStepOutput: (mspTenantId, workflowId, executionId, stepIndex, attempt) => blobPath('execution-data', mspTenantId, workflowId, executionId, 'steps', `${stepIndex}-${attempt}-output.json`),
    executionStepError: (mspTenantId, workflowId, executionId, stepIndex, attempt) => blobPath('execution-data', mspTenantId, workflowId, executionId, 'steps', `${stepIndex}-${attempt}-error.json`),
    auditDetails: (mspTenantId, auditEventId) => blobPath('audit-details', mspTenantId, auditEventId, 'details.json'),
    tenantSettings: (mspTenantId) => blobPath('tenant-data', mspTenantId, 'settings.json'),
    clientNotes: (mspTenantId, clientTenantId) => blobPath('tenant-data', mspTenantId, 'clients', clientTenantId, 'notes.json'),
};
export const secretNameBuilders = {
    connection: (connectionId) => secretName(`aoifmsp-connection-${connectionId}`),
    clientAppRegistration: (appRegistrationId) => secretName(`aoifmsp-clientapp-${appRegistrationId}`),
    webhook: (triggerId) => secretName(`aoifmsp-webhook-${triggerId}`),
};
export const storageNaming = {
    reverseTicks,
    blobPath,
    joinKeySegments,
    joinPathSegments,
    padded,
};
