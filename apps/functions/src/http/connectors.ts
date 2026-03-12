import { app, type HttpRequest, type InvocationContext } from '@azure/functions';

import {
  buildConnectorCatalogResponse,
  buildConnectorDetailResponse,
  buildImportPreviewResponse,
  createPlatformConnection,
  importPlatformConnector,
  type CreateConnectionRequest,
} from '../lib/integrations-model.js';
import type { ConnectorImportRequest } from '../lib/openapi-import.js';
import { getSeededDataLayerService } from '../lib/data-layer.js';
import { json, logRequest, methodNotAllowed } from '../lib/http.js';

export async function connectors(request: HttpRequest, context: InvocationContext) {
  logRequest(context, request);

  if (request.method !== 'GET') {
    return methodNotAllowed(request);
  }

  const mspTenantId = request.query.get('mspTenantId') ?? undefined;
  const service = await getSeededDataLayerService();
  const response = await buildConnectorCatalogResponse(service, mspTenantId);

  return json(response);
}

export async function connectorDetail(request: HttpRequest, context: InvocationContext) {
  logRequest(context, request);

  if (request.method !== 'GET') {
    return methodNotAllowed(request);
  }

  const connectorId = request.params.connectorId;

  if (!connectorId) {
    return json({ error: 'connector_id_required' }, { status: 400 });
  }

  const mspTenantId = request.query.get('mspTenantId') ?? undefined;
  const service = await getSeededDataLayerService();
  const response = await buildConnectorDetailResponse(service, connectorId, mspTenantId);

  if (!response) {
    return json({ error: 'connector_not_found', connectorId }, { status: 404 });
  }

  return json(response);
}

export async function connections(request: HttpRequest, context: InvocationContext) {
  logRequest(context, request);

  const mspTenantId = request.query.get('mspTenantId') ?? undefined;
  const service = await getSeededDataLayerService();

  if (request.method === 'GET') {
    const response = await buildConnectorCatalogResponse(service, mspTenantId);
    return json({
      mspTenantId: response.mspTenantId,
      items: response.connections,
    });
  }

  if (request.method === 'POST') {
    try {
      const payload = await readRequestBody<CreateConnectionRequest>(request);

      if (!payload) {
        return json({ error: 'request_body_required' }, { status: 400 });
      }

      const connection = await createPlatformConnection(service, payload, mspTenantId);
      return json(connection, { status: 201 });
    } catch (error) {
      return mapError(error);
    }
  }

  return methodNotAllowed(request);
}

export async function connectorImportPreview(request: HttpRequest, context: InvocationContext) {
  logRequest(context, request);

  if (request.method !== 'POST') {
    return methodNotAllowed(request);
  }

  try {
    const payload = await readRequestBody<ConnectorImportRequest>(request);

    if (!payload) {
      return json({ error: 'request_body_required' }, { status: 400 });
    }

    const mspTenantId = request.query.get('mspTenantId') ?? undefined;
    const service = await getSeededDataLayerService();
    const response = await buildImportPreviewResponse(service, payload, mspTenantId);
    return json(response);
  } catch (error) {
    return mapError(error);
  }
}

export async function connectorImport(request: HttpRequest, context: InvocationContext) {
  logRequest(context, request);

  if (request.method !== 'POST') {
    return methodNotAllowed(request);
  }

  try {
    const payload = await readRequestBody<ConnectorImportRequest>(request);

    if (!payload) {
      return json({ error: 'request_body_required' }, { status: 400 });
    }

    const mspTenantId = request.query.get('mspTenantId') ?? undefined;
    const service = await getSeededDataLayerService();
    const response = await importPlatformConnector(service, payload, mspTenantId);
    return json(response, { status: 201 });
  } catch (error) {
    return mapError(error);
  }
}

async function readRequestBody<TPayload>(request: HttpRequest): Promise<TPayload | null> {
  const text = await request.text();

  if (!text.trim()) {
    return null;
  }

  return JSON.parse(text) as TPayload;
}

function mapError(error: unknown) {
  const message = error instanceof Error ? error.message : 'unknown_error';

  if (message === 'connector_not_found' || message === 'client_tenant_not_found') {
    return json({ error: message }, { status: 404 });
  }

  if (
    message === 'request_body_required' ||
    message === 'connector_version_required' ||
    message === 'client_tenant_required' ||
    message === 'specification_text_required' ||
    message.startsWith('invalid_specification:')
  ) {
    return json({ error: message }, { status: 400 });
  }

  return json({ error: message }, { status: 500 });
}

app.http('connectors', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'connectors',
  handler: connectors,
});

app.http('connector-detail', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'connectors/{connectorId}',
  handler: connectorDetail,
});

app.http('connections', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  route: 'connections',
  handler: connections,
});

app.http('connector-import-preview', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'connectors/import-preview',
  handler: connectorImportPreview,
});

app.http('connector-import', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'connectors/import',
  handler: connectorImport,
});

