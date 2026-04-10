import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { STORAGE_KEY } from "@/auth/config";

/**
 * API base URL including `/api/v1`. Override with `VITE_API_BASE_URL` in `.env`.
 * Example: `VITE_API_BASE_URL=http://localhost:3000/api/v1`
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://192.168.3.230:6600/api/v1";

export const apiEndpoints = {
  auth: {
    signup: "/auth/signup",
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  },
  agents: {
    list: "/agents",
    create: "/agents/create",
    byId: (id: string) => `/agents/${encodeURIComponent(id)}`,
    connect: (id: string) => `/agents/${encodeURIComponent(id)}/connect`,
    categories: "/agents/categories",
    memory: (id: string) => `/agents/${encodeURIComponent(id)}/memory`,
  },
  users: {
    me: "/users/me",
    list: "/users",
    byId: (id: string) => `/users/${encodeURIComponent(id)}`,
  },
} as const;

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000,
  withCredentials: false,
});

apiClient.interceptors.request.use((config) => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return config;
    const parsed = JSON.parse(raw) as { accessToken?: string | null };
    const token = parsed.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    /* ignore */
  }
  return config;
});

export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

export interface ApiRequestOptions extends Omit<AxiosRequestConfig, "url" | "method" | "baseURL"> {
  path: string;
  method?: HttpMethod;
}

export async function apiRequest<T = unknown>(options: ApiRequestOptions): Promise<T> {
  const { path, method = "get", ...axiosConfig } = options;
  const response: AxiosResponse<T> = await apiClient.request<T>({
    ...axiosConfig,
    url: path,
    method,
  });
  return response.data;
}

export async function apiGet<T = unknown>(
  path: string,
  config?: Omit<ApiRequestOptions, "path" | "method">,
): Promise<T> {
  return apiRequest<T>({ path, method: "get", ...config });
}

export async function apiPost<T = unknown>(
  path: string,
  body?: unknown,
  config?: Omit<ApiRequestOptions, "path" | "method" | "data">,
): Promise<T> {
  return apiRequest<T>({ path, method: "post", data: body, ...config });
}

export async function apiPut<T = unknown>(
  path: string,
  body?: unknown,
  config?: Omit<ApiRequestOptions, "path" | "method" | "data">,
): Promise<T> {
  return apiRequest<T>({ path, method: "put", data: body, ...config });
}

export async function apiPatch<T = unknown>(
  path: string,
  body?: unknown,
  config?: Omit<ApiRequestOptions, "path" | "method" | "data">,
): Promise<T> {
  return apiRequest<T>({ path, method: "patch", data: body, ...config });
}

export async function apiDelete<T = unknown>(
  path: string,
  config?: Omit<ApiRequestOptions, "path" | "method">,
): Promise<T> {
  return apiRequest<T>({ path, method: "delete", ...config });
}
