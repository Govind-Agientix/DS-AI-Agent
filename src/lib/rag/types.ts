export type FileStatus = 'processing' | 'ready' | 'failed';
export type StoreStatus = 'indexing' | 'ready' | 'failed';

export interface RagFile {
  id: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
  status: FileStatus;
  purpose?: 'assistants';
  createdAt: string;  // ISO
}

export interface VectorStore {
  id: string;
  name: string;
  description?: string;
  status: StoreStatus;
  filesCount: number;
  lastActive?: string; // ISO | undefined
  createdAt: string;
  estimatedUsageUsd?: number;
}

export interface FileDetail extends RagFile {
  storageUrl?: string;
  checksumSha256?: string;
}

export interface VectorStoreDetail extends VectorStore {
  usedBy: { id: string; name: string }[];
  filesAttached: RagFile[];
}
