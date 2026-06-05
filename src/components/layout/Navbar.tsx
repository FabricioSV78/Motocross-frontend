import { useState, type ComponentProps, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/useAuth';
import { LogoutButton } from '@/features/auth/components/LogoutButton';
import { ROUTES } from '@/router/routes';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { clsx } from 'clsx';
import { FlowbiteIcon, type FlowbiteIconName } from '@/components/ui/FlowbiteIcon';
import { NavbarTour } from './NavbarTour';

const PILOT_LINKS = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: 'home' },
  { to: ROUTES.MAP, label: 'Map', icon: 'map-pin' },
  { to: ROUTES.RESERVATIONS, label: 'Reservations', icon: 'ticket' },
  { to: ROUTES.PROFILE, label: 'Profile', icon: 'user' },
] as const;

const COACH_LINKS = [
  { to: ROUTES.COACH_DASHBOARD, label: 'Dashboard', icon: 'home' },
  { to: ROUTES.COACH_AVAILABILITY, label: 'Availability', icon: 'calendar-plus' },
  { to: ROUTES.COACH_RESERVATIONS, label: 'Lessons', icon: 'users' },
  { to: ROUTES.MAP, label: 'Map', icon: 'map-pin' },
  { to: ROUTES.COACH_SETTINGS, label: 'Settings', icon: 'cog' },
  { to: ROUTES.PROFILE, label: 'Profile', icon: 'user' },
] as const;

const COMPANY_LINKS = [
  { to: ROUTES.COMPANY_DASHBOARD, label: 'Dashboard', icon: 'home' },
  { to: ROUTES.COMPANY_TRACKS, label: 'Tracks', icon: 'flag' },
  { to: ROUTES.CREATE_TRACK, label: 'Create track', icon: 'plus' },
  { to: ROUTES.MAP, label: 'Map', icon: 'map-pin' },
  { to: ROUTES.PROFILE, label: 'Profile', icon: 'building' },
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
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/82 shadow-sm backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-950/82 dark:shadow-none">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to={homeRoute}
            data-tour="nav-logo"
            className="group inline-flex items-center gap-3 text-xl font-black tracking-tight text-slate-950 transition-opacity hover:opacity-85 dark:text-white"
            onClick={closeMobile}
          >
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-sm font-black text-white shadow-lg shadow-orange-500/25">
              MX
            </span>
            <span>
              Moto<span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Cross</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {user.role === 'PILOT' &&
              PILOT_LINKS.map(({ to, label, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  active={isActive(location.pathname, to)}
                  data-tour={`nav-${label.toLowerCase().replace(' ', '-')}`}
                >
                  <FlowbiteIcon name={icon} className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}

            {user.role === 'COACH' &&
              COACH_LINKS.map(({ to, label, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  active={isActive(location.pathname, to)}
                  data-tour={`nav-${label.toLowerCase().replace(' ', '-')}`}
                >
                  <FlowbiteIcon name={icon} className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}

            {user.role === 'COMPANY' &&
              COMPANY_LINKS.map(({ to, label, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  active={isActive(location.pathname, to)}
                  data-tour={`nav-${label.toLowerCase().replace(' ', '-')}`}
                >
                  <FlowbiteIcon name={icon} className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}

            {user.role === 'ADMIN' && (
              <>
                <NavLink
                  to={ROUTES.ADMIN_COMPANIES}
                  active={location.pathname === ROUTES.ADMIN_COMPANIES}
                >
                  <FlowbiteIcon name="building" className="h-4 w-4" />
                  Companies
                </NavLink>
                <NavLink
                  to={ROUTES.ADMIN_COACHES}
                  active={location.pathname === ROUTES.ADMIN_COACHES}
                >
                  <FlowbiteIcon name="users" className="h-4 w-4" />
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

            <div data-tour="nav-theme-toggle" className="hidden sm:inline-flex">
              <ThemeToggle compact />
            </div>

            <div data-tour="nav-logout">
              <LogoutButton variant="outline" />
            </div>

            {mobileRole && (
              <button
                type="button"
                data-tour="nav-mobile-menu-btn"
                className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 md:hidden dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-expanded={mobileOpen}
                aria-label="Open menu"
                onClick={() => setMobileOpen((o) => !o)}
              >
                <FlowbiteIcon name={mobileOpen ? 'close' : 'bars'} className="h-6 w-6" />
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

        <NavbarTour mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
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
  links: readonly { to: string; label: string; icon: FlowbiteIconName }[];
  pathname: string;
  onClose: () => void;
  cta: { to: string; label: string };
}) {
  return (
    <div className="space-y-1 border-t border-slate-200 py-3 dark:border-slate-800 md:hidden">
      <div className="px-3 pb-2" data-tour="nav-mobile-theme-toggle">
        <ThemeToggle className="w-full justify-center" />
      </div>
      {links.map(({ to, label, icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onClose}
          data-tour={`nav-mobile-${label.toLowerCase().replace(' ', '-')}`}
          className={clsx(
            'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors',
            isActive(pathname, to)
              ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
          )}
        >
          <FlowbiteIcon name={icon} className="h-4 w-4" />
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
  ...props
}: {
  to: string;
  children: ReactNode;
  active?: boolean;
} & Omit<ComponentProps<typeof Link>, 'to' | 'className' | 'children'>) {
  return (
    <Link
      to={to}
      {...props}
      className={clsx(
        'inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-colors',
        active
          ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white'
      )}
    >
      {children}
    </Link>
  );
}
