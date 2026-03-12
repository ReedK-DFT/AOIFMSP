import { app, type HttpRequest, type InvocationContext } from '@azure/functions';

import { json, logRequest, methodNotAllowed } from '../lib/http.js';

const defaultWorkflowRecommendations = [
  {
    id: 'wf-template-ticket-triage',
    title: 'Ticket Triage Assistant',
    category: 'Technician Workspace',
    summary: 'Gather tenant, device, and documentation context around a ticket.',
  },
  {
    id: 'wf-template-user-onboarding',
    title: 'User Onboarding Flow',
    category: 'Tenant Administration',
    summary: 'Create user, assign licenses, and attach documentation steps.',
  },
  {
    id: 'wf-template-standard-remediation',
    title: 'Standards Drift Remediation',
    category: 'Standards',
    summary: 'Review non-compliant standards results and queue guided actions.',
  },
];

export async function bootstrapContext(request: HttpRequest, context: InvocationContext) {
  logRequest(context, request);

  if (request.method !== 'GET') {
    return methodNotAllowed(request);
  }

  return json({
    product: {
      name: 'AOIFMSP',
      tagline: 'Automation of Integrations for Managed Service Providers',
    },
    navigation: [
      {
        id: 'technician-workspace',
        label: 'Technician Workspace',
        description: 'Ticket-centered operations across PSA, RMM, docs, and admin context.',
      },
      {
        id: 'workflow-designer',
        label: 'Workflow Designer',
        description: 'Design visual automations with curated actions and AI-assisted drafting.',
      },
      {
        id: 'tenant-administration',
        label: 'Tenant Administration',
        description: 'Guide common tenant, user, licensing, and standards actions.',
      },
      {
        id: 'connectors',
        label: 'Connectors',
        description: 'Manage API connectors, versions, and authenticated connections.',
      },
    ],
    recommendedWorkflows: defaultWorkflowRecommendations,
    featureExposureModes: ['guided', 'standard', 'advanced'],
    inputModel: {
      profileSupport: true,
      surfaces: ['global', 'workflow-designer', 'tenant-admin', 'technician-workspace'],
    },
  });
}

app.http('bootstrap-context', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'bootstrap/context',
  handler: bootstrapContext,
});
