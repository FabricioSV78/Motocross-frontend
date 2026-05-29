import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { AuthLayout, AuthCard } from '../components/AuthLayout';
import { AuthAlert } from '../components/AuthAlert';
import { authApi, type UserRole } from '../api/authApi';
import { ROUTES } from '@/router/routes';
import { APP_CONFIG } from '@/config/app';
import { useAuth } from '@/providers/useAuth';
import type { LoginFormData } from '../schemas/login.schema';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const locationState = location.state as { message?: string; email?: string } | null;
  const successMessage = locationState?.message;
  const defaultEmail = locationState?.email ?? '';

  const getRedirectRoute = (role: UserRole, status?: string): string => {
    switch (role) {
      case 'PILOT':
        return ROUTES.DASHBOARD;
      case 'COMPANY':
        return ROUTES.COMPANY_DASHBOARD;
      case 'COACH':
        return status === 'APPROVED' ? ROUTES.COACH_DASHBOARD : ROUTES.UPLOAD_CERTIFICATE;
      case 'ADMIN':
        return ROUTES.ADMIN_COMPANIES;
      default:
        return ROUTES.HOME;
    }
  };

  const handleLogin = async (data: LoginFormData) => {
    setError(undefined);
    setIsLoading(true);

    try {
      const response = await authApi.login({
        email: data.email,
        password: data.password,
      });

      localStorage.setItem(APP_CONFIG.auth.tokenKey, response.token);
      const userInfo = {
        id: response.user.id.toString(),
        email: response.user.email,
        role: response.role,
      };
      localStorage.setItem(APP_CONFIG.auth.userKey, JSON.stringify(userInfo));
      updateUser(userInfo);

      navigate(getRedirectRoute(response.role, response.status), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Access your dashboard to manage tracks, bookings, or lessons."
      footer={
        <p className="text-center text-gray-500 text-sm mt-8">
          Don&apos;t have an account?{' '}
          <Link to={ROUTES.REGISTER} className="text-orange-400 hover:text-orange-300 font-medium">
            Create account
          </Link>
        </p>
      }
    >
      {successMessage && (
        <AuthAlert variant="success" title="Account ready">
          {successMessage}
        </AuthAlert>
      )}

      <AuthCard className="mt-6">
        <LoginForm
          onSubmit={handleLogin}
          isLoading={isLoading}
          error={error}
          defaultEmail={defaultEmail}
        />
      </AuthCard>
    </AuthLayout>
  );
}
