import { Customer } from '../types';

let MOCK_CUSTOMERS: Customer[] = [
  {
    id: "cust_1",
    name: "Crowley Logistics",
    code: "CROW",
    description: "Major logistics provider specializing in marine transportation",
    status: "Active",
    defaultOffice: "la",
    defaultServiceType: "drayage",
    billingPolicies: [
      {
        id: "bp_1",
        name: "Detention Policy",
        category: "detention",
        rules: "Apply 2-hour detention after first 2 hours free. Rate: $50/hour after free period.",
        rate: { amount: 50, unit: "hour", currency: "USD" },
        freeTime: { hours: 2 },
        effectiveDate: "2025-01-01",
      },
      {
        id: "bp_2",
        name: "Chassis Cap",
        category: "chassis",
        rules: "Cap chassis at $75/day. No weekend charges unless specifically noted.",
        rate: { amount: 75, unit: "day", currency: "USD" },
      },
    ],
    equipmentAliases: [
      {
        id: "ea_1",
        customerTerm: "Box",
        standardTerm: "Container",
        category: "container",
        notes: "Customer uses 'Box' to refer to containers",
      },
    ],
    rules: [
      {
        id: "rule_1",
        title: "Bill-To Logic",
        category: "billing",
        rule: "Always use consignee as bill-to unless third party is listed in the document.",
        priority: "high",
        isActive: true,
      },
      {
        id: "rule_2",
        title: "No Subcontracting",
        category: "operations",
        rule: "No subcontracting allowed without prior written approval.",
        priority: "high",
        isActive: true,
      },
    ],
    contacts: [
      {
        id: "contact_1",
        name: "John Smith",
        email: "john.smith@crowley.com",
        phone: "+1-555-0101",
        role: "primary",
        isPrimary: true,
      },
      {
        id: "contact_2",
        name: "Sarah Johnson",
        email: "sarah.j@crowley.com",
        phone: "+1-555-0102",
        role: "billing",
        isPrimary: false,
      },
    ],
    integrations: [
      {
        id: "int_1",
        type: "api",
        name: "Crowley API",
        endpoint: "https://api.crowley.com/v1",
        isActive: true,
        lastSync: "2025-01-15T10:30:00Z",
      },
    ],
    connections: [],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-15T10:30:00Z",
    usageStats: {
      totalOrders: 1234,
      successfulOrders: 1180,
      activeAgents: 3,
    },
  },
  {
    id: "cust_2",
    name: "IMC Companies",
    code: "IMC",
    description: "Intermodal container services provider",
    status: "Active",
    defaultOffice: "oakland",
    defaultServiceType: "transload",
    billingPolicies: [],
    equipmentAliases: [],
    rules: [],
    contacts: [
      {
        id: "contact_3",
        name: "Mike Davis",
        email: "mike.davis@imc.com",
        role: "primary",
        isPrimary: true,
      },
    ],
    integrations: [],
    connections: [],
    createdAt: "2025-01-05T00:00:00Z",
    updatedAt: "2025-01-10T08:00:00Z",
    usageStats: {
      totalOrders: 856,
      successfulOrders: 820,
      activeAgents: 2,
    },
  },
  {
    id: "cust_3",
    name: "ARC Logistics",
    code: "ARC",
    description: "Full-service logistics solutions",
    status: "Active",
    defaultOffice: "seattle",
    defaultServiceType: "drayage",
    billingPolicies: [],
    equipmentAliases: [],
    rules: [],
    contacts: [],
    integrations: [],
    connections: [],
    createdAt: "2025-01-08T00:00:00Z",
    updatedAt: "2025-01-12T14:20:00Z",
    usageStats: {
      totalOrders: 567,
      successfulOrders: 540,
      activeAgents: 1,
    },
  },
];

export const customerClient = {
  list: async (filters?: { search?: string; status?: string }): Promise<Customer[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filtered = [...MOCK_CUSTOMERS];
    
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        c => 
          c.name.toLowerCase().includes(searchLower) ||
          c.code.toLowerCase().includes(searchLower) ||
          c.description?.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters?.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }
    
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  },
  
  get: async (id: string): Promise<Customer> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const customer = MOCK_CUSTOMERS.find(c => c.id === id);
    if (!customer) throw new Error('Customer not found');
    return customer;
  },
  
  create: async (input: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'usageStats'>): Promise<Customer> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const now = new Date().toISOString();
    
    const newCustomer: Customer = {
      id: `cust_${Date.now()}`,
      ...input,
      createdAt: now,
      updatedAt: now,
      usageStats: {
        totalOrders: 0,
        successfulOrders: 0,
        activeAgents: 0,
      },
    };
    
    MOCK_CUSTOMERS = [newCustomer, ...MOCK_CUSTOMERS];
    return newCustomer;
  },
  
  update: async (id: string, input: Partial<Omit<Customer, 'id' | 'createdAt'>>): Promise<Customer> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = MOCK_CUSTOMERS.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Customer not found');
    
    MOCK_CUSTOMERS[index] = {
      ...MOCK_CUSTOMERS[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    
    return MOCK_CUSTOMERS[index];
  },
  
  delete: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    MOCK_CUSTOMERS = MOCK_CUSTOMERS.filter(c => c.id !== id);
  },
};
