import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAuthUser, fetchUserProfile, type AuthUser } from "./api";
import type { User } from "@shared/schema";

type AuthContextType = {
  user: AuthUser;
  profile: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  refreshProfile: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["auth-user"],
    queryFn: fetchAuthUser,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: fetchUserProfile,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const login = () => {
    window.location.href = "/api/login";
  };

  const logout = () => {
    window.location.href = "/api/logout";
  };

  const refreshProfile = () => {
    queryClient.invalidateQueries({ queryKey: ["user-profile"] });
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        profile: profile ?? null,
        isLoading: userLoading || (!!user && profileLoading),
        isAuthenticated: !!user,
        login,
        logout,
        refreshProfile,
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
