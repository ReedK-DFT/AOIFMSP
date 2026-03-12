import { useEffect, useState } from 'react';

import type {
  ConnectorCatalogResponse,
  ConnectorDetailResponse,
  ConnectorImportPreviewResponse,
  ConnectorImportRequest,
  CreateConnectionRequest,
} from '../api';

interface ConnectorStudioProps {
  catalog: ConnectorCatalogResponse;
  connectorDetail: ConnectorDetailResponse;
  connectorPreview: ConnectorImportPreviewResponse | null;
  busyIntent: string | null;
  onSelectConnector: (connectorId: string) => void;
  onPreviewImport: (request: ConnectorImportRequest) => void;
  onImportConnector: (request: ConnectorImportRequest) => void;
  onCreateConnection: (request: CreateConnectionRequest) => void;
}

const defaultSpecificationText = `{
  "openapi": "3.0.3",
  "info": {
    "title": "Example Integration",
    "version": "1.0.0",
    "description": "Paste a Swagger or OpenAPI document here to derive standard AOIFMSP actions."
  },
  "paths": {
    "/tickets": {
      "get": {
        "summary": "List tickets"
      }
    },
    "/tickets/{ticketId}/notes": {
      "post": {
        "summary": "Append ticket note"
      }
    }
  },
  "components": {
    "securitySchemes": {
      "ApiKeyAuth": {
        "type": "apiKey"
      }
    },
    "schemas": {
      "Ticket": {},
      "TicketNote": {}
    }
  }
}`;

function dispositionTone(disposition: string): string {
  switch (disposition) {
    case 'authoritative':
      return 'good';
    case 'augmenting':
      return 'info';
    case 'fallback':
      return 'warn';
    case 'redundant':
    case 'disabled':
      return 'risk';
    default:
      return 'neutral';
  }
}

export function ConnectorStudio({
  catalog,
  connectorDetail,
  connectorPreview,
  busyIntent,
  onSelectConnector,
  onPreviewImport,
  onImportConnector,
  onCreateConnection,
}: ConnectorStudioProps) {
  const [importForm, setImportForm] = useState<ConnectorImportRequest>({
    sourceType: 'openapi-upload',
    displayName: 'Example Integration',
    providerName: 'Example Provider',
    category: 'Custom Integration',
    defaultAuthType: 'api-key',
    visibility: 'private',
    versionLabel: 'v1',
    importSource: 'direct-upload',
    specificationText: defaultSpecificationText,
    documentationText: '',
    documentationUrl: '',
    summary: 'Connector scaffold used for import preview and action derivation.',
  });
  const [connectionForm, setConnectionForm] = useState<CreateConnectionRequest>({
    displayName: `${connectorDetail.connector.displayName} Connection`,
    connectorId: connectorDetail.connector.id,
    connectorVersionId: connectorDetail.connector.latestVersion,
    scopeType: 'msp',
    authType: connectorDetail.connector.defaultAuthType,
    capabilities: [],
    secret: {
      authType: connectorDetail.connector.defaultAuthType,
      apiKey: '',
    },
  });

  useEffect(() => {
    setConnectionForm((current) => ({
      ...current,
      displayName: current.displayName || `${connectorDetail.connector.displayName} Connection`,
      connectorId: connectorDetail.connector.id,
      connectorVersionId: connectorDetail.connector.latestVersion,
      authType: connectorDetail.connector.defaultAuthType,
      secret: {
        ...current.secret,
        authType: connectorDetail.connector.defaultAuthType,
      },
    }));
  }, [connectorDetail.connector.defaultAuthType, connectorDetail.connector.displayName, connectorDetail.connector.id, connectorDetail.connector.latestVersion]);

  const importBusy = busyIntent === 'preview-import' || busyIntent === 'import-connector';
  const connectionBusy = busyIntent === 'create-connection';
  const visiblePreview = connectorPreview?.preview ?? null;
  const visibleNormalization = connectorPreview?.normalization ?? connectorDetail.normalization;

  return (
    <section className="surface-page surface-page--connectors">
      <div className="connector-scene">
        <div className="connector-scene__hero context-panel">
          <div>
            <p className="eyebrow">Platform Connector Administration</p>
            <h3>{connectorDetail.connector.displayName}</h3>
            <p>
              {connectorDetail.connector.providerName} · {connectorDetail.connector.sourceType} · {connectorDetail.connector.defaultAuthType}
            </p>
          </div>
          <div className="ticket-card__tags">
            <span>{catalog.connectors.length} connectors</span>
            <span>{catalog.connections.length} connections</span>
            <span>{visibleNormalization.items.length} normalized actions</span>
          </div>
        </div>

        <div className="connector-scene__grid">
          <article className="connector-panel panel-scroll">
            <div className="panel-scroll__header">
              <p className="eyebrow">Import Connector</p>
              <button className="secondary-action" type="button" disabled={importBusy} onClick={() => onPreviewImport(importForm)}>
                Preview
              </button>
            </div>
            <div className="form-grid">
              <label className="form-field">
                <span>Name</span>
                <input value={importForm.displayName ?? ''} onChange={(event) => setImportForm((current) => ({ ...current, displayName: event.target.value }))} />
              </label>
              <label className="form-field">
                <span>Provider</span>
                <input value={importForm.providerName ?? ''} onChange={(event) => setImportForm((current) => ({ ...current, providerName: event.target.value }))} />
              </label>
              <label className="form-field">
                <span>Source Type</span>
                <select value={importForm.sourceType} onChange={(event) => setImportForm((current) => ({ ...current, sourceType: event.target.value as ConnectorImportRequest['sourceType'] }))}>
                  <option value="openapi-upload">OpenAPI Upload</option>
                  <option value="openapi-url">OpenAPI URL</option>
                  <option value="manual-adapter">Documentation Adapter</option>
                </select>
              </label>
              <label className="form-field">
                <span>Default Auth</span>
                <select value={importForm.defaultAuthType ?? 'api-key'} onChange={(event) => setImportForm((current) => ({ ...current, defaultAuthType: event.target.value }))}>
                  <option value="api-key">API Key</option>
                  <option value="oauth2-client-credentials">OAuth2 Client Credentials</option>
                  <option value="oauth2-authorization-code">OAuth2 Authorization Code</option>
                  <option value="oauth2-on-behalf-of">OAuth2 OBO</option>
                  <option value="basic-auth">Basic Auth</option>
                  <option value="custom">Custom</option>
                </select>
              </label>
              <label className="form-field">
                <span>Category</span>
                <input value={importForm.category ?? ''} onChange={(event) => setImportForm((current) => ({ ...current, category: event.target.value }))} />
              </label>
              <label className="form-field">
                <span>Visibility</span>
                <select value={importForm.visibility ?? 'private'} onChange={(event) => setImportForm((current) => ({ ...current, visibility: event.target.value as 'private' | 'shared' }))}>
                  <option value="private">Private</option>
                  <option value="shared">Shared</option>
                </select>
              </label>
              <label className="form-field form-field--wide">
                <span>Import Source</span>
                <input value={importForm.importSource ?? ''} onChange={(event) => setImportForm((current) => ({ ...current, importSource: event.target.value }))} />
              </label>
              <label className="form-field form-field--wide">
                <span>Summary</span>
                <input value={importForm.summary ?? ''} onChange={(event) => setImportForm((current) => ({ ...current, summary: event.target.value }))} />
              </label>
              {importForm.sourceType === 'manual-adapter' ? (
                <>
                  <label className="form-field form-field--wide">
                    <span>Documentation URL</span>
                    <input value={importForm.documentationUrl ?? ''} onChange={(event) => setImportForm((current) => ({ ...current, documentationUrl: event.target.value }))} />
                  </label>
                  <label className="form-field form-field--wide">
                    <span>Documentation Notes</span>
                    <textarea className="form-textarea" value={importForm.documentationText ?? ''} onChange={(event) => setImportForm((current) => ({ ...current, documentationText: event.target.value }))} />
                  </label>
                </>
              ) : (
                <label className="form-field form-field--wide">
                  <span>Swagger / OpenAPI</span>
                  <textarea className="form-textarea form-textarea--code" value={importForm.specificationText ?? ''} onChange={(event) => setImportForm((current) => ({ ...current, specificationText: event.target.value }))} />
                </label>
              )}
            </div>
            <div className="panel-actions">
              <button className="primary-action" type="button" disabled={importBusy} onClick={() => onPreviewImport(importForm)}>
                {busyIntent === 'preview-import' ? 'Previewing...' : 'Preview Actions'}
              </button>
              <button className="secondary-action" type="button" disabled={importBusy} onClick={() => onImportConnector(importForm)}>
                {busyIntent === 'import-connector' ? 'Importing...' : 'Import Connector'}
              </button>
            </div>
          </article>

          <article className="connector-panel panel-scroll">
            <div className="panel-scroll__header">
              <p className="eyebrow">Connector Catalog</p>
              <span>{catalog.connectors.length} items</span>
            </div>
            <div className="connector-list">
              {catalog.connectors.map((connector) => (
                <button key={connector.id} className={`connector-card${connector.id === connectorDetail.connector.id ? ' connector-card--active' : ''}`} type="button" onClick={() => onSelectConnector(connector.id)}>
                  <strong>{connector.displayName}</strong>
                  <span>
                    {connector.category} · {connector.actionCount} actions · {connector.connectionCount} connections
                  </span>
                  <small>{connector.summary}</small>
                </button>
              ))}
            </div>
          </article>

          <article className="connector-panel panel-scroll">
            <div className="panel-scroll__header">
              <p className="eyebrow">Raw Actions</p>
              <span>{(visiblePreview?.actions.length ?? connectorDetail.actions.length).toString()} actions</span>
            </div>
            <div className="connector-preview__meta ticket-card__tags">
              <span>{visiblePreview?.displayName ?? connectorDetail.connector.displayName}</span>
              <span>{visiblePreview?.defaultAuthType ?? connectorDetail.connector.defaultAuthType}</span>
              <span>{visiblePreview?.versionLabel ?? connectorDetail.versions[0]?.versionLabel ?? 'v1'}</span>
            </div>
            {(visiblePreview?.warnings ?? []).length > 0 ? (
              <div className="connector-preview__warnings">
                {(visiblePreview?.warnings ?? []).map((warning) => (
                  <p key={warning}>{warning}</p>
                ))}
              </div>
            ) : null}
            <ul className="connector-action-list">
              {(visiblePreview?.actions ?? connectorDetail.actions).map((action) => (
                <li key={action.id}>
                  <div>
                    <strong>{action.displayName}</strong>
                    <span>
                      {action.method} {action.pathTemplate}
                    </span>
                  </div>
                  <small>{action.summary ?? action.category ?? 'Generated action'}</small>
                </li>
              ))}
            </ul>
          </article>

          <article className="connector-panel panel-scroll">
            <div className="panel-scroll__header">
              <p className="eyebrow">Normalized Catalog Review</p>
              <span>{visibleNormalization.items.length} mapped actions</span>
            </div>
            <div className="connector-review__profile">
              <div>
                <strong>{visibleNormalization.toolProfile?.displayName ?? 'Unreviewed Tool Profile'}</strong>
                <span>
                  {visibleNormalization.toolProfile?.roleInStack ?? 'unknown'} · {visibleNormalization.toolProfile?.toolType ?? 'custom'}
                </span>
              </div>
              <div className="ticket-card__tags">
                {(visibleNormalization.toolProfile?.coveredDomains ?? []).slice(0, 4).map((domain) => (
                  <span key={domain}>{domain}</span>
                ))}
              </div>
            </div>
            <div className="connector-review__notes">
              {visibleNormalization.reviewNotes.map((note) => (
                <p key={note}>{note}</p>
              ))}
            </div>
            <ul className="connector-action-list connector-action-list--review">
              {visibleNormalization.items.map((item) => (
                <li key={item.normalizedActionId}>
                  <div>
                    <strong>{item.displayName}</strong>
                    <span className={`connector-tone connector-tone--${dispositionTone(item.disposition)}`}>{item.disposition}</span>
                  </div>
                  <small>
                    {item.capabilityDomain} · {item.verb} · {Math.round(item.mappingConfidence * 100)}% confidence
                  </small>
                  <div className="ticket-card__tags">
                    <span>{item.objectType}</span>
                    <span>{item.overlapStrategy}</span>
                    {item.authoritativeToolType ? <span>Authority: {item.authoritativeToolType}</span> : null}
                  </div>
                  {item.reviewNotes ? <p className="connector-review__text">{item.reviewNotes}</p> : null}
                  {item.gapNotes ? <p className="connector-review__text">{item.gapNotes}</p> : null}
                  {item.conflictNotes ? <p className="connector-review__text connector-review__text--risk">{item.conflictNotes}</p> : null}
                </li>
              ))}
            </ul>
          </article>

          <article className="connector-panel panel-scroll">
            <div className="panel-scroll__header">
              <p className="eyebrow">Create Connection</p>
              <span>{connectorDetail.connections.length} existing</span>
            </div>
            <div className="form-grid">
              <label className="form-field form-field--wide">
                <span>Connection Name</span>
                <input value={connectionForm.displayName} onChange={(event) => setConnectionForm((current) => ({ ...current, displayName: event.target.value }))} />
              </label>
              <label className="form-field">
                <span>Connector</span>
                <select
                  value={connectionForm.connectorId}
                  onChange={(event) => {
                    const nextConnector = catalog.connectors.find((item) => item.id === event.target.value);
                    setConnectionForm((current) => ({
                      ...current,
                      connectorId: event.target.value,
                      connectorVersionId: nextConnector?.latestVersion,
                      authType: nextConnector?.defaultAuthType ?? current.authType,
                      secret: {
                        ...current.secret,
                        authType: nextConnector?.defaultAuthType ?? current.secret.authType,
                      },
                    }));
                  }}
                >
                  {catalog.connectors.map((connector) => (
                    <option key={connector.id} value={connector.id}>
                      {connector.displayName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                <span>Scope</span>
                <select value={connectionForm.scopeType} onChange={(event) => setConnectionForm((current) => ({ ...current, scopeType: event.target.value as 'msp' | 'client', clientTenantId: event.target.value === 'client' ? catalog.clientTenants[0]?.id : undefined }))}>
                  <option value="msp">MSP</option>
                  <option value="client">Client Tenant</option>
                </select>
              </label>
              {connectionForm.scopeType === 'client' ? (
                <label className="form-field form-field--wide">
                  <span>Client Tenant</span>
                  <select value={connectionForm.clientTenantId ?? ''} onChange={(event) => setConnectionForm((current) => ({ ...current, clientTenantId: event.target.value }))}>
                    {catalog.clientTenants.map((tenant) => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.displayName}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <label className="form-field">
                <span>Auth Type</span>
                <select value={connectionForm.authType} onChange={(event) => setConnectionForm((current) => ({ ...current, authType: event.target.value, secret: { ...current.secret, authType: event.target.value } }))}>
                  <option value="api-key">API Key</option>
                  <option value="oauth2-client-credentials">OAuth2 Client Credentials</option>
                  <option value="oauth2-authorization-code">OAuth2 Authorization Code</option>
                  <option value="oauth2-on-behalf-of">OAuth2 OBO</option>
                  <option value="basic-auth">Basic Auth</option>
                  <option value="custom">Custom</option>
                </select>
              </label>
              <label className="form-field form-field--wide">
                <span>Capabilities</span>
                <input value={(connectionForm.capabilities ?? []).join(', ')} onChange={(event) => setConnectionForm((current) => ({ ...current, capabilities: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) }))} />
              </label>
              {connectionForm.authType === 'api-key' ? (
                <label className="form-field form-field--wide">
                  <span>API Key</span>
                  <input value={connectionForm.secret.apiKey ?? ''} onChange={(event) => setConnectionForm((current) => ({ ...current, secret: { ...current.secret, apiKey: event.target.value } }))} />
                </label>
              ) : null}
              {connectionForm.authType.includes('oauth2') ? (
                <>
                  <label className="form-field">
                    <span>Client ID</span>
                    <input value={connectionForm.secret.clientId ?? ''} onChange={(event) => setConnectionForm((current) => ({ ...current, secret: { ...current.secret, clientId: event.target.value } }))} />
                  </label>
                  <label className="form-field">
                    <span>Client Secret</span>
                    <input value={connectionForm.secret.clientSecret ?? ''} onChange={(event) => setConnectionForm((current) => ({ ...current, secret: { ...current.secret, clientSecret: event.target.value } }))} />
                  </label>
                  <label className="form-field form-field--wide">
                    <span>Token URL</span>
                    <input value={connectionForm.secret.tokenUrl ?? ''} onChange={(event) => setConnectionForm((current) => ({ ...current, secret: { ...current.secret, tokenUrl: event.target.value } }))} />
                  </label>
                </>
              ) : null}
            </div>
            <div className="panel-actions">
              <button className="primary-action" type="button" disabled={connectionBusy} onClick={() => onCreateConnection(connectionForm)}>
                {busyIntent === 'create-connection' ? 'Creating...' : 'Create Connection'}
              </button>
            </div>
            <ul className="connector-action-list connector-action-list--compact">
              {connectorDetail.connections.map((connection) => (
                <li key={connection.id}>
                  <div>
                    <strong>{connection.displayName}</strong>
                    <span>
                      {connection.scopeType} · {connection.authType}
                    </span>
                  </div>
                  <small>{connection.clientTenantDisplayName ?? 'MSP-wide connection'}</small>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
