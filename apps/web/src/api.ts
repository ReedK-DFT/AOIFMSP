import type { WorkflowDocument } from '../../../src/data-layer/workflows';
import {
  createMockConnection,
  getMockWorkflowDetail,
  importMockConnector,
  mockBootstrapContext,
  mockConnectorCatalog,
  mockConnectorDetails,
  mockSession,
  mockTechnicianHome,
  mockTenantDetails,
  mockTenants,
  mockWorkflows,
  previewMockConnectorImport,
  saveMockWorkflowDraft,
} from './mock-data';

export interface NavigationItem {
  id: string;
  label: string;
  description: string;
}

export interface WorkflowRecommendation {
  id: string;
  title: string;
  category: string;
  summary: string;
}

export interface BootstrapContextResponse {
  product: {
    name: string;
    tagline: string;
  };
  branding: {
    mspName: string;
    abbreviation: string;
    colors: {
      primary: string;
      secondary: string;
      surface: string;
    };
    logos: {
      markUrl?: string | undefined;
      wordmarkUrl?: string | undefined;
    };
  };
  navigation: NavigationItem[];
  recommendedWorkflows: WorkflowRecommendation[];
  featureExposureModes: string[];
  inputModel: {
    profileSupport: boolean;
    surfaces: string[];
  };
}

export interface WorkflowListItem {
  id: string;
  displayName: string;
  status: string;
  designAssistantMode: string;
  description?: string;
}

export interface WorkflowListResponse {
  mspTenantId: string;
  items: WorkflowListItem[];
}

export interface WorkflowAvailableAction {
  id: string;
  connectorId: string;
  connectorDisplayName: string;
  connectorVersionId: string;
  actionId: string;
  displayName: string;
  category?: string | undefined;
  method: string;
  pathTemplate: string;
  summary?: string | undefined;
  isTriggerCapable: boolean;
  suggestedConnectionIds: string[];
}

export interface WorkflowDetailResponse {
  mspTenantId: string;
  workflow: WorkflowListItem & {
    defaultClientTenantId?: string | undefined;
    triggerModeSummary?: string | undefined;
    lastRunAt?: string | undefined;
    lastRunStatus?: string | undefined;
  };
  draft: WorkflowDocument;
  availableActions: WorkflowAvailableAction[];
  availableConnections: ConnectionListItem[];
}

export interface SaveWorkflowDraftRequest {
  draft: WorkflowDocument;
  displayName?: string | undefined;
  description?: string | undefined;
}

export interface SessionResponse {
  runtimeMode: 'memory' | 'azure';
  operator: {
    userObjectId: string;
    displayName: string;
    userPrincipalName: string;
    roles: string[];
    featureExposureMode: string;
    preferredStartSurface: string;
    defaultInputProfile: {
      profileId: string;
      displayName: string;
      surfaceScope: string;
      bindings: string[];
    } | null;
  };
  mspTenant: {
    id: string;
    displayName: string;
    primaryDomain: string;
    gdapRelationshipState: string;
    preferredFoundrySetupMode: string;
    defaultAdminAuthMode: string;
  };
}

export interface TechnicianTicketSummary {
  id: string;
  title: string;
  priority: string;
  status: string;
  summary: string;
  sourceSystem: string;
  boardOrQueue?: string;
  clientTenantId?: string | undefined;
  tenantDisplayName?: string;
  relatedUserDisplayName?: string;
  relatedDeviceName?: string;
  recommendedWorkflowIds: string[];
  recommendedWorkflowNames: string[];
  sourceUrl?: string;
}

export interface TechnicianHomeResponse {
  mspTenantId: string;
  queueSummary: Array<{
    label: string;
    count: number;
  }>;
  highlightedTicket: TechnicianTicketSummary | null;
  tickets: TechnicianTicketSummary[];
  activeAlerts: Array<{
    id: string;
    title: string;
    severity: string;
    summary: string;
    tenantDisplayName?: string;
  }>;
}

export interface TenantListItem {
  id: string;
  displayName: string;
  primaryDomain: string;
  status: string;
  gdapRelationshipState: string;
  openTicketCount: number;
  driftAlertCount: number;
  managedUserCount: number;
  lastSuccessfulSyncAt?: string;
}

export interface TenantListResponse {
  mspTenantId: string;
  items: TenantListItem[];
}

export interface TenantDetailResponse {
  mspTenantId: string;
  tenant: TenantListItem & {
    onboardingState: string;
    defaultAdminAuthMode: string;
    managementCapabilities: string[];
  };
  managedUsers: Array<{
    id: string;
    displayName: string;
    userPrincipalName: string;
    status: string;
    licenses: string[];
  }>;
  devices: Array<{
    id: string;
    displayName: string;
    platform?: string;
    status: string;
    lastSeenAt?: string;
  }>;
  documentation: Array<{
    id: string;
    displayName: string;
    category?: string | undefined;
    summary?: string | undefined;
  }>;
  alerts: Array<{
    id: string;
    title: string;
    severity: string;
    status: string;
    summary: string;
  }>;
  syncState: Array<{
    datasetName: string;
    status: string;
    lastSuccessfulSyncAt?: string;
    recordCount?: number;
  }>;
  standards: Array<{
    standardId: string;
    status: string;
    severity: string;
    summary?: string | undefined;
  }>;
  recommendedWorkflows: WorkflowListItem[];
}

export interface ConnectorListItem {
  id: string;
  displayName: string;
  providerName: string;
  category: string;
  sourceType: string;
  defaultAuthType: string;
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
  scopeType: 'msp' | 'client';
  clientTenantId?: string | undefined;
  clientTenantDisplayName?: string | undefined;
  authType: string;
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

export interface ConnectorImportRequest {
  connectorId?: string | undefined;
  displayName?: string | undefined;
  providerName?: string | undefined;
  category?: string | undefined;
  sourceType: 'openapi-upload' | 'openapi-url' | 'manual-adapter';
  defaultAuthType?: string | undefined;
  visibility?: 'private' | 'shared' | undefined;
  versionLabel?: string | undefined;
  importSource?: string | undefined;
  specificationText?: string | undefined;
  documentationText?: string | undefined;
  documentationUrl?: string | undefined;
  summary?: string | undefined;
}

export interface ConnectorImportPreview {
  connectorId: string;
  displayName: string;
  providerName: string;
  category: string;
  sourceType: string;
  defaultAuthType: string;
  visibility: string;
  versionLabel: string;
  importSource: string;
  summary?: string | undefined;
  authSchemes: string[];
  schemas: string[];
  actions: ConnectorActionSummary[];
  contentDigestSha256: string;
  warnings: string[];
  sourceDocument: unknown;
}

export interface ConnectorImportPreviewResponse {
  preview: ConnectorImportPreview;
  normalization: ConnectorNormalizationResponse;
}

export interface CreateConnectionRequest {
  connectionId?: string | undefined;
  displayName: string;
  connectorId: string;
  connectorVersionId?: string | undefined;
  scopeType: 'msp' | 'client';
  clientTenantId?: string | undefined;
  authType: string;
  baseUrlOverride?: string | undefined;
  capabilities?: string[] | undefined;
  secret: {
    authType: string;
    clientId?: string;
    clientSecret?: string;
    tokenUrl?: string;
    scopes?: string[];
    username?: string;
    password?: string;
    apiKey?: string;
    headers?: Record<string, string>;
  };
}

type ApiMode = 'mock' | 'functions';

const apiMode = ((import.meta.env.VITE_AOIFMSP_API_MODE as string | undefined) ?? 'mock') as ApiMode;
const configuredApiBaseUrl = (import.meta.env.VITE_AOIFMSP_API_BASE_URL as string | undefined)?.trim();

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, '');
}

function buildApiUrl(path: string): string {
  if (apiMode === 'functions' && configuredApiBaseUrl) {
    return `${normalizeBaseUrl(configuredApiBaseUrl)}${path}`;
  }

  return path;
}

async function readJson<TResponse>(input: RequestInfo | URL): Promise<TResponse> {
  const response = await fetch(input);

  if (!response.ok) {
    throw new Error(`Failed request: ${response.status}`);
  }

  return response.json() as Promise<TResponse>;
}

async function postJson<TRequest, TResponse>(path: string, body: TRequest): Promise<TResponse> {
  const response = await fetch(buildApiUrl(path), {
    method: 'POST',
    headers: {
      'content-type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Failed request: ${response.status}`);
  }

  return response.json() as Promise<TResponse>;
}

function delay<TResponse>(value: TResponse): Promise<TResponse> {
  return Promise.resolve(structuredClone(value));
}

export function fetchBootstrapContext(): Promise<BootstrapContextResponse> {
  if (apiMode === 'mock') {
    return delay(mockBootstrapContext as BootstrapContextResponse);
  }

  return readJson(buildApiUrl('/api/bootstrap/context'));
}

export function fetchSession(mspTenantId = 'msp_demo'): Promise<SessionResponse> {
  if (apiMode === 'mock') {
    return delay({ ...mockSession, mspTenant: { ...mockSession.mspTenant, id: mspTenantId } } as SessionResponse);
  }

  return readJson(buildApiUrl(`/api/session?mspTenantId=${encodeURIComponent(mspTenantId)}`));
}

export function fetchWorkflows(mspTenantId = 'msp_demo'): Promise<WorkflowListResponse> {
  if (apiMode === 'mock') {
    return delay({ ...mockWorkflows, mspTenantId } as WorkflowListResponse);
  }

  return readJson(buildApiUrl(`/api/workflows?mspTenantId=${encodeURIComponent(mspTenantId)}`));
}

export function fetchWorkflowDetail(workflowId: string, mspTenantId = 'msp_demo'): Promise<WorkflowDetailResponse> {
  if (apiMode === 'mock') {
    return delay(getMockWorkflowDetail(workflowId, mspTenantId) as WorkflowDetailResponse);
  }

  return readJson(buildApiUrl(`/api/workflows/${encodeURIComponent(workflowId)}?mspTenantId=${encodeURIComponent(mspTenantId)}`));
}

export function saveWorkflowDraft(
  workflowId: string,
  request: SaveWorkflowDraftRequest,
  mspTenantId = 'msp_demo',
): Promise<WorkflowDetailResponse> {
  if (apiMode === 'mock') {
    return delay(saveMockWorkflowDraft(workflowId, request, mspTenantId) as WorkflowDetailResponse);
  }

  return fetch(buildApiUrl(`/api/workflows/${encodeURIComponent(workflowId)}?mspTenantId=${encodeURIComponent(mspTenantId)}`), {
    method: 'PUT',
    headers: {
      'content-type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(request),
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Failed request: ${response.status}`);
    }

    return (await response.json()) as WorkflowDetailResponse;
  });
}

export function fetchTechnicianHome(mspTenantId = 'msp_demo'): Promise<TechnicianHomeResponse> {
  if (apiMode === 'mock') {
    return delay({ ...mockTechnicianHome, mspTenantId } as TechnicianHomeResponse);
  }

  return readJson(buildApiUrl(`/api/technician/home?mspTenantId=${encodeURIComponent(mspTenantId)}`));
}

export function fetchTenants(mspTenantId = 'msp_demo'): Promise<TenantListResponse> {
  if (apiMode === 'mock') {
    return delay({ ...mockTenants, mspTenantId } as TenantListResponse);
  }

  return readJson(buildApiUrl(`/api/tenants?mspTenantId=${encodeURIComponent(mspTenantId)}`));
}

export function fetchTenantDetail(clientTenantId: string, mspTenantId = 'msp_demo'): Promise<TenantDetailResponse> {
  if (apiMode === 'mock') {
    const detail = mockTenantDetails[clientTenantId as keyof typeof mockTenantDetails] ?? mockTenantDetails.tenant_northwind;
    return delay({ ...detail, mspTenantId } as TenantDetailResponse);
  }

  return readJson(
    buildApiUrl(`/api/tenants/${encodeURIComponent(clientTenantId)}?mspTenantId=${encodeURIComponent(mspTenantId)}`),
  );
}

export function fetchConnectors(mspTenantId = 'msp_demo'): Promise<ConnectorCatalogResponse> {
  if (apiMode === 'mock') {
    return delay({ ...mockConnectorCatalog, mspTenantId } as ConnectorCatalogResponse);
  }

  return readJson(buildApiUrl(`/api/connectors?mspTenantId=${encodeURIComponent(mspTenantId)}`));
}

export function fetchConnectorDetail(connectorId: string, mspTenantId = 'msp_demo'): Promise<ConnectorDetailResponse> {
  if (apiMode === 'mock') {
    const detail = mockConnectorDetails[connectorId as keyof typeof mockConnectorDetails] ?? mockConnectorDetails.connector_psa;
    return delay({ ...detail, mspTenantId } as ConnectorDetailResponse);
  }

  return readJson(
    buildApiUrl(`/api/connectors/${encodeURIComponent(connectorId)}?mspTenantId=${encodeURIComponent(mspTenantId)}`),
  );
}

export function previewConnectorImport(request: ConnectorImportRequest): Promise<ConnectorImportPreviewResponse> {
  if (apiMode === 'mock') {
    return delay(previewMockConnectorImport(request) as ConnectorImportPreviewResponse);
  }

  return postJson<ConnectorImportRequest, ConnectorImportPreviewResponse>('/api/connectors/import-preview', request);
}

export function importConnector(request: ConnectorImportRequest, mspTenantId = 'msp_demo'): Promise<ConnectorDetailResponse> {
  if (apiMode === 'mock') {
    return delay(importMockConnector(request, mspTenantId) as ConnectorDetailResponse);
  }

  return postJson<ConnectorImportRequest, ConnectorDetailResponse>(
    `/api/connectors/import?mspTenantId=${encodeURIComponent(mspTenantId)}`,
    request,
  );
}

export function createConnection(request: CreateConnectionRequest): Promise<ConnectionListItem> {
  if (apiMode === 'mock') {
    return delay(createMockConnection(request) as ConnectionListItem);
  }

  return postJson<CreateConnectionRequest, ConnectionListItem>('/api/connections', request);
}

export function currentApiMode(): ApiMode {
  return apiMode;
}



