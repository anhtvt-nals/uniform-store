"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { apiClient, setToken, clearToken, storeUser, getToken, getStoredUser } from "@/lib/api"

type AdminUser = {
  id: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getStoredUser();
    if (storedToken && storedUser) {
      setTokenState(storedToken);
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiClient<{
      accessToken: string;
      admin: AdminUser;
    }>("/auth/login", {
      method: "POST",
      body: { email, password },
    });

    const { accessToken, admin } = response.data;
    setToken(accessToken);
    storeUser(admin);
    setTokenState(accessToken);
    setUser(admin);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await apiClient("/auth/logout", {
          method: "POST",
          token,
        });
      }
    } catch {
      // ignore logout errors
    }
    clearToken();
    setTokenState(null);
    setUser(null);
    router.push("/login");
  }, [token, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
