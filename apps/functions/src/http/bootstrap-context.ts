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

function readBranding() {
  const mspName = process.env.AOIFMSP_BRAND_MSP_NAME?.trim() || 'Contoso MSP';
  const abbreviation = process.env.AOIFMSP_BRAND_MSP_ABBREVIATION?.trim() || 'AOI';

  return {
    mspName,
    abbreviation,
    colors: {
      primary: process.env.AOIFMSP_BRAND_PRIMARY_COLOR?.trim() || '#10634a',
      secondary: process.env.AOIFMSP_BRAND_SECONDARY_COLOR?.trim() || '#ff8a3d',
      surface: process.env.AOIFMSP_BRAND_SURFACE_COLOR?.trim() || '#f4efe7',
    },
    logos: {
      ...(process.env.AOIFMSP_BRAND_LOGO_MARK_URL?.trim()
        ? { markUrl: process.env.AOIFMSP_BRAND_LOGO_MARK_URL.trim() }
        : {}),
      ...(process.env.AOIFMSP_BRAND_LOGO_WORDMARK_URL?.trim()
        ? { wordmarkUrl: process.env.AOIFMSP_BRAND_LOGO_WORDMARK_URL.trim() }
        : {}),
    },
  };
}

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
    branding: readBranding(),
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
      surfaces: ['global', 'workflow-designer', 'tenant-admin', 'technician-workspace', 'connectors'],
    },
  });
}

app.http('bootstrap-context', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'bootstrap/context',
  handler: bootstrapContext,
});
