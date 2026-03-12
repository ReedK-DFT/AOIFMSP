import type {
  ConnectorActionMappingEntity,
  ConnectorEntity,
  ConnectorVersionEntity,
  PlatformActionCatalogEntity,
  PlatformCapabilityDomain,
  PlatformToolType,
  ToolCapabilityProfileEntity,
} from '../../../../src/index.js';
import type { ConnectorImportPreview, DerivedConnectorAction } from './openapi-import.js';

export interface NormalizedActionDraft {
  platformAction: Omit<PlatformActionCatalogEntity, 'partitionKey' | 'rowKey' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;
  mapping: Omit<ConnectorActionMappingEntity, 'partitionKey' | 'rowKey' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;
}

export interface NormalizationPreview {
  toolType: PlatformToolType;
  coveredDomains: PlatformCapabilityDomain[];
  drafts: NormalizedActionDraft[];
  reviewNotes: string[];
  authoritativeToolSummary: string[];
}

interface NormalizableAction {
  actionId: string;
  displayName: string;
  pathTemplate: string;
  method: string;
  summary?: string | undefined;
  category?: string | undefined;
}

const authoritativeToolByDomain: Record<PlatformCapabilityDomain, PlatformToolType> = {
  tickets: 'psa',
  tasks: 'psa',
  devices: 'rmm',
  alerts: 'rmm',
  documentation: 'documentation',
  runbooks: 'documentation',
  users: 'graph',
  licenses: 'graph',
  groups: 'graph',
  roles: 'graph',
  standards: 'graph',
  automation: 'custom',
  custom: 'custom',
};

export function buildNormalizationPreview(
  connector: Pick<ConnectorEntity, 'id' | 'displayName' | 'category' | 'providerName'>,
  connectorVersion: Pick<ConnectorVersionEntity, 'connectorVersionId'>,
  preview: Pick<ConnectorImportPreview, 'actions'>,
  existingProfiles: Array<Pick<ToolCapabilityProfileEntity, 'toolType' | 'roleInStack' | 'coveredDomainsJson'>> = [],
): NormalizationPreview {
  const toolType = inferToolType(connector.category, connector.displayName, connector.providerName);
  const drafts = preview.actions.map((action) => buildDraft(connector, connectorVersion, action, toolType, existingProfiles));
  const coveredDomains = [...new Set(drafts.map((draft) => draft.platformAction.capabilityDomain))].sort();
  const authoritativeToolSummary = summarizeAuthorities(existingProfiles);
  const reviewNotes = buildReviewNotes(drafts, toolType, authoritativeToolSummary);

  return {
    toolType,
    coveredDomains,
    drafts,
    reviewNotes,
    authoritativeToolSummary,
  };
}

function buildDraft(
  connector: Pick<ConnectorEntity, 'id' | 'displayName' | 'category' | 'providerName'>,
  connectorVersion: Pick<ConnectorVersionEntity, 'connectorVersionId'>,
  action: NormalizableAction,
  toolType: PlatformToolType,
  existingProfiles: Array<Pick<ToolCapabilityProfileEntity, 'toolType' | 'roleInStack' | 'coveredDomainsJson'>>,
): NormalizedActionDraft {
  const classification = classifyAction(action);
  const authoritativeTool = authoritativeToolByDomain[classification.capabilityDomain];
  const matchingProfiles = existingProfiles.filter((profile) => parseStringArray(profile.coveredDomainsJson).includes(classification.capabilityDomain));
  const authoritativeProfile = matchingProfiles.find((profile) => profile.roleInStack === 'authoritative');
  const currentToolProfile = matchingProfiles.find((profile) => profile.toolType === toolType);
  const effectiveAuthority = authoritativeProfile?.toolType ?? authoritativeTool;
  const disposition = determineDisposition(action, classification.capabilityDomain, toolType, effectiveAuthority, currentToolProfile?.roleInStack);
  const normalizedActionId = `${classification.capabilityDomain}_${classification.objectType}_${classification.verb}`;

  return {
    platformAction: {
      id: normalizedActionId,
      mspTenantId: '',
      normalizedActionId,
      canonicalActionKey: normalizedActionId,
      displayName: classification.displayName,
      objectType: classification.objectType,
      verb: classification.verb,
      capabilityDomain: classification.capabilityDomain,
      lifecycle: disposition === 'disabled' ? 'hidden' : 'candidate',
      visibility: disposition === 'authoritative' ? 'standard' : disposition === 'augmenting' ? 'guided' : 'advanced',
      authoritativeToolType: effectiveAuthority,
      overlapStrategy: deriveOverlapStrategy(disposition),
      summary: action.summary ?? `${action.method} ${action.pathTemplate}`,
      schemaVersion: 1,
      managementMode: 'mixed',
    },
    mapping: {
      id: `${normalizedActionId}_${connector.id}_${connectorVersion.connectorVersionId}_${action.actionId}`,
      mspTenantId: '',
      normalizedActionId,
      connectorId: connector.id,
      connectorVersionId: connectorVersion.connectorVersionId,
      actionId: action.actionId,
      toolType,
      disposition,
      mappingConfidence: classification.confidence,
      isEnabledByDefault: disposition === 'authoritative' || disposition === 'augmenting',
      featureCoverageJson: JSON.stringify(classification.coverage),
      ...(disposition === 'fallback'
        ? { gapNotes: `${connector.displayName} remains available as a backfill option for ${classification.capabilityDomain}.` }
        : {}),
      ...(disposition === 'redundant'
        ? { conflictNotes: `${connector.displayName} overlaps an existing authoritative tool for ${classification.capabilityDomain}.` }
        : {}),
      reviewNotes: buildDraftReviewNote(connector.displayName, classification.capabilityDomain, effectiveAuthority, disposition),
    },
  };
}

function classifyAction(action: NormalizableAction) {
  const haystack = `${action.displayName} ${action.pathTemplate} ${action.summary ?? ''} ${action.category ?? ''}`.toLowerCase();

  if (/(ticket|case|incident)/.test(haystack)) {
    return buildClassification('tickets', 'ticket', inferVerb(action.method, haystack), 'Ticket Action', 0.9, ['queue', 'notes']);
  }

  if (/(task|board|project)/.test(haystack)) {
    return buildClassification('tasks', 'task', inferVerb(action.method, haystack), 'Task Action', 0.88, ['tasking']);
  }

  if (/(device|endpoint|script|patch)/.test(haystack)) {
    return buildClassification('devices', 'device', inferVerb(action.method, haystack), 'Device Action', 0.9, ['device-management']);
  }

  if (/(alert|monitor|health)/.test(haystack)) {
    return buildClassification('alerts', 'alert', inferVerb(action.method, haystack), 'Alert Action', 0.84, ['monitoring']);
  }

  if (/(runbook|article|doc|knowledge|asset)/.test(haystack)) {
    return buildClassification('documentation', 'documentation', inferVerb(action.method, haystack), 'Documentation Action', 0.86, ['knowledge']);
  }

  if (/(user|license|group|role|entra|directory|graph|mfa|standard)/.test(haystack)) {
    const domain = /(license)/.test(haystack)
      ? 'licenses'
      : /(group)/.test(haystack)
        ? 'groups'
        : /(role)/.test(haystack)
          ? 'roles'
          : /(standard|mfa)/.test(haystack)
            ? 'standards'
            : 'users';
    const objectType = domain === 'licenses' ? 'license' : domain === 'groups' ? 'group' : domain === 'roles' ? 'role' : domain === 'standards' ? 'standard' : 'user';
    return buildClassification(domain, objectType, inferVerb(action.method, haystack), 'Identity Action', 0.9, ['tenant-admin']);
  }

  return buildClassification('custom', 'custom', inferVerb(action.method, haystack), 'Custom Action', 0.55, ['review']);
}

function buildClassification(
  capabilityDomain: PlatformCapabilityDomain,
  objectType: PlatformActionCatalogEntity['objectType'],
  verb: string,
  displayName: string,
  confidence: number,
  coverage: string[],
) {
  return {
    capabilityDomain,
    objectType,
    verb,
    displayName: `${capitalize(verb)} ${displayName}`,
    confidence,
    coverage,
  };
}

function inferToolType(category: string, displayName: string, providerName: string): PlatformToolType {
  const haystack = `${category} ${displayName} ${providerName}`.toLowerCase();

  if (/(psa|ticket|service desk|halo|autotask)/.test(haystack)) {
    return 'psa';
  }

  if (/(rmm|device|ninja|endpoint|automate)/.test(haystack)) {
    return 'rmm';
  }

  if (/(doc|documentation|runbook|hudu|it glue|knowledge)/.test(haystack)) {
    return 'documentation';
  }

  if (/(graph|entra|identity|directory|microsoft)/.test(haystack)) {
    return 'graph';
  }

  return 'custom';
}

function inferVerb(method: string, haystack: string): string {
  if (method === 'GET') {
    return /(list|search)/.test(haystack) ? 'list' : 'get';
  }

  if (method === 'DELETE') {
    return 'delete';
  }

  if (method === 'PATCH' || method === 'PUT') {
    return 'update';
  }

  if (/(assign)/.test(haystack)) {
    return 'assign';
  }

  if (/(reset)/.test(haystack)) {
    return 'reset';
  }

  return 'create';
}

function determineDisposition(
  action: NormalizableAction,
  capabilityDomain: PlatformCapabilityDomain,
  toolType: PlatformToolType,
  effectiveAuthority: PlatformToolType,
  currentRoleInStack?: ToolCapabilityProfileEntity['roleInStack'],
): ConnectorActionMappingEntity['disposition'] {
  if (capabilityDomain === 'custom') {
    return 'disabled';
  }

  if (currentRoleInStack === 'legacy') {
    return 'disabled';
  }

  if (toolType === effectiveAuthority) {
    return 'authoritative';
  }

  if (currentRoleInStack === 'supporting' || isSpecializedAugmentation(action)) {
    return 'augmenting';
  }

  if (isReadOnlyAction(action)) {
    return 'fallback';
  }

  return 'redundant';
}

function deriveOverlapStrategy(disposition: ConnectorActionMappingEntity['disposition']): PlatformActionCatalogEntity['overlapStrategy'] {
  if (disposition === 'authoritative') {
    return 'single-authority';
  }

  if (disposition === 'augmenting') {
    return 'allow-multiple-specialized';
  }

  if (disposition === 'fallback') {
    return 'prefer-authoritative-augment-others';
  }

  return 'manual-review';
}

function buildDraftReviewNote(
  connectorDisplayName: string,
  capabilityDomain: PlatformCapabilityDomain,
  effectiveAuthority: PlatformToolType,
  disposition: ConnectorActionMappingEntity['disposition'],
): string {
  if (disposition === 'authoritative') {
    return `${connectorDisplayName} is the preferred tool for ${capabilityDomain}.`;
  }

  if (disposition === 'augmenting') {
    return `${connectorDisplayName} adds specialized value around the authoritative ${effectiveAuthority} capability for ${capabilityDomain}.`;
  }

  if (disposition === 'fallback') {
    return `${connectorDisplayName} should remain available only as a backfill option behind the authoritative ${effectiveAuthority} tool for ${capabilityDomain}.`;
  }

  if (disposition === 'redundant') {
    return `${connectorDisplayName} overlaps the authoritative ${effectiveAuthority} tool for ${capabilityDomain} and should stay off by default.`;
  }

  return `${connectorDisplayName} needs manual review before this action is exposed in the platform catalog.`;
}

function isReadOnlyAction(action: NormalizableAction): boolean {
  const haystack = `${action.displayName} ${action.summary ?? ''}`.toLowerCase();
  return action.method === 'GET' || action.method === 'HEAD' || action.method === 'OPTIONS' || /(get|list|search|lookup|read|fetch)/.test(haystack);
}

function isSpecializedAugmentation(action: NormalizableAction): boolean {
  const haystack = `${action.displayName} ${action.pathTemplate} ${action.summary ?? ''}`.toLowerCase();
  return /(note|comment|context|script|patch|runbook|knowledge|asset|health|sync|lookup|search)/.test(haystack);
}

function summarizeAuthorities(existingProfiles: Array<Pick<ToolCapabilityProfileEntity, 'toolType' | 'roleInStack' | 'coveredDomainsJson'>>): string[] {
  const summaries = existingProfiles
    .filter((profile) => profile.roleInStack === 'authoritative')
    .map((profile) => `${profile.toolType}: ${parseStringArray(profile.coveredDomainsJson).join(', ')}`);

  return summaries.length > 0 ? summaries : ['Default authority rules apply: PSA=tickets/tasks, RMM=devices/alerts, Docs=documentation/runbooks, Graph=tenant admin objects.'];
}

function buildReviewNotes(drafts: NormalizedActionDraft[], toolType: PlatformToolType, authoritativeToolSummary: string[]): string[] {
  const notes = [...authoritativeToolSummary];

  if (drafts.some((draft) => draft.mapping.disposition === 'redundant')) {
    notes.push(`${toolType} exposes overlapping actions that should stay disabled until the MSP confirms there is a real gap to fill.`);
  }

  if (drafts.some((draft) => draft.mapping.disposition === 'fallback')) {
    notes.push(`${toolType} contributes fallback actions that can be enabled later if the authoritative tool is missing coverage.`);
  }

  if (drafts.some((draft) => draft.mapping.disposition === 'disabled')) {
    notes.push('At least one imported action could not be cleanly normalized and should stay in manual review until curated.');
  }

  return notes;
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

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
