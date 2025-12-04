import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase, getSiteUrl } from "./supabase";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";
import type { User } from "@shared/schema";

const RETURN_URL_KEY = "yavoy_login_return";

export type AuthUser = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
} | null;

type AuthContextType = {
  user: AuthUser;
  profile: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  session: Session | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  refreshProfile: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchUserProfile(token: string): Promise<User | null> {
  const response = await fetch("/api/user/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) return null;
  return response.json();
}

async function fetchAuthUser(token: string): Promise<AuthUser> {
  const response = await fetch("/api/auth/user", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) return null;
  return response.json();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const hasHandledRedirect = useRef(false);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const supabase = await getSupabase();
        
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(initialSession);
          setIsInitializing(false);
          
          // Handle redirect after OAuth callback (session exists on first load)
          if (initialSession && !hasHandledRedirect.current) {
            hasHandledRedirect.current = true;
            const savedReturnUrl = sessionStorage.getItem(RETURN_URL_KEY);
            if (savedReturnUrl) {
              sessionStorage.removeItem(RETURN_URL_KEY);
              // Only redirect if we're not already on the target page
              if (!window.location.pathname.startsWith(savedReturnUrl)) {
                window.location.href = savedReturnUrl;
              }
            }
          }
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
          if (mounted) {
            setSession(newSession);
            if (newSession) {
              queryClient.invalidateQueries({ queryKey: ["auth-user"] });
              queryClient.invalidateQueries({ queryKey: ["user-profile"] });
              
              // Handle redirect after sign in (only on SIGNED_IN event)
              if (event === 'SIGNED_IN' && !hasHandledRedirect.current) {
                hasHandledRedirect.current = true;
                const savedReturnUrl = sessionStorage.getItem(RETURN_URL_KEY);
                if (savedReturnUrl) {
                  sessionStorage.removeItem(RETURN_URL_KEY);
                  // Only redirect if we're not already on the target page
                  if (!window.location.pathname.startsWith(savedReturnUrl)) {
                    window.location.href = savedReturnUrl;
                  }
                }
              }
            } else {
              queryClient.setQueryData(["auth-user"], null);
              queryClient.setQueryData(["user-profile"], null);
              hasHandledRedirect.current = false;
            }
          }
        });

        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) {
          setIsInitializing(false);
        }
      }
    }

    initAuth();
    
    return () => {
      mounted = false;
    };
  }, [queryClient]);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["auth-user", session?.access_token],
    queryFn: () => session?.access_token ? fetchAuthUser(session.access_token) : Promise.resolve(null),
    enabled: !!session?.access_token,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["user-profile", session?.access_token],
    queryFn: () => session?.access_token ? fetchUserProfile(session.access_token) : Promise.resolve(null),
    enabled: !!session?.access_token && !!user,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const signInWithGoogle = async () => {
    const supabase = await getSupabase();
    
    // Use the site URL from the server (REPLIT_DEV_DOMAIN) if available
    // This ensures OAuth works even when viewing from localhost proxy
    const siteUrl = getSiteUrl();
    const redirectUrl = siteUrl || window.location.origin;
    
    // Redirect to /entrar after OAuth so the login page can handle proper routing
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${redirectUrl}/entrar`,
      },
    });
    if (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const supabase = await getSupabase();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  };

  const signUpWithEmail = async (email: string, password: string, firstName?: string, lastName?: string) => {
    const supabase = await getSupabase();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  };

  const logout = async () => {
    const supabase = await getSupabase();
    await supabase.auth.signOut();
    queryClient.clear();
    window.location.href = "/";
  };

  const refreshProfile = () => {
    queryClient.invalidateQueries({ queryKey: ["user-profile"] });
  };

  const isLoading = isInitializing || (!!session && (userLoading || (!!user && profileLoading)));

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        profile: profile ?? null,
        isLoading,
        isAuthenticated: !!session && !!user,
        session,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
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
