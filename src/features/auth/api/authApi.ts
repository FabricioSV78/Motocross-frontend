import { apiClient } from '@/lib/axios';
import type { User } from '@/types/user.types';
import { AxiosError } from 'axios';

/**
 * Roles de usuario según el backend
 */
export type UserRole = 'PILOT' | 'COMPANY' | 'COACH' | 'ADMIN';

/**
 * Datos necesarios para el registro de usuario
 */
export interface RegisterData {
  email: string;
  password: string;
  nombre: string;
}

/**
 * Datos necesarios para el registro de empresa
 */
export interface RegisterCompanyData {
  email: string;
  password: string;
  nombre_empresa: string;
  telefono: string;
}

/**
 * Datos necesarios para el registro de coach (HU-03)
 */
export interface RegisterCoachData {
  email: string;
  password: string;
  nombre: string;
  telefono: string;
  experience?: string;
}

/**
 * Respuesta del servidor después de registrar un coach
 */
export interface RegisterCoachResponse {
  id: number;
  email: string;
  role: UserRole;
  status: string;
}

/**
 * Datos necesarios para el login
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * Usuario retornado por el backend en login/register
 */
export interface AuthUser {
  id: number;
  email: string;
}

/**
 * Respuesta del servidor después del login
 */
export interface AuthResponse {
  token: string;
  user: AuthUser;
  role: UserRole;
  status: string;
  message?: string;
}

/**
 * Error de respuesta del backend
 */
export interface ApiError {
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * API de autenticación
 */
export const authApi = {
  /**
   * Registra un nuevo usuario en el sistema
   * @param data - Datos del usuario (email, password, nombre)
   * @returns Promise con la respuesta de autenticación
   * @throws Error si el registro falla
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', {
        email: data.email,
        password: data.password,
        nombre: data.nombre,
      });
      
      return response.data;
    } catch (error) {
      // Extraer mensaje de error del backend
      const axiosError = error as AxiosError<ApiError>;
      const apiError = axiosError.response?.data;
      const errorMessage = 
        apiError?.detail || 
        apiError?.message || 
        'Error al registrar usuario. Intenta nuevamente.';
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Registra una nueva empresa en el sistema
   * @param data - Datos de la empresa (email, password, nombre_empresa, telefono)
   * @returns Promise con la respuesta
   * @throws Error si el registro falla
   */
  async registerCompany(data: RegisterCompanyData): Promise<{ message: string }> {    try {
      const response = await apiClient.post<{ message: string }>('/auth/register-company', {
        email: data.email,
        password: data.password,
        nombre_empresa: data.nombre_empresa,
        telefono: data.telefono,
      });
      
      return response.data;
    } catch (error) {
      // Extraer mensaje de error del backend
      const axiosError = error as AxiosError<ApiError>;
      const apiError = axiosError.response?.data;
      const errorMessage = 
        apiError?.detail || 
        apiError?.message || 
        'Error al registrar empresa. Intenta nuevamente.';
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Inicia sesión con credenciales de usuario
   * @param data - Credenciales (email, password)
   * @returns Promise con la respuesta de autenticación
   * @throws Error si el login falla
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', data);
      
      // Guardar token en localStorage
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      const apiError = axiosError.response?.data;
      const errorMessage = 
        apiError?.detail || 
        apiError?.message || 
        'Invalid credentials.';
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Cierra la sesión del usuario actual
   * Llama al backend para invalidar el token y limpia localStorage
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Siempre remover el token y usuario localmente
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  },

  /**
   * Obtiene el usuario autenticado actual
   * @returns Promise con los datos del usuario
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  /**
   * HU-03: Registra un nuevo coach en el sistema
   * @param data - Datos del coach (email, password, nombre, telefono, experience)
   * @returns Promise con el coach creado
   * @throws Error si el registro falla
   */
  async registerCoach(data: RegisterCoachData): Promise<RegisterCoachResponse> {
    try {
      const response = await apiClient.post<RegisterCoachResponse>('/auth/register-coach', {
        email: data.email,
        password: data.password,
        nombre: data.nombre,
        telefono: data.telefono,
        experience: data.experience ?? null,
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      const apiError = axiosError.response?.data;
      const errorMessage =
        apiError?.detail ||
        apiError?.message ||
        'Failed to register coach. Please try again.';
      throw new Error(errorMessage);
    }
  },

  /**
   * HU-09: Sube el certificado del coach autenticado
   * @param file - Archivo PDF o imagen
   * @returns Promise con mensaje de confirmación
   */
  async uploadCertificate(file: File): Promise<{ message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await apiClient.post<{ message: string }>(
        '/coach/certificate',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      const apiError = axiosError.response?.data;
      const errorMessage =
        apiError?.detail ||
        apiError?.message ||
        'Failed to upload certificate. Please try again.';
      throw new Error(errorMessage);
    }
  },
};
