import { startTransition, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';

import {
  createConnection,
  currentApiMode,
  fetchBootstrapContext,
  fetchConnectorDetail,
  fetchConnectors,
  fetchSession,
  fetchTechnicianHome,
  fetchTenantDetail,
  fetchTenants,
  fetchWorkflows,
  importConnector,
  previewConnectorImport,
  type BootstrapContextResponse,
  type ConnectionListItem,
  type ConnectorCatalogResponse,
  type ConnectorDetailResponse,
  type ConnectorImportPreviewResponse,
  type ConnectorImportRequest,
  type CreateConnectionRequest,
  type NavigationItem,
  type SessionResponse,
  type TechnicianHomeResponse,
  type TenantDetailResponse,
  type TenantListResponse,
  type WorkflowListResponse,
} from './api';
import {
  mockBootstrapContext,
  mockConnectorCatalog,
  mockConnectorDetails,
  mockSession,
  mockTechnicianHome,
  mockTenantDetails,
  mockTenants,
  mockWorkflows,
} from './mock-data';
import {
  AppNavBar,
  ContextDock,
  LauncherOverlay,
  SceneControlPanel,
  SurfaceToolbar,
  TenantAdministration,
  TechnicianWorkspace,
  WorkflowStudio,
} from './components/surfaces';
import { ConnectorStudio } from './components/connector-studio';

const fallbackBootstrap = mockBootstrapContext as BootstrapContextResponse;
const fallbackSession = mockSession as SessionResponse;
const fallbackWorkflows = mockWorkflows as WorkflowListResponse;
const fallbackTechnicianHome = mockTechnicianHome as TechnicianHomeResponse;
const fallbackTenants = mockTenants as TenantListResponse;
const fallbackTenantDetail = mockTenantDetails.tenant_northwind as TenantDetailResponse;
const fallbackConnectorCatalog = mockConnectorCatalog as ConnectorCatalogResponse;
const fallbackConnectorDetail = mockConnectorDetails.connector_graph as ConnectorDetailResponse;

const MIN_LEFT_WIDTH = 220;
const MAX_LEFT_WIDTH = 420;
const MIN_RIGHT_WIDTH = 260;
const MAX_RIGHT_WIDTH = 460;
const MIN_MAIN_WIDTH = 560;

export type SurfaceId = 'technician-workspace' | 'workflow-designer' | 'tenant-administration' | 'connectors';

type ScenePhase = 'idle' | 'scene-out' | 'scene-in';
type DragEdge = 'left' | 'right' | null;

export interface LauncherCommand {
  id: string;
  label: string;
  description: string;
  surfaceId: SurfaceId;
}

function normalizeSurfaceId(value?: string): SurfaceId {
  switch (value) {
    case 'workflow-designer':
      return 'workflow-designer';
    case 'tenant-admin':
    case 'tenant-administration':
      return 'tenant-administration';
    case 'connectors':
      return 'connectors';
    default:
      return 'technician-workspace';
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function normalizeHex(value: string, fallback: string): string {
  const hex = value.trim();
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex) ? hex : fallback;
}

function hexToRgb(value: string): [number, number, number] {
  const hex = normalizeHex(value, '#10634a').slice(1);
  const expanded = hex.length === 3 ? hex.split('').map((part) => part + part).join('') : hex;
  return [0, 2, 4].map((index) => Number.parseInt(expanded.slice(index, index + 2), 16)) as [number, number, number];
}

function rgba(value: string, alpha: number): string {
  const [red, green, blue] = hexToRgb(value);
  return 'rgba(' + red + ', ' + green + ', ' + blue + ', ' + alpha + ')';
}

function mixColors(base: string, blend: string, amount: number): string {
  const [r1, g1, b1] = hexToRgb(base);
  const [r2, g2, b2] = hexToRgb(blend);
  const mix = (left: number, right: number) => Math.round(left + (right - left) * amount);
  return 'rgb(' + mix(r1, r2) + ', ' + mix(g1, g2) + ', ' + mix(b1, b2) + ')';
}

function upsertConnectorCatalogItem(catalog: ConnectorCatalogResponse, detail: ConnectorDetailResponse): ConnectorCatalogResponse {
  const nextConnectors = [...catalog.connectors];
  const existingIndex = nextConnectors.findIndex((item) => item.id === detail.connector.id);

  if (existingIndex >= 0) {
    nextConnectors[existingIndex] = detail.connector;
  } else {
    nextConnectors.unshift(detail.connector);
  }

  return {
    ...catalog,
    connectors: nextConnectors.sort((left, right) => left.displayName.localeCompare(right.displayName)),
  };
}

function upsertConnectionInCatalog(catalog: ConnectorCatalogResponse, connection: ConnectionListItem): ConnectorCatalogResponse {
  const nextConnections = [...catalog.connections];
  const existingIndex = nextConnections.findIndex((item) => item.id === connection.id);

  if (existingIndex >= 0) {
    nextConnections[existingIndex] = connection;
  } else {
    nextConnections.unshift(connection);
  }

  const nextConnectors = catalog.connectors.map((connector) =>
    connector.id === connection.connectorId
      ? {
          ...connector,
          connectionCount: nextConnections.filter((item) => item.connectorId === connector.id).length,
        }
      : connector,
  );

  return {
    ...catalog,
    connectors: nextConnectors,
    connections: nextConnections.sort((left, right) => left.displayName.localeCompare(right.displayName)),
  };
}

function upsertConnectionInDetail(detail: ConnectorDetailResponse, connection: ConnectionListItem): ConnectorDetailResponse {
  const nextConnections = [...detail.connections];
  const existingIndex = nextConnections.findIndex((item) => item.id === connection.id);

  if (existingIndex >= 0) {
    nextConnections[existingIndex] = connection;
  } else {
    nextConnections.unshift(connection);
  }

  return {
    ...detail,
    connector: {
      ...detail.connector,
      connectionCount: nextConnections.length,
    },
    connections: nextConnections.sort((left, right) => left.displayName.localeCompare(right.displayName)),
  };
}

export function App() {
  const frameRef = useRef<HTMLElement | null>(null);
  const [bootstrap, setBootstrap] = useState<BootstrapContextResponse>(fallbackBootstrap);
  const [session, setSession] = useState<SessionResponse>(fallbackSession);
  const [workflows, setWorkflows] = useState<WorkflowListResponse>(fallbackWorkflows);
  const [technicianHome, setTechnicianHome] = useState<TechnicianHomeResponse>(fallbackTechnicianHome);
  const [tenants, setTenants] = useState<TenantListResponse>(fallbackTenants);
  const [tenantDetail, setTenantDetail] = useState<TenantDetailResponse>(fallbackTenantDetail);
  const [connectorCatalog, setConnectorCatalog] = useState<ConnectorCatalogResponse>(fallbackConnectorCatalog);
  const [connectorDetail, setConnectorDetail] = useState<ConnectorDetailResponse>(fallbackConnectorDetail);
  const [connectorPreview, setConnectorPreview] = useState<ConnectorImportPreviewResponse | null>(null);
  const [activeSurface, setActiveSurface] = useState<SurfaceId>('technician-workspace');
  const [visibleSurface, setVisibleSurface] = useState<SurfaceId>('technician-workspace');
  const [scenePhase, setScenePhase] = useState<ScenePhase>('idle');
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(280);
  const [rightDockWidth, setRightDockWidth] = useState(320);
  const [dragEdge, setDragEdge] = useState<DragEdge>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'offline'>('loading');
  const [busyIntent, setBusyIntent] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const primary = normalizeHex(bootstrap.branding.colors.primary, '#10634a');
    const secondary = normalizeHex(bootstrap.branding.colors.secondary, '#ff8a3d');
    const surface = normalizeHex(bootstrap.branding.colors.surface, '#f4efe7');

    root.style.setProperty('--accent', primary);
    root.style.setProperty('--accent-soft', mixColors(primary, '#ffffff', 0.82));
    root.style.setProperty('--signal', secondary);
    root.style.setProperty('--bg', surface);
    root.style.setProperty('--bg-panel-accent', mixColors(primary, '#ffffff', 0.9));
    root.style.setProperty('--hero-primary', rgba(primary, 0.16));
    root.style.setProperty('--hero-secondary', rgba(secondary, 0.18));
    root.style.setProperty('--brand-ring', rgba(primary, 0.2));
  }, [bootstrap.branding]);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const [
          bootstrapResponse,
          sessionResponse,
          workflowResponse,
          technicianResponse,
          tenantResponse,
          connectorResponse,
        ] = await Promise.all([
          fetchBootstrapContext(),
          fetchSession(),
          fetchWorkflows(),
          fetchTechnicianHome(),
          fetchTenants(),
          fetchConnectors(),
        ]);

        const preferredTenantId =
          technicianResponse.highlightedTicket?.clientTenantId ?? tenantResponse.items[0]?.id ?? fallbackTenantDetail.tenant.id;
        const tenantDetailResponse = await fetchTenantDetail(preferredTenantId, tenantResponse.mspTenantId);
        const preferredConnectorId = connectorResponse.connectors[0]?.id ?? fallbackConnectorDetail.connector.id;
        const connectorDetailResponse = await fetchConnectorDetail(preferredConnectorId, connectorResponse.mspTenantId);
        const preferredSurface = normalizeSurfaceId(sessionResponse.operator.preferredStartSurface);

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
          setConnectorCatalog(connectorResponse);
          setConnectorDetail(connectorDetailResponse);
          setActiveSurface(preferredSurface);
          setVisibleSurface(preferredSurface);
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

  useEffect(() => {
    if (activeSurface === visibleSurface) {
      return;
    }

    setScenePhase('scene-out');

    const swapTimeout = window.setTimeout(() => {
      setVisibleSurface(activeSurface);
      setScenePhase('scene-in');
    }, 150);

    const settleTimeout = window.setTimeout(() => {
      setScenePhase('idle');
    }, 340);

    return () => {
      window.clearTimeout(swapTimeout);
      window.clearTimeout(settleTimeout);
    };
  }, [activeSurface, visibleSurface]);

  useEffect(() => {
    if (!dragEdge) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const frame = frameRef.current;

      if (!frame) {
        return;
      }

      const rect = frame.getBoundingClientRect();
      const handleAllowance = 24;

      if (dragEdge === 'left') {
        const maxAllowed = rect.width - rightDockWidth - MIN_MAIN_WIDTH - handleAllowance;
        const nextWidth = clamp(event.clientX - rect.left, MIN_LEFT_WIDTH, Math.min(MAX_LEFT_WIDTH, maxAllowed));
        setLeftPanelWidth(nextWidth);
      }

      if (dragEdge === 'right') {
        const maxAllowed = rect.width - leftPanelWidth - MIN_MAIN_WIDTH - handleAllowance;
        const nextWidth = clamp(rect.right - event.clientX, MIN_RIGHT_WIDTH, Math.min(MAX_RIGHT_WIDTH, maxAllowed));
        setRightDockWidth(nextWidth);
      }
    };

    const handlePointerUp = () => {
      setDragEdge(null);
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragEdge, leftPanelWidth, rightDockWidth]);

  const handleWindowKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      setLauncherOpen((current) => !current);
      return;
    }

    if (event.key === 'Escape') {
      setLauncherOpen(false);
      return;
    }

    if (event.altKey && event.key === '1') {
      setActiveSurface('technician-workspace');
      return;
    }

    if (event.altKey && event.key === '2') {
      setActiveSurface('workflow-designer');
      return;
    }

    if (event.altKey && event.key === '3') {
      setActiveSurface('tenant-administration');
      return;
    }

    if (event.altKey && event.key === '4') {
      setActiveSurface('connectors');
    }
  });

  useEffect(() => {
    window.addEventListener('keydown', handleWindowKeyDown);

    return () => {
      window.removeEventListener('keydown', handleWindowKeyDown);
    };
  }, [handleWindowKeyDown]);

  const beginDrag = (edge: DragEdge) => (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setDragEdge(edge);
  };

  const handleSelectConnector = useEffectEvent(async (connectorId: string) => {
    setBusyIntent(`connector:${connectorId}`);

    try {
      const detail = await fetchConnectorDetail(connectorId, connectorCatalog.mspTenantId);
      startTransition(() => {
        setConnectorDetail(detail);
        setActiveSurface('connectors');
      });
    } finally {
      setBusyIntent(null);
    }
  });

  const handlePreviewConnectorImport = useEffectEvent(async (request: ConnectorImportRequest) => {
    setBusyIntent('preview-import');

    try {
      const preview = await previewConnectorImport(request);
      startTransition(() => {
        setConnectorPreview(preview);
        setActiveSurface('connectors');
      });
    } finally {
      setBusyIntent(null);
    }
  });

  const handleImportConnector = useEffectEvent(async (request: ConnectorImportRequest) => {
    setBusyIntent('import-connector');

    try {
      const detail = await importConnector(request, connectorCatalog.mspTenantId);
      startTransition(() => {
        setConnectorDetail(detail);
        setConnectorCatalog((current) => upsertConnectorCatalogItem(current, detail));
        setConnectorPreview(null);
        setActiveSurface('connectors');
      });
    } finally {
      setBusyIntent(null);
    }
  });

  const handleCreateConnection = useEffectEvent(async (request: CreateConnectionRequest) => {
    setBusyIntent('create-connection');

    try {
      const connection = await createConnection(request);
      startTransition(() => {
        setConnectorCatalog((current) => upsertConnectionInCatalog(current, connection));
        if (connectorDetail.connector.id === connection.connectorId) {
          setConnectorDetail((current) => upsertConnectionInDetail(current, connection));
        }
        setActiveSurface('connectors');
      });
    } finally {
      setBusyIntent(null);
    }
  });

  const activeTenant = tenants.items.find((item) => item.id === tenantDetail.tenant.id) ?? tenants.items[0];
  const visibleNavigation = bootstrap.navigation.find((item) => item.id === visibleSurface) ?? bootstrap.navigation[0];
  const apiMode = currentApiMode();
  const statusLabel =
    status === 'ready'
      ? apiMode === 'mock'
        ? 'Local demo shell'
        : 'Live platform shell'
      : 'Fallback shell';

  const toolbarActions = useMemo(() => {
    switch (visibleSurface) {
      case 'workflow-designer':
        return [
          { id: 'draft-ai', label: 'Draft With AI', emphasis: 'primary' as const },
          { id: 'add-block', label: 'Add Block', emphasis: 'secondary' as const },
          { id: 'publish', label: 'Publish Draft', emphasis: 'secondary' as const },
        ];
      case 'tenant-administration':
        return [
          { id: 'add-user', label: 'Add User', emphasis: 'primary' as const },
          { id: 'assign-license', label: 'Assign License', emphasis: 'secondary' as const },
          { id: 'review-drift', label: 'Review Drift', emphasis: 'secondary' as const },
        ];
      case 'connectors':
        return [
          { id: 'preview-import', label: 'Preview Import', emphasis: 'primary' as const },
          { id: 'import-connector', label: 'Import Connector', emphasis: 'secondary' as const },
          { id: 'create-connection', label: 'Add Connection', emphasis: 'secondary' as const },
        ];
      default:
        return [
          { id: 'guided-action', label: 'Launch Guided Action', emphasis: 'primary' as const },
          { id: 'open-ticket', label: 'Open Ticket', emphasis: 'secondary' as const },
          { id: 'open-tenant', label: 'Open Tenant', emphasis: 'secondary' as const },
        ];
    }
  }, [visibleSurface]);

  const launcherCommands = useMemo<LauncherCommand[]>(() => {
    const baseCommands = bootstrap.navigation.map((item) => ({
      id: `open-${item.id}`,
      label: item.label,
      description: `Open ${item.description.toLowerCase()}`,
      surfaceId: item.id as SurfaceId,
    }));

    return [
      ...baseCommands,
      {
        id: 'guided-action',
        label: 'Launch Guided Action',
        description: 'Open the technician workspace with the current ticket in focus.',
        surfaceId: 'technician-workspace',
      },
      {
        id: 'draft-workflow',
        label: 'Draft Workflow',
        description: 'Jump to the workflow designer and continue from the highlighted context.',
        surfaceId: 'workflow-designer',
      },
      {
        id: 'open-tenant-admin',
        label: 'Open Tenant Admin',
        description: `Jump to ${tenantDetail.tenant.displayName} administration tools.`,
        surfaceId: 'tenant-administration',
      },
      {
        id: 'open-connectors',
        label: 'Open Platform Connectors',
        description: 'Jump to API connection management and connector import tools.',
        surfaceId: 'connectors',
      },
    ];
  }, [bootstrap.navigation, tenantDetail.tenant.displayName]);

  const frameStyle = {
    '--left-panel-width': `${leftPanelWidth}px`,
    '--right-dock-width': `${rightDockWidth}px`,
  } as CSSProperties;

  return (
    <div className="app-shell app-shell--viewport">
      <div className="hero-gradient" />

      <AppNavBar
        branding={bootstrap.branding}
        navigation={bootstrap.navigation}
        activeSurface={activeSurface}
        onNavigate={setActiveSurface}
        onOpenLauncher={() => setLauncherOpen(true)}
        session={session}
        activeTenant={activeTenant}
        statusLabel={statusLabel}
      />

      <SurfaceToolbar
        activeSurface={visibleSurface}
        activeNavigation={visibleNavigation}
        actions={toolbarActions}
        activeTenant={activeTenant}
      />

      <main ref={frameRef} className="surface-frame" style={frameStyle}>
        <SceneControlPanel
          activeSurface={visibleSurface}
          technicianHome={technicianHome}
          tenantDetail={tenantDetail}
          workflows={workflows.items}
          connectorCatalog={connectorCatalog}
          connectorDetail={connectorDetail}
          connectorPreview={connectorPreview?.preview ?? null}
          busyIntent={busyIntent}
        />

        <button
          className={`column-handle column-handle--left${dragEdge === 'left' ? ' is-dragging' : ''}`}
          type="button"
          aria-label="Resize left panel"
          onPointerDown={beginDrag('left')}
        />

        <section className="workspace-shell panel">
          <header className="workspace-shell__header">
            <div>
              <p className="eyebrow">{visibleNavigation?.label ?? 'Workspace'}</p>
              <h2>{visibleNavigation?.description ?? 'AOIFMSP operational surface'}</h2>
            </div>
            <div className="workspace-shell__context">
              <span>{activeTenant?.displayName ?? session.mspTenant.displayName}</span>
              <span>{session.operator.featureExposureMode}</span>
              <span>{visibleSurface.replace(/-/g, ' ')}</span>
            </div>
          </header>

          <div className={`workspace-shell__body workspace-shell__body--scene ${scenePhase}`}>
            {visibleSurface === 'technician-workspace' ? <TechnicianWorkspace home={technicianHome} /> : null}
            {visibleSurface === 'workflow-designer' ? (
              <WorkflowStudio
                recommendations={bootstrap.recommendedWorkflows}
                workflows={workflows.items}
                highlightedTicket={technicianHome.highlightedTicket}
              />
            ) : null}
            {visibleSurface === 'tenant-administration' ? (
              <TenantAdministration modes={bootstrap.featureExposureModes} tenantDetail={tenantDetail} />
            ) : null}
            {visibleSurface === 'connectors' ? (
              <ConnectorStudio
                catalog={connectorCatalog}
                connectorDetail={connectorDetail}
                connectorPreview={connectorPreview}
                busyIntent={busyIntent}
                onSelectConnector={(connectorId) => void handleSelectConnector(connectorId)}
                onPreviewImport={(request) => void handlePreviewConnectorImport(request)}
                onImportConnector={(request) => void handleImportConnector(request)}
                onCreateConnection={(request) => void handleCreateConnection(request)}
              />
            ) : null}
          </div>
        </section>

        <button
          className={`column-handle column-handle--right${dragEdge === 'right' ? ' is-dragging' : ''}`}
          type="button"
          aria-label="Resize right panel"
          onPointerDown={beginDrag('right')}
        />

        <ContextDock
          session={session}
          tenantDetail={tenantDetail}
          home={technicianHome}
          workflows={workflows.items}
          activeSurface={visibleSurface}
          connectorCatalog={connectorCatalog}
          connectorDetail={connectorDetail}
          connectorPreview={connectorPreview?.preview ?? null}
        />
      </main>

      <LauncherOverlay
        open={launcherOpen}
        activeSurface={activeSurface}
        commands={launcherCommands}
        onClose={() => setLauncherOpen(false)}
        onSelect={(surface) => {
          setActiveSurface(surface);
          setLauncherOpen(false);
        }}
      />
    </div>
  );
}


