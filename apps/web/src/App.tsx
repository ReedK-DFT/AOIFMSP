import { startTransition, useEffect, useState } from 'react';

import {
  fetchBootstrapContext,
  fetchSession,
  fetchTechnicianHome,
  fetchTenantDetail,
  fetchTenants,
  fetchWorkflows,
  type BootstrapContextResponse,
  type SessionResponse,
  type TechnicianHomeResponse,
  type TenantDetailResponse,
  type TenantListResponse,
  type WorkflowListResponse,
} from './api';
import { CommandBar, TechnicianWorkspace, TenantAdministration, WorkflowStudio } from './components/surfaces';

const fallbackBootstrap: BootstrapContextResponse = {
  product: {
    name: 'AOIFMSP',
    tagline: 'Automation of Integrations for Managed Service Providers',
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
  ],
  recommendedWorkflows: [
    {
      id: 'wf-ticket-triage',
      title: 'Ticket Triage Assistant',
      category: 'Technician Workspace',
      summary: 'Gather the full context around a ticket and recommend the next move.',
    },
  ],
  featureExposureModes: ['guided', 'standard', 'advanced'],
  inputModel: {
    profileSupport: true,
    surfaces: ['global', 'workflow-designer', 'tenant-admin', 'technician-workspace'],
  },
};

const fallbackSession: SessionResponse = {
  runtimeMode: 'memory',
  operator: {
    userObjectId: 'operator-demo',
    displayName: 'Reed Harper',
    userPrincipalName: 'reed@contosomsp.com',
    roles: ['TechnicianLead', 'AutomationBuilder'],
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

const fallbackWorkflows: WorkflowListResponse = {
  mspTenantId: 'msp_demo',
  items: [
    {
      id: 'wf_demo_ticket_triage',
      displayName: 'Ticket Triage Hub',
      status: 'draft',
      designAssistantMode: 'mixed',
      description: 'Collect ticket and tenant context into a guided technician surface.',
    },
  ],
};

const fallbackTechnicianHome: TechnicianHomeResponse = {
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
    recommendedWorkflowNames: ['Ticket Triage Hub'],
  },
  tickets: [],
  activeAlerts: [
    {
      id: 'alert_mfa_drift',
      title: 'MFA enforcement drift detected',
      severity: 'high',
      summary: 'Two break-glass accounts are excluded from the current MFA policy assignment.',
      tenantDisplayName: 'Northwind Dental',
    },
  ],
};

fallbackTechnicianHome.tickets = [fallbackTechnicianHome.highlightedTicket].filter(
  (ticket): ticket is NonNullable<TechnicianHomeResponse['highlightedTicket']> => Boolean(ticket),
);

const fallbackTenants: TenantListResponse = {
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
  ],
};

const fallbackTenantDetail: TenantDetailResponse = {
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
  ],
  syncState: [
    {
      datasetName: 'users',
      status: 'idle',
      lastSuccessfulSyncAt: '2026-03-12T15:22:00.000Z',
      recordCount: 27,
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
  recommendedWorkflows: fallbackWorkflows.items,
};

export function App() {
  const [bootstrap, setBootstrap] = useState<BootstrapContextResponse>(fallbackBootstrap);
  const [session, setSession] = useState<SessionResponse>(fallbackSession);
  const [workflows, setWorkflows] = useState<WorkflowListResponse>(fallbackWorkflows);
  const [technicianHome, setTechnicianHome] = useState<TechnicianHomeResponse>(fallbackTechnicianHome);
  const [tenants, setTenants] = useState<TenantListResponse>(fallbackTenants);
  const [tenantDetail, setTenantDetail] = useState<TenantDetailResponse>(fallbackTenantDetail);
  const [status, setStatus] = useState<'loading' | 'ready' | 'offline'>('loading');

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const [bootstrapResponse, sessionResponse, workflowResponse, technicianResponse, tenantResponse] = await Promise.all([
          fetchBootstrapContext(),
          fetchSession(),
          fetchWorkflows(),
          fetchTechnicianHome(),
          fetchTenants(),
        ]);

        const preferredTenantId =
          technicianResponse.highlightedTicket?.clientTenantId ?? tenantResponse.items[0]?.id ?? fallbackTenantDetail.tenant.id;
        const tenantDetailResponse = await fetchTenantDetail(preferredTenantId, tenantResponse.mspTenantId);

        if (!isMounted) {
          return;
        }

        startTransition(() => {
          setBootstrap(bootstrapResponse);
          setSession(sessionResponse);
          setWorkflows(workflowResponse);
          setTechnicianHome(technicianResponse);
          setTenants(tenantResponse);
          setTenantDetail(tenantDetailResponse);
          setStatus('ready');
        });
      } catch {
        if (!isMounted) {
          return;
        }

        setStatus('offline');
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeTenant = tenants.items.find((item) => item.id === tenantDetail.tenant.id) ?? tenants.items[0];

  return (
    <div className="app-shell">
      <div className="hero-gradient" />
      <header className="hero">
        <div className="hero__copy">
          <p className="hero__eyebrow">AOIFMSP</p>
          <h1>{bootstrap.product.tagline}</h1>
          <p className="hero__summary">
            A calm operating surface for MSP technicians and automation builders. Ticket context, tenant management,
            and workflow design live together instead of competing across disconnected tools.
          </p>
          <div className="hero__meta-row">
            <span>{session.mspTenant.displayName}</span>
            <span>{session.mspTenant.gdapRelationshipState} GDAP</span>
            <span>{session.operator.roles.slice(0, 2).join(' · ')}</span>
          </div>
        </div>
        <div className="hero__status-card">
          <span className={`status-dot status-dot--${status}`} />
          <div>
            <strong>{status === 'ready' ? 'Connected to live platform shell' : 'Using local fallback shell'}</strong>
            <p>
              {technicianHome.tickets.length} tickets, {tenants.items.length} client tenants, and {workflows.items.length}{' '}
              workflow surfaces ready.
            </p>
          </div>
        </div>
      </header>

      <CommandBar navigation={bootstrap.navigation} session={session} activeTenant={activeTenant} />

      <main className="surface-stack">
        <TechnicianWorkspace home={technicianHome} />
        <WorkflowStudio
          recommendations={bootstrap.recommendedWorkflows}
          workflows={workflows.items}
          highlightedTicket={technicianHome.highlightedTicket}
        />
        <TenantAdministration modes={bootstrap.featureExposureModes} tenantDetail={tenantDetail} />
      </main>
    </div>
  );
}

