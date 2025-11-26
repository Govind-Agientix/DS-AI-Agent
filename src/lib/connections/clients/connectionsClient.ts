import { Connection } from '@/lib/customer/types';

let MOCK_CONNECTIONS: Connection[] = [
  {
    id: "conn_1",
    name: "Production Database",
    type: "database",
    host: "db.production.example.com",
    port: 5432,
    database: "drayage_db",
    username: "app_user",
    description: "Primary PostgreSQL database for production workloads",
    isActive: true,
    connectionStatus: "connected",
    sslEnabled: true,
    timeout: 30,
    retryAttempts: 3,
    lastTested: "2025-01-15T10:30:00Z",
  },
  {
    id: "conn_2",
    name: "Customer API Gateway",
    type: "api",
    host: "api.customers.example.com",
    port: 443,
    description: "REST API endpoint for customer data synchronization",
    isActive: true,
    connectionStatus: "connected",
    sslEnabled: true,
    timeout: 60,
    retryAttempts: 5,
    lastTested: "2025-01-15T09:15:00Z",
  },
  {
    id: "conn_3",
    name: "File Transfer Server",
    type: "sftp",
    host: "sftp.files.example.com",
    port: 22,
    username: "transfer_user",
    description: "SFTP server for document and file transfers",
    isActive: true,
    connectionStatus: "connected",
    sslEnabled: true,
    timeout: 45,
    retryAttempts: 3,
    lastTested: "2025-01-15T08:00:00Z",
  },
  {
    id: "conn_4",
    name: "Message Queue Broker",
    type: "message_queue",
    host: "mq.broker.example.com",
    port: 5672,
    description: "RabbitMQ broker for asynchronous message processing",
    isActive: true,
    connectionStatus: "disconnected",
    sslEnabled: false,
    timeout: 20,
    retryAttempts: 2,
    lastTested: "2025-01-14T15:30:00Z",
  },
  {
    id: "conn_5",
    name: "Legacy FTP Server",
    type: "ftp",
    host: "ftp.legacy.example.com",
    port: 21,
    username: "ftp_user",
    description: "Legacy FTP server for backward compatibility",
    isActive: false,
    connectionStatus: "error",
    sslEnabled: false,
    timeout: 30,
    retryAttempts: 3,
    lastTested: "2025-01-10T12:00:00Z",
  },
  {
    id: "conn_6",
    name: "WebSocket Service",
    type: "websocket",
    host: "ws.realtime.example.com",
    port: 8080,
    description: "WebSocket connection for real-time updates",
    isActive: true,
    connectionStatus: "connected",
    sslEnabled: true,
    timeout: 10,
    retryAttempts: 1,
    lastTested: "2025-01-15T11:00:00Z",
  },
];

export const connectionsClient = {
  list: async (filters?: { 
    search?: string; 
    type?: string; 
    status?: string;
    isActive?: boolean;
  }): Promise<Connection[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filtered = [...MOCK_CONNECTIONS];
    
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        c => 
          c.name.toLowerCase().includes(searchLower) ||
          c.host.toLowerCase().includes(searchLower) ||
          c.description?.toLowerCase().includes(searchLower) ||
          c.database?.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters?.type) {
      filtered = filtered.filter(c => c.type === filters.type);
    }
    
    if (filters?.status) {
      filtered = filtered.filter(c => c.connectionStatus === filters.status);
    }
    
    if (filters?.isActive !== undefined) {
      filtered = filtered.filter(c => c.isActive === filters.isActive);
    }
    
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  },
  
  get: async (id: string): Promise<Connection> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const connection = MOCK_CONNECTIONS.find(c => c.id === id);
    if (!connection) throw new Error('Connection not found');
    return connection;
  },
  
  create: async (input: Omit<Connection, 'id' | 'lastTested' | 'connectionStatus'>): Promise<Connection> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const now = new Date().toISOString();
    
    const newConnection: Connection = {
      id: `conn_${Date.now()}`,
      ...input,
      connectionStatus: "unknown",
      lastTested: undefined,
    };
    
    MOCK_CONNECTIONS = [newConnection, ...MOCK_CONNECTIONS];
    return newConnection;
  },
  
  update: async (id: string, input: Partial<Omit<Connection, 'id'>>): Promise<Connection> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = MOCK_CONNECTIONS.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Connection not found');
    
    MOCK_CONNECTIONS[index] = {
      ...MOCK_CONNECTIONS[index],
      ...input,
    };
    
    return MOCK_CONNECTIONS[index];
  },
  
  delete: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    MOCK_CONNECTIONS = MOCK_CONNECTIONS.filter(c => c.id !== id);
  },
  
  test: async (id: string): Promise<{ success: boolean; message: string; latency?: number }> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const connection = MOCK_CONNECTIONS.find(c => c.id === id);
    if (!connection) throw new Error('Connection not found');
    
    // Simulate test - randomly succeed or fail based on connection status
    const isHealthy = connection.connectionStatus === "connected" || Math.random() > 0.3;
    const latency = Math.floor(Math.random() * 200) + 50;
    
    if (isHealthy) {
      MOCK_CONNECTIONS = MOCK_CONNECTIONS.map(c => 
        c.id === id 
          ? { ...c, connectionStatus: "connected" as const, lastTested: new Date().toISOString() }
          : c
      );
      return { success: true, message: "Connection test successful", latency };
    } else {
      MOCK_CONNECTIONS = MOCK_CONNECTIONS.map(c => 
        c.id === id 
          ? { ...c, connectionStatus: "error" as const, lastTested: new Date().toISOString() }
          : c
      );
      return { success: false, message: "Connection test failed: Unable to reach host", latency };
    }
  },
};

