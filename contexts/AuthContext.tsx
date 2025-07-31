"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { authService, handleApiError } from "@/lib/api";
import { User, LoginForm, RegisterForm } from "@/types";
import { toast } from "react-hot-toast";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  // State
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (credentials: LoginForm) => Promise<boolean>;
  register: (userData: RegisterForm) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;

  // Utilities
  canAccess: (requiredRole?: string) => boolean;
  isAdmin: boolean;
  hasCompletedProfile: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Protected routes that require authentication
const PROTECTED_ROUTES = ["/recommendations", "/profile", "/meal-planning"];

// Admin only routes
const ADMIN_ROUTES = ["/admin"];

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/login", "/register", "/foods"];

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check if current route is protected
  const isProtectedRoute = useCallback((path: string) => {
    return PROTECTED_ROUTES.some((route) => path.startsWith(route));
  }, []);

  // Check if current route is admin only
  const isAdminRoute = useCallback((path: string) => {
    return ADMIN_ROUTES.some((route) => path.startsWith(route));
  }, []);

  // Check if user can access a route
  const canAccess = useCallback(
    (requiredRole?: string) => {
      if (!user) return false;
      if (!requiredRole) return true;
      return user.role === requiredRole || user.role === "admin";
    },
    [user]
  );

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  // Check if user has completed profile
  const hasCompletedProfile = !!(
    user?.nama &&
    user?.umur &&
    user?.jenis_kelamin &&
    user?.tinggi_badan &&
    user?.berat_badan
  );

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Handle route protection
  useEffect(() => {
    if (!loading) {
      handleRouteProtection();
    }
  }, [loading, user, pathname]);

  const initializeAuth = async () => {
    try {
      if (authService.isAuthenticated()) {
        await fetchUser();
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      // Clear invalid token
      authService.logout();
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await authService.getProfile();
      setUser(response.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      // Token might be expired
      authService.logout();
      setUser(null);
      throw error;
    }
  };

  const handleRouteProtection = () => {
    if (isProtectedRoute(pathname) && !user) {
      // Redirect to login with return URL
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (isAdminRoute(pathname) && !isAdmin) {
      // Redirect non-admin users
      toast.error("Akses ditolak. Anda tidak memiliki izin admin.");
      router.push("/");
      return;
    }

    // Redirect authenticated users away from auth pages
    if (user && (pathname === "/login" || pathname === "/register")) {
      router.push("/");
      return;
    }
  };

  const login = async (credentials: LoginForm): Promise<boolean> => {
    try {
      const response = await authService.login(credentials);
      const { token, user: userData } = response;

      // Store user data
      setUser(userData);

      // Success message
      toast.success(`Selamat datang, ${userData.nama}!`);

      // Check if profile is complete
      if (!hasCompletedProfile) {
        toast("Lengkapi profil Anda untuk rekomendasi yang lebih akurat", {
          duration: 5000,
          icon: "ℹ️",
        });
      }

      return true;
    } catch (error) {
      const message = handleApiError(error);
      toast.error(message);
      return false;
    }
  };

  const register = async (userData: RegisterForm): Promise<boolean> => {
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registerData } = userData;

      const response = await authService.register(registerData);
      const { token, user: newUser } = response;

      // Store user data
      setUser(newUser);

      // Welcome message
      toast.success(`Registrasi berhasil! Selamat datang, ${newUser.nama}!`);

      // Encourage profile completion
      if (!newUser.umur || !newUser.tinggi_badan || !newUser.berat_badan) {
        setTimeout(() => {
          toast(
            "Lengkapi profil Anda di halaman profil untuk rekomendasi yang lebih akurat",
            {
              duration: 6000,
              icon: "ℹ️",
            }
          );
        }, 2000);
      }

      return true;
    } catch (error) {
      const message = handleApiError(error);
      toast.error(message);
      return false;
    }
  };

  const logout = () => {
    // Clear user data
    setUser(null);

    // Clear token
    authService.logout();

    // Show success message
    toast.success("Anda telah logout");

    // Redirect to home
    router.push("/");
  };

  const refreshUser = async (): Promise<void> => {
    try {
      await fetchUser();
    } catch (error) {
      console.error("Error refreshing user:", error);
      // If refresh fails, user might need to login again
      logout();
    }
  };

  const contextValue: AuthContextType = {
    // State
    user,
    loading,
    isAuthenticated: !!user,

    // Actions
    login,
    register,
    logout,
    refreshUser,

    // Utilities
    canAccess,
    isAdmin,
    hasCompletedProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// HOC for protecting components
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: string
) => {
  const AuthenticatedComponent = (props: P) => {
    const { isAuthenticated, canAccess, loading } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      );
    }

    if (!isAuthenticated || (requiredRole && !canAccess(requiredRole))) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Akses Ditolak
            </h2>
            <p className="text-gray-600 mb-4">
              Anda tidak memiliki izin untuk mengakses halaman ini.
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${
    Component.displayName || Component.name
  })`;
  return AuthenticatedComponent;
};

// Hook for route protection
export const useRouteProtection = (requiredRole?: string) => {
  const { isAuthenticated, canAccess, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (requiredRole && !canAccess(requiredRole)) {
        toast.error("Anda tidak memiliki izin untuk mengakses halaman ini");
        router.push("/");
      }
    }
  }, [isAuthenticated, canAccess, loading, requiredRole, router, pathname]);

  return { isAuthenticated, canAccess, loading };
};

// Hook for getting user info with loading states
export const useUser = () => {
  const { user, loading, refreshUser } = useAuth();

  return {
    user,
    loading,
    refreshUser,
    isLoggedIn: !!user,
    displayName: user?.nama || "User",
    email: user?.email,
    role: user?.role,
  };
};

// Hook for authentication actions
export const useAuthActions = () => {
  const { login, register, logout } = useAuth();

  return {
    login,
    register,
    logout,
  };
};

// Custom hook for checking user permissions
export const usePermissions = () => {
  const { user, canAccess, isAdmin } = useAuth();

  return {
    canAccess,
    isAdmin,
    canEdit: (resourceUserId?: number) => {
      if (isAdmin) return true;
      if (!user || !resourceUserId) return false;
      return user.user_id === resourceUserId;
    },
    canDelete: (resourceUserId?: number) => {
      if (isAdmin) return true;
      if (!user || !resourceUserId) return false;
      return user.user_id === resourceUserId;
    },
    hasRole: (role: string) => user?.role === role,
    hasAnyRole: (roles: string[]) => !!user?.role && roles.includes(user.role),
  };
};

// Export the context for advanced use cases
export { AuthContext };

// Default export
export default AuthProvider;
