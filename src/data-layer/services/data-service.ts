import type { AIAgentEntity, AIAgentRunEntity, AIAgentVersionEntity, DesignTimeAssistantOutput } from '../ai';
import type { ConnectorActionMappingEntity, PlatformActionCatalogEntity, ToolCapabilityProfileEntity } from '../action-catalog';
import type { AuditEventEntity } from '../audit';
import { blobPathBuilders, keyBuilders, secretNameBuilders } from '../keys';
import type { ClientAppRegistrationEntity, ClientTenantEntity, DirectoryBootstrapStateEntity, FoundryProjectEntity, MspTenantEntity, MspUserEntity, UserInputProfileEntity, UserPreferencesEntity } from '../platform';
import type {
  ManagedUserEntity,
  ManagementAlertEntity,
  ManagementOperationDocument,
  ManagementSyncStateEntity,
  StandardsAssignmentEntity,
  StandardsResultEntity,
  StandardsTemplateEntity,
  TenantGroupEntity,
  TenantGroupMemberEntity,
  TenantManagementProfileEntity,
} from '../management';
import type { ConnectionEntity, ConnectorActionEntity, ConnectorEntity, ConnectorVersionEntity } from '../integrations';
import {
  parseKeyVaultSecretPayload,
  parseManagementOperationDocument,
  parseQueueMessage,
  parseWorkflowDocument,
  workflowDocumentSchema,
  executionStateDocumentSchema,
  designTimeAssistantOutputSchema,
} from '../schemas';
import type { DeviceEntity, DocumentationRecordEntity, TechnicianContextLinkEntity, TicketEntity } from '../technician';
import type { KeyVaultSecretPayload, QueueMessage } from '../storage';
import type {
  ExecutionEntity,
  ExecutionStateDocument,
  ExecutionStepEntity,
  PollingCheckpointEntity,
  WorkflowDocument,
  WorkflowEntity,
  WorkflowTriggerEntity,
  WorkflowVersionEntity,
} from '../workflows';
import type { DataLayerDependencies } from './repository-ports';
import {
  EntityTableRepository,
  InMemoryBlobDocumentStore,
  InMemoryQueueMessageStore,
  InMemorySecretValueStore,
  InMemoryTableEntityStore,
  QueuePublisherService,
  ValidatedBlobRepository,
  ValidatedSecretRepository,
} from './repository-core';

const workflowDocumentParser = (input: unknown): WorkflowDocument => parseWorkflowDocument(input) as WorkflowDocument;
const managementOperationParser = (input: unknown): ManagementOperationDocument => parseManagementOperationDocument(input) as ManagementOperationDocument;
const executionStateParser = (input: unknown): ExecutionStateDocument => executionStateDocumentSchema.parse(input) as ExecutionStateDocument;
const designTimeAssistantOutputParser = (input: unknown): DesignTimeAssistantOutput => designTimeAssistantOutputSchema.parse(input) as DesignTimeAssistantOutput;
const keyVaultSecretPayloadParser = (input: unknown): KeyVaultSecretPayload => parseKeyVaultSecretPayload(input) as KeyVaultSecretPayload;
const queueMessageParser = (input: unknown): QueueMessage => parseQueueMessage(input) as QueueMessage;

export const tableNames = {
  mspTenants: 'MspTenants',
  mspUsers: 'MspUsers',
  userPreferences: 'UserPreferences',
  userInputProfiles: 'UserInputProfiles',
  directoryBootstrapState: 'DirectoryBootstrapState',
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
  platformActionCatalog: 'PlatformActionCatalog',
  connectorActionMappings: 'ConnectorActionMappings',
  toolCapabilityProfiles: 'ToolCapabilityProfiles',
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
} as const;

export interface DataLayerService {
  stores: DataLayerDependencies;
  tables: {
    mspTenants: EntityTableRepository<MspTenantEntity, [mspTenantId: string]>;
    mspUsers: EntityTableRepository<MspUserEntity, [mspTenantId: string, userObjectId: string]>;
    userPreferences: EntityTableRepository<UserPreferencesEntity, [mspTenantId: string, userObjectId: string]>;
    userInputProfiles: EntityTableRepository<UserInputProfileEntity, [mspTenantId: string, userObjectId: string, profileId: string]>;
    directoryBootstrapState: EntityTableRepository<DirectoryBootstrapStateEntity, [mspTenantId: string, scope: string]>;
    clientTenants: EntityTableRepository<ClientTenantEntity, [mspTenantId: string, clientTenantId: string]>;
    clientAppRegistrations: EntityTableRepository<ClientAppRegistrationEntity, [mspTenantId: string, clientTenantId: string, appRegistrationId: string]>;
    foundryProjects: EntityTableRepository<FoundryProjectEntity, [mspTenantId: string, environmentName: string]>;
    tenantManagementProfiles: EntityTableRepository<TenantManagementProfileEntity, [mspTenantId: string, clientTenantId: string]>;
    managedUsers: EntityTableRepository<ManagedUserEntity, [mspTenantId: string, clientTenantId: string, managedUserId: string]>;
    tickets: EntityTableRepository<TicketEntity, [mspTenantId: string, ticketId: string]>;
    devices: EntityTableRepository<DeviceEntity, [mspTenantId: string, clientTenantId: string, deviceId: string]>;
    documentationRecords: EntityTableRepository<DocumentationRecordEntity, [mspTenantId: string, clientTenantId: string, documentationRecordId: string]>;
    technicianContextLinks: EntityTableRepository<TechnicianContextLinkEntity, [mspTenantId: string, contextType: string, contextId: string, linkedType: string, linkedId: string]>;
    tenantGroups: EntityTableRepository<TenantGroupEntity, [mspTenantId: string, tenantGroupId: string]>;
    tenantGroupMembers: EntityTableRepository<TenantGroupMemberEntity, [mspTenantId: string, tenantGroupId: string, clientTenantId: string]>;
    standardsTemplates: EntityTableRepository<StandardsTemplateEntity, [mspTenantId: string, standardId: string]>;
    standardsAssignments: EntityTableRepository<StandardsAssignmentEntity, [mspTenantId: string, standardId: string, assignmentId: string]>;
    standardsResults: EntityTableRepository<StandardsResultEntity, [mspTenantId: string, clientTenantId: string, standardId: string]>;
    managementAlerts: EntityTableRepository<ManagementAlertEntity, [mspTenantId: string, alertId: string, at?: Date | string | number]>;
    managementSyncState: EntityTableRepository<ManagementSyncStateEntity, [mspTenantId: string, clientTenantId: string, datasetName: string]>;
    connectors: EntityTableRepository<ConnectorEntity, [mspTenantId: string, connectorId: string]>;
    platformActionCatalog: EntityTableRepository<PlatformActionCatalogEntity, [mspTenantId: string, normalizedActionId: string]>;
    connectorActionMappings: EntityTableRepository<ConnectorActionMappingEntity, [mspTenantId: string, normalizedActionId: string, connectorId: string, connectorVersionId: string, actionId: string]>;
    toolCapabilityProfiles: EntityTableRepository<ToolCapabilityProfileEntity, [mspTenantId: string, profileId: string]>;
    connectorVersions: EntityTableRepository<ConnectorVersionEntity, [mspTenantId: string, connectorId: string, connectorVersionId: string]>;
    connectorActions: EntityTableRepository<ConnectorActionEntity, [mspTenantId: string, connectorId: string, connectorVersionId: string, actionId: string]>;
    aiAgents: EntityTableRepository<AIAgentEntity, [mspTenantId: string, agentId: string]>;
    aiAgentVersions: EntityTableRepository<AIAgentVersionEntity, [mspTenantId: string, agentId: string, agentVersionId: string]>;
    connections: EntityTableRepository<ConnectionEntity, [mspTenantId: string, connectionId: string, clientTenantId?: string]>;
    workflows: EntityTableRepository<WorkflowEntity, [mspTenantId: string, workflowId: string]>;
    workflowVersions: EntityTableRepository<WorkflowVersionEntity, [mspTenantId: string, workflowId: string, workflowVersionId: string]>;
    workflowTriggers: EntityTableRepository<WorkflowTriggerEntity, [mspTenantId: string, workflowId: string, triggerId: string]>;
    pollingCheckpoints: EntityTableRepository<PollingCheckpointEntity, [mspTenantId: string, triggerId: string]>;
    executions: EntityTableRepository<ExecutionEntity, [mspTenantId: string, workflowId: string, executionId: string, at?: Date | string | number]>;
    executionSteps: EntityTableRepository<ExecutionStepEntity, [executionId: string, stepIndex: number, attempt: number]>;
    aiAgentRuns: EntityTableRepository<AIAgentRunEntity, [mspTenantId: string, aiAgentRunId: string, at?: Date | string | number, workflowId?: string]>;
    auditEvents: EntityTableRepository<AuditEventEntity, [mspTenantId: string, auditEventId: string, at?: Date | string | number]>;
  };
  documents: {
    workflowDrafts: ValidatedBlobRepository<WorkflowDocument, [mspTenantId: string, workflowId: string]>;
    workflowVersions: ValidatedBlobRepository<WorkflowDocument, [mspTenantId: string, workflowId: string, workflowVersionId: string]>;
    managementOperations: ValidatedBlobRepository<ManagementOperationDocument, [mspTenantId: string, clientTenantId: string, operationId: string]>;
    executionStates: ValidatedBlobRepository<ExecutionStateDocument, [mspTenantId: string, workflowId: string, executionId: string]>;
    designTimeOutputs: ValidatedBlobRepository<DesignTimeAssistantOutput, [mspTenantId: string, agentId: string, aiAgentRunId: string]>;
  };
  secrets: {
    connectionCredentials: ValidatedSecretRepository<KeyVaultSecretPayload, [connectionId: string]>;
    clientAppCredentials: ValidatedSecretRepository<KeyVaultSecretPayload, [appRegistrationId: string]>;
  };
  queues: QueuePublisherService;
}

export function createDataLayerService(dependencies: DataLayerDependencies): DataLayerService {
  return {
    stores: dependencies,
    tables: {
      mspTenants: new EntityTableRepository(dependencies.tables, tableNames.mspTenants, keyBuilders.entity.mspTenant),
      mspUsers: new EntityTableRepository(dependencies.tables, tableNames.mspUsers, keyBuilders.entity.mspUser),
      userPreferences: new EntityTableRepository(dependencies.tables, tableNames.userPreferences, keyBuilders.entity.userPreferences),
      userInputProfiles: new EntityTableRepository(dependencies.tables, tableNames.userInputProfiles, keyBuilders.entity.userInputProfile),
      directoryBootstrapState: new EntityTableRepository(dependencies.tables, tableNames.directoryBootstrapState, keyBuilders.entity.directoryBootstrapState),
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
      platformActionCatalog: new EntityTableRepository(dependencies.tables, tableNames.platformActionCatalog, keyBuilders.entity.platformActionCatalog),
      connectorActionMappings: new EntityTableRepository(dependencies.tables, tableNames.connectorActionMappings, keyBuilders.entity.connectorActionMapping),
      toolCapabilityProfiles: new EntityTableRepository(dependencies.tables, tableNames.toolCapabilityProfiles, keyBuilders.entity.toolCapabilityProfile),
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

export function createInMemoryDataLayerService(): DataLayerService {
  return createDataLayerService({
    tables: new InMemoryTableEntityStore(),
    blobs: new InMemoryBlobDocumentStore(),
    queues: new InMemoryQueueMessageStore(),
    secrets: new InMemorySecretValueStore(),
  });
}



