import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/useAuth';
import { LogoutButton } from '@/features/auth/components/LogoutButton';
import { ROUTES } from '@/router/routes';
import { clsx } from 'clsx';

const PILOT_LINKS = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard' },
  { to: ROUTES.MAP, label: 'Map' },
  { to: ROUTES.RESERVATIONS, label: 'Reservations' },
  { to: ROUTES.PROFILE, label: 'Profile' },
] as const;

const COACH_LINKS = [
  { to: ROUTES.COACH_DASHBOARD, label: 'Dashboard' },
  { to: ROUTES.COACH_AVAILABILITY, label: 'Availability' },
  { to: ROUTES.COACH_RESERVATIONS, label: 'Lessons' },
  { to: ROUTES.COACH_SETTINGS, label: 'Settings' },
  { to: ROUTES.PROFILE, label: 'Profile' },
] as const;

const COMPANY_LINKS = [
  { to: ROUTES.COMPANY_DASHBOARD, label: 'Dashboard' },
  { to: ROUTES.COMPANY_TRACKS, label: 'Tracks' },
  { to: ROUTES.CREATE_TRACK, label: 'Create track' },
  { to: ROUTES.MAP, label: 'Map' },
  { to: ROUTES.PROFILE, label: 'Profile' },
] as const;

function isActive(pathname: string, to: string) {
  if (
    to === ROUTES.COACH_DASHBOARD ||
    to === ROUTES.DASHBOARD ||
    to === ROUTES.COMPANY_DASHBOARD
  ) {
    return pathname === to;
  }
  return pathname === to || pathname.startsWith(to + '/');
}

export function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isAuthenticated || !user) {
    return null;
  }

  const closeMobile = () => setMobileOpen(false);

  const homeRoute =
    user.role === 'PILOT'
      ? ROUTES.DASHBOARD
      : user.role === 'COACH'
        ? ROUTES.COACH_DASHBOARD
        : user.role === 'COMPANY'
          ? ROUTES.COMPANY_DASHBOARD
          : ROUTES.HOME;

  const mobileRole =
    user.role === 'PILOT' || user.role === 'COACH' || user.role === 'COMPANY';

  return (
    <nav className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to={homeRoute}
            className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            onClick={closeMobile}
          >
            MotoCross
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {user.role === 'PILOT' &&
              PILOT_LINKS.map(({ to, label }) => (
                <NavLink key={to} to={to} active={isActive(location.pathname, to)}>
                  {label}
                </NavLink>
              ))}

            {user.role === 'COACH' &&
              COACH_LINKS.map(({ to, label }) => (
                <NavLink key={to} to={to} active={isActive(location.pathname, to)}>
                  {label}
                </NavLink>
              ))}

            {user.role === 'COMPANY' &&
              COMPANY_LINKS.map(({ to, label }) => (
                <NavLink key={to} to={to} active={isActive(location.pathname, to)}>
                  {label}
                </NavLink>
              ))}

            {user.role === 'ADMIN' && (
              <>
                <NavLink
                  to={ROUTES.ADMIN_COMPANIES}
                  active={location.pathname === ROUTES.ADMIN_COMPANIES}
                >
                  Companies
                </NavLink>
                <NavLink
                  to={ROUTES.ADMIN_COACHES}
                  active={location.pathname === ROUTES.ADMIN_COACHES}
                >
                  Coaches
                </NavLink>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {user.role === 'PILOT' && (
              <Link
                to={ROUTES.MAP}
                className="hidden sm:inline-flex md:hidden items-center px-3 py-1.5 text-sm font-semibold rounded-lg bg-orange-500 text-white hover:bg-orange-400 transition-colors"
              >
                Book track
              </Link>
            )}
            {user.role === 'COACH' && (
              <Link
                to={ROUTES.COACH_AVAILABILITY}
                className="hidden sm:inline-flex md:hidden items-center px-3 py-1.5 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
              >
                Add slots
              </Link>
            )}
            {user.role === 'COMPANY' && (
              <Link
                to={ROUTES.CREATE_TRACK}
                className="hidden sm:inline-flex md:hidden items-center px-3 py-1.5 text-sm font-semibold rounded-lg bg-orange-500 text-white hover:bg-orange-400 transition-colors"
              >
                New track
              </Link>
            )}

            <LogoutButton variant="outline" />

            {mobileRole && (
              <button
                type="button"
                className="md:hidden p-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
                aria-expanded={mobileOpen}
                aria-label="Open menu"
                onClick={() => setMobileOpen((o) => !o)}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>

        {user.role === 'PILOT' && mobileOpen && (
          <MobileMenu
            links={PILOT_LINKS}
            pathname={location.pathname}
            onClose={closeMobile}
            cta={{ to: ROUTES.MAP, label: 'Find a track' }}
          />
        )}

        {user.role === 'COACH' && mobileOpen && (
          <MobileMenu
            links={COACH_LINKS}
            pathname={location.pathname}
            onClose={closeMobile}
            cta={{ to: ROUTES.COACH_AVAILABILITY, label: 'Add availability' }}
          />
        )}

        {user.role === 'COMPANY' && mobileOpen && (
          <MobileMenu
            links={COMPANY_LINKS}
            pathname={location.pathname}
            onClose={closeMobile}
            cta={{ to: ROUTES.CREATE_TRACK, label: 'Create track' }}
          />
        )}
      </div>
    </nav>
  );
}

function MobileMenu({
  links,
  pathname,
  onClose,
  cta,
}: {
  links: readonly { to: string; label: string }[];
  pathname: string;
  onClose: () => void;
  cta: { to: string; label: string };
}) {
  return (
    <div className="md:hidden border-t border-gray-800 py-3 space-y-1">
      {links.map(({ to, label }) => (
        <Link
          key={to}
          to={to}
          onClick={onClose}
          className={clsx(
            'block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            isActive(pathname, to)
              ? 'bg-orange-500/15 text-orange-400'
              : 'text-gray-300 hover:bg-gray-800'
          )}
        >
          {label}
        </Link>
      ))}
      <Link
        to={cta.to}
        onClick={onClose}
        className="block mx-3 mt-2 text-center py-2.5 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-400"
      >
        {cta.label}
      </Link>
    </div>
  );
}

function NavLink({
  to,
  children,
  active,
}: {
  to: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      to={to}
      className={clsx(
        'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
        active
          ? 'bg-orange-500/15 text-orange-400'
          : 'text-gray-300 hover:text-white hover:bg-gray-800/80'
      )}
    >
      {children}
    </Link>
  );
}
