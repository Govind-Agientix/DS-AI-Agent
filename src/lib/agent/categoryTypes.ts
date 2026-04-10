/** One property from the categories API JSON-schema-style `properties` map. */
export interface AgentCategoryPropertySchema {
  type?: string;
  const?: string;
  default?: unknown;
  title?: string;
  description?: string;
  format?: string;
  enum?: unknown[];
  minLength?: number;
  maxLength?: number;
  items?: { type?: string };
  additionalProperties?: boolean;
  anyOf?: Array<{ type?: string; format?: string; minLength?: number }>;
}

/** Single category row from `GET /api/v1/agents/categories`. */
export interface AgentCategory {
  type: string;
  title: string;
  description: string;
  required: string[];
  properties: Record<string, AgentCategoryPropertySchema>;
  example: unknown;
}

export interface ConnectAgentRequestBody {
  config: Record<string, unknown>;
}
