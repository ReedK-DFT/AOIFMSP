import { type DataLayerService } from '../../../../src/index.js';
export declare const demoContext: {
    mspTenantId: string;
    operatorUserObjectId: string;
    defaultInputProfileId: string;
    highlightedClientTenantId: string;
};
export declare function ensureDemoData(service: DataLayerService, currentRuntimeMode: 'memory' | 'azure'): Promise<DataLayerService>;
//# sourceMappingURL=demo-seed.d.ts.map