import { isAxiosError } from "axios";
import { apiEndpoints, apiPost } from "@/lib/api";
import type { LoginPortal, UserRole } from "./types";
import { portalToApiLoginType, userRoleToApiRole } from "./apiMapping";

export interface SignupRequestBody {
  full_name: string;
  login_type: string;
  role: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface LoginRequestBody {
  login_type: string;
  role: string;
  email: string;
  password: string;
}

function extractAccessToken(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const o = data as Record<string, unknown>;
  const direct = o.access_token ?? o.accessToken ?? o.token;
  if (typeof direct === "string" && direct) return direct;
  const inner = o.data;
  if (inner && typeof inner === "object") {
    const d = inner as Record<string, unknown>;
    const nested = d.access_token ?? d.accessToken ?? d.token;
    if (typeof nested === "string" && nested) return nested;
  }
  return undefined;
}

export function extractDisplayNameFromAuthResponse(
  data: unknown,
  fallbackEmail: string,
): string {
  if (!data || typeof data !== "object") {
    return fallbackEmail.split("@")[0] || "User";
  }
  const o = data as Record<string, unknown>;
  const user = o.user;
  if (user && typeof user === "object") {
    const u = user as Record<string, unknown>;
    const name = u.full_name ?? u.name ?? u.display_name;
    if (typeof name === "string" && name.trim()) return name.trim();
  }
  const top = o.full_name ?? o.name ?? o.display_name;
  if (typeof top === "string" && top.trim()) return top.trim();
  return fallbackEmail.split("@")[0] || "User";
}

export function buildSignupBody(params: {
  fullName: string;
  portal: LoginPortal;
  role: UserRole;
  email: string;
  password: string;
  confirmPassword: string;
}): SignupRequestBody {
  return {
    full_name: params.fullName.trim(),
    login_type: portalToApiLoginType(params.portal),
    role: userRoleToApiRole(params.role),
    email: params.email.trim(),
    password: params.password,
    confirm_password: params.confirmPassword,
  };
}

export function buildLoginBody(params: {
  portal: LoginPortal;
  role: UserRole;
  email: string;
  password: string;
}): LoginRequestBody {
  return {
    login_type: portalToApiLoginType(params.portal),
    role: userRoleToApiRole(params.role),
    email: params.email.trim(),
    password: params.password,
  };
}

export async function signupRequest(body: SignupRequestBody): Promise<{ data: unknown; accessToken?: string }> {
  const data = await apiPost<unknown>(apiEndpoints.auth.signup, body);
  return { data, accessToken: extractAccessToken(data) };
}

export async function loginRequest(body: LoginRequestBody): Promise<{ data: unknown; accessToken: string }> {
  const data = await apiPost<unknown>(apiEndpoints.auth.login, body);
  const accessToken = extractAccessToken(data);
  if (!accessToken) {
    throw new Error("Login succeeded but no access token was returned.");
  }
  return { data, accessToken };
}

export async function logoutRequest(): Promise<void> {
  await apiPost(apiEndpoints.auth.logout, {});
}

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong."): string {
  if (isAxiosError(error)) {
    const msg =
      (error.response?.data as { message?: string; error?: string } | undefined)?.message ??
      (error.response?.data as { message?: string; error?: string } | undefined)?.error;
    if (typeof msg === "string" && msg) return msg;
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
