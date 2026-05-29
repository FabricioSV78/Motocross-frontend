import { QueryClient, type DefaultOptions } from '@tanstack/react-query';

/**
 * Configuración por defecto para React Query
 */
const queryConfig: DefaultOptions = {
  queries: {
    // Tiempo que los datos se consideran "frescos" (5 minutos)
    staleTime: 1000 * 60 * 5,
    
    // Tiempo que los datos inactivos se mantienen en caché (10 minutos)
    gcTime: 1000 * 60 * 10,
    
    // Reintentos en caso de error
    retry: 1,
    
    // No refetch automático al cambiar de ventana
    refetchOnWindowFocus: false,
    
    // No refetch automático al reconectar
    refetchOnReconnect: false,
  },
  mutations: {
    // Configuración para mutaciones
    retry: 0,
  },
};

/**
 * Instancia del QueryClient para React Query
 */
export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});


