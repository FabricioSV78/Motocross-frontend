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

function isLocalHost(hostname: string): boolean {
  return ['localhost', '127.0.0.1', '::1'].includes(hostname);
}

export function normalizeUrlForCurrentPage(value: string): string {
  const trimmed = value.trim();

  try {
    const url = new URL(trimmed);
    const isHttpsPage =
      typeof window !== 'undefined' && window.location.protocol === 'https:';

    if (isHttpsPage && url.protocol === 'http:' && !isLocalHost(url.hostname)) {
      url.protocol = 'https:';
      return url.toString().replace(/\/$/, '');
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}

function normalizeApiUrl(value: string): string {
  return normalizeUrlForCurrentPage(value).replace(/\/+$/, '');
}

/**
 * Variables de entorno tipadas y validadas
 * 
 * IMPORTANTE: Todas las variables deben tener el prefijo VITE_ en .env
 * Ejemplo: VITE_API_URL=http://localhost:8000/api/v1
 */
export const env: Env = {
  API_URL: normalizeApiUrl(getEnvVar('API_URL', 'http://localhost:8000/api/v1')),
  NODE_ENV: (import.meta.env.MODE as Env['NODE_ENV']) || 'development',
};


