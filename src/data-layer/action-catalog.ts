import type { AuditedEntity, SchemaTrackedEntity, TableEntityAddress, TableSystemFields } from './common';

export type PlatformToolType = 'psa' | 'rmm' | 'documentation' | 'graph' | 'identity' | 'custom';
export type PlatformCapabilityDomain =
  | 'tickets'
  | 'tasks'
  | 'devices'
  | 'alerts'
  | 'documentation'
  | 'runbooks'
  | 'users'
  | 'licenses'
  | 'groups'
  | 'roles'
  | 'standards'
  | 'automation'
  | 'custom';
export type NormalizedPlatformObjectType =
  | 'ticket'
  | 'task'
  | 'device'
  | 'alert'
  | 'documentation'
  | 'runbook'
  | 'tenant'
  | 'user'
  | 'license'
  | 'group'
  | 'role'
  | 'standard'
  | 'workflow'
  | 'custom';
export type PlatformActionLifecycle = 'candidate' | 'active' | 'deprecated' | 'hidden';
export type PlatformActionVisibility = 'guided' | 'standard' | 'advanced';
export type OverlapStrategy =
  | 'single-authority'
  | 'prefer-authoritative-augment-others'
  | 'allow-multiple-specialized'
  | 'manual-review';
export type ActionOverlapDisposition = 'authoritative' | 'augmenting' | 'fallback' | 'redundant' | 'disabled';
export type ToolRoleInStack = 'authoritative' | 'supporting' | 'legacy' | 'unknown';
export type OnboardingReviewStatus = 'pending' | 'reviewed' | 'approved' | 'rejected';

export interface PlatformActionCatalogEntity extends TableEntityAddress, TableSystemFields, AuditedEntity, SchemaTrackedEntity {
  id: string;
  mspTenantId: string;
  normalizedActionId: string;
  canonicalActionKey: string;
  displayName: string;
  objectType: NormalizedPlatformObjectType;
  verb: string;
  capabilityDomain: PlatformCapabilityDomain;
  lifecycle: PlatformActionLifecycle;
  visibility: PlatformActionVisibility;
  authoritativeToolType?: PlatformToolType;
  overlapStrategy: OverlapStrategy;
  inputContractJson?: string;
  outputContractJson?: string;
  summary?: string;
}

export interface ConnectorActionMappingEntity extends TableEntityAddress, TableSystemFields, AuditedEntity {
  id: string;
  mspTenantId: string;
  normalizedActionId: string;
  connectorId: string;
  connectorVersionId: string;
  actionId: string;
  toolType: PlatformToolType;
  disposition: ActionOverlapDisposition;
  mappingConfidence: number;
  isEnabledByDefault: boolean;
  featureCoverageJson?: string;
  gapNotes?: string;
  conflictNotes?: string;
  reviewNotes?: string;
}

export interface ToolCapabilityProfileEntity extends TableEntityAddress, TableSystemFields, AuditedEntity, SchemaTrackedEntity {
  id: string;
  mspTenantId: string;
  profileId: string;
  displayName: string;
  toolType: PlatformToolType;
  connectorId?: string;
  connectionId?: string;
  roleInStack: ToolRoleInStack;
  coveredDomainsJson: string;
  overlapPolicyJson?: string;
  observedCapabilitiesJson?: string;
  gapsJson?: string;
  onboardingReviewStatus: OnboardingReviewStatus;
  lastReviewedAt?: string;
  reviewedBy?: string;
}
