import { app } from '@azure/functions';
import { buildTechnicianHomeResponse } from '../lib/app-model.js';
import { getSeededDataLayerService } from '../lib/data-layer.js';
import { json, logRequest, methodNotAllowed } from '../lib/http.js';
export async function technicianHome(request, context) {
    logRequest(context, request);
    if (request.method !== 'GET') {
        return methodNotAllowed(request);
    }
    const mspTenantId = request.query.get('mspTenantId') ?? undefined;
    const service = await getSeededDataLayerService();
    const response = await buildTechnicianHomeResponse(service, mspTenantId);
    return json(response);
}
app.http('technician-home', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'technician/home',
    handler: technicianHome,
});
