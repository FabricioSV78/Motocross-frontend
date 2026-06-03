import { createContext, useState, useEffect, type ReactNode } from 'react';
import { authApi } from '@/features/auth/api/authApi';
import type { UserRole } from '@/features/auth/types';
import {
  clearAuthStorage,
  getAuthToken,
  getStoredAuthUser,
  removeAuthToken,
  removeStoredAuthUser,
  setStoredAuthUser,
} from '@/lib/authStorage';
import { queryClient } from '@/lib/react-query';

/**
 * Tipos para autenticación
 */
interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

/**
 * Contexto de autenticación
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider de autenticación
 * Lee el usuario del localStorage y proporciona el contexto de auth
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si hay sesión guardada al montar
  useEffect(() => {
    const token = getAuthToken();
    const savedUser = getStoredAuthUser();

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        removeAuthToken();
        removeStoredAuthUser();
      }
    }

    setIsLoading(false);
  }, []);

  const logout = async () => {
    try {
      // Llamar al endpoint de logout del backend
      await authApi.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Siempre limpiar el estado local
      clearAuthStorage();
      setUser(null);

      // Limpiar toda la caché de React Query para que el próximo usuario
      // no vea datos del usuario anterior
      queryClient.clear();
      
      // Redirigir a login se maneja en el componente que llama logout
      // Para evitar dependencia circular con react-router
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    setStoredAuthUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
