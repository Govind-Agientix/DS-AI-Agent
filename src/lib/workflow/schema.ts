import { z } from "zod";
import { WORKFLOW_STATUSES, TRIGGER_TYPES, STEP_TYPES } from "./types";

export const triggerConfigSchema = z.object({
  documentType: z.string().optional(),
  customer: z.string().optional(),
  schedule: z.string().optional(),
  webhookUrl: z.string().url().optional().or(z.literal("")),
  conditions: z.record(z.any()).optional(),
});

export const stepConfigSchema = z.object({
  agentId: z.string().optional(),
  promptId: z.string().optional(),
  validationRules: z.record(z.any()).optional(),
  transformRules: z.record(z.any()).optional(),
  recipients: z.array(z.string()).optional(),
  message: z.string().optional(),
  endpoint: z.string().url().optional().or(z.literal("")),
  timeout: z.number().optional(),
  retryCount: z.number().optional(),
});

export const workflowStepSchema = z.object({
  id: z.string(),
  type: z.enum(STEP_TYPES.map((s) => s.value) as [string, ...string[]]),
  name: z.string().min(1, "Step name is required"),
  config: stepConfigSchema,
  order: z.number(),
  enabled: z.boolean(),
});

export const workflowTriggerSchema = z.object({
  type: z.enum(TRIGGER_TYPES.map((t) => t.value) as [string, ...string[]]),
  config: triggerConfigSchema,
});

export const workflowSchema = z.object({
  name: z.string().min(1, "Workflow name is required").min(3, "Workflow name must be at least 3 characters"),
  description: z.string().optional(),
  status: z.enum(WORKFLOW_STATUSES.map((s) => s.value) as [string, ...string[]]),
  customer: z.string().optional(),
  trigger: workflowTriggerSchema,
  steps: z.array(workflowStepSchema).min(1, "At least one step is required"),
});

export type WorkflowFormData = z.infer<typeof workflowSchema>;

