import { VectorStore, VectorStoreDetail, RagFile } from '../types';

let MOCK_STORES: VectorStoreDetail[] = [];

export const storesClient = {
  list: async (): Promise<VectorStore[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_STORES.map(({ usedBy, filesAttached, ...store }) => store);
  },
  
  detail: async (id: string): Promise<VectorStoreDetail> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const store = MOCK_STORES.find(s => s.id === id);
    if (!store) throw new Error('Store not found');
    return store;
  },
  
  create: async (input: { name: string; description?: string }): Promise<VectorStore> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const now = new Date().toISOString();
    const newStore: VectorStoreDetail = {
      id: `vs_${crypto.randomUUID()}`,
      name: input.name,
      description: input.description,
      status: 'ready',
      filesCount: 0,
      createdAt: now,
      lastActive: now,
      usedBy: [],
      filesAttached: [],
      estimatedUsageUsd: 0,
    };
    MOCK_STORES = [newStore, ...MOCK_STORES];
    return newStore;
  },
  
  addFiles: async (storeId: string, fileIds: string[]): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const storeIndex = MOCK_STORES.findIndex(s => s.id === storeId);
    if (storeIndex === -1) throw new Error('Store not found');
    
    // Set to indexing
    MOCK_STORES[storeIndex].status = 'indexing';
    
    // Simulate indexing → ready
    setTimeout(() => {
      MOCK_STORES[storeIndex].status = 'ready';
      MOCK_STORES[storeIndex].filesCount += fileIds.length;
      MOCK_STORES[storeIndex].lastActive = new Date().toISOString();
    }, 4000);
  },
  
  delete: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    MOCK_STORES = MOCK_STORES.filter(s => s.id !== id);
  },
  
  attachMockFiles: (storeId: string, files: RagFile[]) => {
    const store = MOCK_STORES.find(s => s.id === storeId);
    if (store) {
      store.filesAttached = [...store.filesAttached, ...files];
      store.filesCount = store.filesAttached.length;
    }
  }
};
