import { Prompt, PromptVersion } from '../types';

let MOCK_PROMPTS: Prompt[] = [
  {
    id: "prompt_1",
    name: "Booking Confirmation Extractor",
    description: "Extracts key data from booking confirmation documents",
    docType: "Booking",
    scope: "Global",
    version: "v2.1",
    basePrompt: "Extract booking details from the document...",
    fewShotExamples: ["Example 1...", "Example 2..."],
    outputSchema: { booking_number: "string", container: "string" },
    variables: ["customer_name"],
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-09-28T14:30:00Z",
    lastEdited: "2025-09-28",
    owner: "Admin",
    status: "active",
    usageCount: 1234,
  },
  {
    id: "prompt_2",
    name: "Work Order Parser",
    description: "Parses work order documents for IMC Companies",
    docType: "Work Order",
    scope: "IMC Companies",
    version: "v1.8",
    basePrompt: "Parse work order information...",
    createdAt: "2025-01-10T09:00:00Z",
    updatedAt: "2025-09-25T16:20:00Z",
    lastEdited: "2025-09-25",
    owner: "Operations",
    status: "active",
    usageCount: 856,
  },
  {
    id: "prompt_3",
    name: "Trip Sheet Processor",
    description: "Processes trip sheet documents for Crowley",
    docType: "Trip Sheet",
    scope: "Crowley",
    version: "v3.0",
    basePrompt: "Extract trip sheet data...",
    createdAt: "2025-01-05T08:00:00Z",
    updatedAt: "2025-09-27T11:15:00Z",
    lastEdited: "2025-09-27",
    owner: "Admin",
    status: "active",
    usageCount: 2341,
  },
  {
    id: "prompt_4",
    name: "Customs Release Handler",
    description: "Handles customs release documents",
    docType: "Customs",
    scope: "Global",
    version: "v1.5",
    basePrompt: "Process customs release information...",
    createdAt: "2025-01-01T07:00:00Z",
    updatedAt: "2025-09-20T13:45:00Z",
    lastEdited: "2025-09-20",
    owner: "Compliance",
    status: "active",
    usageCount: 567,
  },
  {
    id: "prompt_5",
    name: "Delivery Order Extractor",
    description: "Extracts data from delivery orders",
    docType: "DO",
    scope: "Global",
    version: "v2.3",
    basePrompt: "Extract delivery order details...",
    createdAt: "2025-01-08T12:00:00Z",
    updatedAt: "2025-09-26T10:30:00Z",
    lastEdited: "2025-09-26",
    owner: "Admin",
    status: "active",
    usageCount: 1892,
  },
];

export const promptClient = {
  list: async (filters?: { search?: string; docType?: string; scope?: string; status?: string }): Promise<Prompt[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filtered = [...MOCK_PROMPTS];
    
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          p.docType.toLowerCase().includes(searchLower) ||
          p.scope.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters?.docType) {
      filtered = filtered.filter(p => p.docType === filters.docType);
    }
    
    if (filters?.scope) {
      filtered = filtered.filter(p => p.scope === filters.scope);
    }
    
    if (filters?.status) {
      filtered = filtered.filter(p => p.status === filters.status);
    }
    
    return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },
  
  get: async (id: string): Promise<Prompt> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const prompt = MOCK_PROMPTS.find(p => p.id === id);
    if (!prompt) throw new Error('Prompt not found');
    return prompt;
  },
  
  create: async (input: Omit<Prompt, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'lastEdited' | 'usageCount'>): Promise<Prompt> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const now = new Date();
    const nowISO = now.toISOString();
    const nowDate = now.toISOString().split('T')[0];
    
    // Generate version from existing prompts of same name
    const existingPrompts = MOCK_PROMPTS.filter(p => p.name === input.name);
    const version = existingPrompts.length > 0 
      ? `v${existingPrompts.length + 1}.0`
      : 'v1.0';
    
    const newPrompt: Prompt = {
      id: `prompt_${Date.now()}`,
      ...input,
      version,
      createdAt: nowISO,
      updatedAt: nowISO,
      lastEdited: nowDate,
      usageCount: 0,
    };
    
    MOCK_PROMPTS = [newPrompt, ...MOCK_PROMPTS];
    return newPrompt;
  },
  
  update: async (id: string, input: Partial<Omit<Prompt, 'id' | 'createdAt'>>): Promise<Prompt> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = MOCK_PROMPTS.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Prompt not found');
    
    const now = new Date();
    const nowISO = now.toISOString();
    const nowDate = now.toISOString().split('T')[0];
    
    // Increment version if basePrompt changed
    let version = MOCK_PROMPTS[index].version;
    if (input.basePrompt && input.basePrompt !== MOCK_PROMPTS[index].basePrompt) {
      const versionNum = parseInt(version.replace('v', '').split('.')[0]);
      const patchNum = parseInt(version.split('.')[1] || '0');
      version = `v${versionNum}.${patchNum + 1}`;
    }
    
    MOCK_PROMPTS[index] = {
      ...MOCK_PROMPTS[index],
      ...input,
      version,
      updatedAt: nowISO,
      lastEdited: nowDate,
    };
    
    return MOCK_PROMPTS[index];
  },
  
  duplicate: async (id: string, newName?: string): Promise<Prompt> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const original = MOCK_PROMPTS.find(p => p.id === id);
    if (!original) throw new Error('Prompt not found');
    
    const now = new Date();
    const nowISO = now.toISOString();
    const nowDate = now.toISOString().split('T')[0];
    
    const duplicated: Prompt = {
      ...original,
      id: `prompt_${Date.now()}`,
      name: newName || `${original.name} (Copy)`,
      version: 'v1.0',
      status: 'draft',
      createdAt: nowISO,
      updatedAt: nowISO,
      lastEdited: nowDate,
      usageCount: 0,
    };
    
    MOCK_PROMPTS = [duplicated, ...MOCK_PROMPTS];
    return duplicated;
  },
  
  archive: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = MOCK_PROMPTS.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Prompt not found');
    MOCK_PROMPTS[index].status = 'archived';
  },
  
  delete: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    MOCK_PROMPTS = MOCK_PROMPTS.filter(p => p.id !== id);
  },
  
  test: async (promptId: string, testInput: string): Promise<{ output: string; isValid: boolean; errors?: string[] }> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Mock test response
    return {
      output: JSON.stringify({ test: "output", extracted: "data" }, null, 2),
      isValid: true,
      errors: [],
    };
  },
};

