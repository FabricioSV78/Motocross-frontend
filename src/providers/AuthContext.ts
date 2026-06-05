import { createContext } from 'react';
import type { UserRole } from '@/features/auth/types';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  avatar?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  updateUser: (user: AuthUser) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
