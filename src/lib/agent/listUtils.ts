export interface NormalizedAgentRow {
  id: string;
  name?: string;
  raw: unknown;
}

function pickId(row: Record<string, unknown>): string | undefined {
  const id = row.id ?? row._id ?? row.agent_id;
  if (typeof id === "string" && id) return id;
  return undefined;
}

function pickName(row: Record<string, unknown>): string | undefined {
  const n = row.agent_name ?? row.name ?? row.title;
  if (typeof n === "string" && n.trim()) return n;
  return undefined;
}

/** Normalizes various list shapes (`[]`, `{ agents: [] }`, etc.) into rows with an id. */
export function normalizeAgentsList(payload: unknown): NormalizedAgentRow[] {
  let items: unknown[] = [];
  if (Array.isArray(payload)) {
    items = payload;
  } else if (payload && typeof payload === "object") {
    const o = payload as Record<string, unknown>;
    const arr = o.agents ?? o.data ?? o.items ?? o.results;
    if (Array.isArray(arr)) items = arr;
  }

  const out: NormalizedAgentRow[] = [];
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const id = pickId(row);
    if (!id) continue;
    out.push({ id, name: pickName(row), raw: item });
  }
  return out;
}
