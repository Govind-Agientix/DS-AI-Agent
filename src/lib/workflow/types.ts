export type WorkflowStatus = "active" | "inactive" | "draft" | "archived";
export type TriggerType = "document_upload" | "schedule" | "webhook" | "manual" | "order_created" | "order_updated";
export type StepType = "extract_data" | "validate" | "transform" | "notify" | "submit" | "approve" | "reject" | "ai_process";

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  customer?: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
  lastRun?: string;
  runCount: number;
  successCount: number;
  failureCount: number;
  createdBy: string;
}

export interface WorkflowTrigger {
  type: TriggerType;
  config: TriggerConfig;
}

export interface TriggerConfig {
  documentType?: string;
  customer?: string;
  schedule?: string; // Cron expression
  webhookUrl?: string;
  conditions?: Record<string, any>;
}

export interface WorkflowStep {
  id: string;
  type: StepType;
  name: string;
  config: StepConfig;
  order: number;
  enabled: boolean;
}

export interface StepConfig {
  agentId?: string;
  promptId?: string;
  validationRules?: Record<string, any>;
  transformRules?: Record<string, any>;
  recipients?: string[];
  message?: string;
  endpoint?: string;
  timeout?: number;
  retryCount?: number;
}

export const WORKFLOW_STATUSES = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
] as const;

export const TRIGGER_TYPES = [
  { value: "document_upload", label: "Document Upload" },
  { value: "schedule", label: "Scheduled" },
  { value: "webhook", label: "Webhook" },
  { value: "manual", label: "Manual" },
  { value: "order_created", label: "Order Created" },
  { value: "order_updated", label: "Order Updated" },
] as const;

export const STEP_TYPES = [
  { value: "extract_data", label: "Extract Data" },
  { value: "validate", label: "Validate" },
  { value: "transform", label: "Transform" },
  { value: "notify", label: "Send Notification" },
  { value: "submit", label: "Submit Order" },
  { value: "approve", label: "Approve" },
  { value: "reject", label: "Reject" },
  { value: "ai_process", label: "AI Process" },
] as const;

export const DOCUMENT_TYPES = [
  "Booking Confirmation",
  "Work Order",
  "Delivery Order",
  "Trip Sheet",
  "Customs Release",
  "Prenote",
  "Rate Confirmation",
] as const;

export const CUSTOMERS = [
  { value: "crowley", label: "Crowley Logistics" },
  { value: "maersk", label: "Maersk" },
  { value: "fedex", label: "FedEx Logistics" },
] as const;

