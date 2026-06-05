import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { ROUTES } from '@/router/routes';

const riderSteps = [
  {
    title: 'Find a track',
    text: 'Compare motocross tracks by location, difficulty, capacity, and available dates.',
  },
  {
    title: 'Add a coach',
    text: 'Choose a certified coach only when their lesson time fits the track availability.',
  },
  {
    title: 'Book with clarity',
    text: 'See the session time, price, participants, and status before the ride happens.',
  },
];

const audiences = [
  {
    label: 'Riders',
    title: 'I want to ride',
    text: 'Find open track time, compare options, add a coach if you want one, and keep your bookings organized.',
    action: 'Find tracks',
    route: ROUTES.REGISTER,
  },
  {
    label: 'Coaches',
    title: 'I want to teach',
    text: 'Publish lessons around real track availability, manage upcoming sessions, and see your earnings clearly.',
    action: 'Coach signup',
    route: ROUTES.REGISTER_COACH,
  },
  {
    label: 'Track owners',
    title: 'I want to list my track',
    text: 'Open riding windows, manage capacity, and see every reservation by rider, coach, status, and total.',
    action: 'List a track',
    route: ROUTES.REGISTER_COMPANY,
  },
];

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.14),transparent_32%),linear-gradient(180deg,#fff7ed_0%,#f8fafc_34%,#eef2f7_100%)] text-slate-950 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_32%),linear-gradient(180deg,#020617_0%,#111827_42%,#020617_100%)] dark:text-neutral-100">
      <Hero onNavigate={navigate} />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-orange-600 dark:text-orange-300">
            How it works
          </p>
          <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            From "where can I ride?" to "booking confirmed."
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-neutral-400">
            Motocross App connects riders, coaches, and track owners around one simple truth:
            a session only works when the track, the coach, and the rider are available at the same time.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {riderSteps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-2xl border border-slate-200/80 bg-white/88 p-6 shadow-xl shadow-slate-200/60 backdrop-blur dark:border-white/10 dark:bg-neutral-950/85 dark:shadow-black/35"
            >
              <span className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-orange-600 text-sm font-black text-white shadow-[0_0_28px_rgba(234,88,12,0.28)]">
                {index + 1}
              </span>
              <h3 className="text-xl font-bold text-slate-950 dark:text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-neutral-400">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white/70 text-slate-950 backdrop-blur dark:border-white/10 dark:bg-neutral-950/70 dark:text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-orange-600 dark:text-orange-300">
              Choose your lane
            </p>
            <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
              One platform, three ways into the track.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600 dark:text-neutral-400">
              Whether you ride, coach, or operate a track, Motocross App gives you a direct path
              to the part of the sport you care about.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {audiences.map((item) => (
              <article
                key={item.label}
                className="group flex min-h-[300px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 text-slate-950 shadow-xl shadow-slate-200/60 transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-orange-100 dark:border-white/10 dark:bg-black/80 dark:text-white dark:shadow-black/35 dark:hover:border-orange-500/80"
              >
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600 dark:text-orange-400">
                    {item.label}
                  </p>
                  <h3 className="mt-4 text-3xl font-black tracking-tight">{item.title}</h3>
                  <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-neutral-400">{item.text}</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(item.route)}
                  className="mt-8 w-fit rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition-colors group-hover:border-orange-400 group-hover:text-orange-600 dark:border-white/15 dark:text-white dark:group-hover:text-orange-300"
                >
                  {item.action}
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-orange-600 dark:text-orange-300">
              Why it feels different
            </p>
            <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              Availability is visible before anyone commits.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600 dark:text-neutral-400">
              The platform treats track availability as the source of truth. Coaches publish lessons
              inside those windows, riders book compatible sessions, and companies see the resulting
              reservations immediately.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/88 p-5 shadow-xl shadow-slate-200/60 backdrop-blur dark:border-white/10 dark:bg-neutral-950/85 dark:shadow-black/35">
            <div className="space-y-3">
              <TimelineItem title="Track opens availability" text="Capacity, date, time, and rider category are set." />
              <TimelineItem title="Coach adds matching lessons" text="Single-day and repeating schedules preview real track windows." />
              <TimelineItem title="Rider books a session" text="Track, coach, price, and status stay connected for everyone." />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70 dark:border-white/10 dark:bg-neutral-950 dark:shadow-black/45">
          <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
            <img
              src="/images/motocross.jpg"
              alt="Motocross rider on a dirt track"
              className="h-72 w-full object-cover lg:h-full"
            />
            <div className="p-7 sm:p-10">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-orange-600 dark:text-orange-300">
                Bring the ride online
              </p>
              <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                Less back-and-forth. More time on the dirt.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-neutral-400">
                The best sessions are the ones where nobody has to ask "is the track open?",
                "is the coach free?", or "who is coming?". The app makes those answers visible.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.REGISTER)}
                  className="rounded-lg bg-orange-600 px-6 py-3 text-sm font-black text-white transition-colors hover:bg-orange-500"
                >
                  Join the platform
                </button>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.LOGIN)}
                  className="rounded-lg border border-slate-200 px-6 py-3 text-sm font-black text-slate-700 transition-colors hover:border-orange-400 hover:text-orange-600 dark:border-white/15 dark:text-white dark:hover:text-orange-300"
                >
                  I already have an account
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-black/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 dark:text-neutral-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="font-bold text-slate-950 dark:text-white">Motocross App</p>
          <p>Discover tracks, train with coaches, and manage bookings in one place.</p>
        </div>
      </footer>
    </main>
  );
};

function Hero({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <section className="theme-fixed-dark relative min-h-[86svh] overflow-hidden">
      <img
        src="/images/motocross.jpg"
        alt="Motocross rider jumping on a dirt track"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/45" />
      <div className="absolute inset-x-0 top-0 z-20">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => onNavigate(ROUTES.HOME)}
            className="text-lg font-black tracking-tight text-white"
          >
            Motocross<span className="text-orange-400">App</span>
          </button>
          <div className="flex items-center gap-2">
            <ThemeToggle compact className="border-white/20 bg-black/30 text-white hover:border-orange-400 hover:text-orange-300 dark:border-white/20 dark:bg-black/30 dark:text-white" />
            <button
              type="button"
              onClick={() => onNavigate(ROUTES.LOGIN)}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm font-bold text-white transition-colors hover:border-orange-400 hover:text-orange-300"
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => onNavigate(ROUTES.REGISTER)}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-orange-500"
            >
              Sign up
            </button>
          </div>
        </nav>
      </div>

      <div className="relative z-10 flex min-h-[86svh] items-end">
        <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-28 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.28em] text-orange-300">
              Track booking, coaching, and scheduling
            </p>
            <h1 className="max-w-4xl text-4xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Your next motocross session, actually organized.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-neutral-300 sm:text-xl">
              Discover tracks, reserve real availability, train with certified coaches, and keep
              riders, coaches, and track owners aligned from one clean platform.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => onNavigate(ROUTES.REGISTER)}
                className="rounded-lg bg-orange-600 px-6 py-3 text-sm font-black text-white transition-colors hover:bg-orange-500"
              >
                Book your first ride
              </button>
              <button
                type="button"
                onClick={() => onNavigate(ROUTES.REGISTER_COMPANY)}
                className="rounded-lg border border-white/25 bg-black/30 px-6 py-3 text-sm font-black text-white transition-colors hover:border-orange-400 hover:text-orange-300"
              >
                List a track
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineItem({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-neutral-950/70">
      <h3 className="font-bold text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-neutral-400">{text}</p>
    </div>
  );
}
