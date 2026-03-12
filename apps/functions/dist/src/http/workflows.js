import { app } from '@azure/functions';
import { keyBuilders } from '../../../../src/index.js';
import { getDataLayerService } from '../lib/data-layer.js';
import { json, logRequest, methodNotAllowed } from '../lib/http.js';
function fallbackWorkflows() {
    return [
        {
            id: 'wf_demo_ticket_triage',
            displayName: 'Ticket Triage Hub',
            status: 'draft',
            designAssistantMode: 'mixed',
            description: 'Collect ticket, tenant, device, and documentation context for technicians.',
        },
        {
            id: 'wf_demo_user_onboarding',
            displayName: 'Guided User Onboarding',
            status: 'draft',
            designAssistantMode: 'ai-assisted',
            description: 'Prepare account, licensing, and documentation steps in one flow.',
        },
    ];
}
export async function workflows(request, context) {
    logRequest(context, request);
    if (request.method !== 'GET') {
        return methodNotAllowed(request);
    }
    const mspTenantId = request.query.get('mspTenantId') ?? 'msp_demo';
    const service = getDataLayerService();
    const partitionKey = keyBuilders.partition.msp(mspTenantId);
    const items = await service.tables.workflows.listByPartition(partitionKey);
    return json({
        mspTenantId,
        items: items.length > 0 ? items : fallbackWorkflows(),
    });
}
app.http('workflows', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'workflows',
    handler: workflows,
});
