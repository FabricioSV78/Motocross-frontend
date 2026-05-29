import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { loginSchema, type LoginFormData } from '../schemas/login.schema';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ROUTES } from '@/router/routes';
import { AuthAlert } from './AuthAlert';

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
  defaultEmail?: string;
}

export function LoginForm({
  onSubmit,
  isLoading = false,
  error,
  defaultEmail = '',
}: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: { email: defaultEmail, password: '' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {error && (
        <AuthAlert variant="error" title="Sign-in failed">
          {error}
        </AuthAlert>
      )}

      <Input
        {...register('email')}
        type="email"
        label="Email"
        placeholder="you@example.com"
        error={errors.email?.message}
        fullWidth
        required
        autoComplete="email"
        disabled={isLoading}
      />

      <Input
        {...register('password')}
        type="password"
        label="Password"
        placeholder="Your password"
        error={errors.password?.message}
        fullWidth
        required
        autoComplete="current-password"
        disabled={isLoading}
      />

      <Button type="submit" variant="primary" fullWidth isLoading={isLoading} disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>

      <p className="text-center text-gray-500 text-xs">
        New here?{' '}
        <Link to={ROUTES.REGISTER} className="text-orange-400 hover:text-orange-300 font-medium">
          Choose your account type
        </Link>
      </p>
    </form>
  );
}
