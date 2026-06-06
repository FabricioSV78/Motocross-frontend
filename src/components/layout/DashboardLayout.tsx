import { Outlet, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { ROUTES } from '@/router/routes';
import { Navbar } from './Navbar';

/**
 * Layout para páginas autenticadas
 * Incluye Navbar con logout y renderiza el contenido de las rutas hijas
 */
export function DashboardLayout() {
  const location = useLocation();
  const isFullScreenPage =
    location.pathname === ROUTES.MAP ||
    location.pathname === ROUTES.COACH_AVAILABILITY ||
    /^\/company\/tracks\/[^/]+\/availability$/.test(location.pathname);

  return (
    <div
      className={clsx(
        'flex flex-col overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_30%),radial-gradient(circle_at_90%_12%,rgba(14,165,233,0.12),transparent_24%),linear-gradient(180deg,#fff7ed_0%,#f8fafc_30%,#eef2f7_100%)] text-slate-950 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.18),transparent_30%),radial-gradient(circle_at_90%_12%,rgba(16,185,129,0.11),transparent_24%),linear-gradient(180deg,#0f172a_0%,#111827_45%,#020617_100%)] dark:text-slate-100',
        isFullScreenPage ? 'h-svh overflow-hidden' : 'min-h-screen',
      )}
    >
      <Navbar />
      <main
        className={clsx(
          'w-full',
          isFullScreenPage
            ? 'min-h-0 flex-1 overflow-hidden'
            : 'mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8',
        )}
      >
        <Outlet />
      </main>
    </div>
  );
}
