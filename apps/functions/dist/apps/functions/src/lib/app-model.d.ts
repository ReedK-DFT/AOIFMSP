import { type DataLayerService } from '../../../../src/index.js';
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
export interface WorkflowSummary {
    id: string;
    displayName: string;
    status: string;
    designAssistantMode: string;
    description?: string | undefined;
}
export interface TechnicianTicketSummary {
    id: string;
    title: string;
    priority: string;
    status: string;
    summary: string;
    sourceSystem: string;
    boardOrQueue?: string | undefined;
    clientTenantId?: string | undefined;
    tenantDisplayName?: string | undefined;
    relatedUserDisplayName?: string | undefined;
    relatedDeviceName?: string | undefined;
    recommendedWorkflowIds: string[];
    recommendedWorkflowNames: string[];
    sourceUrl?: string | undefined;
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
        tenantDisplayName?: string | undefined;
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
    lastSuccessfulSyncAt?: string | undefined;
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
        platform?: string | undefined;
        status: string;
        lastSeenAt?: string | undefined;
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
        lastSuccessfulSyncAt?: string | undefined;
        recordCount?: number | undefined;
    }>;
    standards: Array<{
        standardId: string;
        status: string;
        severity: string;
        summary?: string | undefined;
    }>;
    recommendedWorkflows: WorkflowSummary[];
}
export declare function buildSessionResponse(service: DataLayerService, currentRuntimeMode: 'memory' | 'azure', mspTenantId?: string, userObjectId?: string): Promise<SessionResponse | null>;
export declare function buildWorkflowSummaries(service: DataLayerService, mspTenantId?: string): Promise<WorkflowSummary[]>;
export declare function buildTechnicianHomeResponse(service: DataLayerService, mspTenantId?: string): Promise<TechnicianHomeResponse>;
export declare function buildTenantListResponse(service: DataLayerService, mspTenantId?: string): Promise<TenantListResponse>;
export declare function buildTenantDetailResponse(service: DataLayerService, clientTenantId: string, mspTenantId?: string): Promise<TenantDetailResponse | null>;
//# sourceMappingURL=app-model.d.ts.map