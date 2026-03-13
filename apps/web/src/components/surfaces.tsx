import { useMemo, useState } from 'react';

import type {
  ConnectorCatalogResponse,
  ConnectorDetailResponse,
  ConnectorImportPreview,
  NavigationItem,
  SessionResponse,
  TechnicianHomeResponse,
  TenantDetailResponse,
  TenantListItem,
  WorkflowDetailResponse,
  WorkflowListItem,
} from '../api';
import type { LauncherCommand, SurfaceId } from '../App';
export { WorkflowStudio } from './workflow-designer';
import type { WorkflowSceneSnapshot } from './workflow-designer';

interface AppNavBarProps {
  branding: {
    mspName: string;
    abbreviation: string;
    logos: {
      markUrl?: string | undefined;
      wordmarkUrl?: string | undefined;
    };
  };
  navigation: NavigationItem[];
  activeSurface: SurfaceId;
  onNavigate: (surface: SurfaceId) => void;
  onOpenLauncher: () => void;
  session: SessionResponse;
  activeTenant?: TenantListItem | undefined;
  statusLabel: string;
}

export function AppNavBar({
  branding,
  navigation,
  activeSurface,
  onNavigate,
  onOpenLauncher,
  session,
  activeTenant,
  statusLabel,
}: AppNavBarProps) {
  return (
    <header className="app-nav panel">
      <div className="app-nav__brand">
        <span className="app-nav__logo">
          {branding.logos.markUrl ? <img className="app-nav__logo-image" src={branding.logos.markUrl} alt={`${branding.mspName} mark`} /> : branding.abbreviation}
        </span>
        <div>
          {branding.logos.wordmarkUrl ? <img className="app-nav__wordmark" src={branding.logos.wordmarkUrl} alt={`${branding.mspName} wordmark`} /> : <strong>{branding.mspName}</strong>}
          <p>{statusLabel}</p>
        </div>
      </div>

      <nav className="app-nav__tabs" aria-label="Application navigation">
        {navigation.map((item) => {
          const isActive = item.id === activeSurface;

          return (
            <button
              key={item.id}
              className={`app-nav__tab${isActive ? ' app-nav__tab--active' : ''}`}
              type="button"
              onClick={() => onNavigate(item.id as SurfaceId)}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="app-nav__meta">
        <button className="secondary-action" type="button" onClick={onOpenLauncher}>
          Launcher
        </button>
        <span>{activeTenant?.displayName ?? session.mspTenant.displayName}</span>
        <span>{session.operator.displayName}</span>
      </div>
    </header>
  );
}

interface SurfaceToolbarProps {
  activeSurface: SurfaceId;
  activeNavigation?: NavigationItem | undefined;
  actions: Array<{
    id: string;
    label: string;
    emphasis: 'primary' | 'secondary';
    disabled?: boolean | undefined;
  }>;
  activeTenant?: TenantListItem | undefined;
  onAction: (actionId: string) => void;
}

export function SurfaceToolbar({ activeSurface, activeNavigation, actions, activeTenant, onAction }: SurfaceToolbarProps) {
  return (
    <section className="surface-toolbar panel">
      <div className="surface-toolbar__summary">
        <p className="eyebrow">Scene Toolbar</p>
        <h2>{activeNavigation?.label ?? 'Workspace'}</h2>
        <span>
          {activeTenant?.displayName ?? 'No tenant selected'} · {activeSurface.replace(/-/g, ' ')}
        </span>
      </div>

      <div className="surface-toolbar__actions">
        {actions.map((action) => (
          <button
            key={action.id}
            className={action.emphasis === 'primary' ? 'primary-action' : 'secondary-action'}
            type="button"
            disabled={action.disabled}
            onClick={() => onAction(action.id)}
          >
            {action.label}
          </button>
        ))}
      </div>
    </section>
  );
}

interface SceneControlPanelProps {
  activeSurface: SurfaceId;
  technicianHome: TechnicianHomeResponse;
  tenantDetail: TenantDetailResponse;
  workflows: WorkflowListItem[];
  connectorCatalog: ConnectorCatalogResponse;
  connectorDetail: ConnectorDetailResponse;
  connectorPreview: ConnectorImportPreview | null;
  busyIntent: string | null;
  workflowDetail: WorkflowDetailResponse;
  workflowSceneState: WorkflowSceneSnapshot;
}

export function SceneControlPanel({
  activeSurface,
  technicianHome,
  tenantDetail,
  workflows,
  connectorCatalog,
  connectorDetail,
  connectorPreview,
  busyIntent,
  workflowDetail,
  workflowSceneState,
}: SceneControlPanelProps) {
  return (
    <aside className="scene-panel panel">
      {activeSurface === 'technician-workspace' ? (
        <>
          <div className="scene-panel__section">
            <p className="eyebrow">Focused Ticket</p>
            <h3>{technicianHome.highlightedTicket?.title ?? 'No active ticket'}</h3>
            <p>{technicianHome.highlightedTicket?.summary ?? 'Select a ticket to inspect context and actions.'}</p>
          </div>
          <div className="scene-panel__section">
            <p className="eyebrow">Queue State</p>
            <ul className="mini-list">
              {technicianHome.queueSummary.map((queue) => (
                <li key={queue.label}>
                  <strong>{queue.label}</strong>
                  <span>{queue.count} items</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="scene-panel__section">
            <p className="eyebrow">Quick Controls</p>
            <div className="ticket-card__tags">
              <span>Attach Runbook</span>
              <span>Queue Workflow</span>
              <span>Escalate</span>
            </div>
          </div>
        </>
      ) : null}

      {activeSurface === 'workflow-designer' ? (
        <>
          <div className="scene-panel__section">
            <p className="eyebrow">Selected Block</p>
            <h3>{workflowSceneState.selectedNodeLabel ?? workflowDetail.workflow.displayName}</h3>
            <p>
              {workflowSceneState.selectedNodeType
                ? `${workflowSceneState.selectedNodeType} block selected in the main view.`
                : 'Select a workflow block to inspect and edit it here.'}
            </p>
          </div>
          <div className="scene-panel__section">
            <p className="eyebrow">Scene Controls</p>
            <ul className="mini-list">
              <li>
                <strong>Canvas Zoom</strong>
                <span>{Math.round(workflowSceneState.zoom * 100)}%</span>
              </li>
              <li>
                <strong>Draft State</strong>
                <span>{workflowSceneState.isDirty ? 'Unsaved changes' : 'Saved'}</span>
              </li>
              <li>
                <strong>Trigger Mode</strong>
                <span>{workflowSceneState.triggerType ? workflowSceneState.triggerType.replace(/-/g, ' ') : 'manual'}</span>
              </li>
              <li>
                <strong>Start Condition</strong>
                <span>{workflowSceneState.triggerSummary ?? 'In-app launch'}</span>
              </li>
              <li>
                <strong>Template Basis</strong>
                <span>{technicianHome.highlightedTicket?.tenantDisplayName ?? 'Generic'}</span>
              </li>
            </ul>
          </div>
          <div className="scene-panel__section">
            <p className="eyebrow">Draft Queue</p>
            <ul className="mini-list">
              <li>
                <strong>{workflowSceneState.nodeCount} blocks</strong>
                <span>{workflowSceneState.edgeCount} links</span>
              </li>
              {workflows.slice(0, 3).map((workflow) => (
                <li key={workflow.id}>
                  <strong>{workflow.displayName}</strong>
                  <span>{workflow.designAssistantMode}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}

      {activeSurface === 'tenant-administration' ? (
        <>
          <div className="scene-panel__section">
            <p className="eyebrow">Tenant Profile</p>
            <h3>{tenantDetail.tenant.displayName}</h3>
            <p>
              {tenantDetail.tenant.primaryDomain} · {tenantDetail.tenant.defaultAdminAuthMode}
            </p>
          </div>
          <div className="scene-panel__section">
            <p className="eyebrow">Capabilities</p>
            <div className="ticket-card__tags">
              {tenantDetail.tenant.managementCapabilities.map((capability) => (
                <span key={capability}>{capability}</span>
              ))}
            </div>
          </div>
          <div className="scene-panel__section">
            <p className="eyebrow">Admin Focus</p>
            <ul className="mini-list">
              <li>
                <strong>Managed Users</strong>
                <span>{tenantDetail.managedUsers.length}</span>
              </li>
              <li>
                <strong>Open Alerts</strong>
                <span>{tenantDetail.alerts.length}</span>
              </li>
              <li>
                <strong>Standards Results</strong>
                <span>{tenantDetail.standards.length}</span>
              </li>
            </ul>
          </div>
        </>
      ) : null}

      {activeSurface === 'connectors' ? (
        <>
          <div className="scene-panel__section">
            <p className="eyebrow">Selected Connector</p>
            <h3>{connectorDetail.connector.displayName}</h3>
            <p>{connectorDetail.connector.summary ?? 'Connector summary will appear here.'}</p>
          </div>
          <div className="scene-panel__section">
            <p className="eyebrow">Connector Stats</p>
            <ul className="mini-list">
              <li>
                <strong>Published Actions</strong>
                <span>{connectorDetail.actions.length}</span>
              </li>
              <li>
                <strong>Connections</strong>
                <span>{connectorDetail.connections.length}</span>
              </li>
              <li>
                <strong>Catalog Size</strong>
                <span>{connectorCatalog.connectors.length} connectors</span>
              </li>
            </ul>
          </div>
          <div className="scene-panel__section">
            <p className="eyebrow">Import State</p>
            <ul className="mini-list">
              <li>
                <strong>Busy Intent</strong>
                <span>{busyIntent ?? 'idle'}</span>
              </li>
              <li>
                <strong>Preview Actions</strong>
                <span>{connectorPreview?.actions.length ?? 0}</span>
              </li>
              <li>
                <strong>Auth Modes</strong>
                <span>{connectorDetail.connector.authSchemes.join(', ') || 'custom'}</span>
              </li>
            </ul>
          </div>
        </>
      ) : null}
    </aside>
  );
}

interface LauncherOverlayProps {
  open: boolean;
  activeSurface: SurfaceId;
  commands: LauncherCommand[];
  onClose: () => void;
  onSelect: (surface: SurfaceId) => void;
}

export function LauncherOverlay({ open, activeSurface, commands, onClose, onSelect }: LauncherOverlayProps) {
  const [query, setQuery] = useState('');

  const filteredCommands = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return commands;
    }

    return commands.filter((command) => {
      const haystack = `${command.label} ${command.description} ${command.surfaceId}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [commands, query]);

  if (!open) {
    return null;
  }

  return (
    <div className="launcher-overlay" role="dialog" aria-modal="true" aria-label="AOIFMSP launcher">
      <button className="launcher-overlay__backdrop" type="button" onClick={onClose} aria-label="Close launcher" />
      <div className="launcher-panel">
        <div className="launcher-panel__header">
          <p className="eyebrow">Launcher</p>
          <span>{activeSurface.replace(/-/g, ' ')}</span>
        </div>
        <input
          autoFocus
          className="launcher-panel__input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Jump to a surface or action"
        />
        <div className="launcher-panel__results">
          {filteredCommands.map((command) => (
            <button
              key={command.id}
              className="launcher-command"
              type="button"
              onClick={() => onSelect(command.surfaceId)}
            >
              <strong>{command.label}</strong>
              <span>{command.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ContextDockProps {
  session: SessionResponse;
  tenantDetail: TenantDetailResponse;
  home: TechnicianHomeResponse;
  workflows: WorkflowListItem[];
  activeSurface: SurfaceId;
  connectorCatalog: ConnectorCatalogResponse;
  connectorDetail: ConnectorDetailResponse;
  connectorPreview: ConnectorImportPreview | null;
}

export function ContextDock({
  session,
  tenantDetail,
  home,
  workflows,
  activeSurface,
  connectorCatalog,
  connectorDetail,
  connectorPreview,
}: ContextDockProps) {
  return (
    <aside className="context-dock panel">
      <div className="context-dock__section">
        <p className="eyebrow">Operator</p>
        <h3>{session.operator.displayName}</h3>
        <p>{session.operator.userPrincipalName}</p>
        <div className="ticket-card__tags">
          {session.operator.roles.slice(0, 3).map((role) => (
            <span key={role}>{role}</span>
          ))}
        </div>
      </div>

      <div className="context-dock__section">
        <p className="eyebrow">Tenant Focus</p>
        <h3>{tenantDetail.tenant.displayName}</h3>
        <p>
          {tenantDetail.tenant.primaryDomain} · {tenantDetail.tenant.openTicketCount} open tickets
        </p>
      </div>

      <div className="context-dock__section">
        <p className="eyebrow">Live Queue</p>
        <ul className="mini-list">
          {home.tickets.slice(0, 3).map((ticket) => (
            <li key={ticket.id}>
              <strong>{ticket.title}</strong>
              <span>
                {ticket.priority} · {ticket.status}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="context-dock__section">
        <p className="eyebrow">Surface Assist</p>
        <ul className="mini-list">
          {activeSurface === 'workflow-designer'
            ? workflows.slice(0, 3).map((workflow) => (
                <li key={workflow.id}>
                  <strong>{workflow.displayName}</strong>
                  <span>{workflow.designAssistantMode}</span>
                </li>
              ))
            : activeSurface === 'connectors'
              ? connectorDetail.connections.slice(0, 3).map((connection) => (
                  <li key={connection.id}>
                    <strong>{connection.displayName}</strong>
                    <span>
                      {connection.authType} · {connection.scopeType}
                    </span>
                  </li>
                ))
              : tenantDetail.recommendedWorkflows.slice(0, 3).map((workflow) => (
                  <li key={workflow.id}>
                    <strong>{workflow.displayName}</strong>
                    <span>{workflow.status}</span>
                  </li>
                ))}
        </ul>
      </div>

      {activeSurface === 'connectors' ? (
        <div className="context-dock__section">
          <p className="eyebrow">Import Preview</p>
          <ul className="mini-list">
            <li>
              <strong>{connectorCatalog.connectors.length} catalog connectors</strong>
              <span>{connectorCatalog.connections.length} authenticated connections</span>
            </li>
            <li>
              <strong>{connectorPreview?.displayName ?? connectorDetail.connector.displayName}</strong>
              <span>{connectorPreview?.actions.length ?? connectorDetail.actions.length} available actions</span>
            </li>
          </ul>
        </div>
      ) : null}
    </aside>
  );
}

interface TechnicianWorkspaceProps {
  home: TechnicianHomeResponse;
}

export function TechnicianWorkspace({ home }: TechnicianWorkspaceProps) {
  const highlightedTicket = home.highlightedTicket;

  return (
    <section className="surface-page surface-page--technician">
      <div className="surface-page__grid surface-page__grid--technician">
        <article className="ticket-card ticket-card--active ticket-card--primary">
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

        <div className="surface-stack-mini">
          <article className="context-panel panel-scroll">
            <div className="panel-scroll__header">
              <p className="eyebrow">Current Queue</p>
              <button className="secondary-action" type="button">
                Run Guided Action
              </button>
            </div>
            <ul className="context-list">
              {home.tickets.map((ticket) => (
                <li key={ticket.id}>
                  <strong>{ticket.title}</strong>
                  <span>
                    {ticket.tenantDisplayName} · {ticket.status}
                  </span>
                </li>
              ))}
            </ul>
          </article>

          <article className="context-panel panel-scroll">
            <div className="panel-scroll__header">
              <p className="eyebrow">Active Alerts</p>
              <button className="secondary-action" type="button">
                View Queue
              </button>
            </div>
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
          </article>
        </div>
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
    <section className="surface-page surface-page--tenant-admin">
      <div className="tenant-admin__hero context-panel">
        <div>
          <p className="eyebrow">Tenant Administration</p>
          <h3>{tenantDetail.tenant.displayName}</h3>
          <p>
            {tenantDetail.tenant.primaryDomain} · {tenantDetail.tenant.gdapRelationshipState} GDAP ·{' '}
            {tenantDetail.tenant.defaultAdminAuthMode}
          </p>
        </div>
        <div className="mode-switcher">
          {modes.map((mode) => (
            <span key={mode}>{mode}</span>
          ))}
        </div>
      </div>

      <div className="surface-page__grid surface-page__grid--tenant-admin">
        <article className="admin-card panel-scroll">
          <div className="panel-scroll__header">
            <p className="eyebrow">Managed Users</p>
            <button className="primary-action" type="button">
              Add User
            </button>
          </div>
          <ul className="mini-list">
            {tenantDetail.managedUsers.map((user) => (
              <li key={user.id}>
                <strong>{user.displayName}</strong>
                <span>
                  {user.status} · {user.licenses.join(', ') || 'No license'}
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="admin-card panel-scroll">
          <div className="panel-scroll__header">
            <p className="eyebrow">Devices and Docs</p>
            <button className="secondary-action" type="button">
              Open Context
            </button>
          </div>
          <ul className="mini-list">
            {tenantDetail.devices.map((device) => (
              <li key={device.id}>
                <strong>{device.displayName}</strong>
                <span>
                  {device.platform} · {device.status}
                </span>
              </li>
            ))}
            {tenantDetail.documentation.map((record) => (
              <li key={record.id}>
                <strong>{record.displayName}</strong>
                <span>{record.category ?? 'Documentation'}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="admin-card panel-scroll">
          <div className="panel-scroll__header">
            <p className="eyebrow">Alerts and Standards</p>
            <button className="secondary-action" type="button">
              Review Drift
            </button>
          </div>
          <ul className="mini-list">
            {tenantDetail.alerts.map((alert) => (
              <li key={alert.id}>
                <strong>{alert.title}</strong>
                <span>
                  {alert.severity} · {alert.status}
                </span>
              </li>
            ))}
            {tenantDetail.standards.map((standard) => (
              <li key={standard.standardId}>
                <strong>{standard.standardId}</strong>
                <span>
                  {standard.severity} · {standard.status}
                </span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}










