import type { BlobPath, StartedByType, TableEntityAddress, TableSystemFields } from './common';
export interface AuditEventEntity extends TableEntityAddress, TableSystemFields {
    id: string;
    mspTenantId: string;
    clientTenantId?: string;
    actorType: StartedByType | 'api-client';
    actorId: string;
    actorDisplayName?: string;
    actionType: string;
    resourceType: string;
    resourceId: string;
    resourceDisplayName?: string;
    result: 'succeeded' | 'failed' | 'denied';
    ipAddress?: string;
    userAgent?: string;
    correlationId: string;
    summary: string;
    detailsBlobPath?: BlobPath;
    occurredAt: string;
}
//# sourceMappingURL=audit.d.ts.map