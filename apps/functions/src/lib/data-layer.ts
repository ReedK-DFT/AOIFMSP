import {
  createAzureDataLayerService,
  createInMemoryDataLayerService,
  loadAzureDataLayerConfigFromEnv,
  type DataLayerService,
} from '../../../../src/index.js';
import { ensureDemoData } from './demo-seed.js';

let cachedService: DataLayerService | undefined;

export function runtimeMode(): 'memory' | 'azure' {
  return process.env.AOIFMSP_RUNTIME_MODE === 'azure' ? 'azure' : 'memory';
}

export function getDataLayerService(): DataLayerService {
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

export async function getSeededDataLayerService(): Promise<DataLayerService> {
  const service = getDataLayerService();
  return ensureDemoData(service, runtimeMode());
}
