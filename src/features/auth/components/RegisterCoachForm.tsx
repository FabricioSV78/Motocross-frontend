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

const registerCoachSchema = z
  .object({
    nombre: z.string().min(2, 'At least 2 characters').max(100),
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    telefono: z
      .string()
      .min(9, 'At least 9 digits')
      .max(15)
      .regex(/^[0-9+\s\-()]+$/, 'Invalid phone format'),
    experience: z.string().max(500).optional(),
    password: z.string().min(8, 'At least 8 characters').max(100),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterCoachFormData = z.infer<typeof registerCoachSchema>;

export function RegisterCoachForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterCoachFormData>({
    resolver: zodResolver(registerCoachSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: RegisterCoachFormData) => {
    try {
      setIsLoading(true);
      setApiError(null);

      await authApi.registerCoach({
        email: data.email,
        password: data.password,
        nombre: data.nombre,
        telefono: data.telefono,
        experience: data.experience || undefined,
      });

      await authApi.login({ email: data.email, password: data.password });

      navigate(ROUTES.UPLOAD_CERTIFICATE, {
        state: { message: 'Account created. Upload your certificate to continue.' },
      });
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const textareaClass =
    'w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {apiError && (
        <AuthAlert variant="error" title="Could not create account">
          {apiError}
        </AuthAlert>
      )}

      <AuthFormSection title="Profile">
        <Input
          label="Full name"
          placeholder="John Rider"
          error={errors.nombre?.message}
          fullWidth
          required
          disabled={isLoading}
          {...register('nombre')}
        />
        <Input
          label="Phone"
          type="tel"
          placeholder="+61 400 000 000"
          error={errors.telefono?.message}
          fullWidth
          required
          disabled={isLoading}
          {...register('telefono')}
        />
        <div>
          <label className="text-sm font-semibold text-gray-200">Experience (optional)</label>
          <textarea
            placeholder="Years coaching, certifications, specialties..."
            rows={3}
            className={`${textareaClass} mt-1.5`}
            disabled={isLoading}
            {...register('experience')}
          />
          {errors.experience && (
            <p className="text-xs text-red-400 mt-1">{errors.experience.message}</p>
          )}
        </div>
      </AuthFormSection>

      <AuthFormSection title="Account & security">
        <Input
          label="Email"
          type="email"
          placeholder="coach@example.com"
          error={errors.email?.message}
          fullWidth
          required
          autoComplete="email"
          disabled={isLoading}
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
        {isLoading ? 'Creating account...' : 'Continue to certificate upload'}
      </Button>
    </form>
  );
}
