
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

import { apiRequest } from "../services/api.ts";
import type { LoginResponse, User } from "../types/auth.ts";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

function getStoredSession(): {
  token: string;
  user: User;
} | null {
  try {
    const token = localStorage.getItem("token");
    const rawUser = localStorage.getItem("user");

    if (!token || !rawUser) return null;

    const user: unknown = JSON.parse(rawUser);

    if (typeof user !== "object" || user === null || !("id" in user) || !("name" in user) || !("email" in user) || !("role" in user)) {
      clearSession();
      return null;
    }

    const candidate = user as User;

    if (!["admin", "reporter", "approver"].includes(candidate.role)) {
      clearSession();
      return null;
    }

    return { token, user: candidate };
  } catch {
    clearSession();
    return null;
  }
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  useEffect(() => {
    const session = getStoredSession();

    if (session) {
      setUser(session.user);
    }

    setLoading(false);

    const handleUnauthorized = () => logout();

    window.addEventListener(
      "auth:unauthorized",
      handleUnauthorized,
    );

    return () => {
      window.removeEventListener(
        "auth:unauthorized",
        handleUnauthorized,
      );
    };
  }, [logout]);

  const login = useCallback(
    async (email: string, password: string): Promise<User> => {
      const result = await apiRequest<LoginResponse>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        },
      );

      if (!result.success || !result.data?.token || !result.data?.user) {
        throw new Error(result.message || "Login gagal.");
      }

      const loggedInUser = result.data.user;

      if (!["admin", "reporter", "approver"].includes(loggedInUser.role,)) {
        throw new Error("Role pengguna tidak valid.");
      }

      localStorage.setItem("token", result.data.token);
      localStorage.setItem("user", JSON.stringify(loggedInUser));

      setUser(loggedInUser);

      return loggedInUser;
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth harus digunakan di dalam AuthProvider.",
    );
  }

  return context;
}