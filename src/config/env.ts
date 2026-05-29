/**
 * Validación y tipado de variables de entorno
 */

interface Env {
  API_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
}

/**
 * Obtiene y valida una variable de entorno
 */
function getEnvVar(key: string, fallback?: string): string {
  const value = import.meta.env[`VITE_${key}`] || fallback;
  
  if (!value) {
    throw new Error(`Variable de entorno faltante: VITE_${key}`);
  }
  
  return value;
}

/**
 * Variables de entorno tipadas y validadas
 * 
 * IMPORTANTE: Todas las variables deben tener el prefijo VITE_ en .env
 * Ejemplo: VITE_API_URL=http://localhost:8000/api/v1
 */
export const env: Env = {
  API_URL: getEnvVar('API_URL', 'http://localhost:8000/api/v1'),
  NODE_ENV: (import.meta.env.MODE as Env['NODE_ENV']) || 'development',
};


