import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/useAuth';
import { PageLoader } from '@/components/common';
import { ROUTES } from '@/router/routes';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

/** Ruta por defecto según el rol del usuario */
function defaultRouteForRole(role: UserRole): string {
  switch (role) {
    case 'ADMIN':    return ROUTES.ADMIN_COMPANIES;
    case 'COMPANY':  return ROUTES.COMPANY_DASHBOARD;
    case 'COACH':    return ROUTES.COACH_DASHBOARD;
    default:         return ROUTES.DASHBOARD;
  }
}

export function ProtectedRoute({ 
  allowedRoles, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader message="Checking session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Si el rol no tiene acceso, redirigir silenciosamente a su dashboard
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={defaultRouteForRole(user.role)} replace />;
  }

  return <Outlet />;
}
