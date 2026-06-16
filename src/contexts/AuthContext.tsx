import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import api from "../services/api";
import type { User, JSendResponse } from "../types/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    // Localization is per-account: signal listeners (LocaleContext) to forget
    // the chosen language so the site resets to its English/LTR default for
    // the next (guest) session.
    window.dispatchEvent(new Event("auth:logout"));
  };

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          // Verify token and get fresh user data
          const response =
            await api.get<JSendResponse<{ user: User }>>("/auth/me");
          if (response.data.success && response.data.data) {
            setUser(response.data.data.user);
          }
        } catch (error) {
          console.error("Failed to restore session:", error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();

    // Listen for unauthorized events from axios interceptor
    const handleUnauthorized = () => logout();
    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const response = await api.get<JSendResponse<{ user: User }>>("/auth/me");
      if (response.data.success && response.data.data) {
        setUser(response.data.data.user);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
