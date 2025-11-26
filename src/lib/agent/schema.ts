import { z } from "zod";
import { DOCUMENT_TYPES, CUSTOMERS, OFFICES, SERVICE_TYPES, LOAD_TYPES } from "./types";

export const agentConfigSchema = z.object({
  name: z.string().min(1, "Agent name is required").min(3, "Agent name must be at least 3 characters"),
  customer: z.string().min(1, "Customer selection is required"),
  documentTypes: z.array(z.string()).min(1, "At least one document type must be selected"),
  office: z.string().min(1, "Office selection is required"),
  serviceType: z.string().min(1, "Service type is required"),
  loadType: z.string().min(1, "Load type is required"),
  instructions: z.string().min(10, "Instructions must be at least 10 characters"),
  outputSchema: z.record(z.any()).refine((schema) => Object.keys(schema).length > 0, {
    message: "Output schema must have at least one field",
  }),
  basePrompt: z.string().optional(),
  fewShotExamples: z.array(z.string()).optional(),
});

export type AgentConfigFormData = z.infer<typeof agentConfigSchema>;

export const defaultOutputSchema = {
  container: "string",
  chassis: "string",
  booking_number: "string",
  seal: "string",
  lfd: "date",
  port_cutoff: "datetime",
  rates: {
    base: "number",
    fuel: "number",
    chassis: "number",
  },
  customs: {
    in_bond: "boolean",
    fda_may_proceed: "boolean",
  },
};

export const defaultBasePrompt = `You are an expert logistics document processor. Extract structured data from the provided document with high accuracy.

Instructions:
- Extract all relevant fields according to the output schema
- Handle variations in document formats gracefully
- Mark fields as null if information is not available
- Validate data types and formats strictly
- Return only valid JSON matching the schema`;
