import type {
  NavigationItem,
  SessionResponse,
  TechnicianHomeResponse,
  TenantDetailResponse,
  TenantListItem,
  WorkflowListItem,
  WorkflowRecommendation,
} from '../api';

interface CommandBarProps {
  navigation: NavigationItem[];
  session: SessionResponse;
  activeTenant?: TenantListItem | undefined;
}

export function CommandBar({ navigation, session, activeTenant }: CommandBarProps) {
  return (
    <div className="command-bar">
      <div className="command-bar__search">
        <span className="command-bar__label">Quick Jump</span>
        <input aria-label="Search AOIFMSP" placeholder="Search tickets, tenants, devices, workflows" />
      </div>
      <div className="command-bar__actions">
        {navigation.slice(0, 3).map((item) => (
          <button key={item.id} className="command-pill" type="button">
            {item.label}
          </button>
        ))}
      </div>
      <div className="persona-strip">
        <span>{session.operator.displayName}</span>
        <span>{session.operator.featureExposureMode}</span>
        {activeTenant ? <span>{activeTenant.displayName}</span> : null}
      </div>
    </div>
  );
}

interface TechnicianWorkspaceProps {
  home: TechnicianHomeResponse;
}

export function TechnicianWorkspace({ home }: TechnicianWorkspaceProps) {
  const highlightedTicket = home.highlightedTicket;

  return (
    <section className="panel panel--feature technician-shell">
      <header className="panel__header">
        <div>
          <p className="eyebrow">Technician Workspace</p>
          <h2>Tickets stay connected to the tenant, device, docs, and actions needed to resolve them</h2>
        </div>
        <button className="primary-action" type="button">
          Launch Guided Action
        </button>
      </header>

      <div className="queue-strip">
        {home.queueSummary.map((queue) => (
          <div key={queue.label} className="queue-pill">
            <strong>{queue.count}</strong>
            <span>{queue.label}</span>
          </div>
        ))}
      </div>

      <div className="technician-shell__grid">
        <article className="ticket-card ticket-card--active">
          {highlightedTicket ? (
            <>
              <p className="ticket-card__meta">
                {highlightedTicket.sourceSystem} Ticket · Priority {highlightedTicket.priority}
              </p>
              <h3>{highlightedTicket.title}</h3>
              <p>{highlightedTicket.summary}</p>
              <div className="ticket-card__tags">
                {highlightedTicket.tenantDisplayName ? <span>{highlightedTicket.tenantDisplayName}</span> : null}
                {highlightedTicket.relatedDeviceName ? <span>Device: {highlightedTicket.relatedDeviceName}</span> : null}
                {highlightedTicket.relatedUserDisplayName ? <span>User: {highlightedTicket.relatedUserDisplayName}</span> : null}
                {highlightedTicket.boardOrQueue ? <span>Queue: {highlightedTicket.boardOrQueue}</span> : null}
              </div>
              <div className="context-panel context-panel--embedded">
                <p className="eyebrow">Suggested Runs</p>
                <ul className="context-list">
                  {highlightedTicket.recommendedWorkflowNames.map((name) => (
                    <li key={name}>
                      <strong>{name}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <>
              <p className="ticket-card__meta">No active ticket selected</p>
              <h3>Technician workspace is ready</h3>
              <p>Once tickets arrive, their tenant and workflow context will appear here.</p>
            </>
          )}
        </article>

        <article className="context-stack">
          <div className="context-panel">
            <p className="eyebrow">Current Queue</p>
            <ul className="context-list">
              {home.tickets.slice(0, 3).map((ticket) => (
                <li key={ticket.id}>
                  <strong>{ticket.title}</strong>
                  <span>
                    {ticket.tenantDisplayName} · {ticket.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="context-panel">
            <p className="eyebrow">Active Alerts</p>
            <ul className="context-list">
              {home.activeAlerts.map((alert) => (
                <li key={alert.id}>
                  <strong>{alert.title}</strong>
                  <span>
                    {alert.tenantDisplayName} · {alert.severity}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </article>
      </div>
    </section>
  );
}

interface WorkflowStudioProps {
  recommendations: WorkflowRecommendation[];
  workflows: WorkflowListItem[];
  highlightedTicket: TechnicianHomeResponse['highlightedTicket'];
}

export function WorkflowStudio({ recommendations, workflows, highlightedTicket }: WorkflowStudioProps) {
  return (
    <section className="panel workflow-studio">
      <header className="panel__header">
        <div>
          <p className="eyebrow">Workflow Designer</p>
          <h2>Design automations from the work in front of the technician, not from a blank expert canvas</h2>
        </div>
        <button className="secondary-action" type="button">
          Draft With AI
        </button>
      </header>

      <div className="workflow-studio__layout">
        <div className="workflow-canvas">
          <div className="workflow-canvas__lane workflow-canvas__lane--trigger">Trigger</div>
          <div className="workflow-canvas__node">{highlightedTicket?.title ?? 'Select Ticket Context'}</div>
          <div className="workflow-canvas__node workflow-canvas__node--accent">Tenant Admin Action</div>
          <div className="workflow-canvas__node">Documentation Update</div>
          <div className="workflow-canvas__node">Technician Follow-Up</div>
        </div>

        <aside className="workflow-inspector">
          <h3>Suggested Blocks</h3>
          <ul className="recommendation-list">
            {recommendations.map((item) => (
              <li key={item.id}>
                <strong>{item.title}</strong>
                <span>{item.category}</span>
                <p>{item.summary}</p>
              </li>
            ))}
          </ul>
          <h3>Recent Drafts</h3>
          <ul className="mini-list">
            {workflows.map((workflow) => (
              <li key={workflow.id}>
                <strong>{workflow.displayName}</strong>
                <span>
                  {workflow.status} · {workflow.designAssistantMode}
                </span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}

interface TenantAdministrationProps {
  modes: string[];
  tenantDetail: TenantDetailResponse;
}

export function TenantAdministration({ modes, tenantDetail }: TenantAdministrationProps) {
  return (
    <section className="panel tenant-admin">
      <header className="panel__header">
        <div>
          <p className="eyebrow">Tenant Administration</p>
          <h2>{tenantDetail.tenant.displayName} is ready for guided user, standards, and ticket-linked actions</h2>
        </div>
        <div className="mode-switcher">
          {modes.map((mode) => (
            <span key={mode}>{mode}</span>
          ))}
        </div>
      </header>

      <div className="tenant-admin__summary-grid">
        <article className="admin-card">
          <p className="eyebrow">Tenant Posture</p>
          <h3>{tenantDetail.tenant.primaryDomain}</h3>
          <p>
            {tenantDetail.tenant.gdapRelationshipState} GDAP · {tenantDetail.tenant.defaultAdminAuthMode} ·{' '}
            {tenantDetail.tenant.openTicketCount} open tickets
          </p>
          <div className="ticket-card__tags">
            {tenantDetail.tenant.managementCapabilities.map((capability) => (
              <span key={capability}>{capability}</span>
            ))}
          </div>
        </article>
        <article className="admin-card">
          <p className="eyebrow">Managed Users</p>
          <ul className="mini-list">
            {tenantDetail.managedUsers.slice(0, 3).map((user) => (
              <li key={user.id}>
                <strong>{user.displayName}</strong>
                <span>
                  {user.status} · {user.licenses.join(', ') || 'No license'}
                </span>
              </li>
            ))}
          </ul>
        </article>
        <article className="admin-card">
          <p className="eyebrow">Sync and Standards</p>
          <ul className="mini-list">
            {tenantDetail.syncState.map((item) => (
              <li key={item.datasetName}>
                <strong>{item.datasetName}</strong>
                <span>
                  {item.status} · {item.recordCount ?? 0} records
                </span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="tenant-admin__cards">
        <article className="admin-card">
          <h3>Devices and Docs</h3>
          <ul className="mini-list">
            {tenantDetail.devices.slice(0, 2).map((device) => (
              <li key={device.id}>
                <strong>{device.displayName}</strong>
                <span>
                  {device.platform} · {device.status}
                </span>
              </li>
            ))}
            {tenantDetail.documentation.slice(0, 2).map((record) => (
              <li key={record.id}>
                <strong>{record.displayName}</strong>
                <span>{record.category ?? 'Documentation'}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="admin-card">
          <h3>Open Alerts</h3>
          <ul className="mini-list">
            {tenantDetail.alerts.map((alert) => (
              <li key={alert.id}>
                <strong>{alert.title}</strong>
                <span>
                  {alert.severity} · {alert.status}
                </span>
              </li>
            ))}
          </ul>
        </article>
        <article className="admin-card">
          <h3>Recommended Workflows</h3>
          <ul className="mini-list">
            {tenantDetail.recommendedWorkflows.map((workflow) => (
              <li key={workflow.id}>
                <strong>{workflow.displayName}</strong>
                <span>
                  {workflow.status} · {workflow.designAssistantMode}
                </span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

