import type { AgentCategory, AgentCategoryPropertySchema } from "@/lib/agent/categoryTypes";

function isOptionalString(prop: AgentCategoryPropertySchema): boolean {
  const anyOf = prop.anyOf;
  if (!Array.isArray(anyOf)) return false;
  return anyOf.some((a) => a?.type === "string") && anyOf.some((a) => a?.type === "null");
}

function isOptionalUri(prop: AgentCategoryPropertySchema): boolean {
  return (
    Array.isArray(prop.anyOf) &&
    prop.anyOf.some((a) => a?.format === "uri") &&
    prop.anyOf.some((a) => a?.type === "null")
  );
}

function isOptionalInteger(prop: AgentCategoryPropertySchema): boolean {
  return (
    Array.isArray(prop.anyOf) &&
    prop.anyOf.some((a) => a?.type === "integer") &&
    prop.anyOf.some((a) => a?.type === "null")
  );
}

function isStringArrayOrNull(prop: AgentCategoryPropertySchema): boolean {
  return (
    Array.isArray(prop.anyOf) &&
    prop.anyOf.some((a) => a?.type === "array") &&
    prop.anyOf.some((a) => a?.type === "null")
  );
}

/** Keys to render as user-editable fields (excludes const-only properties such as `type`). */
export function editableConfigKeys(category: AgentCategory): string[] {
  return Object.keys(category.properties).filter((k) => {
    const p = category.properties[k];
    return p?.const == null;
  });
}

export function getDefaultForProperty(key: string, prop: AgentCategoryPropertySchema): unknown {
  if (Object.prototype.hasOwnProperty.call(prop, "default")) {
    return prop.default;
  }
  if (prop.const != null) return prop.const;
  if (Array.isArray(prop.enum) && prop.enum.length > 0) return prop.enum[0];
  if (prop.type === "boolean") return false;
  if (prop.type === "integer") return "";
  if (prop.type === "array" || isStringArrayOrNull(prop)) return "";
  if (prop.type === "object" || prop.additionalProperties === true) return "{}";
  if (isOptionalString(prop) || isOptionalUri(prop) || isOptionalInteger(prop)) return "";
  return "";
}

function emptyToNull(
  prop: AgentCategoryPropertySchema | undefined,
  raw: unknown,
): unknown {
  const isEmpty =
    raw === undefined ||
    raw === "" ||
    (typeof raw === "string" && !raw.trim());
  if (!isEmpty) return raw;
  if (isOptionalString(prop) || isOptionalUri(prop) || isOptionalInteger(prop) || isStringArrayOrNull(prop)) {
    return null;
  }
  return raw;
}

/** Build `config` object for `POST .../connect` from form state. */
export function buildConnectConfig(
  category: AgentCategory,
  values: Record<string, unknown>,
): Record<string, unknown> {
  const config: Record<string, unknown> = {};

  for (const key of Object.keys(category.properties)) {
    const prop = category.properties[key];
    if (prop?.const != null) {
      config[key] = prop.const;
      continue;
    }

    const rawIn = values[key];
    const raw = emptyToNull(prop, rawIn);

    if (prop?.type === "boolean" || typeof rawIn === "boolean") {
      config[key] = rawIn === true || rawIn === "true";
      continue;
    }
    if (prop?.type === "integer" || isOptionalInteger(prop)) {
      if (raw === null || raw === undefined) {
        config[key] = null;
        continue;
      }
      const n = typeof raw === "number" ? raw : Number.parseInt(String(raw), 10);
      config[key] = Number.isFinite(n) ? n : null;
      continue;
    }
    if (prop?.type === "array" || isStringArrayOrNull(prop)) {
      if (raw === null) {
        config[key] = null;
        continue;
      }
      if (Array.isArray(rawIn)) {
        config[key] = rawIn;
        continue;
      }
      if (typeof rawIn === "string") {
        const parts = rawIn
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        config[key] = parts.length ? parts : null;
        continue;
      }
      config[key] = null;
      continue;
    }
    if (prop?.type === "object" && prop.additionalProperties) {
      if (typeof rawIn === "string") {
        try {
          config[key] = JSON.parse(rawIn) as Record<string, unknown>;
        } catch {
          config[key] = {};
        }
      } else if (rawIn && typeof rawIn === "object") {
        config[key] = rawIn;
      } else {
        config[key] = {};
      }
      continue;
    }
    config[key] = raw;
  }

  if (config.type == null) {
    config.type = category.type;
  }

  return config;
}

export function validateRequiredConnectFields(
  category: AgentCategory,
  values: Record<string, unknown>,
): string | null {
  for (const req of category.required) {
    const prop = category.properties[req];
    if (prop?.const != null) continue;
    const v = values[req];
    const empty =
      v === undefined ||
      v === "" ||
      (typeof v === "string" && !v.trim()) ||
      (Array.isArray(v) && v.length === 0);
    if (empty) {
      return `${prop?.title ?? req} is required.`;
    }
  }
  return null;
}
