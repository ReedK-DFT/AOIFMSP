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
  clientTenantId?: string;
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
    category?: string;
    summary?: string;
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
    summary?: string;
  }>;
  recommendedWorkflows: WorkflowListItem[];
}

async function readJson<TResponse>(input: RequestInfo | URL): Promise<TResponse> {
  const response = await fetch(input);

  if (!response.ok) {
    throw new Error(`Failed request: ${response.status}`);
  }

  return response.json() as Promise<TResponse>;
}

export function fetchBootstrapContext(): Promise<BootstrapContextResponse> {
  return readJson('/api/bootstrap/context');
}

export function fetchSession(mspTenantId = 'msp_demo'): Promise<SessionResponse> {
  return readJson(`/api/session?mspTenantId=${encodeURIComponent(mspTenantId)}`);
}

export function fetchWorkflows(mspTenantId = 'msp_demo'): Promise<WorkflowListResponse> {
  return readJson(`/api/workflows?mspTenantId=${encodeURIComponent(mspTenantId)}`);
}

export function fetchTechnicianHome(mspTenantId = 'msp_demo'): Promise<TechnicianHomeResponse> {
  return readJson(`/api/technician/home?mspTenantId=${encodeURIComponent(mspTenantId)}`);
}

export function fetchTenants(mspTenantId = 'msp_demo'): Promise<TenantListResponse> {
  return readJson(`/api/tenants?mspTenantId=${encodeURIComponent(mspTenantId)}`);
}

export function fetchTenantDetail(clientTenantId: string, mspTenantId = 'msp_demo'): Promise<TenantDetailResponse> {
  return readJson(`/api/tenants/${encodeURIComponent(clientTenantId)}?mspTenantId=${encodeURIComponent(mspTenantId)}`);
}
