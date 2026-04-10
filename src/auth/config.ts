import type { LoginPortal, UserRole } from "./types";

export const STORAGE_KEY = "ds-ai-agent-auth";

export const PORTAL_LABELS: Record<LoginPortal, string> = {
  internal: "Internal (operations)",
  carrier: "Carrier",
  customer: "Customer",
  partner: "Partner / integrator",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  internal_admin: "Administrator",
  internal_operator: "Operator",
  internal_viewer: "Viewer (read-only)",
  carrier_admin: "Carrier admin",
  carrier_dispatcher: "Dispatcher",
  customer_user: "Customer user",
  partner_admin: "Partner admin",
};

/** Roles offered per login portal (each portal maps to its own role set). */
export const ROLES_BY_PORTAL: Record<LoginPortal, UserRole[]> = {
  internal: ["internal_admin", "internal_operator", "internal_viewer"],
  carrier: ["carrier_admin", "carrier_dispatcher"],
  customer: ["customer_user"],
  partner: ["partner_admin"],
};

/**
 * Which routes a role may open. Replace with API-driven permissions when backend exists.
 * `*` = all app routes under the main layout.
 */
export const ROLE_ROUTE_ACCESS: Record<UserRole, "*" | string[]> = {
  internal_admin: "*",
  internal_operator: "*",
  internal_viewer: "*",
  carrier_admin: [
    "/",
    "/activity",
    "/agents",
    "/prompts",
    "/integrations",
    "/workflows",
    "/orders",
    "/rag",
  ],
  carrier_dispatcher: ["/", "/activity", "/orders", "/workflows"],
  customer_user: ["/", "/activity", "/orders"],
  partner_admin: [
    "/",
    "/activity",
    "/agents",
    "/prompts",
    "/integrations",
    "/workflows",
    "/orders",
  ],
};

export function defaultRoleForPortal(portal: LoginPortal): UserRole {
  return ROLES_BY_PORTAL[portal][0];
}

export function canAccessRoute(role: UserRole, pathname: string): boolean {
  const access = ROLE_ROUTE_ACCESS[role];
  if (access === "*") return true;
  return access.some((prefix) => {
    if (prefix === "/") return pathname === "/";
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
}
