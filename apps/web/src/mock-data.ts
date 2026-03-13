import type { WorkflowDocument } from '../../../src/data-layer/workflows';

export const mockBootstrapContext = {
  product: {
    name: 'AOIFMSP',
    tagline: 'Automation of Integrations for Managed Service Providers',
  },
  branding: {
    mspName: 'Contoso MSP',
    abbreviation: 'AOI',
    colors: {
      primary: '#10634a',
      secondary: '#ff8a3d',
      surface: '#f4efe7',
    },
    logos: {},
  },
  navigation: [
    {
      id: 'technician-workspace',
      label: 'Technician Workspace',
      description: 'Ticket-centered support operations.',
    },
    {
      id: 'workflow-designer',
      label: 'Workflow Designer',
      description: 'Visual automation authoring.',
    },
    {
      id: 'tenant-administration',
      label: 'Tenant Administration',
      description: 'Guided user and tenant administration.',
    },
    {
      id: 'connectors',
      label: 'Platform Connectors',
      description: 'Create API connectors, derive actions, and manage authenticated connections.',
    },
  ],
  recommendedWorkflows: [
    {
      id: 'wf-ticket-triage',
      title: 'Ticket Triage Assistant',
      category: 'Technician Workspace',
      summary: 'Gather the full context around a ticket and recommend the next move.',
    },
    {
      id: 'wf-user-onboarding',
      title: 'Guided User Onboarding',
      category: 'Tenant Administration',
      summary: 'Prepare identity, licensing, and documentation steps in one guided flow.',
    },
    {
      id: 'wf-standards-review',
      title: 'Standards Drift Review',
      category: 'Standards',
      summary: 'Review high-impact findings before remediation is queued.',
    },
  ],
  featureExposureModes: ['guided', 'standard', 'advanced'],
  inputModel: {
    profileSupport: true,
    surfaces: ['global', 'workflow-designer', 'tenant-admin', 'technician-workspace', 'connectors'],
  },
};

export const mockSession = {
  runtimeMode: 'memory',
  operator: {
    userObjectId: 'operator-demo',
    displayName: 'Reed Harper',
    userPrincipalName: 'reed@contosomsp.com',
    roles: ['TechnicianLead', 'AutomationBuilder', 'PlatformAdmin'],
    featureExposureMode: 'guided',
    preferredStartSurface: 'technician-workspace',
    defaultInputProfile: {
      profileId: 'profile_default',
      displayName: 'Technician Default',
      surfaceScope: 'global',
      bindings: ['open-command-palette: Ctrl+K', 'launch-guided-action: Space'],
    },
  },
  mspTenant: {
    id: 'msp_demo',
    displayName: 'Contoso MSP',
    primaryDomain: 'contosomsp.com',
    gdapRelationshipState: 'active',
    preferredFoundrySetupMode: 'basic',
    defaultAdminAuthMode: 'gdap-obo',
  },
};

export const mockWorkflows = {
  mspTenantId: 'msp_demo',
  items: [
    {
      id: 'wf_demo_ticket_triage',
      displayName: 'Ticket Triage Hub',
      status: 'draft',
      designAssistantMode: 'mixed',
      description: 'Collect ticket and tenant context into a guided technician surface.',
    },
    {
      id: 'wf_demo_user_onboarding',
      displayName: 'Guided User Onboarding',
      status: 'draft',
      designAssistantMode: 'ai-assisted',
      description: 'Prepare user, license, Teams, and checklist tasks in one staged flow.',
    },
    {
      id: 'wf_demo_standards_drift',
      displayName: 'Standards Drift Review',
      status: 'draft',
      designAssistantMode: 'manual',
      description: 'Review findings and queue remediations without losing technician context.',
    },
  ],
};

export const mockWorkflowDetails = {
  wf_demo_ticket_triage: {
    mspTenantId: 'msp_demo',
    workflow: {
      ...mockWorkflows.items[0],
      defaultClientTenantId: 'tenant_northwind',
      triggerModeSummary: 'API polling from PSA ticket queue',
      lastRunAt: '2026-03-12T15:05:00.000Z',
      lastRunStatus: 'succeeded',
    },
    draft: buildTicketTriageWorkflowDraft('wf_demo_ticket_triage'),
  },
  wf_demo_user_onboarding: {
    mspTenantId: 'msp_demo',
    workflow: {
      ...mockWorkflows.items[1],
      defaultClientTenantId: 'tenant_wingtip',
      triggerModeSummary: 'Webhook from onboarding intake',
      lastRunAt: '2026-03-11T16:43:00.000Z',
      lastRunStatus: 'succeeded',
    },
    draft: buildUserOnboardingWorkflowDraft('wf_demo_user_onboarding'),
  },
  wf_demo_standards_drift: {
    mspTenantId: 'msp_demo',
    workflow: {
      ...mockWorkflows.items[2],
      defaultClientTenantId: 'tenant_northwind',
      triggerModeSummary: 'Cron schedule for standards review',
      lastRunAt: '2026-03-12T14:41:00.000Z',
      lastRunStatus: 'partial',
    },
    draft: buildStandardsDriftWorkflowDraft('wf_demo_standards_drift'),
  },
};

export const mockTechnicianHome = {
  mspTenantId: 'msp_demo',
  queueSummary: [
    { label: 'Needs Triage', count: 1 },
    { label: 'Ready To Run', count: 1 },
    { label: 'Waiting', count: 1 },
  ],
  highlightedTicket: {
    id: 'ticket_4512',
    title: 'Printer outage for main reception',
    priority: 'high',
    status: 'triage',
    summary: 'Reception cannot print intake forms after this morning’s workstation reboot.',
    sourceSystem: 'HaloPSA',
    boardOrQueue: 'Support',
    clientTenantId: 'tenant_northwind',
    tenantDisplayName: 'Northwind Dental',
    relatedUserDisplayName: 'Anna Morgan',
    relatedDeviceName: 'Front Desk PC',
    recommendedWorkflowIds: ['wf_demo_ticket_triage'],
    recommendedWorkflowNames: ['Ticket Triage Hub', 'Standards Drift Review'],
  },
  tickets: [
    {
      id: 'ticket_4512',
      title: 'Printer outage for main reception',
      priority: 'high',
      status: 'triage',
      summary: 'Reception cannot print intake forms after this morning’s workstation reboot.',
      sourceSystem: 'HaloPSA',
      boardOrQueue: 'Support',
      clientTenantId: 'tenant_northwind',
      tenantDisplayName: 'Northwind Dental',
      relatedUserDisplayName: 'Anna Morgan',
      relatedDeviceName: 'Front Desk PC',
      recommendedWorkflowIds: ['wf_demo_ticket_triage'],
      recommendedWorkflowNames: ['Ticket Triage Hub'],
    },
    {
      id: 'ticket_4519',
      title: 'Prepare onboarding for new hygienist',
      priority: 'medium',
      status: 'ready',
      summary: 'New starter begins Monday and needs identity, licensing, Teams access, and device prep.',
      sourceSystem: 'HaloPSA',
      boardOrQueue: 'Identity',
      clientTenantId: 'tenant_wingtip',
      tenantDisplayName: 'Wingtip Health',
      recommendedWorkflowIds: ['wf_demo_user_onboarding'],
      recommendedWorkflowNames: ['Guided User Onboarding'],
    },
    {
      id: 'ticket_4498',
      title: 'Review MFA standards drift exceptions',
      priority: 'medium',
      status: 'waiting',
      summary: 'Baseline detected new exception accounts and needs technician review before auto-remediation.',
      sourceSystem: 'HaloPSA',
      boardOrQueue: 'Standards',
      clientTenantId: 'tenant_northwind',
      tenantDisplayName: 'Northwind Dental',
      recommendedWorkflowIds: ['wf_demo_standards_drift'],
      recommendedWorkflowNames: ['Standards Drift Review'],
    },
  ],
  activeAlerts: [
    {
      id: 'alert_mfa_drift',
      title: 'MFA enforcement drift detected',
      severity: 'high',
      summary: 'Two break-glass accounts are excluded from the current MFA policy assignment.',
      tenantDisplayName: 'Northwind Dental',
    },
    {
      id: 'alert_print_spooler',
      title: 'Print spooler failures detected',
      severity: 'medium',
      summary: 'Front Desk PC restarted the print spooler three times in the last two hours.',
      tenantDisplayName: 'Northwind Dental',
    },
  ],
};

export const mockTenants = {
  mspTenantId: 'msp_demo',
  items: [
    {
      id: 'tenant_northwind',
      displayName: 'Northwind Dental',
      primaryDomain: 'northwinddental.com',
      status: 'active',
      gdapRelationshipState: 'active',
      openTicketCount: 2,
      driftAlertCount: 1,
      managedUserCount: 2,
      lastSuccessfulSyncAt: '2026-03-12T15:22:00.000Z',
    },
    {
      id: 'tenant_wingtip',
      displayName: 'Wingtip Health',
      primaryDomain: 'wingtiphealth.com',
      status: 'active',
      gdapRelationshipState: 'active',
      openTicketCount: 1,
      driftAlertCount: 0,
      managedUserCount: 1,
      lastSuccessfulSyncAt: '2026-03-12T15:16:00.000Z',
    },
  ],
};

export const mockTenantDetails = {
  tenant_northwind: {
    mspTenantId: 'msp_demo',
    tenant: {
      id: 'tenant_northwind',
      displayName: 'Northwind Dental',
      primaryDomain: 'northwinddental.com',
      status: 'active',
      gdapRelationshipState: 'active',
      openTicketCount: 2,
      driftAlertCount: 1,
      managedUserCount: 2,
      lastSuccessfulSyncAt: '2026-03-12T15:22:00.000Z',
      onboardingState: 'complete',
      defaultAdminAuthMode: 'gdap-obo',
      managementCapabilities: ['user-lifecycle', 'licenses', 'standards', 'alerts'],
    },
    managedUsers: [
      {
        id: 'user_anna_morgan',
        displayName: 'Anna Morgan',
        userPrincipalName: 'anna.morgan@northwinddental.com',
        status: 'active',
        licenses: ['Microsoft 365 Business Premium'],
      },
      {
        id: 'user_danielle_rivera',
        displayName: 'Danielle Rivera',
        userPrincipalName: 'danielle.rivera@northwinddental.com',
        status: 'active',
        licenses: ['Microsoft Teams Essentials'],
      },
    ],
    devices: [
      {
        id: 'device_frontdesk_pc',
        displayName: 'Front Desk PC',
        platform: 'Windows 11',
        status: 'attention',
        lastSeenAt: '2026-03-12T15:21:00.000Z',
      },
    ],
    documentation: [
      {
        id: 'doc_printer_runbook',
        displayName: 'Reception Printer Runbook',
        category: 'Runbook',
        summary: 'Restart spooler, verify shared queue mapping, and confirm tray sensor state.',
      },
    ],
    alerts: [
      {
        id: 'alert_mfa_drift',
        title: 'MFA enforcement drift detected',
        severity: 'high',
        status: 'open',
        summary: 'Break-glass accounts need documented exclusion policy review.',
      },
      {
        id: 'alert_print_spooler',
        title: 'Print spooler failures detected',
        severity: 'medium',
        status: 'open',
        summary: 'Front Desk PC restarted the print spooler three times in the last two hours.',
      },
    ],
    syncState: [
      {
        datasetName: 'users',
        status: 'idle',
        lastSuccessfulSyncAt: '2026-03-12T15:22:00.000Z',
        recordCount: 27,
      },
      {
        datasetName: 'standards',
        status: 'idle',
        lastSuccessfulSyncAt: '2026-03-12T15:22:00.000Z',
        recordCount: 14,
      },
    ],
    standards: [
      {
        standardId: 'std_mfa_enforcement',
        status: 'non-compliant',
        severity: 'high',
        summary: 'Break-glass accounts need review.',
      },
    ],
    recommendedWorkflows: mockWorkflows.items,
  },
  tenant_wingtip: {
    mspTenantId: 'msp_demo',
    tenant: {
      id: 'tenant_wingtip',
      displayName: 'Wingtip Health',
      primaryDomain: 'wingtiphealth.com',
      status: 'active',
      gdapRelationshipState: 'active',
      openTicketCount: 1,
      driftAlertCount: 0,
      managedUserCount: 1,
      lastSuccessfulSyncAt: '2026-03-12T15:16:00.000Z',
      onboardingState: 'standards-review',
      defaultAdminAuthMode: 'gdap-obo',
      managementCapabilities: ['user-lifecycle', 'licenses', 'alerts'],
    },
    managedUsers: [
      {
        id: 'user_mason_shaw',
        displayName: 'Mason Shaw',
        userPrincipalName: 'mason.shaw@wingtiphealth.com',
        status: 'active',
        licenses: ['Microsoft 365 E3'],
      },
    ],
    devices: [
      {
        id: 'device_lab_surface',
        displayName: 'Lab Surface 7',
        platform: 'Windows 11',
        status: 'healthy',
        lastSeenAt: '2026-03-12T15:19:00.000Z',
      },
    ],
    documentation: [
      {
        id: 'doc_new_hire_checklist',
        displayName: 'Clinical New Hire Checklist',
        category: 'Checklist',
        summary: 'Identity, device allocation, Teams policy, and baseline standards reminders.',
      },
    ],
    alerts: [
      {
        id: 'alert_license_pool',
        title: 'Only one spare E3 license remains',
        severity: 'low',
        status: 'open',
        summary: 'Onboarding can proceed, but renewal planning should be scheduled this week.',
      },
    ],
    syncState: [
      {
        datasetName: 'users',
        status: 'idle',
        lastSuccessfulSyncAt: '2026-03-12T15:16:00.000Z',
        recordCount: 54,
      },
    ],
    standards: [
      {
        standardId: 'std_secure_score',
        status: 'compliant',
        severity: 'medium',
        summary: 'Tenant baseline score is above target threshold.',
      },
    ],
    recommendedWorkflows: mockWorkflows.items.filter((workflow) => workflow.id !== 'wf_demo_ticket_triage'),
  },
};

export const mockConnectorCatalog = {
  mspTenantId: 'msp_demo',
  clientTenants: mockTenants.items.map((tenant) => ({ id: tenant.id, displayName: tenant.displayName })),
  connectors: [
    {
      id: 'connector_psa',
      displayName: 'Halo PSA',
      providerName: 'HaloPSA',
      category: 'PSA',
      sourceType: 'openapi-upload',
      defaultAuthType: 'oauth2-client-credentials',
      latestVersion: 'v1',
      status: 'active',
      visibility: 'shared',
      summary: 'Primary PSA connector for ticket, task, and note operations.',
      actionCount: 4,
      connectionCount: 1,
      authSchemes: ['oauth2'],
      lastImportedAt: '2026-03-12T14:00:00.000Z',
    },
    {
      id: 'connector_graph',
      displayName: 'Microsoft Graph Delegated',
      providerName: 'Microsoft Graph',
      category: 'Identity',
      sourceType: 'manual-adapter',
      defaultAuthType: 'oauth2-on-behalf-of',
      latestVersion: 'v1',
      status: 'active',
      visibility: 'shared',
      summary: 'GDAP-backed delegated tenant operations and curated Graph actions.',
      actionCount: 5,
      connectionCount: 2,
      authSchemes: ['oauth2OnBehalfOf', 'gdapDelegated'],
      lastImportedAt: '2026-03-12T14:00:00.000Z',
    },
    {
      id: 'connector_compliance_vault',
      displayName: 'Compliance Vault',
      providerName: 'Compliance Vault',
      category: 'Compliance',
      sourceType: 'openapi-upload',
      defaultAuthType: 'api-key',
      latestVersion: 'v1',
      status: 'active',
      visibility: 'private',
      summary: 'Custom LOB connector imported from customer-provided Swagger.',
      actionCount: 2,
      connectionCount: 1,
      authSchemes: ['apiKey'],
      lastImportedAt: '2026-03-12T15:25:00.000Z',
    },
  ],
  connections: [
    {
      id: 'conn_psa_primary',
      displayName: 'Halo PSA Primary',
      connectorId: 'connector_psa',
      connectorDisplayName: 'Halo PSA',
      connectorVersionId: 'v1',
      scopeType: 'msp',
      authType: 'oauth2-client-credentials',
      status: 'active',
      healthStatus: 'healthy',
      capabilities: ['tickets', 'tasks', 'notes'],
      lastTestedAt: '2026-03-12T15:25:00.000Z',
    },
    {
      id: 'conn_graph_northwind',
      displayName: 'Northwind Graph',
      connectorId: 'connector_graph',
      connectorDisplayName: 'Microsoft Graph Delegated',
      connectorVersionId: 'v1',
      scopeType: 'client',
      clientTenantId: 'tenant_northwind',
      clientTenantDisplayName: 'Northwind Dental',
      authType: 'oauth2-on-behalf-of',
      status: 'active',
      healthStatus: 'healthy',
      capabilities: ['users', 'licenses', 'standards'],
      lastTestedAt: '2026-03-12T15:25:00.000Z',
    },
    {
      id: 'conn_graph_wingtip',
      displayName: 'Wingtip Graph',
      connectorId: 'connector_graph',
      connectorDisplayName: 'Microsoft Graph Delegated',
      connectorVersionId: 'v1',
      scopeType: 'client',
      clientTenantId: 'tenant_wingtip',
      clientTenantDisplayName: 'Wingtip Health',
      authType: 'oauth2-on-behalf-of',
      status: 'active',
      healthStatus: 'healthy',
      capabilities: ['users', 'licenses', 'alerts'],
      lastTestedAt: '2026-03-12T15:25:00.000Z',
    },
    {
      id: 'conn_compliance_vault',
      displayName: 'Compliance Vault Shared',
      connectorId: 'connector_compliance_vault',
      connectorDisplayName: 'Compliance Vault',
      connectorVersionId: 'v1',
      scopeType: 'msp',
      authType: 'api-key',
      status: 'active',
      healthStatus: 'healthy',
      capabilities: ['findings', 'reviews'],
      lastTestedAt: '2026-03-12T15:25:00.000Z',
    },
  ],
};

export const mockConnectorDetails = {
  connector_psa: {
    mspTenantId: 'msp_demo',
    connector: mockConnectorCatalog.connectors[0]!,
    versions: [
      {
        id: 'v1',
        versionLabel: '2026.1',
        status: 'published',
        importSource: 'seed://halo-openapi',
        actionsCount: 4,
        schemasCount: 3,
        authSchemes: ['oauth2'],
        importedAt: '2026-03-12T14:00:00.000Z',
        publishedAt: '2026-03-12T14:00:00.000Z',
        managementMode: 'mixed',
      },
    ],
    actions: [
      actionSummary('getTicketContext', 'getTicketContext', 'Load Ticket Context', 'PSA', 'GET', '/tickets/{ticketId}/context', true, 'Load ticket, tenant, and assignment context.'),
      actionSummary('appendTicketNote', 'appendTicketNote', 'Append Ticket Note', 'PSA', 'POST', '/tickets/{ticketId}/notes', false, 'Append a note to the active ticket.'),
      actionSummary('createTask', 'createTask', 'Create Task', 'PSA', 'POST', '/tasks', false, 'Create a technician follow-up task.'),
      actionSummary('listTickets', 'listTickets', 'List Tickets', 'PSA', 'GET', '/tickets', true, 'List tickets for technician queues.'),
    ],
    normalization: buildMockNormalization(mockConnectorCatalog.connectors[0]!, [
      actionSummary('getTicketContext', 'getTicketContext', 'Load Ticket Context', 'PSA', 'GET', '/tickets/{ticketId}/context', true, 'Load ticket, tenant, and assignment context.'),
      actionSummary('appendTicketNote', 'appendTicketNote', 'Append Ticket Note', 'PSA', 'POST', '/tickets/{ticketId}/notes', false, 'Append a note to the active ticket.'),
      actionSummary('createTask', 'createTask', 'Create Task', 'PSA', 'POST', '/tasks', false, 'Create a technician follow-up task.'),
      actionSummary('listTickets', 'listTickets', 'List Tickets', 'PSA', 'GET', '/tickets', true, 'List tickets for technician queues.'),
    ]),
    connections: mockConnectorCatalog.connections.filter((connection) => connection.connectorId === 'connector_psa'),
  },
  connector_graph: {
    mspTenantId: 'msp_demo',
    connector: mockConnectorCatalog.connectors[1]!,
    versions: [
      {
        id: 'v1',
        versionLabel: '2026.1',
        status: 'published',
        importSource: 'seed://graph-manual-adapter',
        actionsCount: 5,
        schemasCount: 4,
        authSchemes: ['oauth2OnBehalfOf', 'gdapDelegated'],
        importedAt: '2026-03-12T14:00:00.000Z',
        publishedAt: '2026-03-12T14:00:00.000Z',
        managementMode: 'mixed',
      },
    ],
    actions: [
      actionSummary('createUser', 'createUser', 'Create User', 'Identity', 'POST', '/users', false, 'Create a new Entra ID user in a client tenant.'),
      actionSummary('assignLicense', 'assignLicense', 'Assign License', 'Identity', 'POST', '/users/{userId}/assignLicense', false, 'Assign product licenses to a user.'),
      actionSummary('getStandardsResult', 'getStandardsResult', 'Get Standards Result', 'Standards', 'GET', '/security/standards/{standardId}', true, 'Retrieve tenant standards posture for review.'),
      actionSummary('resetPassword', 'resetPassword', 'Reset Password', 'Identity', 'POST', '/users/{userId}/resetPassword', false, 'Reset a user password with delegated admin context.'),
      actionSummary('listUsers', 'listUsers', 'List Users', 'Identity', 'GET', '/users', true, 'List tenant users through Graph.'),
    ],
    normalization: buildMockNormalization(mockConnectorCatalog.connectors[1]!, [
      actionSummary('createUser', 'createUser', 'Create User', 'Identity', 'POST', '/users', false, 'Create a new Entra ID user in a client tenant.'),
      actionSummary('assignLicense', 'assignLicense', 'Assign License', 'Identity', 'POST', '/users/{userId}/assignLicense', false, 'Assign product licenses to a user.'),
      actionSummary('getStandardsResult', 'getStandardsResult', 'Get Standards Result', 'Standards', 'GET', '/security/standards/{standardId}', true, 'Retrieve tenant standards posture for review.'),
      actionSummary('resetPassword', 'resetPassword', 'Reset Password', 'Identity', 'POST', '/users/{userId}/resetPassword', false, 'Reset a user password with delegated admin context.'),
      actionSummary('listUsers', 'listUsers', 'List Users', 'Identity', 'GET', '/users', true, 'List tenant users through Graph.'),
    ]),
    connections: mockConnectorCatalog.connections.filter((connection) => connection.connectorId === 'connector_graph'),
  },
  connector_compliance_vault: {
    mspTenantId: 'msp_demo',
    connector: mockConnectorCatalog.connectors[2]!,
    versions: [
      {
        id: 'v1',
        versionLabel: '1.0.0',
        status: 'published',
        importSource: 'seed://uploaded-openapi/compliance-vault.json',
        actionsCount: 2,
        schemasCount: 2,
        authSchemes: ['apiKey'],
        importedAt: '2026-03-12T15:25:00.000Z',
        publishedAt: '2026-03-12T15:25:00.000Z',
        managementMode: 'mixed',
      },
    ],
    actions: [
      actionSummary('listFindings', 'listFindings', 'List Findings', 'Compliance', 'GET', '/findings', true, 'List open compliance findings.'),
      actionSummary('queueReview', 'queueReview', 'Queue Review', 'Compliance', 'POST', '/reviews', false, 'Queue a manual review in the external compliance system.'),
    ],
    normalization: buildMockNormalization(mockConnectorCatalog.connectors[2]!, [
      actionSummary('listFindings', 'listFindings', 'List Findings', 'Compliance', 'GET', '/findings', true, 'List open compliance findings.'),
      actionSummary('queueReview', 'queueReview', 'Queue Review', 'Compliance', 'POST', '/reviews', false, 'Queue a manual review in the external compliance system.'),
    ]),
    connections: mockConnectorCatalog.connections.filter((connection) => connection.connectorId === 'connector_compliance_vault'),
  },
};

export function previewMockConnectorImport(request: {
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
}) {
  if (request.sourceType === 'manual-adapter') {
    const actions = (request.documentationText ?? '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 6)
      .map((line, index) => actionSummary(`manual_${index + 1}`, `manual_${index + 1}`, toDisplay(line), request.category ?? 'Manual Adapter', inferMethod(line), `/manual/${slug(line) || index + 1}`, inferMethod(line) === 'GET', line));

    return {
      preview: {
        connectorId: request.connectorId ?? `connector_${slug(request.displayName ?? request.providerName ?? 'manual_adapter')}`,
        displayName: request.displayName ?? request.providerName ?? 'Documentation Adapter',
        providerName: request.providerName ?? request.displayName ?? 'Custom Provider',
        category: request.category ?? 'Manual Adapter',
        sourceType: request.sourceType,
        defaultAuthType: request.defaultAuthType ?? 'custom',
        visibility: request.visibility ?? 'private',
        versionLabel: request.versionLabel ?? 'v1',
        importSource: request.importSource ?? request.documentationUrl ?? 'manual-documentation',
        summary: request.summary ?? 'Connector scaffolded from documentation notes.',
        authSchemes: [request.defaultAuthType ?? 'custom'],
        schemas: [],
        actions: actions.length > 0 ? actions : [actionSummary('reviewDocumentation', 'reviewDocumentation', 'Review Documentation', 'Manual Adapter', 'POST', '/manual/review-documentation', false, 'Placeholder manual connector action.')],
        contentDigestSha256: `mock-${Date.now()}`,
        warnings: actions.length > 0 ? [] : ['Documentation import is using a placeholder action until endpoint notes are provided.'],
        sourceDocument: {
          documentationText: request.documentationText ?? '',
          documentationUrl: request.documentationUrl ?? '',
        },
      },
      normalization: buildMockNormalization(
        {
          id: request.connectorId ?? `connector_${slug(request.displayName ?? request.providerName ?? 'manual_adapter')}`,
          displayName: request.displayName ?? request.providerName ?? 'Documentation Adapter',
          providerName: request.providerName ?? request.displayName ?? 'Custom Provider',
          category: request.category ?? 'Manual Adapter',
        },
        actions.length > 0 ? actions : [actionSummary('reviewDocumentation', 'reviewDocumentation', 'Review Documentation', 'Manual Adapter', 'POST', '/manual/review-documentation', false, 'Placeholder manual connector action.')],
      ),
    };
  }

  const spec = parseSpec(request.specificationText);
  const actions = Object.entries(spec.paths ?? {}).flatMap(([path, operations]) =>
    Object.keys(operations as Record<string, unknown>).map((method) =>
      actionSummary(
        slug(`${method}_${path}`),
        slug(`${method}_${path}`),
        toDisplay(`${method} ${path}`),
        request.category ?? firstPathSegment(path),
        method.toUpperCase(),
        path,
        method.toLowerCase() === 'get',
        `Generated from ${method.toUpperCase()} ${path}`,
      ),
    ),
  );

  return {
    preview: {
      connectorId: request.connectorId ?? `connector_${slug(request.displayName ?? spec.info?.title ?? 'custom_connector')}`,
      displayName: request.displayName ?? spec.info?.title ?? 'Imported Connector',
      providerName: request.providerName ?? spec.info?.title ?? 'Custom Provider',
      category: request.category ?? firstPathSegment(Object.keys(spec.paths ?? {})[0] ?? '') ?? 'Custom Integration',
      sourceType: request.sourceType,
      defaultAuthType: request.defaultAuthType ?? 'api-key',
      visibility: request.visibility ?? 'private',
      versionLabel: request.versionLabel ?? spec.info?.version ?? 'v1',
      importSource: request.importSource ?? 'direct-upload',
      summary: request.summary ?? spec.info?.description ?? 'Connector generated from provided API definition.',
      authSchemes: Object.keys(spec.components?.securitySchemes ?? {}),
      schemas: Object.keys(spec.components?.schemas ?? {}),
      actions,
      contentDigestSha256: `mock-${Date.now()}`,
      warnings: actions.length > 0 ? [] : ['No operations were discovered under the paths object.'],
      sourceDocument: spec,
    },
    normalization: buildMockNormalization(
      {
        id: request.connectorId ?? `connector_${slug(request.displayName ?? spec.info?.title ?? 'custom_connector')}`,
        displayName: request.displayName ?? spec.info?.title ?? 'Imported Connector',
        providerName: request.providerName ?? spec.info?.title ?? 'Custom Provider',
        category: request.category ?? firstPathSegment(Object.keys(spec.paths ?? {})[0] ?? '') ?? 'Custom Integration',
      },
      actions,
    ),
  };
}

export function importMockConnector(request: Parameters<typeof previewMockConnectorImport>[0], mspTenantId = 'msp_demo') {
  const previewResponse = previewMockConnectorImport(request);
  const preview = previewResponse.preview;

  return {
    mspTenantId,
    connector: {
      id: preview.connectorId,
      displayName: preview.displayName,
      providerName: preview.providerName,
      category: preview.category,
      sourceType: preview.sourceType,
      defaultAuthType: preview.defaultAuthType,
      latestVersion: 'v1',
      status: 'active',
      visibility: preview.visibility,
      summary: preview.summary,
      actionCount: preview.actions.length,
      connectionCount: 0,
      authSchemes: preview.authSchemes,
      lastImportedAt: '2026-03-12T16:05:00.000Z',
    },
    versions: [
      {
        id: 'v1',
        versionLabel: preview.versionLabel,
        status: 'published',
        importSource: preview.importSource,
        actionsCount: preview.actions.length,
        schemasCount: preview.schemas.length,
        authSchemes: preview.authSchemes,
        importedAt: '2026-03-12T16:05:00.000Z',
        publishedAt: '2026-03-12T16:05:00.000Z',
        managementMode: 'mixed',
      },
    ],
    actions: preview.actions,
    normalization: previewResponse.normalization,
    connections: [],
  };
}

export function createMockConnection(request: {
  connectionId?: string | undefined;
  displayName: string;
  connectorId: string;
  connectorVersionId?: string | undefined;
  scopeType: 'msp' | 'client';
  clientTenantId?: string | undefined;
  authType: string;
  baseUrlOverride?: string | undefined;
  capabilities?: string[] | undefined;
}) {
  const connector = mockConnectorCatalog.connectors.find((item) => item.id === request.connectorId) ?? mockConnectorCatalog.connectors[0]!!;
  const tenant = mockTenants.items.find((item) => item.id === request.clientTenantId);

  return {
    id: request.connectionId ?? `conn_${slug(request.displayName)}_mock`,
    displayName: request.displayName,
    connectorId: request.connectorId,
    connectorDisplayName: connector.displayName,
    connectorVersionId: request.connectorVersionId ?? connector.latestVersion ?? 'v1',
    scopeType: request.scopeType,
    clientTenantId: request.clientTenantId,
    clientTenantDisplayName: tenant?.displayName,
    authType: request.authType,
    status: 'active',
    healthStatus: 'unknown',
    baseUrlOverride: request.baseUrlOverride,
    capabilities: request.capabilities ?? [],
    lastTestedAt: undefined,
  };
}

function buildMockNormalization(
  connector: { id: string; displayName: string; providerName?: string; category: string },
  actions: Array<ReturnType<typeof actionSummary>>,
) {
  const toolType = inferToolType(connector.category, connector.displayName, connector.providerName ?? connector.displayName);
  const coveredDomains = [...new Set(actions.map((action) => classifyDomain(action.displayName, action.pathTemplate, action.summary, action.category)))];
  return {
    toolProfile: {
      id: `${toolType}_${connector.id}`,
      displayName: `${toDisplay(connector.category)} · ${connector.displayName}`,
      toolType,
      roleInStack: actions.some((action) => isAuthoritative(toolType, classifyDomain(action.displayName, action.pathTemplate, action.summary, action.category))) ? 'authoritative' : 'supporting',
      coveredDomains,
      onboardingReviewStatus: 'pending',
    },
    reviewNotes: [
      `${connector.displayName} is being mapped into AOIFMSP standard action objects for overlap review.`,
      'Default authority rules keep overlapping actions from becoming active automatically unless they improve coverage.',
    ],
    authoritativeToolSummary: [
      'PSA=tickets/tasks, RMM=devices/alerts, Docs=documentation/runbooks, Graph=tenant admin objects.',
    ],
    items: actions.map((action) => {
      const capabilityDomain = classifyDomain(action.displayName, action.pathTemplate, action.summary, action.category);
      const disposition = classifyDisposition(toolType, capabilityDomain, action.method, action.displayName, action.summary);
      const verb = inferNormalizedVerb(action.method, action.displayName, action.summary);
      return {
        normalizedActionId: `${capabilityDomain}_${slug(action.displayName) || action.id}_${verb}`.slice(0, 64),
        displayName: action.displayName,
        capabilityDomain,
        objectType: inferObjectType(capabilityDomain),
        verb,
        lifecycle: disposition === 'disabled' ? 'hidden' : 'candidate',
        visibility: disposition === 'authoritative' ? 'standard' : disposition === 'augmenting' ? 'guided' : 'advanced',
        authoritativeToolType: defaultAuthorityForDomain(capabilityDomain),
        overlapStrategy: disposition === 'authoritative' ? 'single-authority' : disposition === 'augmenting' ? 'allow-multiple-specialized' : disposition === 'fallback' ? 'prefer-authoritative-augment-others' : 'manual-review',
        disposition,
        mappingConfidence: disposition === 'disabled' ? 0.55 : 0.86,
        isEnabledByDefault: disposition === 'authoritative' || disposition === 'augmenting',
        featureCoverage: capabilityDomain === 'tickets' ? ['queue', 'notes'] : capabilityDomain === 'devices' ? ['device-management'] : capabilityDomain === 'documentation' ? ['knowledge'] : capabilityDomain === 'users' || capabilityDomain === 'licenses' || capabilityDomain === 'standards' ? ['tenant-admin'] : ['review'],
        reviewNotes: disposition === 'authoritative' ? `${connector.displayName} is the preferred source for ${capabilityDomain}.` : `${connector.displayName} should stay reviewed against the authoritative tool for ${capabilityDomain}.`,
        ...(disposition === 'fallback' ? { gapNotes: `${connector.displayName} remains available as a backfill option.` } : {}),
        ...(disposition === 'redundant' ? { conflictNotes: 'This action overlaps a stronger source and should remain off by default.' } : {}),
      };
    }),
  };
}

function inferToolType(category: string, displayName: string, providerName: string): string {
  const haystack = `${category} ${displayName} ${providerName}`.toLowerCase();
  if (/(psa|ticket|halo|autotask)/.test(haystack)) return 'psa';
  if (/(rmm|ninja|device|endpoint)/.test(haystack)) return 'rmm';
  if (/(doc|documentation|knowledge|hudu|it glue)/.test(haystack)) return 'documentation';
  if (/(graph|identity|entra|directory|microsoft)/.test(haystack)) return 'graph';
  return 'custom';
}

function classifyDomain(displayName: string, pathTemplate: string, summary?: string, category?: string): string {
  const haystack = `${displayName} ${pathTemplate} ${summary ?? ''} ${category ?? ''}`.toLowerCase();
  if (/(ticket|case|incident)/.test(haystack)) return 'tickets';
  if (/(task|project|board)/.test(haystack)) return 'tasks';
  if (/(device|endpoint|script|patch)/.test(haystack)) return 'devices';
  if (/(alert|monitor|health)/.test(haystack)) return 'alerts';
  if (/(doc|article|knowledge|runbook|asset)/.test(haystack)) return 'documentation';
  if (/(license)/.test(haystack)) return 'licenses';
  if (/(standard|mfa)/.test(haystack)) return 'standards';
  if (/(group)/.test(haystack)) return 'groups';
  if (/(role)/.test(haystack)) return 'roles';
  if (/(user|identity|entra|directory|graph)/.test(haystack)) return 'users';
  return 'custom';
}

function defaultAuthorityForDomain(domain: string): string {
  if (domain === 'tickets' || domain === 'tasks') return 'psa';
  if (domain === 'devices' || domain === 'alerts') return 'rmm';
  if (domain === 'documentation' || domain === 'runbooks') return 'documentation';
  if (domain === 'users' || domain === 'licenses' || domain === 'groups' || domain === 'roles' || domain === 'standards') return 'graph';
  return 'custom';
}

function classifyDisposition(toolType: string, domain: string, method: string, displayName: string, summary?: string): string {
  if (domain === 'custom') return 'disabled';
  if (toolType === defaultAuthorityForDomain(domain)) return 'authoritative';
  const haystack = `${displayName} ${summary ?? ''}`.toLowerCase();
  if (method === 'GET' || /(context|note|comment|search|lookup|health)/.test(haystack)) return 'augmenting';
  if (/(list|get|read|search|lookup)/.test(haystack)) return 'fallback';
  return 'redundant';
}

function inferNormalizedVerb(method: string, displayName: string, summary?: string): string {
  const haystack = `${displayName} ${summary ?? ''}`.toLowerCase();
  if (method === 'GET') return /(list|search)/.test(haystack) ? 'list' : 'get';
  if (method === 'DELETE') return 'delete';
  if (method === 'PATCH' || method === 'PUT') return 'update';
  if (/(assign)/.test(haystack)) return 'assign';
  if (/(reset)/.test(haystack)) return 'reset';
  return 'create';
}

function inferObjectType(domain: string): string {
  if (domain === 'tickets') return 'ticket';
  if (domain === 'tasks') return 'task';
  if (domain === 'devices') return 'device';
  if (domain === 'alerts') return 'alert';
  if (domain === 'documentation') return 'documentation';
  if (domain === 'licenses') return 'license';
  if (domain === 'groups') return 'group';
  if (domain === 'roles') return 'role';
  if (domain === 'standards') return 'standard';
  if (domain === 'users') return 'user';
  return 'custom';
}

function isAuthoritative(toolType: string, domain: string): boolean {
  return defaultAuthorityForDomain(domain) === toolType;
}
function actionSummary(
  id: string,
  operationId: string,
  displayName: string,
  category: string,
  method: string,
  pathTemplate: string,
  isTriggerCapable: boolean,
  summary: string,
) {
  return {
    id,
    operationId,
    displayName,
    category,
    method,
    pathTemplate,
    isTriggerCapable,
    isDeprecated: false,
    summary,
  };
}

function parseSpec(specificationText?: string) {
  if (!specificationText?.trim()) {
    return sampleOpenApiSpec;
  }

  try {
    return JSON.parse(specificationText) as typeof sampleOpenApiSpec;
  } catch {
    return sampleOpenApiSpec;
  }
}

function firstPathSegment(path: string): string {
  return toDisplay(path.split('/').find((segment) => segment && !segment.startsWith('{')) ?? 'General');
}

function inferMethod(line: string): string {
  const normalized = line.toLowerCase();

  if (/\b(get|list|search|lookup|read)\b/.test(normalized)) {
    return 'GET';
  }

  if (/\b(update|patch|modify)\b/.test(normalized)) {
    return 'PATCH';
  }

  if (/\b(delete|remove)\b/.test(normalized)) {
    return 'DELETE';
  }

  return 'POST';
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 36);
}

function toDisplay(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/(^|\s)\S/g, (segment) => segment.toUpperCase());
}

const sampleOpenApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Demo Integration',
    version: '1.0.0',
    description: 'Sample OpenAPI definition for AOIFMSP connector import preview.',
  },
  paths: {
    '/tickets': {
      get: {
        summary: 'List Tickets',
      },
    },
    '/tickets/{ticketId}/notes': {
      post: {
        summary: 'Append Ticket Note',
      },
    },
    '/users/{userId}/licenses': {
      post: {
        summary: 'Assign License',
      },
    },
  },
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
      },
    },
    schemas: {
      Ticket: {},
      TicketNote: {},
      UserLicenseAssignment: {},
    },
  },
};



const workflowDetailStore = new Map(
  Object.entries(mockWorkflowDetails).map(([workflowId, detail]) => [workflowId, deepClone(detail)]),
);

export function getMockWorkflowDetail(workflowId: string, mspTenantId = 'msp_demo') {
  const detail = workflowDetailStore.get(workflowId) ?? workflowDetailStore.get('wf_demo_ticket_triage');
  if (!detail) {
    throw new Error(`Unknown mock workflow: ${workflowId}`);
  }

  return {
    ...deepClone(detail),
    mspTenantId,
    availableConnections: buildMockWorkflowConnections(),
    availableActions: buildMockWorkflowAvailableActions(),
  };
}

export function saveMockWorkflowDraft(
  workflowId: string,
  request: {
    draft: WorkflowDocument;
    displayName?: string | undefined;
    description?: string | undefined;
  },
  mspTenantId = 'msp_demo',
) {
  const existing = workflowDetailStore.get(workflowId) ?? workflowDetailStore.get('wf_demo_ticket_triage');
  if (!existing) {
    throw new Error(`Unknown mock workflow: ${workflowId}`);
  }

  const nextDraft = deepClone(request.draft);
  nextDraft.workflowId = workflowId;
  nextDraft.displayName = request.displayName ?? nextDraft.displayName;

  const nextDetail = {
    ...deepClone(existing),
    mspTenantId,
    workflow: {
      ...existing.workflow,
      displayName: nextDraft.displayName,
      description: request.description ?? existing.workflow.description,
    },
    draft: nextDraft,
  };

  workflowDetailStore.set(workflowId, deepClone(nextDetail));
  const workflowIndex = mockWorkflows.items.findIndex((workflow) => workflow.id === workflowId);
  if (workflowIndex >= 0) {
    const currentWorkflow = mockWorkflows.items[workflowIndex]!;
    mockWorkflows.items[workflowIndex] = {
      ...currentWorkflow,
      displayName: nextDraft.displayName,
      description: request.description ?? currentWorkflow.description,
    };
  }

  return getMockWorkflowDetail(workflowId, mspTenantId);
}

function buildMockWorkflowConnections() {
  return mockConnectorCatalog.connections.map((connection) => ({
    ...connection,
    capabilities: [...connection.capabilities],
  }));
}

function buildMockWorkflowAvailableActions() {
  return Object.values(mockConnectorDetails)
    .flatMap((detail) => {
      const suggestedConnectionIds = detail.connections.map((connection) => connection.id);
      return detail.actions.map((action) => ({
        id: `${detail.connector.id}:${detail.versions[0]?.id ?? 'v1'}:${action.id}`,
        connectorId: detail.connector.id,
        connectorDisplayName: detail.connector.displayName,
        connectorVersionId: detail.versions[0]?.id ?? 'v1',
        actionId: action.id,
        displayName: action.displayName,
        category: action.category,
        method: action.method,
        pathTemplate: action.pathTemplate,
        summary: action.summary,
        isTriggerCapable: action.isTriggerCapable,
        suggestedConnectionIds,
      }));
    })
    .sort((left, right) => {
      const byConnector = left.connectorDisplayName.localeCompare(right.connectorDisplayName);
      return byConnector !== 0 ? byConnector : left.displayName.localeCompare(right.displayName);
    });
}

function buildDefaultWorkflowErrorHandling(): WorkflowDocument['errorHandling'] {
  return {
    defaultNodePolicy: {
      strategy: 'retry',
      maxRetries: 2,
      retryDelaySeconds: 30,
      captureAs: 'lastError',
    },
    onTriggerFailure: {
      strategy: 'continue',
      captureAs: 'triggerError',
    },
    onUnhandledError: {
      strategy: 'fail-workflow',
      captureAs: 'unhandledError',
    },
  };
}

function buildTicketTriageWorkflowDraft(workflowId: string): WorkflowDocument {
  return {
    schemaVersion: 1,
    workflowId,
    displayName: 'Ticket Triage Hub',
    trigger: {
      type: 'polling',
      config: {
        connectorId: 'connector_psa',
        connectorVersionId: 'v1',
        actionId: 'listTickets',
        connectionId: 'conn_psa_primary',
        intervalMinutes: 10,
        matchMode: 'new-items',
      },
    },
    errorHandling: buildDefaultWorkflowErrorHandling(),
    nodes: [
      {
        id: 'trigger-start',
        type: 'trigger',
        label: 'Poll Ticket Queue',
        triggerType: 'polling',
        config: {
          queue: 'Needs Triage',
          intervalMinutes: 10,
        },
        position: { x: 72, y: 120 },
      },
      {
        id: 'load-ticket-context',
        type: 'connector-action',
        label: 'Load Ticket Context',
        connectorId: 'connector_psa',
        connectorVersionId: 'v1',
        actionId: 'getTicketContext',
        connectionId: 'conn_psa_primary',
        inputs: {
          includeTenant: true,
          includeDevice: true,
        },
        position: { x: 330, y: 120 },
      },
      {
        id: 'suggest-next-steps',
        type: 'ai-agent',
        label: 'Suggest Next Steps',
        agentId: 'agent_triage_guide',
        agentVersionId: 'v1',
        foundryProjectRef: 'foundry-default',
        operatingMode: 'suggest-only',
        inputTemplate: {
          includeDocumentation: true,
        },
        outputSchema: {
          recommendations: 'array',
          riskLevel: 'string',
        },
        approvalPolicy: {
          required: false,
        },
        timeoutSeconds: 45,
        maxRetries: 1,
        position: { x: 602, y: 120 },
      },
      {
        id: 'update-ticket-notes',
        type: 'connector-action',
        label: 'Update Ticket Notes',
        connectorId: 'connector_psa',
        connectorVersionId: 'v1',
        actionId: 'appendTicketNote',
        connectionId: 'conn_psa_primary',
        inputs: {
          noteSource: 'agent-summary',
        },
        position: { x: 874, y: 120 },
      },
    ],
    edges: [
      { id: 'edge-1', sourceNodeId: 'trigger-start', targetNodeId: 'load-ticket-context' },
      { id: 'edge-2', sourceNodeId: 'load-ticket-context', targetNodeId: 'suggest-next-steps' },
      { id: 'edge-3', sourceNodeId: 'suggest-next-steps', targetNodeId: 'update-ticket-notes' },
    ],
    variables: [
      {
        id: 'var_ticket_id',
        name: 'ticketId',
        type: 'string',
      },
    ],
    bindings: {
      connections: [
        {
          connectionId: 'conn_psa_primary',
          connectorId: 'connector_psa',
          alias: 'Primary PSA',
          scopeType: 'msp',
          requiredActions: ['getTicketContext', 'appendTicketNote'],
        },
      ],
    },
    ai: {
      draftSource: 'manual-or-ai',
      assumptions: ['Ticket queue polling runs against the PSA queue and enriches ticket context before technician review.'],
    },
    editor: {
      viewport: {
        zoom: 0.92,
      },
      selectedNodeIds: ['suggest-next-steps'],
    },
  };
}

function buildUserOnboardingWorkflowDraft(workflowId: string): WorkflowDocument {
  return {
    schemaVersion: 1,
    workflowId,
    displayName: 'Guided User Onboarding',
    trigger: {
      type: 'webhook',
      config: {
        webhookPath: '/hooks/onboarding/user-intake',
        method: 'POST',
        signatureMode: 'secret-header',
        payloadBinding: 'body',
      },
    },
    errorHandling: buildDefaultWorkflowErrorHandling(),
    nodes: [
      {
        id: 'trigger-start',
        type: 'trigger',
        label: 'Inbound Onboarding Webhook',
        triggerType: 'webhook',
        config: {
          source: 'hr-intake',
          payloadBinding: 'body',
        },
        position: { x: 72, y: 108 },
      },
      {
        id: 'create-user',
        type: 'connector-action',
        label: 'Create Entra User',
        connectorId: 'connector_graph',
        connectorVersionId: 'v1',
        actionId: 'createUser',
        connectionId: 'conn_graph_wingtip',
        inputs: {
          usageLocation: 'US',
        },
        position: { x: 332, y: 108 },
      },
      {
        id: 'assign-license',
        type: 'connector-action',
        label: 'Assign License',
        connectorId: 'connector_graph',
        connectorVersionId: 'v1',
        actionId: 'assignLicense',
        connectionId: 'conn_graph_wingtip',
        inputs: {
          sku: 'Microsoft 365 E3',
        },
        position: { x: 602, y: 108 },
      },
      {
        id: 'publish-doc-note',
        type: 'javascript',
        label: 'Add Checklist Note',
        inlineScript: 'return { checklist: "created" };',
        timeoutSeconds: 20,
        position: { x: 872, y: 108 },
      },
    ],
    edges: [
      { id: 'edge-1', sourceNodeId: 'trigger-start', targetNodeId: 'create-user' },
      { id: 'edge-2', sourceNodeId: 'create-user', targetNodeId: 'assign-license' },
      { id: 'edge-3', sourceNodeId: 'assign-license', targetNodeId: 'publish-doc-note' },
    ],
    variables: [],
    bindings: {
      connections: [
        {
          connectionId: 'conn_graph_wingtip',
          connectorId: 'connector_graph',
          alias: 'Wingtip Graph',
          scopeType: 'client',
          requiredActions: ['createUser', 'assignLicense'],
        },
      ],
    },
    ai: {
      draftSource: 'ai',
      assumptions: ['The tenant already has GDAP and the platform app registration in place.', 'Inbound onboarding requests arrive through a signed webhook payload.'],
    },
    editor: {
      viewport: {
        zoom: 0.94,
      },
      selectedNodeIds: ['assign-license'],
    },
  };
}

function buildStandardsDriftWorkflowDraft(workflowId: string): WorkflowDocument {
  return {
    schemaVersion: 1,
    workflowId,
    displayName: 'Standards Drift Review',
    trigger: {
      type: 'schedule',
      config: {
        cron: '0 */4 * * *',
        timezone: 'America/New_York',
      },
    },
    errorHandling: buildDefaultWorkflowErrorHandling(),
    nodes: [
      {
        id: 'trigger-start',
        type: 'trigger',
        label: 'Cron Standards Sweep',
        triggerType: 'schedule',
        config: {
          cron: '0 */4 * * *',
          timezone: 'America/New_York',
        },
        position: { x: 72, y: 132 },
      },
      {
        id: 'load-drift-results',
        type: 'connector-action',
        label: 'Load Standards Result',
        connectorId: 'connector_graph',
        connectorVersionId: 'v1',
        actionId: 'getStandardsResult',
        connectionId: 'conn_graph_northwind',
        inputs: {
          standardId: 'std_mfa_enforcement',
        },
        position: { x: 338, y: 132 },
      },
      {
        id: 'needs-approval',
        type: 'condition',
        label: 'Needs Approval?',
        expression: 'result.severity === "high"',
        position: { x: 612, y: 132 },
      },
      {
        id: 'queue-remediation',
        type: 'connector-action',
        label: 'Queue Remediation Task',
        connectorId: 'connector_psa',
        connectorVersionId: 'v1',
        actionId: 'createTask',
        connectionId: 'conn_psa_primary',
        inputs: {
          board: 'Standards',
        },
        position: { x: 886, y: 132 },
      },
    ],
    edges: [
      { id: 'edge-1', sourceNodeId: 'trigger-start', targetNodeId: 'load-drift-results' },
      { id: 'edge-2', sourceNodeId: 'load-drift-results', targetNodeId: 'needs-approval' },
      { id: 'edge-3', sourceNodeId: 'needs-approval', targetNodeId: 'queue-remediation', conditionExpression: 'true' },
    ],
    variables: [],
    bindings: {
      connections: [
        {
          connectionId: 'conn_graph_northwind',
          connectorId: 'connector_graph',
          alias: 'Northwind Graph',
          scopeType: 'client',
          requiredActions: ['getStandardsResult'],
        },
        {
          connectionId: 'conn_psa_primary',
          connectorId: 'connector_psa',
          alias: 'Primary PSA',
          scopeType: 'msp',
          requiredActions: ['createTask'],
        },
      ],
    },
    ai: {
      draftSource: 'manual',
      assumptions: ['High-severity findings require technician review before changes are applied.'],
    },
    editor: {
      viewport: {
        zoom: 0.9,
      },
      selectedNodeIds: ['needs-approval'],
    },
  };
}

function deepClone(value: unknown) {
  return JSON.parse(JSON.stringify(value));
}







