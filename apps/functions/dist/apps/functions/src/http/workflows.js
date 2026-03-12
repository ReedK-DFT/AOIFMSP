import { app } from '@azure/functions';
import { buildWorkflowSummaries } from '../lib/app-model.js';
import { getSeededDataLayerService } from '../lib/data-layer.js';
import { json, logRequest, methodNotAllowed } from '../lib/http.js';
export async function workflows(request, context) {
    logRequest(context, request);
    if (request.method !== 'GET') {
        return methodNotAllowed(request);
    }
    const mspTenantId = request.query.get('mspTenantId') ?? undefined;
    const service = await getSeededDataLayerService();
    const items = await buildWorkflowSummaries(service, mspTenantId);
    return json({
        mspTenantId: mspTenantId ?? 'msp_demo',
        items,
    });
}
app.http('workflows', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'workflows',
    handler: workflows,
});
