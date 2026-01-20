import { z } from "zod";

export const billingPolicySchema = z.object({
  name: z.string().min(1, "Policy name is required"),
  category: z.enum(["detention", "chassis", "fuel", "other"]),
  rules: z.string().min(1, "Rules are required"),
  rate: z
    .object({
      amount: z.number().positive(),
      unit: z.enum(["hour", "day", "flat"]),
      currency: z.string().default("USD"),
    })
    .optional(),
  freeTime: z
    .object({
      hours: z.number().nonnegative(),
    })
    .optional(),
  effectiveDate: z.string().optional(),
  expirationDate: z.string().optional(),
});

export const equipmentAliasSchema = z.object({
  customerTerm: z.string().min(1, "Customer term is required"),
  standardTerm: z.string().min(1, "Standard term is required"),
  category: z.enum(["container", "chassis", "equipment", "other"]),
  notes: z.string().optional(),
});

export const customerRuleSchema = z.object({
  title: z.string().min(1, "Rule title is required"),
  category: z.enum(["billing", "operations", "compliance", "equipment", "other"]),
  rule: z.string().min(1, "Rule content is required"),
  priority: z.enum(["high", "medium", "low"]),
  effectiveDate: z.string().optional(),
  expirationDate: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  role: z.enum(["primary", "billing", "operations", "technical", "other"]),
  department: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

export const integrationSchema = z.object({
  type: z.enum(["api", "edi", "email", "ftp", "webhook"]),
  name: z.string().min(1, "Integration name is required"),
  endpoint: z.string().url("Invalid URL").optional(),
  credentials: z.record(z.any()).optional(),
  isActive: z.boolean().default(true),
});

export const connectionSchema = z.object({
  name: z.string().min(1, "Connection name is required"),
  type: z.enum(["database", "api", "ftp", "sftp", "websocket", "message_queue", "other"]),
  host: z.string().min(1, "Host is required"),
  port: z.number().int().positive().optional(),
  database: z.string().optional(),
  username: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  sslEnabled: z.boolean().default(false),
  timeout: z.number().int().positive().optional(),
  retryAttempts: z.number().int().nonnegative().optional(),
});

export const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required").min(2, "Name must be at least 2 characters"),
  code: z.string().min(1, "Customer code is required").max(10, "Code must be 10 characters or less"),
  description: z.string().optional(),
  status: z.enum(["Active", "Inactive", "Suspended"]).default("Active"),
  defaultOffice: z.string().optional(),
  defaultServiceType: z.string().optional(),
  billingPolicies: z.array(billingPolicySchema).default([]),
  equipmentAliases: z.array(equipmentAliasSchema).default([]),
  rules: z.array(customerRuleSchema).default([]),
  contacts: z.array(contactSchema).default([]),
  integrations: z.array(integrationSchema).default([]),
  connections: z.array(connectionSchema).default([]),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
export type BillingPolicyFormData = z.infer<typeof billingPolicySchema>;
export type EquipmentAliasFormData = z.infer<typeof equipmentAliasSchema>;
export type CustomerRuleFormData = z.infer<typeof customerRuleSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type IntegrationFormData = z.infer<typeof integrationSchema>;
export type ConnectionFormData = z.infer<typeof connectionSchema>;
