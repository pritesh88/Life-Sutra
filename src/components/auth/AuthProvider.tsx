"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthUser, PermissionKey } from "@/lib/auth/types";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  can: (permission: PermissionKey) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function cookieValue(name: string) {
  return document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${name}=`))
    ?.split("=")
    .slice(1)
    .join("=");
}

async function csrfToken() {
  await fetch("/api/auth/csrf", { credentials: "same-origin", cache: "no-store" });
  const token = cookieValue("__Host-life_sutra_csrf") ?? cookieValue("life_sutra_csrf");
  if (!token)
    throw new Error("Security token could not be established. Please refresh and try again.");
  return decodeURIComponent(token);
}

export async function authRequest(
  path: string,
  body?: Record<string, unknown>,
  method: "POST" | "PATCH" | "PUT" | "DELETE" = "POST",
) {
  const token = await csrfToken();
  const request: RequestInit = {
    method,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
  };
  if (body) request.body = JSON.stringify(body);
  const response = await fetch(path, request);
  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    fields?: Record<string, string[]>;
    user?: AuthUser;
  };
  if (!response.ok) {
    const error = new Error(data.error ?? "Something went wrong. Please try again.") as Error & {
      fields?: Record<string, string[]>;
      status?: number;
    };
    if (data.fields) error.fields = data.fields;
    error.status = response.status;
    throw error;
  }
  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session", {
        credentials: "same-origin",
        cache: "no-store",
      });
      const data = (await response.json()) as { user: AuthUser | null };
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await authRequest("/api/auth/logout");
    setUser(null);
    // Full navigation: drops every piece of client-side state and any cached
    // server-rendered page that belonged to the signed-in user.
    window.location.assign("/");
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      refresh,
      logout,
      can: (permission: PermissionKey) => user?.permissions.includes(permission) ?? false,
    }),
    [loading, refresh, logout, user],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider.");
  return value;
}
