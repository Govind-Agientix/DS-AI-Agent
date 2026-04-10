import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { AuthUser, AuthSessionPayload } from "./types";
import { STORAGE_KEY } from "./config";

type AuthContextValue = {
  user: AuthUser | null;
  login: (payload: AuthSessionPayload) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readSession(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSessionPayload;
    if (!parsed?.email || !parsed?.portal || !parsed?.role) return null;
    return {
      portal: parsed.portal,
      role: parsed.role,
      email: parsed.email,
      displayName: parsed.displayName || parsed.email.split("@")[0] || "User",
    };
  } catch {
    return null;
  }
}

let memoryUser: AuthUser | null = readSession();
const listeners = new Set<() => void>();

function setSession(payload: AuthSessionPayload | null) {
  if (!payload) {
    memoryUser = null;
    sessionStorage.removeItem(STORAGE_KEY);
    listeners.forEach((l) => l());
    return;
  }
  const displayName = payload.displayName || payload.email.split("@")[0] || "User";
  const full: AuthSessionPayload = {
    ...payload,
    displayName,
    accessToken: payload.accessToken ?? null,
  };
  memoryUser = {
    portal: full.portal,
    role: full.role,
    email: full.email,
    displayName,
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(full));
  listeners.forEach((l) => l());
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    },
    () => memoryUser,
    () => memoryUser,
  );

  const login = useCallback((payload: AuthSessionPayload) => {
    const displayName = payload.displayName || payload.email.split("@")[0] || "User";
    setSession({
      ...payload,
      displayName,
      accessToken: payload.accessToken ?? null,
    });
  }, []);

  const logout = useCallback(() => {
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
    }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
