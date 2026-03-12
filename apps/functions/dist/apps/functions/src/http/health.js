import { app } from '@azure/functions';
import { getDataLayerService } from '../lib/data-layer.js';
import { json, logRequest, methodNotAllowed } from '../lib/http.js';
export async function health(request, context) {
    logRequest(context, request);
    if (request.method !== 'GET') {
        return methodNotAllowed(request);
    }
    const runtimeMode = process.env.AOIFMSP_RUNTIME_MODE === 'azure' ? 'azure' : 'memory';
    const service = getDataLayerService();
    return json({
        status: 'ok',
        service: 'aoifmsp-functions',
        runtimeMode,
        repositories: Object.keys(service.tables),
        documents: Object.keys(service.documents),
        timestamp: new Date().toISOString(),
    });
}
app.http('health', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'health',
    handler: health,
});
