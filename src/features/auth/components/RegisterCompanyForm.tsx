import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authApi } from '../api/authApi';
import { ROUTES } from '@/router/routes';
import { AuthAlert } from './AuthAlert';
import { AuthFormSection } from './AuthFormSection';

const registerCompanySchema = z
  .object({
    nombre_empresa: z.string().min(2, 'At least 2 characters').max(100),
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    telefono: z
      .string()
      .min(9, 'At least 9 digits')
      .max(15)
      .regex(/^[0-9+\s-()]+$/, 'Invalid phone format'),
    password: z.string().min(8, 'At least 8 characters').max(100),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterCompanyFormData = z.infer<typeof registerCompanySchema>;

export function RegisterCompanyForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterCompanyFormData>({
    resolver: zodResolver(registerCompanySchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: RegisterCompanyFormData) => {
    try {
      setIsLoading(true);
      setApiError(null);
      setSuccessMessage(null);

      const response = await authApi.registerCompany({
        email: data.email,
        password: data.password,
        nombre_empresa: data.nombre_empresa,
        telefono: data.telefono,
      });

      setSuccessMessage(
        response.message ||
          'Registration received. We will notify you when your company is approved.'
      );

      setTimeout(() => {
        navigate(ROUTES.LOGIN, {
          state: { message: 'Account created. Sign in after admin approval.' },
        });
      }, 4000);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const disabled = isLoading || !!successMessage;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {successMessage && (
        <AuthAlert variant="success" title="Registration submitted">
          {successMessage}
        </AuthAlert>
      )}
      {apiError && (
        <AuthAlert variant="error" title="Could not register">
          {apiError}
        </AuthAlert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <AuthFormSection title="Company">
          <Input
            label="Company name"
            placeholder="Motocross Park Pty Ltd"
            error={errors.nombre_empresa?.message}
            fullWidth
            required
            disabled={disabled}
            {...register('nombre_empresa')}
          />
          <Input
            label="Business phone"
            type="tel"
            placeholder="+61 400 000 000"
            helperText="Include country code if needed"
            error={errors.telefono?.message}
            fullWidth
            required
            disabled={disabled}
            {...register('telefono')}
          />
        </AuthFormSection>

        <AuthFormSection title="Account & security">
          <Input
            label="Email"
            type="email"
            placeholder="company@example.com"
            error={errors.email?.message}
            fullWidth
            required
            autoComplete="email"
            disabled={disabled}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Minimum 8 characters"
            error={errors.password?.message}
            fullWidth
            required
            autoComplete="new-password"
            disabled={disabled}
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
            disabled={disabled}
            {...register('confirmPassword')}
          />
        </AuthFormSection>
      </div>

      {!successMessage && (
        <div className="pt-1">
          <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading} disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Create company account'}
          </Button>
        </div>
      )}
    </form>
  );
}
