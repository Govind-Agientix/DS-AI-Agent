import { z } from "zod";

export const promptSchema = z.object({
  name: z.string().min(1, "Prompt name is required").min(3, "Prompt name must be at least 3 characters"),
  description: z.string().optional(),
  docType: z.string().min(1, "Document type is required"),
  scope: z.string().min(1, "Scope is required"),
  basePrompt: z.string().min(10, "Base prompt must be at least 10 characters"),
  fewShotExamples: z.array(z.string()).optional(),
  outputSchema: z.record(z.any()).optional(),
  variables: z.array(z.string()).optional(),
  status: z.enum(["active", "draft", "archived"]).default("draft"),
});

export type PromptFormData = z.infer<typeof promptSchema>;

export const defaultPromptTemplate = `You are an expert document processor. Extract structured data from the provided document.

Instructions:
- Extract all relevant fields according to the output schema
- Handle variations in document formats gracefully
- Mark fields as null if information is not available
- Validate data types and formats strictly
- Return only valid JSON matching the schema`;

