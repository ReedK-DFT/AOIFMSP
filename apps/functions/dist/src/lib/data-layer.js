import { createAzureDataLayerService, createInMemoryDataLayerService, loadAzureDataLayerConfigFromEnv, } from '../../../../src/index.js';
let cachedService;
function runtimeMode() {
    return process.env.AOIFMSP_RUNTIME_MODE === 'azure' ? 'azure' : 'memory';
}
export function getDataLayerService() {
    if (cachedService) {
        return cachedService;
    }
    if (runtimeMode() === 'azure') {
        cachedService = createAzureDataLayerService(loadAzureDataLayerConfigFromEnv()).service;
        return cachedService;
    }
    cachedService = createInMemoryDataLayerService();
    return cachedService;
}
