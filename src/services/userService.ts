import { apiClient } from '@/lib/axios';
import { getAuthToken } from '@/lib/authStorage';
import type { UserProfile, UpdateProfileData } from '@/types/profile.types';
import type { User } from '@/types/user.types';
import { AxiosError } from 'axios';

/**
 * Servicio para gestionar datos del usuario
 */
export const userService = {
  /**
   * Obtiene el perfil completo del usuario piloto autenticado
   * HU-05: Ver perfil
   * Requiere token JWT en localStorage
   * 
   * Intenta primero /users/me/profile (nuevo backend)
   * Si falla con 404, intenta /users/me (backend antiguo) y adapta la respuesta
   * 
   * @returns Promise con los datos del perfil del usuario
   * @throws Error si falla la petición
   */
  async getMyProfile(): Promise<UserProfile> {
    try {
      // Intentar endpoint nuevo (HU-05 implementación completa)
      const response = await apiClient.get<UserProfile>('/users/me/profile');
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
      
      // Si es 404, intentar endpoint antiguo como fallback
      if (axiosError.response?.status === 404) {
        try {
          console.warn('Endpoint /users/me/profile not found, using /users/me as fallback');
          
          // El endpoint antiguo retorna estructura diferente
          const fallbackResponse = await apiClient.get<User>('/users/me');
          const userData = fallbackResponse.data;
          
          // Adaptar la respuesta de /users/me (UserResponse del backend) a UserProfile.
          // El backend devuelve 'nombre' (no 'name') y no existe campo 'avatar'.
          const adaptedProfile: UserProfile = {
            id: Number(userData.id),
            email: userData.email,
            nombre: (userData as unknown as { nombre: string }).nombre,
            foto: null,
            foto_moto: null,
            nivel: 'BEGINNER', // Valor por defecto (UserResponse no incluye nivel)
            moto: null,
          };
          
          return adaptedProfile;
        } catch (fallbackError) {
          const fallbackAxiosError = fallbackError as AxiosError<{ detail?: string; message?: string }>;
          const apiError = fallbackAxiosError.response?.data;
          const errorMessage = 
            apiError?.detail || 
            apiError?.message || 
            'Failed to load user profile';
          
          throw new Error(errorMessage);
        }
      }
      
      // Si no es 404, lanzar el error original
      const apiError = axiosError.response?.data;
      const errorMessage = 
        apiError?.detail || 
        apiError?.message || 
        'Failed to load user profile';
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Actualiza el perfil del piloto autenticado (HU-06)
   * @param data - Datos a actualizar (nombre, foto, foto_moto, nivel, moto)
   */
  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    try {
      const response = await apiClient.put<UserProfile>('/users/me', data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
      const apiError = axiosError.response?.data;
      const errorMessage =
        apiError?.detail ||
        apiError?.message ||
        'Failed to update profile';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene los datos básicos del usuario autenticado (cualquier rol).
   * Llama a GET /users/me que funciona para PILOT, COMPANY y COACH.
   */
  async getMe(): Promise<{
    id: number;
    email: string;
    nombre: string;
    role: string;
    status: string;
    nombre_empresa?: string | null;
    telefono?: string | null;
  }> {
    const response = await apiClient.get('/users/me');
    return response.data as {
      id: number;
      email: string;
      nombre: string;
      role: string;
      status: string;
      nombre_empresa?: string | null;
      telefono?: string | null;
    };
  },

  /**
   * Sube una foto al servidor y devuelve la URL pública
   * @param tipo - 'avatar' | 'moto'
   * @param file - Archivo a subir (JPG, PNG o WebP, máx 5 MB)
   */
  async uploadPhoto(tipo: 'avatar' | 'moto', file: File): Promise<string> {
    // Use fetch directly so the browser sets the correct
    // multipart/form-data; boundary=... header automatically.
    // Axios's instance default Content-Type: 'application/json' would otherwise
    // prevent FastAPI from parsing Form(...) fields (422 Unprocessable Entity).
    const formData = new FormData();
    formData.append('tipo', tipo);
    formData.append('file', file);

    const token = getAuthToken();
    const baseUrl = (apiClient.defaults.baseURL ?? '').replace(/\/$/, '');

    const response = await fetch(`${baseUrl}/users/me/upload-photo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token ?? ''}` },
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({})) as { detail?: string; message?: string };
      throw new Error(data.detail || data.message || 'Failed to upload image');
    }

    const data = await response.json() as { url: string };
    return data.url;
  },
};
