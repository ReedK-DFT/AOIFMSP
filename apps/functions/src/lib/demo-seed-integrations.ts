import {
  blobPathBuilders,
  keyBuilders,
  type ConnectionEntity,
  type ConnectorActionEntity,
  type ConnectorEntity,
  type ConnectorVersionEntity,
  type DataLayerService,
  type KeyVaultSecretPayload,
} from '../../../../src/index.js';

import { demoContext } from './demo-seed.js';

const demoTimestamp = '2026-03-12T14:00:00.000Z';
const recentTimestamp = '2026-03-12T15:25:00.000Z';

interface SeededConnection {
  entity: Omit<ConnectionEntity, 'partitionKey' | 'rowKey' | 'secretRef'>;
  secret: KeyVaultSecretPayload;
}

interface SeededConnectorBundle {
  connector: Omit<ConnectorEntity, 'partitionKey' | 'rowKey'>;
  version: Omit<ConnectorVersionEntity, 'partitionKey' | 'rowKey' | 'openApiBlobPath' | 'artifactBlobPath'>;
  actions: Array<Omit<ConnectorActionEntity, 'partitionKey' | 'rowKey'>>;
  specDocument: unknown;
  schemas: string[];
  sourceMetadata: Record<string, unknown>;
  connections: SeededConnection[];
}

export async function seedIntegrationDemoData(service: DataLayerService): Promise<void> {
  const bundles = buildSeededBundles();

  for (const bundle of bundles) {
    const { connector, version } = bundle;
    const openApiBlobPath = blobPathBuilders.connectorOpenApi(connector.mspTenantId, connector.id, version.connectorVersionId);
    const actionsBlobPath = blobPathBuilders.connectorActions(connector.mspTenantId, connector.id, version.connectorVersionId);
    const schemasBlobPath = blobPathBuilders.connectorSchemas(connector.mspTenantId, connector.id, version.connectorVersionId);
    const manifestBlobPath = blobPathBuilders.connectorManifest(connector.mspTenantId, connector.id, version.connectorVersionId);
    const sourceMetadataBlobPath = blobPathBuilders.connectorSourceMetadata(connector.mspTenantId, connector.id, version.connectorVersionId);

    await service.tables.connectors.upsert({
      ...keyBuilders.entity.connector(connector.mspTenantId, connector.id),
      ...connector,
    });

    await service.tables.connectorVersions.upsert({
      ...keyBuilders.entity.connectorVersion(connector.mspTenantId, connector.id, version.connectorVersionId),
      ...version,
      openApiBlobPath,
      artifactBlobPath: manifestBlobPath,
    });

    await Promise.all(
      bundle.actions.map((action) =>
        service.tables.connectorActions.upsert({
          ...keyBuilders.entity.connectorAction(connector.mspTenantId, connector.id, version.connectorVersionId, action.actionId),
          ...action,
        }),
      ),
    );

    await Promise.all([
      service.stores.blobs.writeJson(openApiBlobPath, bundle.specDocument),
      service.stores.blobs.writeJson(actionsBlobPath, bundle.actions),
      service.stores.blobs.writeJson(schemasBlobPath, bundle.schemas),
      service.stores.blobs.writeJson(sourceMetadataBlobPath, bundle.sourceMetadata),
      service.stores.blobs.writeJson(manifestBlobPath, {
        connectorId: connector.id,
        versionId: version.connectorVersionId,
        actionsCount: bundle.actions.length,
        schemasCount: bundle.schemas.length,
        authSchemes: JSON.parse(version.authSchemesJson ?? '[]'),
      }),
    ]);

    await Promise.all(
      bundle.connections.map(async (connection) => {
        const entity = {
          ...keyBuilders.entity.connection(
            connection.entity.mspTenantId,
            connection.entity.id,
            connection.entity.scopeType === 'client' ? connection.entity.clientTenantId : undefined,
          ),
          ...connection.entity,
          secretRef: `aoifmsp-connection-${connection.entity.id}`,
        } satisfies ConnectionEntity;

        await Promise.all([
          service.tables.connections.upsert(entity),
          service.secrets.connectionCredentials.set(connection.secret, connection.entity.id),
        ]);
      }),
    );
  }
}

function buildSeededBundles(): SeededConnectorBundle[] {
  return [
    {
      connector: {
        id: 'connector_psa',
        mspTenantId: demoContext.mspTenantId,
        displayName: 'Halo PSA',
        providerName: 'HaloPSA',
        category: 'PSA',
        sourceType: 'openapi-upload',
        defaultAuthType: 'oauth2-client-credentials',
        latestVersion: 'v1',
        status: 'active',
        visibility: 'shared',
        summary: 'Primary PSA connector for ticket, task, and note operations.',
        schemaVersion: 1,
        managementMode: 'mixed',
        createdAt: demoTimestamp,
        createdBy: 'system:seed',
        updatedAt: recentTimestamp,
        updatedBy: 'system:seed',
      },
      version: {
        id: 'connector_psa_v1',
        mspTenantId: demoContext.mspTenantId,
        connectorId: 'connector_psa',
        connectorVersionId: 'v1',
        versionLabel: '2026.1',
        status: 'published',
        importSource: 'seed://halo-openapi',
        actionsCount: 4,
        schemasCount: 3,
        authSchemesJson: JSON.stringify(['oauth2']),
        hashSha256: 'seed-halo-openapi',
        importedAt: demoTimestamp,
        importedBy: 'system:seed',
        publishedAt: demoTimestamp,
        schemaVersion: 1,
        managementMode: 'mixed',
      },
      actions: [
        buildAction('connector_psa', 'v1', 'getTicketContext', 'getTicketContext', 'Load Ticket Context', 'PSA', 'GET', '/tickets/{ticketId}/context', true, 'Load ticket, tenant, and assignment context.'),
        buildAction('connector_psa', 'v1', 'appendTicketNote', 'appendTicketNote', 'Append Ticket Note', 'PSA', 'POST', '/tickets/{ticketId}/notes', false, 'Append a note to the active ticket.'),
        buildAction('connector_psa', 'v1', 'createTask', 'createTask', 'Create Task', 'PSA', 'POST', '/tasks', false, 'Create a technician follow-up task.'),
        buildAction('connector_psa', 'v1', 'listTickets', 'listTickets', 'List Tickets', 'PSA', 'GET', '/tickets', true, 'List tickets for technician queues.'),
      ],
      specDocument: buildOpenApiDocument('Halo PSA', '2026.1', {
        '/tickets': ['get'],
        '/tickets/{ticketId}/context': ['get'],
        '/tickets/{ticketId}/notes': ['post'],
        '/tasks': ['post'],
      }),
      schemas: ['Ticket', 'TicketContext', 'TaskRequest'],
      sourceMetadata: {
        sourceType: 'openapi-upload',
        notes: ['Seeded platform PSA connector'],
      },
      connections: [
        {
          entity: buildConnectionEntity('conn_psa_primary', 'Halo PSA Primary', 'connector_psa', 'v1', 'msp', undefined, 'oauth2-client-credentials', ['tickets', 'tasks', 'notes']),
          secret: {
            authType: 'oauth2-client-credentials',
            clientId: 'seed-halo-client-id',
            clientSecret: 'seed-halo-client-secret',
            tokenUrl: 'https://auth.example.invalid/halo/token',
            scopes: ['tickets.read', 'tickets.write'],
          },
        },
      ],
    },
    {
      connector: {
        id: 'connector_rmm',
        mspTenantId: demoContext.mspTenantId,
        displayName: 'NinjaOne RMM',
        providerName: 'NinjaOne',
        category: 'RMM',
        sourceType: 'openapi-upload',
        defaultAuthType: 'oauth2-client-credentials',
        latestVersion: 'v1',
        status: 'active',
        visibility: 'shared',
        summary: 'Device, automation, and health actions for managed endpoints.',
        schemaVersion: 1,
        managementMode: 'mixed',
        createdAt: demoTimestamp,
        createdBy: 'system:seed',
        updatedAt: recentTimestamp,
        updatedBy: 'system:seed',
      },
      version: {
        id: 'connector_rmm_v1',
        mspTenantId: demoContext.mspTenantId,
        connectorId: 'connector_rmm',
        connectorVersionId: 'v1',
        versionLabel: '2026.1',
        status: 'published',
        importSource: 'seed://ninja-openapi',
        actionsCount: 3,
        schemasCount: 3,
        authSchemesJson: JSON.stringify(['oauth2']),
        hashSha256: 'seed-rmm-openapi',
        importedAt: demoTimestamp,
        importedBy: 'system:seed',
        publishedAt: demoTimestamp,
        schemaVersion: 1,
        managementMode: 'mixed',
      },
      actions: [
        buildAction('connector_rmm', 'v1', 'getDevice', 'getDevice', 'Get Device', 'RMM', 'GET', '/devices/{deviceId}', true, 'Load device details for a technician session.'),
        buildAction('connector_rmm', 'v1', 'runScript', 'runScript', 'Run Script', 'RMM', 'POST', '/devices/{deviceId}/scripts', false, 'Run a remote remediation script.'),
        buildAction('connector_rmm', 'v1', 'listAlerts', 'listAlerts', 'List Device Alerts', 'RMM', 'GET', '/alerts', true, 'List active RMM alerts.'),
      ],
      specDocument: buildOpenApiDocument('NinjaOne RMM', '2026.1', {
        '/devices/{deviceId}': ['get'],
        '/devices/{deviceId}/scripts': ['post'],
        '/alerts': ['get'],
      }),
      schemas: ['Device', 'ScriptRunRequest', 'Alert'],
      sourceMetadata: {
        sourceType: 'openapi-upload',
        notes: ['Seeded RMM connector'],
      },
      connections: [
        {
          entity: buildConnectionEntity('conn_rmm_primary', 'NinjaOne Primary', 'connector_rmm', 'v1', 'msp', undefined, 'oauth2-client-credentials', ['devices', 'scripts', 'alerts']),
          secret: {
            authType: 'oauth2-client-credentials',
            clientId: 'seed-rmm-client-id',
            clientSecret: 'seed-rmm-client-secret',
            tokenUrl: 'https://auth.example.invalid/ninja/token',
            scopes: ['devices.read', 'automation.execute'],
          },
        },
      ],
    },
    {
      connector: {
        id: 'connector_docs',
        mspTenantId: demoContext.mspTenantId,
        displayName: 'Hudu Documentation',
        providerName: 'Hudu',
        category: 'Documentation',
        sourceType: 'openapi-upload',
        defaultAuthType: 'api-key',
        latestVersion: 'v1',
        status: 'active',
        visibility: 'shared',
        summary: 'Knowledge and runbook access for technician context.',
        schemaVersion: 1,
        managementMode: 'mixed',
        createdAt: demoTimestamp,
        createdBy: 'system:seed',
        updatedAt: recentTimestamp,
        updatedBy: 'system:seed',
      },
      version: {
        id: 'connector_docs_v1',
        mspTenantId: demoContext.mspTenantId,
        connectorId: 'connector_docs',
        connectorVersionId: 'v1',
        versionLabel: '2026.1',
        status: 'published',
        importSource: 'seed://hudu-openapi',
        actionsCount: 3,
        schemasCount: 2,
        authSchemesJson: JSON.stringify(['apiKey']),
        hashSha256: 'seed-docs-openapi',
        importedAt: demoTimestamp,
        importedBy: 'system:seed',
        publishedAt: demoTimestamp,
        schemaVersion: 1,
        managementMode: 'mixed',
      },
      actions: [
        buildAction('connector_docs', 'v1', 'searchArticles', 'searchArticles', 'Search Articles', 'Documentation', 'GET', '/articles/search', true, 'Search documentation articles and runbooks.'),
        buildAction('connector_docs', 'v1', 'getAsset', 'getAsset', 'Get Asset', 'Documentation', 'GET', '/assets/{assetId}', true, 'Retrieve documentation asset context.'),
        buildAction('connector_docs', 'v1', 'appendAssetNote', 'appendAssetNote', 'Append Asset Note', 'Documentation', 'POST', '/assets/{assetId}/notes', false, 'Append an operational note to a documentation asset.'),
      ],
      specDocument: buildOpenApiDocument('Hudu Documentation', '2026.1', {
        '/articles/search': ['get'],
        '/assets/{assetId}': ['get'],
        '/assets/{assetId}/notes': ['post'],
      }),
      schemas: ['Article', 'Asset'],
      sourceMetadata: {
        sourceType: 'openapi-upload',
        notes: ['Seeded documentation connector'],
      },
      connections: [
        {
          entity: buildConnectionEntity('conn_docs_primary', 'Hudu Primary', 'connector_docs', 'v1', 'msp', undefined, 'api-key', ['articles', 'assets']),
          secret: {
            authType: 'api-key',
            apiKey: 'seed-hudu-api-key',
            headers: {
              'X-Api-Key': 'seed-hudu-api-key',
            },
          },
        },
      ],
    },
    {
      connector: {
        id: 'connector_graph',
        mspTenantId: demoContext.mspTenantId,
        displayName: 'Microsoft Graph Delegated',
        providerName: 'Microsoft Graph',
        category: 'Identity',
        sourceType: 'manual-adapter',
        defaultAuthType: 'oauth2-on-behalf-of',
        latestVersion: 'v1',
        status: 'active',
        visibility: 'shared',
        summary: 'GDAP-backed delegated tenant operations and platform-specific Graph actions.',
        schemaVersion: 1,
        managementMode: 'mixed',
        createdAt: demoTimestamp,
        createdBy: 'system:seed',
        updatedAt: recentTimestamp,
        updatedBy: 'system:seed',
      },
      version: {
        id: 'connector_graph_v1',
        mspTenantId: demoContext.mspTenantId,
        connectorId: 'connector_graph',
        connectorVersionId: 'v1',
        versionLabel: '2026.1',
        status: 'published',
        importSource: 'seed://graph-manual-adapter',
        actionsCount: 5,
        schemasCount: 4,
        authSchemesJson: JSON.stringify(['oauth2OnBehalfOf', 'gdapDelegated']),
        hashSha256: 'seed-graph-manual',
        importedAt: demoTimestamp,
        importedBy: 'system:seed',
        publishedAt: demoTimestamp,
        schemaVersion: 1,
        managementMode: 'mixed',
      },
      actions: [
        buildAction('connector_graph', 'v1', 'createUser', 'createUser', 'Create User', 'Identity', 'POST', '/users', false, 'Create a new Entra ID user in a client tenant.'),
        buildAction('connector_graph', 'v1', 'assignLicense', 'assignLicense', 'Assign License', 'Identity', 'POST', '/users/{userId}/assignLicense', false, 'Assign product licenses to a user.'),
        buildAction('connector_graph', 'v1', 'getStandardsResult', 'getStandardsResult', 'Get Standards Result', 'Standards', 'GET', '/security/standards/{standardId}', true, 'Retrieve tenant standards posture for review.'),
        buildAction('connector_graph', 'v1', 'resetPassword', 'resetPassword', 'Reset Password', 'Identity', 'POST', '/users/{userId}/resetPassword', false, 'Reset a user password with delegated admin context.'),
        buildAction('connector_graph', 'v1', 'listUsers', 'listUsers', 'List Users', 'Identity', 'GET', '/users', true, 'List tenant users through Graph.'),
      ],
      specDocument: {
        adapterType: 'manual-adapter',
        authModel: 'gdap-obo',
        endpoints: ['/users', '/users/{userId}/assignLicense', '/security/standards/{standardId}'],
      },
      schemas: ['User', 'LicenseAssignment', 'StandardsResult', 'PasswordResetRequest'],
      sourceMetadata: {
        sourceType: 'manual-adapter',
        notes: ['Seeded Graph connector representing curated platform actions'],
      },
      connections: [
        {
          entity: buildConnectionEntity('conn_graph_northwind', 'Northwind Graph', 'connector_graph', 'v1', 'client', 'tenant_northwind', 'oauth2-on-behalf-of', ['users', 'licenses', 'standards']),
          secret: {
            authType: 'oauth2-on-behalf-of',
            clientId: 'seed-graph-platform-client-id',
            tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
            scopes: ['https://graph.microsoft.com/.default'],
          },
        },
        {
          entity: buildConnectionEntity('conn_graph_wingtip', 'Wingtip Graph', 'connector_graph', 'v1', 'client', 'tenant_wingtip', 'oauth2-on-behalf-of', ['users', 'licenses', 'alerts']),
          secret: {
            authType: 'oauth2-on-behalf-of',
            clientId: 'seed-graph-platform-client-id',
            tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
            scopes: ['https://graph.microsoft.com/.default'],
          },
        },
      ],
    },
    {
      connector: {
        id: 'connector_compliance_vault',
        mspTenantId: demoContext.mspTenantId,
        displayName: 'Compliance Vault',
        providerName: 'Compliance Vault',
        category: 'Compliance',
        sourceType: 'openapi-upload',
        defaultAuthType: 'api-key',
        latestVersion: 'v1',
        status: 'active',
        visibility: 'private',
        summary: 'Custom LOB connector imported from customer-provided Swagger.',
        schemaVersion: 1,
        managementMode: 'mixed',
        createdAt: demoTimestamp,
        createdBy: 'system:seed',
        updatedAt: recentTimestamp,
        updatedBy: 'system:seed',
      },
      version: {
        id: 'connector_compliance_vault_v1',
        mspTenantId: demoContext.mspTenantId,
        connectorId: 'connector_compliance_vault',
        connectorVersionId: 'v1',
        versionLabel: '1.0.0',
        status: 'published',
        importSource: 'seed://uploaded-openapi/compliance-vault.json',
        actionsCount: 2,
        schemasCount: 2,
        authSchemesJson: JSON.stringify(['apiKey']),
        hashSha256: 'seed-compliance-openapi',
        importedAt: recentTimestamp,
        importedBy: 'system:seed',
        publishedAt: recentTimestamp,
        schemaVersion: 1,
        managementMode: 'mixed',
      },
      actions: [
        buildAction('connector_compliance_vault', 'v1', 'listFindings', 'listFindings', 'List Findings', 'Compliance', 'GET', '/findings', true, 'List open compliance findings.'),
        buildAction('connector_compliance_vault', 'v1', 'queueReview', 'queueReview', 'Queue Review', 'Compliance', 'POST', '/reviews', false, 'Queue a manual review in the external compliance system.'),
      ],
      specDocument: buildOpenApiDocument('Compliance Vault', '1.0.0', {
        '/findings': ['get'],
        '/reviews': ['post'],
      }),
      schemas: ['Finding', 'ReviewRequest'],
      sourceMetadata: {
        sourceType: 'openapi-upload',
        notes: ['Example custom imported connector'],
      },
      connections: [
        {
          entity: buildConnectionEntity('conn_compliance_vault', 'Compliance Vault Shared', 'connector_compliance_vault', 'v1', 'msp', undefined, 'api-key', ['findings', 'reviews']),
          secret: {
            authType: 'api-key',
            apiKey: 'seed-compliance-api-key',
            headers: {
              Authorization: 'Bearer seed-compliance-api-key',
            },
          },
        },
      ],
    },
  ];
}

function buildAction(
  connectorId: string,
  connectorVersionId: string,
  actionId: string,
  operationId: string,
  displayName: string,
  category: string,
  method: ConnectorActionEntity['method'],
  pathTemplate: string,
  isTriggerCapable: boolean,
  summary: string,
): Omit<ConnectorActionEntity, 'partitionKey' | 'rowKey'> {
  return {
    id: `${connectorId}_${connectorVersionId}_${actionId}`,
    mspTenantId: demoContext.mspTenantId,
    connectorId,
    connectorVersionId,
    actionId,
    operationId,
    displayName,
    category,
    method,
    pathTemplate,
    ...(category === 'Identity' ? { authRequirement: 'gdapDelegated' } : {}),
    isTriggerCapable,
    isDeprecated: false,
    summary,
  };
}

function buildConnectionEntity(
  id: string,
  displayName: string,
  connectorId: string,
  connectorVersionId: string,
  scopeType: ConnectionEntity['scopeType'],
  clientTenantId: string | undefined,
  authType: ConnectionEntity['authType'],
  capabilities: string[],
): Omit<ConnectionEntity, 'partitionKey' | 'rowKey' | 'secretRef'> {
  return {
    id,
    mspTenantId: demoContext.mspTenantId,
    ...(clientTenantId ? { clientTenantId } : {}),
    scopeType,
    connectorId,
    connectorVersionId,
    displayName,
    authType,
    status: 'active',
    healthStatus: 'healthy',
    lastTestedAt: recentTimestamp,
    lastTokenRefreshAt: recentTimestamp,
    capabilitiesJson: JSON.stringify(capabilities),
    createdAt: demoTimestamp,
    createdBy: 'system:seed',
    updatedAt: recentTimestamp,
    updatedBy: 'system:seed',
  };
}

function buildOpenApiDocument(title: string, version: string, paths: Record<string, string[]>): Record<string, unknown> {
  return {
    openapi: '3.0.3',
    info: {
      title,
      version,
    },
    paths: Object.fromEntries(
      Object.entries(paths).map(([path, methods]) => [
        path,
        Object.fromEntries(
          methods.map((method) => [
            method,
            {
              operationId: `${method}${path.replace(/[^a-zA-Z0-9]+/g, '_')}`,
              summary: `${method.toUpperCase()} ${path}`,
              tags: [title],
            },
          ]),
        ),
      ]),
    ),
  };
}

