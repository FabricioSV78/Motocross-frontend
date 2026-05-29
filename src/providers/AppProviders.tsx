import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './AuthProvider';
import { queryClient } from '@/lib/react-query';

/**
 * Componente que agrupa todos los providers de la aplicación
 * 
 * Orden de providers:
 * 1. QueryClientProvider - React Query
 * 2. BrowserRouter - React Router (en App.tsx)
 * 3. AuthProvider - Autenticación
 * 4. Futuros providers (Theme, Notifications, etc)
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}
