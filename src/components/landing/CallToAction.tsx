import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../router/routes';

export const CallToAction = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-orange-500/20 blur-3xl animate-gradient" />
        </div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl p-12 md:p-16 border border-gray-700/50 shadow-2xl">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-600/20 border border-orange-500/30">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-orange-400 text-sm font-bold">🏁 READY TO RIDE?</span>
            </div>

            {/* Heading */}
            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight">
                Start Your{' '}
                <span className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent">
                  Motocross Adventure
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Join thousands of riders who trust our platform to find and book the best tracks.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <button
                onClick={() => navigate(ROUTES.REGISTER)}
                className="group relative px-10 py-5 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold text-xl rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-105 w-full sm:w-auto"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  🏍️ Join as Rider
                  <svg className="w-6 h-6 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>

              <button
                onClick={() => navigate(ROUTES.REGISTER)}
                className="group relative px-10 py-5 bg-gradient-to-r from-orange-800/50 to-red-800/50 border border-orange-600/50 text-orange-300 font-bold text-xl rounded-xl transition-all duration-300 hover:from-orange-700/70 hover:to-red-700/70 hover:shadow-xl hover:shadow-orange-500/30 hover:scale-105 hover:text-white w-full sm:w-auto"
              >
                🎓 Become a Coach
              </button>

              <button
                onClick={() => navigate(ROUTES.TRACKS)}
                className="px-10 py-5 bg-transparent border-2 border-gray-600 text-gray-300 font-bold text-xl rounded-xl hover:bg-gray-800 hover:border-orange-500 hover:text-orange-400 transition-all duration-300 hover:scale-105 w-full sm:w-auto"
              >
                Browse Tracks
              </button>
            </div>

            {/* Features list */}
            <div className="flex flex-wrap justify-center gap-6 pt-8 text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Free to join</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Instant booking</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
    </section>
  );
};
