/**
 * Tipos relacionados con el perfil de usuario
 */

/**
 * Nivel de experiencia del piloto
 */
export type UserLevel = 'BEGINNER' | 'INTERMEDIATE' | 'PRO';

/**
 * Perfil completo del usuario piloto
 */
export interface UserProfile {
  id: number;
  email: string;
  nombre: string;
  foto: string | null;
  foto_moto: string | null;
  nivel: UserLevel;
  moto: string | null;
}

/**
 * Datos enviados al backend para editar el perfil (HU-06)
 */
export interface UpdateProfileData {
  nombre: string;
  foto?: string | null;
  foto_moto?: string | null;
  nivel?: UserLevel;
  moto?: string | null;
}

/**
 * Etiquetas traducidas para los niveles
 */
export const USER_LEVEL_LABELS: Record<UserLevel, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  PRO: 'Pro',
};

/**
 * Colores para cada nivel
 */
export const USER_LEVEL_COLORS: Record<UserLevel, string> = {
  BEGINNER: 'bg-green-500/20 text-green-400 border-green-500/30',
  INTERMEDIATE: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  PRO: 'bg-red-500/20 text-red-400 border-red-500/30',
};
