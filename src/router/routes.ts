/**
 * Definición centralizada de rutas de la aplicación
 */

export const ROUTES = {
  // Públicas
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  REGISTER_COMPANY: '/register-company',
  REGISTER_COACH: '/register-coach',

  // Coach (pública para registro, protegida para subir certificado)
  UPLOAD_CERTIFICATE: '/coach/upload-certificate',
  COACH_SETTINGS: '/coach/settings',
  COACH_AVAILABILITY: '/coach/availability',
  COACH_RESERVATIONS: '/coach/reservations',
  
  // Pistas
  TRACKS: '/tracks',
  MAP: '/map',
  TRACK_DETAIL: (id: string) => `/tracks/${id}`,
  
  // Dashboard (protegidas - según rol)
  DASHBOARD: '/dashboard',           // Para PILOT
  COACH_DASHBOARD: '/coach/dashboard', // Para COACH aprobado
  PROFILE: '/profile', // Perfil de usuario
  EDIT_PROFILE: '/profile/edit', // Editar perfil (HU-06)
  COMPANY_DASHBOARD: '/company', // Para COMPANY
  ADMIN_DASHBOARD: '/admin/dashboard', // Para ADMIN
  ADMIN_COMPANIES: '/admin/companies', // HU-24: Gestión de empresas
  ADMIN_COACHES: '/admin/coaches',     // HU-25: Gestión de coaches
  ADMIN_PROVIDERS: '/admin/providers', // HU-25: Vista unificada proveedores
  
  // Reservas (protegidas)
  RESERVATIONS: '/reservations',
  RESERVATION_DETAIL: (id: string) => `/reservations/${id}`,
  QUOTE_CHECKOUT: (trackId: string, coachId?: string) => 
    coachId ? `/quote/checkout/${trackId}?coach=${coachId}` : `/quote/checkout/${trackId}`,
  
  // Company (protegidas - solo companies)
  COMPANY_TRACKS: '/company/tracks',
  CREATE_TRACK: '/company/tracks/create',
  EDIT_TRACK: (id: string) => `/company/tracks/${id}/edit`,
  TRACK_AVAILABILITY: (id: string) => `/company/tracks/${id}/availability`,
} as const;


