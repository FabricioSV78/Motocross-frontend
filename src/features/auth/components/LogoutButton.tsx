import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/useAuth';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/router/routes';

interface LogoutButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  className?: string;
}

/**
 * Botón de logout
 * Cierra la sesión del usuario y redirige al login
 */
export function LogoutButton({ variant = 'outline', className }: LogoutButtonProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Llamar a la función logout del contexto
      await logout();
      
      // Redirigir al login después del logout exitoso
      navigate(ROUTES.LOGIN, { replace: true });
    } catch (error) {
      console.error('Error durante logout:', error);
      // Incluso si hay error, redirigir al login
      navigate(ROUTES.LOGIN, { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant={variant}
      isLoading={isLoading}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
    </Button>
  );
}
