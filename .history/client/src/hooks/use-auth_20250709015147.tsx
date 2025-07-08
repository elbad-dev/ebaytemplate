import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Define types
type UserType = {
  id: number;
  username: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

type AuthContextType = {
  user: UserType | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<UserType, Error, LoginData>;
  logoutMutation: UseMutationResult<{ message: string }, Error, void>;
  registerMutation: UseMutationResult<UserType, Error, RegisterData>;
  isDemoMode: boolean;
};

type LoginData = {
  username: string; 
  password: string;
};

type RegisterData = {
  username: string;
  email: string;
  password: string;
};

// Helper function to detect if we're in demo mode (GitHub Pages)
const isDemoMode = () => {
  // Check if we're on GitHub Pages or no backend is available
  return window.location.hostname.includes('github.io') || 
         process.env.NODE_ENV === 'production' && !window.location.hostname.includes('localhost');
};

// Demo user for GitHub Pages
const DEMO_USER: UserType = {
  id: 1,
  username: "demo",
  email: "demo@example.com",
  role: "user",
  isVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Create context
export const AuthContext = createContext<AuthContextType | null>(null);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const isDemo = isDemoMode();
  
  // Query to fetch the current user
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<UserType | null, Error>({
    queryKey: ["/api/user"],
    queryFn: async ({ queryKey }) => {
      // In demo mode, return null (no user logged in initially)
      if (isDemo) {
        console.log("Demo mode: No user authentication");
        return null;
      }
      
      console.log("Fetching current user");
      try {
        const res = await fetch(queryKey[0] as string, {
          credentials: "include", // Important for cookies
        });
        
        if (res.status === 401) {
          return null;
        }
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
        }
        
        return await res.json();
      } catch (error) {
        console.error("User query error:", error);
        return null;
      }
    },
    staleTime: 60000, // Cache for 1 minute
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log("Attempting login with:", credentials.username);
      
      // In demo mode, simulate login
      if (isDemo) {
        // Simple demo credentials check
        if ((credentials.username === "demo" || credentials.username === "testuser") && 
            credentials.password === "password") {
          console.log("Demo mode: Login successful");
          return DEMO_USER;
        } else {
          throw new Error("Demo credentials: username: demo/testuser, password: password");
        }
      }
      
      try {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
          credentials: "include", // Important for cookies
        });
        
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || `Error ${res.status}: ${res.statusText}`);
        }
        
        return data;
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },
    onSuccess: (user: UserType) => {
      console.log("Login successful:", user);
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!${isDemo ? ' (Demo Mode)' : ''}`,
      });
    },
    onError: (error: Error) => {
      console.error("Login mutation error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Incorrect username or password",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      console.log("Attempting registration with:", credentials.username);
      
      // In demo mode, simulate registration
      if (isDemo) {
        console.log("Demo mode: Registration successful");
        return { ...DEMO_USER, username: credentials.username, email: credentials.email };
      }
      
      try {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
          credentials: "include", // Important for cookies
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
        }
        
        return await res.json();
      } catch (error) {
        console.error("Registration error:", error);
        throw error;
      }
    },
    onSuccess: (user: UserType) => {
      console.log("Registration successful:", user);
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: `Your account has been created${isDemo ? ' (Demo Mode)' : ''}`,
      });
    },
    onError: (error: Error) => {
      console.error("Registration mutation error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log("Attempting logout");
      try {
        const res = await fetch("/api/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Important for cookies
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
        }
        
        return await res.json();
      } catch (error) {
        console.error("Logout error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("Logout successful");
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Logout mutation error:", error);
      toast({
        title: "Logout failed",
        description: error.message || "Failed to log out",
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}