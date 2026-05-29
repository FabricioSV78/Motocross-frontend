import { useContext } from 'react';
import { AuthContext } from './AuthProvider';

/**
 * Hook para usar el contexto de autenticación
 * 
 * IMPORTANTE: Debe usarse dentro de AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  
  return context;
}
