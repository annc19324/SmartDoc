import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { User, Role } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (partialUser: Partial<User>) => void;
  hasRole: (roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_KEY = 'smartdoc_access_token';
const REFRESH_TOKEN_KEY = 'smartdoc_refresh_token';
const USER_STORAGE_KEY = 'smartdoc_user';

const getInitialStoredUser = (): User | null => {
  try {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) {
      localStorage.removeItem(USER_STORAGE_KEY);
      return null;
    }
    const rawUser = localStorage.getItem(USER_STORAGE_KEY);
    if (!rawUser) return null;
    const parsed = JSON.parse(rawUser);
    if (parsed && parsed.id && parsed.email) {
      return parsed as User;
    }
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
  }
  return null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(getInitialStoredUser);
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    // Only block initial route guard if we have a token to verify and no hydrated user yet
    const hasToken = !!localStorage.getItem(ACCESS_TOKEN_KEY);
    const hasCachedUser = !!getInitialStoredUser();
    return hasToken && !hasCachedUser;
  });

  const persistUser = useCallback((nextUser: User | null) => {
    setUser(nextUser);
    if (nextUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, []);

  const clearAuthStorage = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (!token) {
        if (isMounted) {
          persistUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const userData = await authApi.getMe();
        if (isMounted) {
          persistUser(userData);
        }
      } catch (err: any) {
        const status = err?.response?.status;
        // Only wipe session when server explicitly rejects credentials (401 / 403)
        // Transient network hiccups or cold-starts keep cached session alive
        if (status === 401 || status === 403) {
          console.warn('Session expired or unauthorized, clearing auth state.');
          if (isMounted) {
            clearAuthStorage();
            queryClient.clear();
          }
        } else {
          console.warn('Transient error verifying session, keeping cached session:', err?.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Sync state when Axios interceptor detects an expired refresh token
    const handleAuthExpired = () => {
      if (isMounted) {
        clearAuthStorage();
        queryClient.clear();
      }
    };

    // Sync login/logout across multiple browser tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (!isMounted) return;
      if (e.key === ACCESS_TOKEN_KEY && !e.newValue) {
        setUser(null);
        queryClient.clear();
      } else if (e.key === USER_STORAGE_KEY) {
        if (e.newValue && localStorage.getItem(ACCESS_TOKEN_KEY)) {
          try {
            setUser(JSON.parse(e.newValue));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('smartdoc:auth-expired', handleAuthExpired);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      isMounted = false;
      window.removeEventListener('smartdoc:auth-expired', handleAuthExpired);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [persistUser, clearAuthStorage, queryClient]);

  const login = async (credentials: any) => {
    const data = await authApi.login(credentials);
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    persistUser(data.user);
    // Clear stale guest or previous-user cache so homepage/dashboard fetches fresh user data
    queryClient.clear();
  };

  const register = async (userData: any) => {
    const data = await authApi.register(userData);
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    persistUser(data.user);
    queryClient.clear();
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (e) {
      console.warn('Logout error ignored:', e);
    } finally {
      clearAuthStorage();
      queryClient.clear();
    }
  };

  const updateUser = useCallback(
    (partialUser: Partial<User>) => {
      setUser((prev) => {
        if (!prev) return prev;
        const merged = { ...prev, ...partialUser };
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(merged));
        return merged;
      });
    },
    []
  );

  const hasRole = (roles: Role[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
