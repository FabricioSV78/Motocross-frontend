import { zodResolver } from '@hookform/resolvers/zod';

/**
 * Configuración por defecto para React Hook Form
 */
export const defaultFormConfig = {
  mode: 'onBlur' as const,
  reValidateMode: 'onChange' as const,
};

/**
 * Re-exportar zodResolver para usar en los formularios
 */
export { zodResolver };
