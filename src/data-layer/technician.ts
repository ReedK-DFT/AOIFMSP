import type { BlobPath, TableEntityAddress, TableSystemFields } from './common';

export type TechnicianContextType = 'ticket' | 'tenant' | 'user' | 'device' | 'documentation' | 'alert' | 'workflow';
export type LinkedContextType = TechnicianContextType;

export interface TicketEntity extends TableEntityAddress, TableSystemFields {
  id: string;
  mspTenantId: string;
  ticketId: string;
  sourceSystem: string;
  sourceTicketId: string;
  boardOrQueue?: string;
  status: string;
  priority?: string;
  displayName: string;
  clientTenantId?: string;
  relatedUserId?: string;
  relatedDeviceId?: string;
  assignedTechnicianId?: string;
  summary?: string;
  lastSourceUpdatedAt?: string;
  lastSyncedAt?: string;
  sourceUrl?: string;
}

export interface DeviceEntity extends TableEntityAddress, TableSystemFields {
  id: string;
  mspTenantId: string;
  clientTenantId: string;
  deviceId: string;
  sourceSystem: string;
  sourceDeviceId: string;
  displayName: string;
  deviceType?: string;
  platform?: string;
  status: string;
  lastSeenAt?: string;
  primaryUserId?: string;
  ticketCount?: number;
  alertCount?: number;
  summary?: string;
  lastSourceUpdatedAt?: string;
  lastSyncedAt?: string;
  sourceUrl?: string;
}

export interface DocumentationRecordEntity extends TableEntityAddress, TableSystemFields {
  id: string;
  mspTenantId: string;
  clientTenantId: string;
  documentationRecordId: string;
  sourceSystem: string;
  sourceRecordId: string;
  displayName: string;
  category?: string;
  relatedUserId?: string;
  relatedDeviceId?: string;
  relatedTicketId?: string;
  summary?: string;
  lastSourceUpdatedAt?: string;
  lastSyncedAt?: string;
  sourceUrl?: string;
}

export interface TechnicianContextLinkEntity extends TableEntityAddress, TableSystemFields {
  mspTenantId: string;
  contextType: TechnicianContextType;
  contextId: string;
  linkedType: LinkedContextType;
  linkedId: string;
  relationshipType: string;
  sourceSystem: string;
  confidence?: number;
  updatedAt: string;
}

export interface TechnicianContextDocument {
  mspTenantId: string;
  contextType: TechnicianContextType;
  contextId: string;
  snapshotBlobPath?: BlobPath;
  relatedTickets?: string[];
  relatedUsers?: string[];
  relatedDevices?: string[];
  relatedDocumentation?: string[];
  relatedWorkflows?: string[];
  relatedAlerts?: string[];
}
