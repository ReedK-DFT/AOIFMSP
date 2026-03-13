import { app, type HttpRequest, type InvocationContext } from '@azure/functions';

import type { WorkflowDocument } from '../../../../src/index.js';
import { buildWorkflowDetailResponse } from '../lib/app-model.js';
import { getSeededDataLayerService } from '../lib/data-layer.js';
import { json, logRequest, methodNotAllowed } from '../lib/http.js';

interface SaveWorkflowDraftRequest {
  draft: WorkflowDocument;
  displayName?: string | undefined;
  description?: string | undefined;
}

export async function workflowDetail(request: HttpRequest, context: InvocationContext) {
  logRequest(context, request);

  const workflowId = request.params.workflowId;
  const mspTenantId = request.query.get('mspTenantId') ?? undefined;

  if (!workflowId) {
    return json({ error: 'missing_workflow_id' }, { status: 400 });
  }

  if (request.method === 'GET') {
    const service = await getSeededDataLayerService();
    const detail = await buildWorkflowDetailResponse(service, workflowId, mspTenantId);

    if (!detail) {
      return json({ error: 'workflow_not_found', workflowId }, { status: 404 });
    }

    return json(detail);
  }

  if (request.method === 'PUT') {
    const service = await getSeededDataLayerService();
    const existing = await service.tables.workflows.getByKey(mspTenantId ?? 'msp_demo', workflowId);

    if (!existing) {
      return json({ error: 'workflow_not_found', workflowId }, { status: 404 });
    }

    const body = (await request.json()) as SaveWorkflowDraftRequest;

    if (!body?.draft || typeof body.draft !== 'object') {
      return json({ error: 'invalid_workflow_draft' }, { status: 400 });
    }

    const nextDraft = {
      ...body.draft,
      workflowId,
      displayName: body.displayName ?? body.draft.displayName,
    } satisfies WorkflowDocument;

    await service.documents.workflowDrafts.put(nextDraft, existing.mspTenantId, workflowId);
    await service.tables.workflows.upsert({
      ...existing,
      displayName: nextDraft.displayName,
      ...(body.description ?? existing.description ? { description: body.description ?? existing.description } : {}),
      updatedAt: new Date().toISOString(),
      updatedBy: 'api:workflow-draft',
    });

    const detail = await buildWorkflowDetailResponse(service, workflowId, existing.mspTenantId);

    if (!detail) {
      return json({ error: 'workflow_not_found', workflowId }, { status: 404 });
    }

    return json(detail);
  }

  return methodNotAllowed(request);
}

app.http('workflow-detail', {
  methods: ['GET', 'PUT'],
  authLevel: 'anonymous',
  route: 'workflows/{workflowId}',
  handler: workflowDetail,
});

