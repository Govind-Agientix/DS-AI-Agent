import { apiEndpoints, apiDelete, apiGet, apiPost } from "@/lib/api";
import type { AgentCategory, ConnectAgentRequestBody } from "@/lib/agent/categoryTypes";
import type { AgentConfigFormData } from "@/lib/agent/schema";
import { CUSTOMERS } from "@/lib/agent/types";

/** Response from `GET /api/v1/agents/:id`. */
export interface AgentDetailResponse {
  id: string;
  user_id: string;
  agent_name: string;
  category: string;
  config: Record<string, unknown>;
  connected: boolean;
  status: string;
  last_heartbeat: string | null;
  created_at: string;
  instructions: string;
  customer: string;
  document_type: string | null;
  evans_office_location: string | null;
  service_type: string | null;
  load_type: string | null;
  memory_count: number;
}

/** Payload expected by `POST /api/v1/agents/create`. */
export interface CreateAgentApiBody {
  agent_name: string;
  customer: string;
  document_type: string;
  evans_office_location: string;
  service_type: string;
  load_type: string;
  instructions: string;
}

function customerLabel(value: string): string {
  const found = CUSTOMERS.find((c) => c.value === value);
  return found?.label ?? value;
}

export function toCreateAgentBody(data: AgentConfigFormData): CreateAgentApiBody {
  return {
    agent_name: data.name.trim(),
    customer: customerLabel(data.customer),
    document_type: data.documentType,
    evans_office_location: data.office,
    service_type: data.serviceType,
    load_type: data.loadType,
    instructions: data.instructions.trim(),
  };
}

export async function createAgent(body: CreateAgentApiBody): Promise<unknown> {
  return apiPost<unknown>(apiEndpoints.agents.create, body);
}

export async function listAgents(): Promise<unknown> {
  return apiGet<unknown>(apiEndpoints.agents.list);
}

export async function getAgent(agentId: string): Promise<AgentDetailResponse> {
  return apiGet<AgentDetailResponse>(apiEndpoints.agents.byId(agentId));
}

export async function deleteAgent(agentId: string): Promise<unknown> {
  return apiDelete<unknown>(apiEndpoints.agents.byId(agentId));
}

export async function connectAgent(
  agentId: string,
  body: ConnectAgentRequestBody,
): Promise<unknown> {
  return apiPost<unknown>(apiEndpoints.agents.connect(agentId), body);
}

export async function getAgentCategories(): Promise<AgentCategory[]> {
  return apiGet<AgentCategory[]>(apiEndpoints.agents.categories);
}

/** `GET /api/v1/agents/:id/memory` — returns agent memory payload. */
export async function getAgentMemory(agentId: string): Promise<unknown> {
  return apiGet<unknown>(apiEndpoints.agents.memory(agentId));
}
