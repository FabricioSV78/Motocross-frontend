import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authApi, type RegisterData } from '../api/authApi';
import { ROUTES } from '@/router/routes';
import { AuthAlert } from './AuthAlert';
import { AuthFormSection } from './AuthFormSection';

const registerSchema = z
  .object({
    nombre: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    password: z.string().min(8, 'At least 8 characters').max(100),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setApiError(null);

      const registerData: RegisterData = {
        email: data.email,
        password: data.password,
        nombre: data.nombre,
      };

      await authApi.register(registerData);

      navigate(ROUTES.LOGIN, {
        state: {
          message: 'Account created. Sign in with your email and password.',
          email: data.email,
        },
      });
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {apiError && (
        <AuthAlert variant="error" title="Could not create account">
          {apiError}
        </AuthAlert>
      )}

      <AuthFormSection title="Your details">
        <Input
          label="Full name"
          placeholder="John Smith"
          error={errors.nombre?.message}
          fullWidth
          required
          disabled={isLoading}
          {...register('nombre')}
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          fullWidth
          required
          autoComplete="email"
          disabled={isLoading}
          {...register('email')}
        />
      </AuthFormSection>

      <AuthFormSection title="Security" description="Minimum 8 characters">
        <Input
          label="Password"
          type="password"
          placeholder="Create a password"
          error={errors.password?.message}
          fullWidth
          required
          autoComplete="new-password"
          disabled={isLoading}
          {...register('password')}
        />
        <Input
          label="Confirm password"
          type="password"
          placeholder="Repeat password"
          error={errors.confirmPassword?.message}
          fullWidth
          required
          autoComplete="new-password"
          disabled={isLoading}
          {...register('confirmPassword')}
        />
      </AuthFormSection>

      <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading} disabled={isLoading}>
        {isLoading ? 'Creating account...' : 'Create rider account'}
      </Button>
    </form>
  );
}
