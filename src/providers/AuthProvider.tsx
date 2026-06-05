import { useEffect, useState, type ReactNode } from 'react';
import { authApi } from '@/features/auth/api/authApi';
import {
  clearAuthStorage,
  getAuthToken,
  getStoredAuthUser,
  removeAuthToken,
  removeStoredAuthUser,
  setStoredAuthUser,
} from '@/lib/authStorage';
import { queryClient } from '@/lib/react-query';
import { AuthContext, type AuthContextType, type AuthUser } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    const savedUser = getStoredAuthUser();

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser) as AuthUser);
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
      await authApi.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      clearAuthStorage();
      setUser(null);
      queryClient.clear();
    }
  };

  const updateUser = (updatedUser: AuthUser) => {
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
