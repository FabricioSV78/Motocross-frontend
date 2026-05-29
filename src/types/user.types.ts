/**
 * Tipos relacionados con usuarios
 */

/**
 * Roles de usuario según el backend
 */
export type UserRole = 'PILOT' | 'COMPANY' | 'ADMIN' | 'COACH';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Rider extends User {
  role: 'PILOT';
  experience?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  bikeModel?: string;
}

export interface Company extends User {
  role: 'COMPANY';
  companyName: string;
  cif: string;
  address?: string;
  description?: string;
  logo?: string;
}

export interface UserProfile {
  user: User;
  stats?: {
    totalReservations: number;
    favoriveTracks: number;
  };
}
