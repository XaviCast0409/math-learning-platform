import { createContext, useContext, useState, useEffect, type ReactNode, useMemo } from 'react';
import type { User, AuthResponse } from '../types'; // Ensure AuthResponse is imported
import { authApi } from '../features/auth/api/auth.api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<AuthResponse>;
  register?: (data: { username: string; email: string; password: string }) => Promise<void>; // Deprecated
  logout: () => void;
  updateUserStats: (stats: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  setSession: (user: User, token: string) => void;
  // REMOVE createdAt and updatedAt from here. They belong inside 'user'.
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApi.getProfile();
      setUser(response.data.user);
    } catch (error) {
      console.error('Sesión inválida', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await authApi.login(credentials);

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      setUser(response.data.user);

      return response;
    } catch (error) {
      throw error;
    }
  };

  // DEPRECATED: Old register method - Now using email verification flow
  // const register = async (data: { username: string; email: string; password: string }) => {
  //   try {
  //     const response = await authApi.register(data);
  //     localStorage.setItem('token', response.data.token);
  //     localStorage.setItem('user', JSON.stringify(response.data.user));
  //     setUser(response.data.user);
  //   } catch (error) {
  //     throw error;
  //   }
  // };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const setSession = (userData: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const updateUserStats = (newStats: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...newStats };
      setUser(updatedUser);
      // Persist to localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    // register is deprecated - using email verification flow now
    logout,
    updateUserStats,
    refreshUser: checkAuth,
    setSession
  }), [user, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};