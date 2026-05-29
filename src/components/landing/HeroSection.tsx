import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../router/routes';

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Capa de textura tipo tierra/dirt */}
      <div className="absolute inset-0 opacity-20"
        style={{ backgroundImage: "repeating-linear-gradient(45deg,#78350f 0,#78350f 1px,transparent 0,transparent 50%)", backgroundSize: "12px 12px" }}
      />

      {/* Radial glow naranja central */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(234,88,12,0.25)_0%,transparent_70%)]" />

      {/* Líneas de velocidad (efecto dirt track) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-40 top-1/3 w-[200%] h-1 bg-gradient-to-r from-transparent via-orange-500/30 to-transparent rotate-6" />
        <div className="absolute -left-40 top-2/3 w-[200%] h-px bg-gradient-to-r from-transparent via-orange-600/20 to-transparent -rotate-3" />
        <div className="absolute -left-40 top-1/2 w-[200%] h-px bg-gradient-to-r from-transparent via-red-500/15 to-transparent rotate-2" />
      </div>

      {/* Blur spots */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-orange-600/30 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-red-600/20 rounded-full blur-3xl" />
      <div className="absolute top-0 right-1/3 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl" />

      {/* Navbar de landing (solo para no-autenticados) */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center px-6 py-4 sm:px-10">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-white">Motocross<span className="text-orange-500"> App</span></span>
        </div>
        <button
          onClick={() => navigate(ROUTES.LOGIN)}
          className="px-5 py-2 border border-orange-500 text-orange-400 font-bold rounded-lg hover:bg-orange-500 hover:text-white transition-all duration-200 text-sm"
        >
          Log In
        </button>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-600/20 border border-orange-500/40 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-orange-400 text-sm font-bold tracking-widest uppercase">
              🏆 The #1 Motocross Platform
            </span>
          </div>

          {/* Título principal */}
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-white leading-none tracking-tight">
            FEEL THE{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(234,88,12,0.8)]">
                RUSH
              </span>
              {/* Animated underline */}
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-full" />
            </span>
            <br />
            <span className="text-4xl sm:text-5xl lg:text-6xl text-gray-200">Discover, Book & Conquer</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Find the best motocross tracks, train with certified coaches,
            and join the fastest-growing rider community.
          </p>

          {/* Main CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
            {/* CTA principal - unirse */}
            <button
              onClick={() => navigate(ROUTES.REGISTER)}
              className="group relative px-10 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-black text-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/60 hover:scale-105"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                🏍️ Join Now — It's Free
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>

            {/* Iniciar sesión */}
            <button
              onClick={() => navigate(ROUTES.LOGIN)}
              className="px-10 py-4 bg-white/5 border-2 border-white/20 text-white font-bold text-lg rounded-xl backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-orange-400 hover:text-orange-300 hover:scale-105"
            >
              Log In
            </button>

            {/* Browse tracks */}
            <button
              onClick={() => navigate(ROUTES.TRACKS)}
              className="px-10 py-4 bg-transparent border border-gray-700 text-gray-400 font-semibold text-lg rounded-xl transition-all duration-300 hover:bg-gray-800/60 hover:border-gray-500 hover:text-gray-200 hover:scale-105"
            >
              🗺️ Browse Tracks
            </button>
          </div>

          {/* Mini links de acceso rápido */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 pt-2">
            <button onClick={() => navigate(ROUTES.REGISTER)} className="hover:text-orange-400 transition-colors">
              🏢 Register your track
            </button>
            <span>·</span>
            <button onClick={() => navigate(ROUTES.REGISTER)} className="hover:text-orange-400 transition-colors">
              🎓 Become a Coach
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600 animate-bounce">
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
};
