import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../router/routes';

export const ForCompanies = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: '📈',
      title: 'Increase Visibility',
      description: 'Reach thousands of riders looking for their next motocross adventure.',
    },
    {
      icon: '💰',
      title: 'Boost Revenue',
      description: 'Fill empty slots and maximize your track\'s potential with online bookings.',
    },
    {
      icon: '📱',
      title: 'Easy Management',
      description: 'Manage bookings, schedules, and customer communication from one dashboard.',
    },
    {
      icon: '⭐',
      title: 'Build Reputation',
      description: 'Collect reviews and showcase your track to the largest rider community.',
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-800 via-gray-900 to-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-600/10 border border-orange-500/20">
                <span className="text-orange-400 text-sm font-bold">🏢 FOR TRACK OWNERS</span>
              </div>
              
              <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                Grow Your{' '}
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  Motocross Business
                </span>
              </h2>
              
              <p className="text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto">
                Join the leading motocross platform and connect with riders ready to book.
                It's free to list your track.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="group p-4 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-orange-500/50 transition-all duration-300 hover:transform hover:scale-105 text-left"
                >
                  <div className="text-3xl mb-2">{benefit.icon}</div>
                  <h3 className="text-white font-bold mb-1">{benefit.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate(ROUTES.REGISTER)}
                className="group px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold text-lg rounded-lg hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105"
              >
                <span className="flex items-center justify-center gap-2">
                  List Your Track
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
