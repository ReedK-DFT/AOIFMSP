import {
  blobPathBuilders,
  keyBuilders,
  secretNameBuilders,
  type ClientTenantEntity,
  type ConnectionAuthType,
  type ConnectionScopeType,
  type ConnectionEntity,
  type ConnectionStatus,
  type ConnectorActionEntity,
  type ConnectorActionMappingEntity,
  type ConnectorEntity,
  type ConnectorSourceType,
  type ConnectorVersionEntity,
  type DataLayerService,
  type KeyVaultSecretPayload,
  type PlatformActionCatalogEntity,
  type PlatformCapabilityDomain,
  type PlatformToolType,
  type ToolCapabilityProfileEntity,
} from '../../../../src/index.js';

import { demoContext } from './demo-seed.js';
import { buildNormalizationPreview, type NormalizationPreview } from './action-normalization.js';
import { deriveConnectorImportPreview, type ConnectorImportPreview, type ConnectorImportRequest, type DerivedConnectorAction } from './openapi-import.js';

export interface ConnectorListItem {
  id: string;
  displayName: string;
  providerName: string;
  category: string;
  sourceType: ConnectorSourceType;
  defaultAuthType: ConnectionAuthType;
  latestVersion?: string | undefined;
  status: string;
  visibility: string;
  summary?: string | undefined;
  actionCount: number;
  connectionCount: number;
  authSchemes: string[];
  lastImportedAt?: string | undefined;
}

export interface ConnectionListItem {
  id: string;
  displayName: string;
  connectorId: string;
  connectorDisplayName: string;
  connectorVersionId: string;
  scopeType: ConnectionScopeType;
  clientTenantId?: string | undefined;
  clientTenantDisplayName?: string | undefined;
  authType: ConnectionAuthType;
  status: string;
  healthStatus: string;
  baseUrlOverride?: string | undefined;
  capabilities: string[];
  lastTestedAt?: string | undefined;
}

export interface ConnectorActionSummary {
  id: string;
  operationId: string;
  displayName: string;
  category?: string | undefined;
  method: string;
  pathTemplate: string;
  inputSchemaRef?: string | undefined;
  outputSchemaRef?: string | undefined;
  authRequirement?: string | undefined;
  isTriggerCapable: boolean;
  isDeprecated: boolean;
  summary?: string | undefined;
}

export interface ConnectorVersionSummary {
  id: string;
  versionLabel: string;
  status: string;
  importSource: string;
  actionsCount: number;
  schemasCount: number;
  authSchemes: string[];
  importedAt: string;
  publishedAt?: string | undefined;
  managementMode?: string | undefined;
}

export interface ToolCapabilityProfileSummary {
  id: string;
  displayName: string;
  toolType: string;
  roleInStack: string;
  coveredDomains: string[];
  onboardingReviewStatus: string;
  reviewedBy?: string | undefined;
  lastReviewedAt?: string | undefined;
}

export interface NormalizedCatalogItem {
  normalizedActionId: string;
  displayName: string;
  capabilityDomain: string;
  objectType: string;
  verb: string;
  lifecycle: string;
  visibility: string;
  authoritativeToolType?: string | undefined;
  overlapStrategy: string;
  disposition: string;
  mappingConfidence: number;
  isEnabledByDefault: boolean;
  featureCoverage: string[];
  reviewNotes?: string | undefined;
  gapNotes?: string | undefined;
  conflictNotes?: string | undefined;
}

export interface ConnectorNormalizationResponse {
  toolProfile: ToolCapabilityProfileSummary | null;
  reviewNotes: string[];
  authoritativeToolSummary: string[];
  items: NormalizedCatalogItem[];
}

export interface ConnectorCatalogResponse {
  mspTenantId: string;
  clientTenants: Array<{
    id: string;
    displayName: string;
  }>;
  connectors: ConnectorListItem[];
  connections: ConnectionListItem[];
}

export interface ConnectorDetailResponse {
  mspTenantId: string;
  connector: ConnectorListItem;
  versions: ConnectorVersionSummary[];
  actions: ConnectorActionSummary[];
  normalization: ConnectorNormalizationResponse;
  connections: ConnectionListItem[];
}

export interface CreateConnectionRequest {
  connectionId?: string | undefined;
  displayName: string;
  connectorId: string;
  connectorVersionId?: string | undefined;
  scopeType: ConnectionScopeType;
  clientTenantId?: string | undefined;
  authType: ConnectionAuthType;
  baseUrlOverride?: string | undefined;
  capabilities?: string[];
  secret: KeyVaultSecretPayload;
}

export async function buildConnectorCatalogResponse(
  service: DataLayerService,
  mspTenantId = demoContext.mspTenantId,
): Promise<ConnectorCatalogResponse> {
  const [clientTenants, connectors, connections] = await Promise.all([
    service.tables.clientTenants.listByPartition(keyBuilders.partition.msp(mspTenantId)),
    service.tables.connectors.listByPartition(keyBuilders.partition.msp(mspTenantId)),
    listConnections(service, mspTenantId),
  ]);

  const connectorItems = await Promise.all(
    connectors.map(async (connector) => buildConnectorListItem(service, connector, connections.filter((item) => item.connectorId === connector.id))),
  );

  return {
    mspTenantId,
    clientTenants: clientTenants
      .slice()
      .sort((left, right) => left.displayName.localeCompare(right.displayName))
      .map((tenant) => ({
        id: tenant.clientTenantId,
        displayName: tenant.displayName,
      })),
    connectors: connectorItems.sort((left, right) => left.displayName.localeCompare(right.displayName)),
    connections: connections.sort((left, right) => left.displayName.localeCompare(right.displayName)),
  };
}

export async function buildConnectorDetailResponse(
  service: DataLayerService,
  connectorId: string,
  mspTenantId = demoContext.mspTenantId,
): Promise<ConnectorDetailResponse | null> {
  const [connector, catalog] = await Promise.all([
    service.tables.connectors.getByKey(mspTenantId, connectorId),
    buildConnectorCatalogResponse(service, mspTenantId),
  ]);

  if (!connector) {
    return null;
  }

  const versions = await listConnectorVersions(service, mspTenantId, connectorId);
  const latestVersionId = connector.latestVersion ?? versions[0]?.connectorVersionId;
  const actions = latestVersionId ? await listConnectorActions(service, mspTenantId, connectorId, latestVersionId) : [];
  const connectorItem = await buildConnectorListItem(service, connector, catalog.connections.filter((item) => item.connectorId === connector.id));
  const normalization = await buildConnectorNormalizationResponse(service, connector, latestVersionId ?? 'v1', actions, mspTenantId);

  return {
    mspTenantId,
    connector: connectorItem,
    versions: versions.map((version) => ({
      id: version.connectorVersionId,
      versionLabel: version.versionLabel,
      status: version.status,
      importSource: version.importSource,
      actionsCount: version.actionsCount,
      schemasCount: version.schemasCount,
      authSchemes: parseStringArray(version.authSchemesJson),
      importedAt: version.importedAt,
      publishedAt: version.publishedAt,
      managementMode: version.managementMode,
    })),
    actions: actions
      .slice()
      .sort((left, right) => left.displayName.localeCompare(right.displayName))
      .map((action) => ({
        id: action.actionId,
        operationId: action.operationId,
        displayName: action.displayName,
        category: action.category,
        method: action.method,
        pathTemplate: action.pathTemplate,
        inputSchemaRef: action.inputSchemaRef,
        outputSchemaRef: action.outputSchemaRef,
        authRequirement: action.authRequirement,
        isTriggerCapable: action.isTriggerCapable,
        isDeprecated: action.isDeprecated,
        summary: action.summary,
      })),
    normalization,
    connections: catalog.connections.filter((item) => item.connectorId === connector.id),
  };
}

export async function createPlatformConnection(
  service: DataLayerService,
  request: CreateConnectionRequest,
  mspTenantId = demoContext.mspTenantId,
  actor = 'platform-admin:api',
): Promise<ConnectionListItem> {
  const connector = await service.tables.connectors.getByKey(mspTenantId, request.connectorId);

  if (!connector) {
    throw new Error('connector_not_found');
  }

  const connectorVersionId = request.connectorVersionId ?? connector.latestVersion;

  if (!connectorVersionId) {
    throw new Error('connector_version_required');
  }

  if (request.scopeType === 'client' && !request.clientTenantId) {
    throw new Error('client_tenant_required');
  }

  if (request.scopeType === 'client' && request.clientTenantId) {
    const clientTenant = await service.tables.clientTenants.getByKey(mspTenantId, request.clientTenantId);

    if (!clientTenant) {
      throw new Error('client_tenant_not_found');
    }
  }

  const connectionId = request.connectionId?.trim() || buildConnectionId(request.connectorId, request.displayName);
  const now = new Date().toISOString();
  const secretRef = secretNameBuilders.connection(connectionId);

  const entity: ConnectionEntity = {
    ...keyBuilders.entity.connection(mspTenantId, connectionId, request.scopeType === 'client' ? request.clientTenantId : undefined),
    id: connectionId,
    mspTenantId,
    ...(request.scopeType === 'client' && request.clientTenantId ? { clientTenantId: request.clientTenantId } : {}),
    scopeType: request.scopeType,
    connectorId: request.connectorId,
    connectorVersionId,
    displayName: request.displayName.trim(),
    authType: request.authType,
    secretRef,
    ...(request.baseUrlOverride?.trim() ? { baseUrlOverride: request.baseUrlOverride.trim() } : {}),
    status: normalizeConnectionStatus(request.secret),
    healthStatus: 'unknown',
    capabilitiesJson: JSON.stringify((request.capabilities ?? []).filter(Boolean)),
    createdAt: now,
    createdBy: actor,
    updatedAt: now,
    updatedBy: actor,
  };

  await Promise.all([
    service.tables.connections.upsert(entity),
    service.secrets.connectionCredentials.set(
      {
        ...request.secret,
        authType: request.authType,
      },
      connectionId,
    ),
  ]);

  const clientTenants = await service.tables.clientTenants.listByPartition(keyBuilders.partition.msp(mspTenantId));
  const connectionList = await listConnections(service, mspTenantId, clientTenants);
  const connectionItem = connectionList.find((item) => item.id === connectionId);

  if (!connectionItem) {
    throw new Error('connection_create_failed');
  }

  return connectionItem;
}

export async function importPlatformConnector(
  service: DataLayerService,
  request: ConnectorImportRequest,
  mspTenantId = demoContext.mspTenantId,
  actor = 'platform-admin:api',
): Promise<ConnectorDetailResponse> {
  const preview = deriveConnectorImportPreview(request);
  const [existingConnector, existingVersions, existingCapabilityProfiles] = await Promise.all([
    service.tables.connectors.getByKey(mspTenantId, preview.connectorId),
    listConnectorVersions(service, mspTenantId, preview.connectorId),
    service.tables.toolCapabilityProfiles.listByPartition(keyBuilders.partition.msp(mspTenantId)),
  ]);
  const connectorVersionId = buildConnectorVersionId(existingVersions.map((item) => item.connectorVersionId));
  const now = new Date().toISOString();

  const connectorEntity: ConnectorEntity = {
    ...keyBuilders.entity.connector(mspTenantId, preview.connectorId),
    id: preview.connectorId,
    mspTenantId,
    displayName: preview.displayName,
    providerName: preview.providerName,
    category: preview.category,
    sourceType: preview.sourceType,
    defaultAuthType: preview.defaultAuthType,
    latestVersion: connectorVersionId,
    status: 'active',
    visibility: preview.visibility,
    ...(preview.summary ? { summary: preview.summary } : {}),
    ...(existingConnector?.iconBlobPath ? { iconBlobPath: existingConnector.iconBlobPath } : {}),
    schemaVersion: 1,
    managementMode: 'mixed',
    createdAt: existingConnector?.createdAt ?? now,
    createdBy: existingConnector?.createdBy ?? actor,
    updatedAt: now,
    updatedBy: actor,
  };

  const openApiBlobPath = blobPathBuilders.connectorOpenApi(mspTenantId, preview.connectorId, connectorVersionId);
  const sourceMetadataBlobPath = blobPathBuilders.connectorSourceMetadata(mspTenantId, preview.connectorId, connectorVersionId);
  const actionsBlobPath = blobPathBuilders.connectorActions(mspTenantId, preview.connectorId, connectorVersionId);
  const schemasBlobPath = blobPathBuilders.connectorSchemas(mspTenantId, preview.connectorId, connectorVersionId);
  const manifestBlobPath = blobPathBuilders.connectorManifest(mspTenantId, preview.connectorId, connectorVersionId);

  const versionEntity: ConnectorVersionEntity = {
    ...keyBuilders.entity.connectorVersion(mspTenantId, preview.connectorId, connectorVersionId),
    id: `${preview.connectorId}_${connectorVersionId}`,
    mspTenantId,
    connectorId: preview.connectorId,
    connectorVersionId,
    versionLabel: preview.versionLabel,
    status: 'published',
    importSource: preview.importSource,
    openApiBlobPath,
    artifactBlobPath: manifestBlobPath,
    actionsCount: preview.actions.length,
    schemasCount: preview.schemas.length,
    authSchemesJson: JSON.stringify(preview.authSchemes),
    hashSha256: preview.contentDigestSha256,
    importedAt: now,
    importedBy: actor,
    publishedAt: now,
    schemaVersion: 1,
    managementMode: 'mixed',
  };

  const actionEntities: ConnectorActionEntity[] = preview.actions.map((action) => ({
    ...keyBuilders.entity.connectorAction(mspTenantId, preview.connectorId, connectorVersionId, action.actionId),
    id: `${preview.connectorId}_${connectorVersionId}_${action.actionId}`,
    mspTenantId,
    connectorId: preview.connectorId,
    connectorVersionId,
    actionId: action.actionId,
    operationId: action.operationId,
    displayName: action.displayName,
    ...(action.category ? { category: action.category } : {}),
    method: action.method,
    pathTemplate: action.pathTemplate,
    ...(action.inputSchemaRef ? { inputSchemaRef: action.inputSchemaRef } : {}),
    ...(action.outputSchemaRef ? { outputSchemaRef: action.outputSchemaRef } : {}),
    ...(action.authRequirement ? { authRequirement: action.authRequirement } : {}),
    isTriggerCapable: action.isTriggerCapable,
    isDeprecated: action.isDeprecated,
    ...(action.summary ? { summary: action.summary } : {}),
  }));

  const normalization = buildNormalizationPreview(
    {
      id: preview.connectorId,
      displayName: preview.displayName,
      category: preview.category,
      providerName: preview.providerName,
    },
    {
      connectorVersionId,
    },
    {
      actions: preview.actions,
    },
    existingCapabilityProfiles,
  );

  await service.tables.connectors.upsert(connectorEntity);
  await service.tables.connectorVersions.upsert(versionEntity);
  await Promise.all(actionEntities.map((action) => service.tables.connectorActions.upsert(action)));
  await persistNormalizationArtifacts(service, mspTenantId, preview.connectorId, preview.displayName, normalization, now, actor, existingCapabilityProfiles);
  await Promise.all([
    service.stores.blobs.writeJson(openApiBlobPath, preview.sourceDocument),
    service.stores.blobs.writeJson(sourceMetadataBlobPath, {
      connectorId: preview.connectorId,
      providerName: preview.providerName,
      importSource: preview.importSource,
      sourceType: preview.sourceType,
      warnings: preview.warnings,
    }),
    service.stores.blobs.writeJson(actionsBlobPath, preview.actions),
    service.stores.blobs.writeJson(schemasBlobPath, preview.schemas),
    service.stores.blobs.writeJson(manifestBlobPath, {
      connectorId: preview.connectorId,
      versionId: connectorVersionId,
      actionCount: preview.actions.length,
      schemaCount: preview.schemas.length,
      authSchemes: preview.authSchemes,
      summary: preview.summary,
      warnings: preview.warnings,
      normalization,
    }),
  ]);

  const detail = await buildConnectorDetailResponse(service, preview.connectorId, mspTenantId);

  if (!detail) {
    throw new Error('connector_import_failed');
  }

  return detail;
}

export async function buildImportPreviewResponse(
  service: DataLayerService,
  request: ConnectorImportRequest,
  mspTenantId = demoContext.mspTenantId,
): Promise<{ preview: ConnectorImportPreview; normalization: ConnectorNormalizationResponse }> {
  const preview = deriveConnectorImportPreview(request);
  const profiles = await service.tables.toolCapabilityProfiles.listByPartition(keyBuilders.partition.msp(mspTenantId));

  const normalization = buildNormalizationPreview(
    {
      id: preview.connectorId,
      displayName: preview.displayName,
      category: preview.category,
      providerName: preview.providerName,
    },
    {
      connectorVersionId: preview.versionLabel,
    },
    {
      actions: preview.actions,
    },
    profiles,
  );

  return {
    preview,
    normalization: mapNormalizationPreviewToResponse(normalization, findToolProfile(profiles, preview.connectorId)),
  };
}

async function buildConnectorListItem(
  service: DataLayerService,
  connector: ConnectorEntity,
  relatedConnections: ConnectionListItem[],
): Promise<ConnectorListItem> {
  const versions = await listConnectorVersions(service, connector.mspTenantId, connector.id);
  const latestVersion = versions.find((item) => item.connectorVersionId === connector.latestVersion) ?? versions[0];
  const latestActions = latestVersion
    ? await listConnectorActions(service, connector.mspTenantId, connector.id, latestVersion.connectorVersionId)
    : [];

  return {
    id: connector.id,
    displayName: connector.displayName,
    providerName: connector.providerName,
    category: connector.category,
    sourceType: connector.sourceType,
    defaultAuthType: connector.defaultAuthType,
    latestVersion: connector.latestVersion,
    status: connector.status,
    visibility: connector.visibility,
    summary: connector.summary,
    actionCount: latestVersion?.actionsCount ?? latestActions.length,
    connectionCount: relatedConnections.length,
    authSchemes: latestVersion ? parseStringArray(latestVersion.authSchemesJson) : [],
    lastImportedAt: latestVersion?.importedAt,
  };
}

async function listConnections(
  service: DataLayerService,
  mspTenantId: string,
  cachedClientTenants?: ClientTenantEntity[],
): Promise<ConnectionListItem[]> {
  const clientTenants = cachedClientTenants ?? (await service.tables.clientTenants.listByPartition(keyBuilders.partition.msp(mspTenantId)));
  const [mspConnections, ...clientConnectionGroups] = await Promise.all([
    service.tables.connections.listByPartition(keyBuilders.partition.msp(mspTenantId)),
    ...clientTenants.map((tenant) => service.tables.connections.listByPartition(keyBuilders.partition.mspClient(mspTenantId, tenant.clientTenantId))),
  ]);

  const allConnections = [...mspConnections, ...clientConnectionGroups.flat()];
  const connectors = await service.tables.connectors.listByPartition(keyBuilders.partition.msp(mspTenantId));
  const connectorNames = new Map(connectors.map((connector) => [connector.id, connector.displayName]));
  const clientNames = new Map(clientTenants.map((tenant) => [tenant.clientTenantId, tenant.displayName]));

  return allConnections.map((connection) => ({
    id: connection.id,
    displayName: connection.displayName,
    connectorId: connection.connectorId,
    connectorDisplayName: connectorNames.get(connection.connectorId) ?? connection.connectorId,
    connectorVersionId: connection.connectorVersionId,
    scopeType: connection.scopeType,
    clientTenantId: connection.clientTenantId,
    clientTenantDisplayName: connection.clientTenantId ? clientNames.get(connection.clientTenantId) : undefined,
    authType: connection.authType,
    status: connection.status,
    healthStatus: connection.healthStatus,
    baseUrlOverride: connection.baseUrlOverride,
    capabilities: parseStringArray(connection.capabilitiesJson),
    lastTestedAt: connection.lastTestedAt,
  }));
}

async function listConnectorVersions(
  service: DataLayerService,
  mspTenantId: string,
  connectorId: string,
): Promise<ConnectorVersionEntity[]> {
  return (await service.tables.connectorVersions.listByPartition(keyBuilders.partition.mspConnector(mspTenantId, connectorId)))
    .slice()
    .sort((left, right) => compareIsoDates(right.importedAt, left.importedAt));
}

async function listConnectorActions(
  service: DataLayerService,
  mspTenantId: string,
  connectorId: string,
  connectorVersionId: string,
): Promise<ConnectorActionEntity[]> {
  return service.tables.connectorActions.listByPartition(
    `${keyBuilders.partition.mspConnector(mspTenantId, connectorId)}|VER#${connectorVersionId}`,
  );
}

async function persistNormalizationArtifacts(
  service: DataLayerService,
  mspTenantId: string,
  connectorId: string,
  connectorDisplayName: string,
  normalization: NormalizationPreview,
  now: string,
  actor: string,
  existingCapabilityProfiles: ToolCapabilityProfileEntity[],
): Promise<void> {
  const existingActions = await Promise.all(
    normalization.drafts.map((draft) => service.tables.platformActionCatalog.getByKey(mspTenantId, draft.platformAction.normalizedActionId)),
  );
  const existingMappings = await Promise.all(
    normalization.drafts.map((draft) =>
      service.tables.connectorActionMappings.getByKey(
        mspTenantId,
        draft.mapping.normalizedActionId,
        draft.mapping.connectorId,
        draft.mapping.connectorVersionId,
        draft.mapping.actionId,
      ),
    ),
  );

  await Promise.all([
    ...normalization.drafts.map((draft, index) => {
      const existingAction = existingActions[index];
      const entity: PlatformActionCatalogEntity = {
        ...keyBuilders.entity.platformActionCatalog(mspTenantId, draft.platformAction.normalizedActionId),
        ...draft.platformAction,
        mspTenantId,
        createdAt: existingAction?.createdAt ?? now,
        createdBy: existingAction?.createdBy ?? actor,
        updatedAt: now,
        updatedBy: actor,
      };
      return service.tables.platformActionCatalog.upsert(entity);
    }),
    ...normalization.drafts.map((draft, index) => {
      const existingMapping = existingMappings[index];
      const entity: ConnectorActionMappingEntity = {
        ...keyBuilders.entity.connectorActionMapping(
          mspTenantId,
          draft.mapping.normalizedActionId,
          draft.mapping.connectorId,
          draft.mapping.connectorVersionId,
          draft.mapping.actionId,
        ),
        ...draft.mapping,
        mspTenantId,
        createdAt: existingMapping?.createdAt ?? now,
        createdBy: existingMapping?.createdBy ?? actor,
        updatedAt: now,
        updatedBy: actor,
      };
      return service.tables.connectorActionMappings.upsert(entity);
    }),
    upsertToolCapabilityProfile(service, mspTenantId, connectorId, connectorDisplayName, normalization, now, actor, existingCapabilityProfiles),
  ]);
}

async function upsertToolCapabilityProfile(
  service: DataLayerService,
  mspTenantId: string,
  connectorId: string,
  connectorDisplayName: string,
  normalization: NormalizationPreview,
  now: string,
  actor: string,
  existingCapabilityProfiles: ToolCapabilityProfileEntity[],
): Promise<void> {
  const profileId = `${normalization.toolType}_${connectorId}`;
  const existingProfile = existingCapabilityProfiles.find((profile) => profile.profileId === profileId);
  const profile: ToolCapabilityProfileEntity = {
    ...keyBuilders.entity.toolCapabilityProfile(mspTenantId, profileId),
    id: profileId,
    mspTenantId,
    profileId,
    displayName: `${toDisplayToolType(normalization.toolType)} · ${connectorDisplayName}`,
    toolType: normalization.toolType,
    connectorId,
    roleInStack: deriveToolRole(normalization.drafts),
    coveredDomainsJson: JSON.stringify(normalization.coveredDomains),
    overlapPolicyJson: JSON.stringify(buildOverlapPolicy(normalization.drafts)),
    observedCapabilitiesJson: JSON.stringify(normalization.drafts.map((draft) => draft.platformAction.normalizedActionId)),
    gapsJson: JSON.stringify(buildGapSummary(normalization.drafts)),
    onboardingReviewStatus: existingProfile?.onboardingReviewStatus ?? 'pending',
    ...(existingProfile?.lastReviewedAt ? { lastReviewedAt: existingProfile.lastReviewedAt } : {}),
    ...(existingProfile?.reviewedBy ? { reviewedBy: existingProfile.reviewedBy } : {}),
    schemaVersion: 1,
    createdAt: existingProfile?.createdAt ?? now,
    createdBy: existingProfile?.createdBy ?? actor,
    updatedAt: now,
    updatedBy: actor,
  };

  await service.tables.toolCapabilityProfiles.upsert(profile);
}

async function buildConnectorNormalizationResponse(
  service: DataLayerService,
  connector: ConnectorEntity,
  connectorVersionId: string,
  actions: ConnectorActionEntity[],
  mspTenantId: string,
): Promise<ConnectorNormalizationResponse> {
  const [profiles, platformActions] = await Promise.all([
    service.tables.toolCapabilityProfiles.listByPartition(keyBuilders.partition.msp(mspTenantId)),
    service.tables.platformActionCatalog.listByPartition(keyBuilders.partition.msp(mspTenantId)),
  ]);
  const toolProfile = findToolProfile(profiles, connector.id);
  const previewNormalization = buildNormalizationPreview(
    {
      id: connector.id,
      displayName: connector.displayName,
      category: connector.category,
      providerName: connector.providerName,
    },
    {
      connectorVersionId,
    },
    {
      actions: actions.map(toDerivedConnectorAction),
    },
    profiles,
  );

  if (platformActions.length === 0) {
    return mapNormalizationPreviewToResponse(previewNormalization, toolProfile);
  }

  const mappingGroups = await Promise.all(
    platformActions.map((platformAction) =>
      service.tables.connectorActionMappings.listByPartition(buildConnectorActionMappingPartition(mspTenantId, platformAction.normalizedActionId)),
    ),
  );

  const connectorMappings = mappingGroups.flat().filter((mapping) => mapping.connectorId === connector.id && mapping.connectorVersionId === connectorVersionId);

  if (connectorMappings.length === 0) {
    return mapNormalizationPreviewToResponse(previewNormalization, toolProfile);
  }

  const platformActionIndex = new Map(platformActions.map((platformAction) => [platformAction.normalizedActionId, platformAction]));

  return {
    toolProfile: mapToolProfileSummary(toolProfile),
    reviewNotes: previewNormalization.reviewNotes,
    authoritativeToolSummary: previewNormalization.authoritativeToolSummary,
    items: connectorMappings
      .map((mapping) => buildNormalizedCatalogItem(platformActionIndex.get(mapping.normalizedActionId), mapping))
      .filter((item): item is NormalizedCatalogItem => item !== null)
      .sort((left, right) => left.capabilityDomain.localeCompare(right.capabilityDomain) || left.displayName.localeCompare(right.displayName)),
  };
}

function mapNormalizationPreviewToResponse(
  normalization: NormalizationPreview,
  toolProfile: ToolCapabilityProfileEntity | null,
): ConnectorNormalizationResponse {
  return {
    toolProfile: mapToolProfileSummary(toolProfile),
    reviewNotes: normalization.reviewNotes,
    authoritativeToolSummary: normalization.authoritativeToolSummary,
    items: normalization.drafts
      .map((draft) => ({
        normalizedActionId: draft.platformAction.normalizedActionId,
        displayName: draft.platformAction.displayName,
        capabilityDomain: draft.platformAction.capabilityDomain,
        objectType: draft.platformAction.objectType,
        verb: draft.platformAction.verb,
        lifecycle: draft.platformAction.lifecycle,
        visibility: draft.platformAction.visibility,
        authoritativeToolType: draft.platformAction.authoritativeToolType,
        overlapStrategy: draft.platformAction.overlapStrategy,
        disposition: draft.mapping.disposition,
        mappingConfidence: draft.mapping.mappingConfidence,
        isEnabledByDefault: draft.mapping.isEnabledByDefault,
        featureCoverage: parseStringArray(draft.mapping.featureCoverageJson),
        ...(draft.mapping.reviewNotes ? { reviewNotes: draft.mapping.reviewNotes } : {}),
        ...(draft.mapping.gapNotes ? { gapNotes: draft.mapping.gapNotes } : {}),
        ...(draft.mapping.conflictNotes ? { conflictNotes: draft.mapping.conflictNotes } : {}),
      }))
      .sort((left, right) => left.capabilityDomain.localeCompare(right.capabilityDomain) || left.displayName.localeCompare(right.displayName)),
  };
}

function buildNormalizedCatalogItem(
  platformAction: PlatformActionCatalogEntity | undefined,
  mapping: ConnectorActionMappingEntity,
): NormalizedCatalogItem | null {
  if (!platformAction) {
    return null;
  }

  return {
    normalizedActionId: platformAction.normalizedActionId,
    displayName: platformAction.displayName,
    capabilityDomain: platformAction.capabilityDomain,
    objectType: platformAction.objectType,
    verb: platformAction.verb,
    lifecycle: platformAction.lifecycle,
    visibility: platformAction.visibility,
    authoritativeToolType: platformAction.authoritativeToolType,
    overlapStrategy: platformAction.overlapStrategy,
    disposition: mapping.disposition,
    mappingConfidence: mapping.mappingConfidence,
    isEnabledByDefault: mapping.isEnabledByDefault,
    featureCoverage: parseStringArray(mapping.featureCoverageJson),
    ...(mapping.reviewNotes ? { reviewNotes: mapping.reviewNotes } : {}),
    ...(mapping.gapNotes ? { gapNotes: mapping.gapNotes } : {}),
    ...(mapping.conflictNotes ? { conflictNotes: mapping.conflictNotes } : {}),
  };
}

function mapToolProfileSummary(profile: ToolCapabilityProfileEntity | null): ToolCapabilityProfileSummary | null {
  if (!profile) {
    return null;
  }

  return {
    id: profile.profileId,
    displayName: profile.displayName,
    toolType: profile.toolType,
    roleInStack: profile.roleInStack,
    coveredDomains: parseStringArray(profile.coveredDomainsJson),
    onboardingReviewStatus: profile.onboardingReviewStatus,
    ...(profile.reviewedBy ? { reviewedBy: profile.reviewedBy } : {}),
    ...(profile.lastReviewedAt ? { lastReviewedAt: profile.lastReviewedAt } : {}),
  };
}

function findToolProfile(profiles: ToolCapabilityProfileEntity[], connectorId: string): ToolCapabilityProfileEntity | null {
  return profiles.find((profile) => profile.connectorId === connectorId) ?? null;
}

function toDerivedConnectorAction(action: ConnectorActionEntity): DerivedConnectorAction {
  return {
    actionId: action.actionId,
    operationId: action.operationId,
    displayName: action.displayName,
    category: action.category,
    method: action.method,
    pathTemplate: action.pathTemplate,
    inputSchemaRef: action.inputSchemaRef,
    outputSchemaRef: action.outputSchemaRef,
    authRequirement: action.authRequirement,
    isTriggerCapable: action.isTriggerCapable,
    isDeprecated: action.isDeprecated,
    summary: action.summary,
  };
}

function buildConnectorActionMappingPartition(mspTenantId: string, normalizedActionId: string): string {
  return `${keyBuilders.partition.msp(mspTenantId)}|PACTION#${normalizedActionId}`;
}
function deriveToolRole(
  drafts: NormalizationPreview['drafts'],
): ToolCapabilityProfileEntity['roleInStack'] {
  if (drafts.some((draft) => draft.mapping.disposition === 'authoritative')) {
    return 'authoritative';
  }

  if (drafts.some((draft) => draft.mapping.disposition === 'augmenting' || draft.mapping.disposition === 'fallback')) {
    return 'supporting';
  }

  if (drafts.every((draft) => draft.mapping.disposition === 'disabled' || draft.mapping.disposition === 'redundant')) {
    return 'unknown';
  }

  return 'legacy';
}

function buildOverlapPolicy(
  drafts: ReturnType<typeof buildNormalizationPreview>['drafts'],
): Record<string, string[]> {
  return drafts.reduce<Record<string, string[]>>((accumulator, draft) => {
    const domain = draft.platformAction.capabilityDomain;
    if (!accumulator[domain]) {
      accumulator[domain] = [];
    }

    accumulator[domain].push(`${draft.platformAction.verb}:${draft.mapping.disposition}`);
    return accumulator;
  }, {});
}

function buildGapSummary(
  drafts: ReturnType<typeof buildNormalizationPreview>['drafts'],
): Array<{ domain: PlatformCapabilityDomain; note: string }> {
  return drafts
    .filter((draft) => draft.mapping.disposition === 'fallback' || draft.mapping.disposition === 'disabled')
    .map((draft) => ({
      domain: draft.platformAction.capabilityDomain,
      note: draft.mapping.reviewNotes ?? 'Requires review before default enablement.',
    }));
}

function toDisplayToolType(toolType: PlatformToolType): string {
  switch (toolType) {
    case 'psa':
      return 'PSA';
    case 'rmm':
      return 'RMM';
    case 'documentation':
      return 'Documentation';
    case 'graph':
      return 'Graph';
    case 'identity':
      return 'Identity';
    default:
      return 'Custom';
  }
}

function parseStringArray(value?: string): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function compareIsoDates(left?: string, right?: string): number {
  return new Date(left ?? 0).getTime() - new Date(right ?? 0).getTime();
}

function buildConnectionId(connectorId: string, displayName: string): string {
  const normalized = `${connectorId}_${displayName}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 42);

  return `conn_${normalized}_${Date.now().toString().slice(-4)}`;
}

function buildConnectorVersionId(existingVersionIds: string[]): string {
  const versionNumbers = existingVersionIds
    .map((value) => /^v(?<number>\d+)$/i.exec(value)?.groups?.number)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

  const nextVersion = versionNumbers.length > 0 ? Math.max(...versionNumbers) + 1 : 1;
  return `v${nextVersion}`;
}

function normalizeConnectionStatus(secret: KeyVaultSecretPayload): ConnectionStatus {
  if (secret.authType === 'api-key' && !secret.apiKey) {
    return 'error';
  }

  if (secret.authType === 'oauth2-client-credentials' && (!secret.clientId || !secret.clientSecret)) {
    return 'error';
  }

  if (secret.authType === 'basic-auth' && (!secret.username || !secret.password)) {
    return 'error';
  }

  return 'active';
}
