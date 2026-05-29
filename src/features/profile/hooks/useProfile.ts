import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/userService';

/**
 * Hook personalizado para obtener el perfil del usuario autenticado
 * Usa React Query para caché y manejo de estado
 * 
 * @returns Query con los datos del perfil, estado de carga y errores
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { profile, isLoading, error } = useProfile();
 *   
 *   if (isLoading) return <Spinner />;
 *   if (error) return <Error message={error.message} />;
 *   
 *   return <div>{profile.nombre}</div>;
 * }
 * ```
 */
export function useProfile() {
  const query = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: userService.getMyProfile,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isError: query.isError,
    isSuccess: query.isSuccess,
  };
}
