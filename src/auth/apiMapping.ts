import type { LoginPortal, UserRole } from "./types";

/** Maps UI login type to backend `login_type` (e.g. `"Carrier"`). */
export function portalToApiLoginType(portal: LoginPortal): string {
  const map: Record<LoginPortal, string> = {
    internal: "Internal",
    carrier: "Carrier",
    customer: "Customer",
    partner: "Partner",
  };
  return map[portal];
}

/** Maps fine-grained UI role to backend `role` string. */
export function userRoleToApiRole(role: UserRole): string {
  if (role.includes("admin")) return "admin";
  return "user";
}
