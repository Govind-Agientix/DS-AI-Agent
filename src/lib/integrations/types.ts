/**
 * Integration Directory types (Spec §5.2). Swap `staticConnectors` for API data later.
 */

export type ConnectorCategoryId =
  | "communication"
  | "storage"
  | "database"
  | "logistics"
  | "business";

export type AuthMethodType = "oauth" | "api_key" | "session";

export interface ConnectorTool {
  name: string;
  description: string;
}

export interface Connector {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: ConnectorCategoryId;
  authMethod: AuthMethodType;
  tools: ConnectorTool[];
  /** Which DS AI Agent capabilities this unlocks */
  agentUseCases: string[];
  documentationUrl?: string;
}

export const CONNECTOR_CATEGORY_LABELS: Record<ConnectorCategoryId, string> = {
  communication: "Email & chat",
  storage: "Storage & files",
  database: "Database & data",
  logistics: "Logistics & terminals",
  business: "Business & billing",
};

export const AUTH_METHOD_LABELS: Record<AuthMethodType, string> = {
  oauth: "OAuth 2.0",
  api_key: "API key",
  session: "Session (browser login)",
};
