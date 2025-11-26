export interface AgentConfig {
  id?: string;
  name: string;
  customer: string;
  documentTypes: string[];
  office: string;
  serviceType: string;
  loadType: string;
  instructions: string;
  outputSchema: Record<string, any>;
  basePrompt?: string;
  fewShotExamples?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RuleTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  category: string;
}

export const RULE_TEMPLATES: RuleTemplate[] = [
  {
    id: "detention-policy",
    name: "Detention Policy",
    description: "Standard detention time and rate rules",
    category: "Billing",
    content: "Apply 2-hour detention after first 2 hours free. Rate: $50/hour after free period.",
  },
  {
    id: "chassis-rules",
    name: "Chassis Rules",
    description: "Chassis rental and cap policies",
    category: "Equipment",
    content: "Cap chassis at $75/day. No weekend charges unless specifically noted.",
  },
  {
    id: "bill-to-logic",
    name: "Bill-To Logic",
    description: "Billing party determination rules",
    category: "Billing",
    content: "Always use consignee as bill-to unless third party is listed in the document.",
  },
  {
    id: "equipment-restrictions",
    name: "Equipment Restrictions",
    description: "Allowed equipment types and constraints",
    category: "Equipment",
    content: "Only 20ft and 40ft containers allowed. Dry van and refrigerated equipment accepted.",
  },
  {
    id: "subcontracting-policy",
    name: "Subcontracting Policy",
    description: "Rules regarding subcontractor usage",
    category: "Operations",
    content: "No subcontracting allowed without prior written approval.",
  },
];

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
  { value: "imc", label: "IMC Companies" },
  { value: "arc", label: "ARC Logistics" },
  { value: "chr", label: "CHR Logistics" },
  { value: "traffix", label: "Traffix" },
] as const;

export const OFFICES = [
  { value: "la", label: "Los Angeles" },
  { value: "oakland", label: "Oakland" },
  { value: "seattle", label: "Seattle" },
] as const;

export const SERVICE_TYPES = [
  { value: "drayage", label: "Drayage" },
  { value: "transload", label: "Transload" },
  { value: "warehousing", label: "Warehousing" },
] as const;

export const LOAD_TYPES = [
  { value: "import", label: "Import" },
  { value: "export", label: "Export" },
  { value: "domestic", label: "Domestic" },
] as const;
