import { keyBuilders, } from '../../../../src/index.js';
import { demoContext } from './demo-seed.js';
export async function buildSessionResponse(service, currentRuntimeMode, mspTenantId = demoContext.mspTenantId, userObjectId = demoContext.operatorUserObjectId) {
    const [tenant, user, preferences, profile] = await Promise.all([
        service.tables.mspTenants.getByKey(mspTenantId),
        service.tables.mspUsers.getByKey(mspTenantId, userObjectId),
        service.tables.userPreferences.getByKey(mspTenantId, userObjectId),
        service.tables.userInputProfiles.getByKey(mspTenantId, userObjectId, demoContext.defaultInputProfileId),
    ]);
    if (!tenant || !user || !preferences) {
        return null;
    }
    const bindingMap = profile ? parseStringArrayMap(profile.bindingMapJson) : [];
    return {
        runtimeMode: currentRuntimeMode,
        operator: {
            userObjectId: user.userObjectId,
            displayName: user.displayName,
            userPrincipalName: user.userPrincipalName,
            roles: user.rolesCsv.split(',').map((role) => role.trim()).filter(Boolean),
            featureExposureMode: preferences.featureExposureMode,
            preferredStartSurface: preferences.preferredStartSurface,
            defaultInputProfile: profile
                ? {
                    profileId: profile.profileId,
                    displayName: profile.displayName,
                    surfaceScope: profile.surfaceScope,
                    bindings: bindingMap,
                }
                : null,
        },
        mspTenant: {
            id: tenant.id,
            displayName: tenant.displayName,
            primaryDomain: tenant.primaryDomain,
            gdapRelationshipState: tenant.gdapRelationshipState,
            preferredFoundrySetupMode: tenant.preferredFoundrySetupMode,
            defaultAdminAuthMode: tenant.defaultAdminAuthMode,
        },
    };
}
export async function buildWorkflowSummaries(service, mspTenantId = demoContext.mspTenantId) {
    const items = await service.tables.workflows.listByPartition(keyBuilders.partition.msp(mspTenantId));
    return items
        .slice()
        .sort((left, right) => compareIsoDates(right.updatedAt, left.updatedAt))
        .map((workflow) => ({
        id: workflow.id,
        displayName: workflow.displayName,
        status: workflow.status,
        designAssistantMode: workflow.designAssistantMode,
        description: workflow.description,
    }));
}
export async function buildTechnicianHomeResponse(service, mspTenantId = demoContext.mspTenantId) {
    const [tickets, workflows, alerts, clientTenants, operator] = await Promise.all([
        service.tables.tickets.listByPartition(keyBuilders.partition.msp(mspTenantId)),
        service.tables.workflows.listByPartition(keyBuilders.partition.msp(mspTenantId)),
        service.tables.managementAlerts.listByPartition(keyBuilders.partition.msp(mspTenantId)),
        service.tables.clientTenants.listByPartition(keyBuilders.partition.msp(mspTenantId)),
        service.tables.mspUsers.getByKey(mspTenantId, demoContext.operatorUserObjectId),
    ]);
    const tenantNames = new Map(clientTenants.map((tenant) => [tenant.clientTenantId, tenant.displayName]));
    const workflowsByUse = workflows.map((workflow) => ({
        ...workflow,
        searchText: `${workflow.displayName} ${workflow.description ?? ''}`.toLowerCase(),
    }));
    const ticketSummaries = await Promise.all(tickets
        .slice()
        .sort((left, right) => compareTickets(left, right))
        .map(async (ticket) => {
        const [devices, docs, managedUsers] = await Promise.all([
            ticket.clientTenantId
                ? service.tables.devices.listByPartition(keyBuilders.partition.mspClient(mspTenantId, ticket.clientTenantId))
                : Promise.resolve([]),
            ticket.clientTenantId
                ? service.tables.documentationRecords.listByPartition(keyBuilders.partition.mspClient(mspTenantId, ticket.clientTenantId))
                : Promise.resolve([]),
            ticket.clientTenantId
                ? service.tables.managedUsers.listByPartition(keyBuilders.partition.mspClient(mspTenantId, ticket.clientTenantId))
                : Promise.resolve([]),
        ]);
        const relatedDevice = devices.find((device) => device.deviceId === ticket.relatedDeviceId);
        const relatedUser = managedUsers.find((managedUser) => managedUser.managedUserId === ticket.relatedUserId);
        const recommendationSet = recommendWorkflows(ticket, workflowsByUse, docs, relatedDevice);
        return {
            id: ticket.ticketId,
            title: ticket.displayName,
            priority: ticket.priority ?? 'normal',
            status: ticket.status,
            summary: ticket.summary ?? 'No ticket summary available yet.',
            sourceSystem: ticket.sourceSystem,
            boardOrQueue: ticket.boardOrQueue,
            clientTenantId: ticket.clientTenantId,
            tenantDisplayName: ticket.clientTenantId ? tenantNames.get(ticket.clientTenantId) : undefined,
            relatedUserDisplayName: relatedUser?.displayName,
            relatedDeviceName: relatedDevice?.displayName,
            recommendedWorkflowIds: recommendationSet.map((workflow) => workflow.id),
            recommendedWorkflowNames: recommendationSet.map((workflow) => workflow.displayName),
            sourceUrl: ticket.sourceUrl,
        };
    }));
    const highlightedTicket = ticketSummaries[0] ?? null;
    return {
        mspTenantId,
        queueSummary: [
            { label: 'Needs Triage', count: tickets.filter((ticket) => ticket.status === 'triage').length },
            { label: 'Ready To Run', count: tickets.filter((ticket) => ticket.status === 'ready').length },
            { label: 'Waiting', count: tickets.filter((ticket) => ticket.status === 'waiting').length },
        ],
        highlightedTicket,
        tickets: ticketSummaries,
        activeAlerts: alerts
            .filter((alert) => alert.status === 'open')
            .slice()
            .sort((left, right) => compareAlerts(left, right))
            .slice(0, 4)
            .map((alert) => ({
            id: alert.id,
            title: alert.title,
            severity: alert.severity,
            summary: alert.summary,
            tenantDisplayName: alert.clientTenantId ? tenantNames.get(alert.clientTenantId) : operator?.displayName,
        })),
    };
}
export async function buildTenantListResponse(service, mspTenantId = demoContext.mspTenantId) {
    const clientTenants = await service.tables.clientTenants.listByPartition(keyBuilders.partition.msp(mspTenantId));
    const alerts = await service.tables.managementAlerts.listByPartition(keyBuilders.partition.msp(mspTenantId));
    const tickets = await service.tables.tickets.listByPartition(keyBuilders.partition.msp(mspTenantId));
    const items = await Promise.all(clientTenants.map(async (tenant) => {
        const [managedUsers, syncStates, managementProfile] = await Promise.all([
            service.tables.managedUsers.listByPartition(keyBuilders.partition.mspClient(mspTenantId, tenant.clientTenantId)),
            service.tables.managementSyncState.listByPartition(keyBuilders.partition.mspClient(mspTenantId, tenant.clientTenantId)),
            service.tables.tenantManagementProfiles.getByKey(mspTenantId, tenant.clientTenantId),
        ]);
        return buildTenantListItem(tenant, managementProfile?.gdapRelationshipState ?? 'unknown', managedUsers, syncStates, alerts, tickets);
    }));
    return {
        mspTenantId,
        items: items.sort((left, right) => left.displayName.localeCompare(right.displayName)),
    };
}
export async function buildTenantDetailResponse(service, clientTenantId, mspTenantId = demoContext.mspTenantId) {
    const [tenant, managementProfile, workflows, alerts, tickets, managedUsers, devices, documentation, syncState, standards] = await Promise.all([
        service.tables.clientTenants.getByKey(mspTenantId, clientTenantId),
        service.tables.tenantManagementProfiles.getByKey(mspTenantId, clientTenantId),
        service.tables.workflows.listByPartition(keyBuilders.partition.msp(mspTenantId)),
        service.tables.managementAlerts.listByPartition(keyBuilders.partition.msp(mspTenantId)),
        service.tables.tickets.listByPartition(keyBuilders.partition.msp(mspTenantId)),
        service.tables.managedUsers.listByPartition(keyBuilders.partition.mspClient(mspTenantId, clientTenantId)),
        service.tables.devices.listByPartition(keyBuilders.partition.mspClient(mspTenantId, clientTenantId)),
        service.tables.documentationRecords.listByPartition(keyBuilders.partition.mspClient(mspTenantId, clientTenantId)),
        service.tables.managementSyncState.listByPartition(keyBuilders.partition.mspClient(mspTenantId, clientTenantId)),
        service.tables.standardsResults.listByPartition(keyBuilders.partition.mspClient(mspTenantId, clientTenantId)),
    ]);
    if (!tenant || !managementProfile) {
        return null;
    }
    const tenantAlerts = alerts
        .filter((alert) => alert.clientTenantId === clientTenantId)
        .slice()
        .sort((left, right) => compareAlerts(left, right));
    const tenantTickets = tickets.filter((ticket) => ticket.clientTenantId === clientTenantId);
    return {
        mspTenantId,
        tenant: {
            ...buildTenantListItem(tenant, managementProfile.gdapRelationshipState, managedUsers, syncState, alerts, tickets),
            onboardingState: tenant.onboardingState,
            defaultAdminAuthMode: managementProfile.defaultAdminAuthMode,
            managementCapabilities: parseStringArray(managementProfile.managementCapabilitiesJson),
        },
        managedUsers: managedUsers
            .slice()
            .sort((left, right) => left.displayName.localeCompare(right.displayName))
            .map((user) => ({
            id: user.managedUserId,
            displayName: user.displayName,
            userPrincipalName: user.userPrincipalName,
            status: user.status,
            licenses: parseStringArray(user.licenseSummaryJson),
        })),
        devices: devices
            .slice()
            .sort((left, right) => left.displayName.localeCompare(right.displayName))
            .map((device) => ({
            id: device.deviceId,
            displayName: device.displayName,
            platform: device.platform,
            status: device.status,
            lastSeenAt: device.lastSeenAt,
        })),
        documentation: documentation
            .slice()
            .sort((left, right) => left.displayName.localeCompare(right.displayName))
            .map((record) => ({
            id: record.documentationRecordId,
            displayName: record.displayName,
            category: record.category,
            summary: record.summary,
        })),
        alerts: tenantAlerts.map((alert) => ({
            id: alert.id,
            title: alert.title,
            severity: alert.severity,
            status: alert.status,
            summary: alert.summary,
        })),
        syncState: syncState
            .slice()
            .sort((left, right) => left.datasetName.localeCompare(right.datasetName))
            .map((item) => ({
            datasetName: item.datasetName,
            status: item.status,
            lastSuccessfulSyncAt: item.lastSuccessfulSyncAt,
            recordCount: item.recordCount,
        })),
        standards: standards
            .slice()
            .sort((left, right) => left.standardId.localeCompare(right.standardId))
            .map((standard) => ({
            standardId: standard.standardId,
            status: standard.status,
            severity: standard.severity,
            summary: standard.resultSummary,
        })),
        recommendedWorkflows: workflows
            .filter((workflow) => workflow.defaultClientTenantId === clientTenantId || workflow.designAssistantMode !== 'manual')
            .slice(0, 3)
            .map((workflow) => ({
            id: workflow.id,
            displayName: workflow.displayName,
            status: workflow.status,
            designAssistantMode: workflow.designAssistantMode,
            description: workflow.description,
        })),
    };
}
function buildTenantListItem(tenant, gdapRelationshipState, managedUsers, syncStates, alerts, tickets) {
    const clientAlerts = alerts.filter((alert) => alert.clientTenantId === tenant.clientTenantId && alert.status === 'open');
    const clientTickets = tickets.filter((ticket) => ticket.clientTenantId === tenant.clientTenantId);
    return {
        id: tenant.clientTenantId,
        displayName: tenant.displayName,
        primaryDomain: tenant.primaryDomain,
        status: tenant.status,
        gdapRelationshipState,
        openTicketCount: clientTickets.length,
        driftAlertCount: clientAlerts.filter((alert) => alert.alertType === 'standards-drift').length,
        managedUserCount: managedUsers.length,
        lastSuccessfulSyncAt: syncStates
            .map((state) => state.lastSuccessfulSyncAt)
            .filter((value) => Boolean(value))
            .sort((left, right) => compareIsoDates(right, left))[0],
    };
}
function recommendWorkflows(ticket, workflows, documentation, device) {
    const query = `${ticket.displayName} ${ticket.summary ?? ''} ${ticket.boardOrQueue ?? ''} ${device?.displayName ?? ''} ${documentation.map((record) => record.displayName).join(' ')}`.toLowerCase();
    const ranked = workflows
        .map((workflow) => ({
        workflow,
        score: scoreWorkflow(query, workflow.searchText),
    }))
        .filter((item) => item.score > 0)
        .sort((left, right) => right.score - left.score)
        .map((item) => item.workflow);
    return ranked.length > 0 ? ranked.slice(0, 2) : workflows.slice(0, 2);
}
function scoreWorkflow(query, workflowSearchText) {
    let score = 0;
    if (query.includes('printer') && workflowSearchText.includes('triage')) {
        score += 4;
    }
    if (query.includes('onboarding') && workflowSearchText.includes('onboarding')) {
        score += 4;
    }
    if (query.includes('mfa') && workflowSearchText.includes('drift')) {
        score += 4;
    }
    for (const token of workflowSearchText.split(/\s+/)) {
        if (token.length > 3 && query.includes(token)) {
            score += 1;
        }
    }
    return score;
}
function compareTickets(left, right) {
    const byPriority = priorityWeight(right.priority) - priorityWeight(left.priority);
    if (byPriority !== 0) {
        return byPriority;
    }
    return compareIsoDates(right.lastSourceUpdatedAt ?? right.lastSyncedAt, left.lastSourceUpdatedAt ?? left.lastSyncedAt);
}
function compareAlerts(left, right) {
    const bySeverity = severityWeight(right.severity) - severityWeight(left.severity);
    if (bySeverity !== 0) {
        return bySeverity;
    }
    return compareIsoDates(right.createdAt, left.createdAt);
}
function priorityWeight(priority) {
    switch ((priority ?? '').toLowerCase()) {
        case 'critical':
            return 5;
        case 'high':
            return 4;
        case 'medium':
            return 3;
        case 'low':
            return 2;
        default:
            return 1;
    }
}
function severityWeight(severity) {
    switch (severity) {
        case 'critical':
            return 5;
        case 'high':
            return 4;
        case 'medium':
            return 3;
        case 'low':
            return 2;
        default:
            return 1;
    }
}
function compareIsoDates(left, right) {
    return new Date(left ?? 0).getTime() - new Date(right ?? 0).getTime();
}
function parseStringArray(value) {
    if (!value) {
        return [];
    }
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
    }
    catch {
        return [];
    }
}
function parseStringArrayMap(value) {
    if (!value) {
        return [];
    }
    try {
        const parsed = JSON.parse(value);
        return Object.entries(parsed.actions ?? {}).flatMap(([action, bindings]) => bindings.map((binding) => `${action}: ${binding}`));
    }
    catch {
        return [];
    }
}
