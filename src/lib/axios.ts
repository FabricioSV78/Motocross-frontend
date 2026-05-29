import axios from 'axios';
import { env } from '@/config/env';

/**
 * Instancia configurada de Axios para todas las peticiones API
 */
export const apiClient = axios.create({
  baseURL: env.API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de request - Añade token de autenticación
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de response - Manejo de errores global
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // El servidor respondió con un status code fuera del rango 2xx
      const { status, data } = error.response;
      
      switch (status) {
        case 401: {
          // Solo redirigir al login si NO es el propio endpoint de autenticación.
          // Si el 401 viene de /auth/login o /auth/login-oauth significa credenciales
          // incorrectas: el error debe propagarse al formulario para mostrarlo.
          const url = error.config?.url ?? '';
          const isAuthEndpoint = url.includes('/auth/login');
          if (!isAuthEndpoint) {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
          }
          break;
        }
        case 403: {
          // Token de otro usuario en localStorage (ej: dos pestañas con distintos roles)
          // Limpiar sesión y redirigir al login
          const url403 = error.config?.url ?? '';
          const isAuthEndpoint403 = url403.includes('/auth/login');
          if (!isAuthEndpoint403) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            window.location.href = '/login';
          }
          break;
        }
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('Request error:', data?.message || error.message);
      }
    } else if (error.request) {
      // La petición se hizo pero no se recibió respuesta
      console.error('Could not connect to the server');
    } else {
      // Algo ocurrió al configurar la petición
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);
