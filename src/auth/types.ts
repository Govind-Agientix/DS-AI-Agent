/** How the user reached the app (separate SSO portals, white-label, etc.). */
export type LoginPortal = "internal" | "carrier" | "customer" | "partner";

/** Fine-grained permission set after authentication. */
export type UserRole =
  | "internal_admin"
  | "internal_operator"
  | "internal_viewer"
  | "carrier_admin"
  | "carrier_dispatcher"
  | "customer_user"
  | "partner_admin";

export interface AuthUser {
  portal: LoginPortal;
  role: UserRole;
  email: string;
  /** Display name from email or profile (extend when wiring a real API). */
  displayName: string;
}

export interface AuthSessionPayload {
  portal: LoginPortal;
  role: UserRole;
  /** JWT or API access token for `Authorization: Bearer` on protected routes. */
  accessToken: string | null;
  email: string;
  displayName: string;
}
