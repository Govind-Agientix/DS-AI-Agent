export interface Customer {
  id: string;
  name: string;
  code: string; // Short code like "CROW", "IMC"
  description?: string;
  status: "Active" | "Inactive" | "Suspended";
  billingPolicies: BillingPolicy[];
  equipmentAliases: EquipmentAlias[];
  rules: CustomerRule[];
  contacts: Contact[];
  integrations: Integration[];
  connections: Connection[];
  defaultOffice?: string;
  defaultServiceType?: string;
  createdAt: string;
  updatedAt: string;
  usageStats?: {
    totalOrders: number;
    successfulOrders: number;
    activeAgents: number;
  };
}

export interface BillingPolicy {
  id: string;
  name: string;
  category: "detention" | "chassis" | "fuel" | "other";
  rules: string;
  rate?: {
    amount: number;
    unit: "hour" | "day" | "flat";
    currency: string;
  };
  freeTime?: {
    hours: number;
  };
  effectiveDate?: string;
  expirationDate?: string;
}

export interface EquipmentAlias {
  id: string;
  customerTerm: string; // How customer refers to it
  standardTerm: string; // Standard term in system
  category: "container" | "chassis" | "equipment" | "other";
  notes?: string;
}

export interface CustomerRule {
  id: string;
  title: string;
  category: "billing" | "operations" | "compliance" | "equipment" | "other";
  rule: string;
  priority: "high" | "medium" | "low";
  effectiveDate?: string;
  expirationDate?: string;
  isActive: boolean;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "primary" | "billing" | "operations" | "technical" | "other";
  department?: string;
  isPrimary: boolean;
}

export interface Integration {
  id: string;
  type: "api" | "edi" | "email" | "ftp" | "webhook";
  name: string;
  endpoint?: string;
  credentials?: Record<string, any>;
  isActive: boolean;
  lastSync?: string;
}

export interface Connection {
  id: string;
  name: string;
  type: "database" | "api" | "ftp" | "sftp" | "websocket" | "message_queue" | "other";
  host: string;
  port?: number;
  database?: string;
  username?: string;
  description?: string;
  isActive: boolean;
  lastTested?: string;
  connectionStatus?: "connected" | "disconnected" | "error" | "unknown";
  sslEnabled?: boolean;
  timeout?: number;
  retryAttempts?: number;
}

export const CUSTOMER_STATUSES = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
  { value: "Suspended", label: "Suspended" },
] as const;

export const BILLING_CATEGORIES = [
  { value: "detention", label: "Detention" },
  { value: "chassis", label: "Chassis" },
  { value: "fuel", label: "Fuel" },
  { value: "other", label: "Other" },
] as const;

export const EQUIPMENT_CATEGORIES = [
  { value: "container", label: "Container" },
  { value: "chassis", label: "Chassis" },
  { value: "equipment", label: "Equipment" },
  { value: "other", label: "Other" },
] as const;

export const RULE_CATEGORIES = [
  { value: "billing", label: "Billing" },
  { value: "operations", label: "Operations" },
  { value: "compliance", label: "Compliance" },
  { value: "equipment", label: "Equipment" },
  { value: "other", label: "Other" },
] as const;

export const RULE_PRIORITIES = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
] as const;

export const CONTACT_ROLES = [
  { value: "primary", label: "Primary Contact" },
  { value: "billing", label: "Billing" },
  { value: "operations", label: "Operations" },
  { value: "technical", label: "Technical" },
  { value: "other", label: "Other" },
] as const;

export const INTEGRATION_TYPES = [
  { value: "api", label: "API" },
  { value: "edi", label: "EDI" },
  { value: "email", label: "Email" },
  { value: "ftp", label: "FTP" },
  { value: "webhook", label: "Webhook" },
] as const;

export const CONNECTION_TYPES = [
  { value: "database", label: "Database" },
  { value: "api", label: "API" },
  { value: "ftp", label: "FTP" },
  { value: "sftp", label: "SFTP" },
  { value: "websocket", label: "WebSocket" },
  { value: "message_queue", label: "Message Queue" },
  { value: "other", label: "Other" },
] as const;

export const CONNECTION_STATUSES = [
  { value: "connected", label: "Connected", color: "default" },
  { value: "disconnected", label: "Disconnected", color: "secondary" },
  { value: "error", label: "Error", color: "destructive" },
  { value: "unknown", label: "Unknown", color: "outline" },
] as const;
