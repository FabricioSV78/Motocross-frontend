/**
 * Constantes de configuración de la aplicación
 */

export const APP_CONFIG = {
  name: 'MotoCross App',
  version: '1.0.0',
  description: 'Plataforma de reservas de pistas de motocross',
  
  // Configuración de autenticación
  auth: {
    tokenKey: 'auth_token',
    userKey: 'auth_user',
    sessionDuration: 1000 * 60 * 60 * 24 * 7, // 7 días
  },
  
  // Configuración de paginación
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50],
  },
  
  // Configuración de mapas
  map: {
    defaultCenter: { lat: 40.4168, lng: -3.7038 }, // Madrid
    defaultZoom: 12,
  },
  
  // Formatos de fecha
  dateFormat: {
    short: 'dd/MM/yyyy',
    long: 'dd/MM/yyyy HH:mm',
    time: 'HH:mm',
  },
  
  // Límites de reservas
  reservations: {
    maxAdvanceDays: 30, // días máximos de antelación
    minDuration: 60, // minutos
    maxDuration: 480, // minutos (8 horas)
  },
} as const;


