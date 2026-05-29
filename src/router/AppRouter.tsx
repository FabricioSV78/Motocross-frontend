import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { ROUTES } from './routes';

// Layouts
import { DashboardLayout } from '@/components/layout';

// Public pages
import { LandingPage } from '@/pages/Landing/LandingPage';

// Auth pages
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { RegisterCompanyPage } from '@/features/auth/pages/RegisterCompanyPage';
import { RegisterCoachPage } from '@/features/auth/pages/RegisterCoachPage';

// Coach pages
import { UploadCertificatePage } from '@/pages/Coach/UploadCertificatePage';
import { CoachDashboardPage } from '@/pages/Coach/CoachDashboardPage';
import { CoachSettingsPage } from '@/pages/Coach/CoachSettingsPage';
import { CoachAvailabilityPage } from '@/pages/Coach/CoachAvailabilityPage';
import { CoachReservationsPage } from '@/pages/Coach/CoachReservationsPage';

// Dashboard pages (por rol)
import { PilotDashboardPage } from '@/pages/Pilot/PilotDashboardPage';
import { CompanyDashboardPage } from '@/pages/Company/CompanyDashboardPage';
import { MyReservationsPage } from '@/pages/Pilot/MyReservationsPage';

// User pages
import { ProfilePage } from '@/pages/Profile/ProfilePage';
import { EditProfilePage } from '@/pages/Profile/EditProfilePage';
import { AdminCompaniesPage } from '@/pages/Admin/AdminCompaniesPage';
import { AdminCoachesPage } from '@/pages/Admin/AdminCoachesPage';
import { AdminProvidersPage } from '@/pages/Admin/AdminProvidersPage';
import { CreateTrackPage } from '@/pages/Company/CreateTrackPage';
import { CompanyTracksPage } from '@/pages/Company/CompanyTracksPage';
import { EditTrackPage } from '@/pages/Company/EditTrackPage';
import { TrackAvailabilityPage } from '@/pages/Company/TrackAvailabilityPage';
import { CompanyReservationsPage } from '@/pages/Company/CompanyReservationsPage';
import { MapPage } from '@/pages/Map/MapPage';
import { TrackDetailPage } from '@/pages/Pilot/TrackDetailPage';
import { QuoteCheckoutPage } from '@/pages/Pilot/QuoteCheckoutPage';
import { ReservationDetailPage } from '@/pages/Pilot/ReservationDetailPage';

/**
 * Configuración principal del router de la aplicación
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path={ROUTES.HOME} element={<LandingPage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.REGISTER_COMPANY} element={<RegisterCompanyPage />} />
        <Route path={ROUTES.REGISTER_COACH} element={<RegisterCoachPage />} />
        <Route path={ROUTES.UPLOAD_CERTIFICATE} element={<UploadCertificatePage />} />
        <Route path={ROUTES.TRACKS} element={<div style={{ color: 'black', padding: '20px', background: 'white' }}>Tracks List - TODO</div>} />
        
        {/* Rutas protegidas con DashboardLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            {/* HU-11: Mapa de pistas (cualquier usuario autenticado) */}
            <Route path={ROUTES.MAP} element={<MapPage />} />
            
            {/* HU-17: Detalle de pista (cualquier usuario autenticado) */}
            <Route path="/tracks/:trackId" element={<TrackDetailPage />} />
            
            {/* HU-18-21: Cotización y Checkout */}
            <Route path="/quote/checkout/:trackId" element={<QuoteCheckoutPage />} />

            {/* Rutas para PILOT */}
            <Route path={ROUTES.DASHBOARD} element={<PilotDashboardPage />} />
            
            {/* Perfil de usuario */}
            <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
            <Route path={ROUTES.EDIT_PROFILE} element={<EditProfilePage />} />
            
            {/* Reservas */}
            <Route path={ROUTES.RESERVATIONS} element={<MyReservationsPage />} />
            <Route path="/reservations/:id" element={<ReservationDetailPage />} />
          </Route>
        </Route>
        
        {/* Rutas protegidas - Solo para coaches aprobados */}
        <Route element={<ProtectedRoute allowedRoles={['COACH']} />}>
          <Route element={<DashboardLayout />}>
            <Route path={ROUTES.COACH_DASHBOARD} element={<CoachDashboardPage />} />
            <Route path={ROUTES.COACH_SETTINGS} element={<CoachSettingsPage />} />
            <Route path={ROUTES.COACH_AVAILABILITY} element={<CoachAvailabilityPage />} />
            <Route path={ROUTES.COACH_RESERVATIONS} element={<CoachReservationsPage />} />
          </Route>
        </Route>

        {/* Rutas protegidas - Solo para empresas */}
        <Route element={<ProtectedRoute allowedRoles={['COMPANY', 'ADMIN']} />}>
          <Route element={<DashboardLayout />}>
            <Route path={ROUTES.COMPANY_DASHBOARD} element={<CompanyDashboardPage />} />
            <Route path={ROUTES.COMPANY_TRACKS} element={<CompanyTracksPage />} />
            <Route path={ROUTES.CREATE_TRACK} element={<CreateTrackPage />} />
            <Route path="/company/tracks/:id/edit" element={<EditTrackPage />} />
            <Route path="/company/tracks/:id/availability" element={<TrackAvailabilityPage />} />
            <Route path="/company/tracks/:trackId/reservations" element={<CompanyReservationsPage />} />
          </Route>
        </Route>
        
        {/* Rutas protegidas - Solo para admin */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route element={<DashboardLayout />}>
            <Route path={ROUTES.ADMIN_DASHBOARD} element={<div className="text-white"><h1 className="text-3xl font-bold">Admin Dashboard</h1></div>} />
            <Route path={ROUTES.ADMIN_COMPANIES} element={<AdminCompaniesPage />} />
            <Route path={ROUTES.ADMIN_COACHES} element={<AdminCoachesPage />} />
            <Route path={ROUTES.ADMIN_PROVIDERS} element={<AdminProvidersPage />} />
          </Route>
        </Route>
        
        {/* Ruta 404 */}
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
