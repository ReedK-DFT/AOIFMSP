import { blobPathBuilders, keyBuilders, secretNameBuilders } from '../keys';
import { parseKeyVaultSecretPayload, parseManagementOperationDocument, parseQueueMessage, parseWorkflowDocument, executionStateDocumentSchema, designTimeAssistantOutputSchema, } from '../schemas';
import { EntityTableRepository, InMemoryBlobDocumentStore, InMemoryQueueMessageStore, InMemorySecretValueStore, InMemoryTableEntityStore, QueuePublisherService, ValidatedBlobRepository, ValidatedSecretRepository, } from './repository-core';
const workflowDocumentParser = (input) => parseWorkflowDocument(input);
const managementOperationParser = (input) => parseManagementOperationDocument(input);
const executionStateParser = (input) => executionStateDocumentSchema.parse(input);
const designTimeAssistantOutputParser = (input) => designTimeAssistantOutputSchema.parse(input);
const keyVaultSecretPayloadParser = (input) => parseKeyVaultSecretPayload(input);
const queueMessageParser = (input) => parseQueueMessage(input);
export const tableNames = {
    mspTenants: 'MspTenants',
    mspUsers: 'MspUsers',
    userPreferences: 'UserPreferences',
    userInputProfiles: 'UserInputProfiles',
    clientTenants: 'ClientTenants',
    clientAppRegistrations: 'ClientAppRegistrations',
    foundryProjects: 'FoundryProjects',
    tenantManagementProfiles: 'TenantManagementProfiles',
    managedUsers: 'ManagedUsers',
    tickets: 'Tickets',
    devices: 'Devices',
    documentationRecords: 'DocumentationRecords',
    technicianContextLinks: 'TechnicianContextLinks',
    tenantGroups: 'TenantGroups',
    tenantGroupMembers: 'TenantGroupMembers',
    standardsTemplates: 'StandardsTemplates',
    standardsAssignments: 'StandardsAssignments',
    standardsResults: 'StandardsResults',
    managementAlerts: 'ManagementAlerts',
    managementSyncState: 'ManagementSyncState',
    connectors: 'Connectors',
    connectorVersions: 'ConnectorVersions',
    connectorActions: 'ConnectorActions',
    aiAgents: 'AIAgents',
    aiAgentVersions: 'AIAgentVersions',
    connections: 'Connections',
    workflows: 'Workflows',
    workflowVersions: 'WorkflowVersions',
    workflowTriggers: 'WorkflowTriggers',
    pollingCheckpoints: 'PollingCheckpoints',
    executions: 'Executions',
    executionSteps: 'ExecutionSteps',
    aiAgentRuns: 'AIAgentRuns',
    auditEvents: 'AuditEvents',
};
export function createDataLayerService(dependencies) {
    return {
        stores: dependencies,
        tables: {
            mspTenants: new EntityTableRepository(dependencies.tables, tableNames.mspTenants, keyBuilders.entity.mspTenant),
            mspUsers: new EntityTableRepository(dependencies.tables, tableNames.mspUsers, keyBuilders.entity.mspUser),
            userPreferences: new EntityTableRepository(dependencies.tables, tableNames.userPreferences, keyBuilders.entity.userPreferences),
            userInputProfiles: new EntityTableRepository(dependencies.tables, tableNames.userInputProfiles, keyBuilders.entity.userInputProfile),
            clientTenants: new EntityTableRepository(dependencies.tables, tableNames.clientTenants, keyBuilders.entity.clientTenant),
            clientAppRegistrations: new EntityTableRepository(dependencies.tables, tableNames.clientAppRegistrations, keyBuilders.entity.clientAppRegistration),
            foundryProjects: new EntityTableRepository(dependencies.tables, tableNames.foundryProjects, keyBuilders.entity.foundryProject),
            tenantManagementProfiles: new EntityTableRepository(dependencies.tables, tableNames.tenantManagementProfiles, keyBuilders.entity.tenantManagementProfile),
            managedUsers: new EntityTableRepository(dependencies.tables, tableNames.managedUsers, keyBuilders.entity.managedUser),
            tickets: new EntityTableRepository(dependencies.tables, tableNames.tickets, keyBuilders.entity.ticket),
            devices: new EntityTableRepository(dependencies.tables, tableNames.devices, keyBuilders.entity.device),
            documentationRecords: new EntityTableRepository(dependencies.tables, tableNames.documentationRecords, keyBuilders.entity.documentationRecord),
            technicianContextLinks: new EntityTableRepository(dependencies.tables, tableNames.technicianContextLinks, keyBuilders.entity.technicianContextLink),
            tenantGroups: new EntityTableRepository(dependencies.tables, tableNames.tenantGroups, keyBuilders.entity.tenantGroup),
            tenantGroupMembers: new EntityTableRepository(dependencies.tables, tableNames.tenantGroupMembers, keyBuilders.entity.tenantGroupMember),
            standardsTemplates: new EntityTableRepository(dependencies.tables, tableNames.standardsTemplates, keyBuilders.entity.standardsTemplate),
            standardsAssignments: new EntityTableRepository(dependencies.tables, tableNames.standardsAssignments, keyBuilders.entity.standardsAssignment),
            standardsResults: new EntityTableRepository(dependencies.tables, tableNames.standardsResults, keyBuilders.entity.standardsResult),
            managementAlerts: new EntityTableRepository(dependencies.tables, tableNames.managementAlerts, keyBuilders.entity.managementAlert),
            managementSyncState: new EntityTableRepository(dependencies.tables, tableNames.managementSyncState, keyBuilders.entity.managementSyncState),
            connectors: new EntityTableRepository(dependencies.tables, tableNames.connectors, keyBuilders.entity.connector),
            connectorVersions: new EntityTableRepository(dependencies.tables, tableNames.connectorVersions, keyBuilders.entity.connectorVersion),
            connectorActions: new EntityTableRepository(dependencies.tables, tableNames.connectorActions, keyBuilders.entity.connectorAction),
            aiAgents: new EntityTableRepository(dependencies.tables, tableNames.aiAgents, keyBuilders.entity.aiAgent),
            aiAgentVersions: new EntityTableRepository(dependencies.tables, tableNames.aiAgentVersions, keyBuilders.entity.aiAgentVersion),
            connections: new EntityTableRepository(dependencies.tables, tableNames.connections, keyBuilders.entity.connection),
            workflows: new EntityTableRepository(dependencies.tables, tableNames.workflows, keyBuilders.entity.workflow),
            workflowVersions: new EntityTableRepository(dependencies.tables, tableNames.workflowVersions, keyBuilders.entity.workflowVersion),
            workflowTriggers: new EntityTableRepository(dependencies.tables, tableNames.workflowTriggers, keyBuilders.entity.workflowTrigger),
            pollingCheckpoints: new EntityTableRepository(dependencies.tables, tableNames.pollingCheckpoints, keyBuilders.entity.pollingCheckpoint),
            executions: new EntityTableRepository(dependencies.tables, tableNames.executions, keyBuilders.entity.execution),
            executionSteps: new EntityTableRepository(dependencies.tables, tableNames.executionSteps, keyBuilders.entity.executionStep),
            aiAgentRuns: new EntityTableRepository(dependencies.tables, tableNames.aiAgentRuns, keyBuilders.entity.aiAgentRun),
            auditEvents: new EntityTableRepository(dependencies.tables, tableNames.auditEvents, keyBuilders.entity.auditEvent),
        },
        documents: {
            workflowDrafts: new ValidatedBlobRepository(dependencies.blobs, blobPathBuilders.workflowDraft, workflowDocumentParser),
            workflowVersions: new ValidatedBlobRepository(dependencies.blobs, blobPathBuilders.workflowVersionWorkflow, workflowDocumentParser),
            managementOperations: new ValidatedBlobRepository(dependencies.blobs, blobPathBuilders.managementOperationRequest, managementOperationParser),
            executionStates: new ValidatedBlobRepository(dependencies.blobs, blobPathBuilders.executionState, executionStateParser),
            designTimeOutputs: new ValidatedBlobRepository(dependencies.blobs, blobPathBuilders.aiAgentRunOutput, designTimeAssistantOutputParser),
        },
        secrets: {
            connectionCredentials: new ValidatedSecretRepository(dependencies.secrets, secretNameBuilders.connection, keyVaultSecretPayloadParser),
            clientAppCredentials: new ValidatedSecretRepository(dependencies.secrets, secretNameBuilders.clientAppRegistration, keyVaultSecretPayloadParser),
        },
        queues: new QueuePublisherService(dependencies.queues, queueMessageParser),
    };
}
export function createInMemoryDataLayerService() {
    return createDataLayerService({
        tables: new InMemoryTableEntityStore(),
        blobs: new InMemoryBlobDocumentStore(),
        queues: new InMemoryQueueMessageStore(),
        secrets: new InMemorySecretValueStore(),
    });
}
