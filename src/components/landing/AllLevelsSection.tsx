import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../router/routes';

export const AllLevelsSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gradient-to-b from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main motocross image section */}
        <div className="mb-24 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-600/10 border border-orange-500/20">
            <span className="text-orange-400 text-sm font-bold">🏁 THE THRILL AWAITS</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
            Experience the{' '}
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Ultimate Ride
            </span>
          </h2>

          {/* Large motocross representation */}
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/30">
              <img 
                src="/images/motocross.jpg" 
                alt="Professional motocross rider performing an aerial jump"
                className="w-full aspect-[16/9] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                <h3 className="text-3xl sm:text-4xl font-black text-white drop-shadow-2xl">
                  Push Your Limits
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* All levels welcome section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Image/Visual */}
          <div className="order-2 lg:order-1">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl border border-gray-700">
              <div className="aspect-[4/3] flex flex-col items-center justify-center p-8 text-center">
                {/* Beginner rider representation */}
                <div className="text-8xl mb-6">🏍️💨</div>
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-600/20 border border-green-500/30">
                    <span className="text-green-400 text-sm font-bold">ALL LEVELS WELCOME</span>
                  </div>
                  <p className="text-gray-400 text-sm max-w-xs mx-auto">
                    We welcome riders of all skill levels — from first-timers to pros
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div className="order-1 lg:order-2 space-y-6">
            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                Start Your Journey{' '}
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  No Matter Your Level
                </span>
              </h2>
              
              <p className="text-xl text-gray-400 leading-relaxed">
                You don't need to be a pro to experience the thrill of motocross.
                Our platform connects you with tracks suitable for every skill level.
              </p>
            </div>

            {/* Level badges */}
            <div className="space-y-3">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-green-500/50 transition-all">
                <div className="text-3xl">🌱</div>
                <div>
                  <h3 className="text-white font-bold mb-1">Beginner</h3>
                  <p className="text-gray-400 text-sm">
                    Safe tracks with coaching available. Perfect for learning from scratch.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-orange-500/50 transition-all">
                <div className="text-3xl">🔥</div>
                <div>
                  <h3 className="text-white font-bold mb-1">Intermediate</h3>
                  <p className="text-gray-400 text-sm">
                    Challenging terrain to sharpen your skills and push your personal limits.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-red-500/50 transition-all">
                <div className="text-3xl">⚡</div>
                <div>
                  <h3 className="text-white font-bold mb-1">Advanced</h3>
                  <p className="text-gray-400 text-sm">
                    Pro-level tracks for experienced riders seeking the ultimate challenge.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-4">
              <button
                onClick={() => navigate(ROUTES.REGISTER)}
                className="group px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold text-lg rounded-lg hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105"
              >
                <span className="flex items-center justify-center gap-2">
                  Start Your Journey Today
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
