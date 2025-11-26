export interface Prompt {
  id: string;
  name: string;
  description?: string;
  docType: string;
  scope: "Global" | string; // Global or customer name
  version: string;
  basePrompt: string;
  fewShotExamples?: string[];
  outputSchema?: Record<string, any>;
  variables?: string[]; // Variable injection points like {{customer_name}}
  createdAt: string;
  updatedAt: string;
  lastEdited: string;
  owner: string;
  status: "active" | "draft" | "archived";
  usageCount?: number;
}

export interface PromptVersion {
  id: string;
  promptId: string;
  version: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export const DOCUMENT_TYPES_FOR_PROMPTS = [
  "Booking Confirmation",
  "Work Order",
  "Delivery Order",
  "Trip Sheet",
  "Customs Release",
  "Prenote",
  "Rate Confirmation",
] as const;

export const PROMPT_SCOPES = [
  { value: "Global", label: "Global" },
  { value: "crowley", label: "Crowley Logistics" },
  { value: "imc", label: "IMC Companies" },
  { value: "arc", label: "ARC Logistics" },
  { value: "chr", label: "CHR Logistics" },
  { value: "traffix", label: "Traffix" },
] as const;

