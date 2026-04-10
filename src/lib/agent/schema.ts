import { z } from "zod";

/** Form model aligned with `POST /api/v1/agents/create`. */
export const agentConfigSchema = z.object({
  name: z.string().min(1, "Agent name is required").min(2, "Agent name is too short"),
  customer: z.string().min(1, "Customer is required"),
  documentType: z.string().min(1, "Document type is required"),
  office: z.string().min(1, "Evans office location is required"),
  serviceType: z.string().min(1, "Service type is required"),
  loadType: z.string().min(1, "Load type is required"),
  instructions: z.string().min(1, "Instructions are required"),
});

export type AgentConfigFormData = z.infer<typeof agentConfigSchema>;
