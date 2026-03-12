import { app } from '@azure/functions';
import { buildTenantDetailResponse, buildTenantListResponse } from '../lib/app-model.js';
import { getSeededDataLayerService } from '../lib/data-layer.js';
import { json, logRequest, methodNotAllowed } from '../lib/http.js';
export async function tenants(request, context) {
    logRequest(context, request);
    if (request.method !== 'GET') {
        return methodNotAllowed(request);
    }
    const mspTenantId = request.query.get('mspTenantId') ?? undefined;
    const service = await getSeededDataLayerService();
    const response = await buildTenantListResponse(service, mspTenantId);
    return json(response);
}
export async function tenantDetail(request, context) {
    logRequest(context, request);
    if (request.method !== 'GET') {
        return methodNotAllowed(request);
    }
    const clientTenantId = request.params.clientTenantId;
    if (!clientTenantId) {
        return json({
            error: 'client_tenant_id_required',
        }, { status: 400 });
    }
    const mspTenantId = request.query.get('mspTenantId') ?? undefined;
    const service = await getSeededDataLayerService();
    const response = await buildTenantDetailResponse(service, clientTenantId, mspTenantId);
    if (!response) {
        return json({
            error: 'tenant_not_found',
            clientTenantId,
        }, { status: 404 });
    }
    return json(response);
}
app.http('tenants', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'tenants',
    handler: tenants,
});
app.http('tenant-detail', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'tenants/{clientTenantId}',
    handler: tenantDetail,
});
