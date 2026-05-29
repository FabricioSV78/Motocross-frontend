import { z } from 'zod';

/**
 * Esquema de validación para el formulario de login
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

/**
 * Tipo inferido del esquema de login
 */
export type LoginFormData = z.infer<typeof loginSchema>;
