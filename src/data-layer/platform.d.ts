import type { AdminAuthMode, AuditedEntity, BlobPath, FoundrySetupMode, GuidString, JsonObject, TableEntityAddress, TableSystemFields, UserBindingMap } from './common';
export type MspTenantStatus = 'active' | 'onboarding' | 'suspended' | 'disabled';
export type MspUserStatus = 'active' | 'invited' | 'disabled';
export type FeatureExposureMode = 'guided' | 'standard' | 'advanced';
export type SurfaceScope = 'global' | 'workflow-designer' | 'tenant-admin' | 'technician-workspace';
export type FoundryProjectStatus = 'active' | 'disabled' | 'error';
export interface MspTenantEntity extends TableEntityAddress, TableSystemFields, AuditedEntity {
    id: string;
    m365TenantId: GuidString;
    displayName: string;
    primaryDomain: string;
    status: MspTenantStatus;
    billingState: string;
    defaultRegion: string;
    settingsBlobPath?: BlobPath;
    preferredFoundrySetupMode: FoundrySetupMode;
    gdapRelationshipState: string;
    defaultAdminAuthMode: AdminAuthMode;
    schemaVersion: number;
}
export interface MspUserEntity extends TableEntityAddress, TableSystemFields, AuditedEntity {
    id: string;
    mspTenantId: string;
    userObjectId: GuidString;
    userPrincipalName: string;
    displayName: string;
    rolesCsv: string;
    status: MspUserStatus;
    lastLoginAt?: string;
}
export interface UserPreferencesEntity extends TableEntityAddress, TableSystemFields {
    mspTenantId: string;
    userObjectId: GuidString;
    themeMode: 'system' | 'light' | 'dark';
    densityMode: 'comfortable' | 'compact';
    preferredStartSurface: SurfaceScope | string;
    layoutPreferencesJson?: string;
    commandPaletteHistoryJson?: string;
    onboardingProgressJson?: string;
    featureExposureMode: FeatureExposureMode;
    updatedAt: string;
}
export interface UserInputProfileEntity extends TableEntityAddress, TableSystemFields {
    mspTenantId: string;
    userObjectId: GuidString;
    profileId: string;
    displayName: string;
    surfaceScope: SurfaceScope | string;
    isDefault: boolean;
    bindingMapJson: string;
    version: number;
    updatedAt: string;
}
export interface UserInputProfileDocument {
    mspTenantId: string;
    userObjectId: GuidString;
    profileId: string;
    displayName: string;
    surfaceScope: SurfaceScope | string;
    isDefault: boolean;
    bindingMap: UserBindingMap;
    version: number;
    updatedAt: string;
}
export interface ClientTenantEntity extends TableEntityAddress, TableSystemFields, AuditedEntity {
    id: string;
    mspTenantId: string;
    clientTenantId: string;
    clientM365TenantId: GuidString;
    displayName: string;
    primaryDomain: string;
    status: 'active' | 'onboarding' | 'offboarding' | 'disabled';
    onboardingState: string;
    graphConnectionId?: string;
    defaultUsageLocation?: string;
    notesBlobPath?: BlobPath;
}
export interface ClientAppRegistrationEntity extends TableEntityAddress, TableSystemFields, AuditedEntity {
    id: string;
    mspTenantId: string;
    clientTenantId: string;
    displayName: string;
    appId: GuidString;
    servicePrincipalObjectId?: GuidString;
    tenantId: GuidString;
    authMode: AdminAuthMode | string;
    credentialType: 'secret' | 'certificate' | 'federated' | 'none';
    credentialSecretRef?: string;
    certificateThumbprint?: string;
    consentState: 'pending' | 'granted' | 'revoked' | 'expired';
    permissionsJson?: string;
    lastValidatedAt?: string;
    status: 'active' | 'inactive' | 'error';
}
export interface FoundryProjectEntity extends TableEntityAddress, TableSystemFields, AuditedEntity {
    id: string;
    mspTenantId: string;
    environmentName: string;
    displayName: string;
    foundryProjectEndpoint: string;
    foundryProjectName: string;
    foundryProjectResourceId?: string;
    defaultModelDeployment: string;
    setupMode: FoundrySetupMode;
    status: FoundryProjectStatus;
    appInsightsResourceId?: string;
    storageResourceId?: string;
    cosmosResourceId?: string;
    searchResourceId?: string;
}
export interface LayoutPreferencesDocument extends JsonObject {
    panels?: Record<string, {
        collapsed?: boolean;
        width?: number;
        height?: number;
    }>;
    surfaces?: Record<string, JsonObject>;
}
//# sourceMappingURL=platform.d.ts.map