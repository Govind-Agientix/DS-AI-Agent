import { RagFile, FileDetail } from '../types';

let MOCK_FILES: RagFile[] = [];

export const filesClient = {
  list: async (): Promise<RagFile[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_FILES;
  },
  
  detail: async (id: string): Promise<FileDetail> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const file = MOCK_FILES.find(f => f.id === id);
    if (!file) throw new Error('File not found');
    return { 
      ...file, 
      checksumSha256: `sha256_${id.slice(0, 8)}`,
      storageUrl: `/storage/${id}`
    };
  },
  
  upload: async (blobs: File[]): Promise<RagFile[]> => {
    const now = new Date().toISOString();
    const newOnes = blobs.map((b) => ({
      id: `file-${crypto.randomUUID()}`,
      name: b.name,
      sizeBytes: b.size,
      mimeType: b.type || 'application/octet-stream',
      status: 'processing' as const,
      purpose: 'assistants' as const,
      createdAt: now
    }));
    MOCK_FILES = [...newOnes, ...MOCK_FILES];
    
    // Simulate processing → ready after a delay
    setTimeout(() => {
      MOCK_FILES = MOCK_FILES.map(f => 
        newOnes.some(n => n.id === f.id) ? { ...f, status: 'ready' as const } : f
      );
    }, 3000);
    
    return newOnes;
  },
  
  delete: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    MOCK_FILES = MOCK_FILES.filter(f => f.id !== id);
  },
};
