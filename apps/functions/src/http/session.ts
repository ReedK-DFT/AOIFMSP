import { app, type HttpRequest, type InvocationContext } from '@azure/functions';

import { buildSessionResponse } from '../lib/app-model.js';
import { getSeededDataLayerService, runtimeMode } from '../lib/data-layer.js';
import { json, logRequest, methodNotAllowed } from '../lib/http.js';

export async function session(request: HttpRequest, context: InvocationContext) {
  logRequest(context, request);

  if (request.method !== 'GET') {
    return methodNotAllowed(request);
  }

  const mspTenantId = request.query.get('mspTenantId') ?? undefined;
  const userObjectId = request.query.get('userObjectId') ?? undefined;
  const service = await getSeededDataLayerService();
  const response = await buildSessionResponse(service, runtimeMode(), mspTenantId, userObjectId);

  if (!response) {
    return json(
      {
        error: 'session_context_not_found',
      },
      { status: 404 },
    );
  }

  return json(response);
}

app.http('session', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'session',
  handler: session,
});
