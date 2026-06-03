import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

/**
 * Layout para páginas autenticadas
 * Incluye Navbar con logout y renderiza el contenido de las rutas hijas
 */
export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.12),transparent_34%),linear-gradient(180deg,#fff7ed_0%,#f8fafc_32%,#eef2f7_100%)] text-slate-950 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_32%),linear-gradient(180deg,#0f172a_0%,#111827_45%,#020617_100%)] dark:text-slate-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
