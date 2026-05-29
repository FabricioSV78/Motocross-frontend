import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../router/routes';

export const ForCoaches = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: '🎯',
      title: 'Reach More Students',
      description: 'Connect with riders of all levels actively looking for professional coaching.',
    },
    {
      icon: '📅',
      title: 'Manage Your Classes',
      description: 'Set your own schedule, pricing, and availability from a simple dashboard.',
    },
    {
      icon: '🏆',
      title: 'Build Your Brand',
      description: 'Showcase your credentials, experience, and student reviews to grow your reputation.',
    },
    {
      icon: '💳',
      title: 'Secure Payments',
      description: 'Get paid instantly and securely. No chasing invoices — focus on coaching.',
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-black via-gray-900 to-gray-800 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — text content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-600/10 border border-orange-500/20">
              <span className="text-orange-400 text-sm font-bold">🎓 FOR COACHES</span>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                Share Your Passion.{' '}
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  Teach Motocross.
                </span>
              </h2>
              <p className="text-xl text-gray-400 leading-relaxed">
                Are you an experienced rider? Become a certified coach and help
                the next generation of motocross athletes reach their potential.
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {[
                { step: '1', text: 'Create your coach account' },
                { step: '2', text: 'Upload your certificate' },
                { step: '3', text: 'Get approved by admin' },
                { step: '4', text: 'Start offering classes' },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center font-black text-white text-sm flex-shrink-0">
                    {step}
                  </div>
                  <span className="text-gray-300 font-medium">{text}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate(ROUTES.REGISTER)}
                className="group px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold text-lg rounded-lg hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105"
              >
                <span className="flex items-center justify-center gap-2">
                  🎓 Become a Coach
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
              <button
                onClick={() => navigate(ROUTES.LOGIN)}
                className="px-8 py-4 bg-transparent border-2 border-gray-600 text-gray-300 font-semibold text-lg rounded-lg hover:bg-gray-800 hover:border-gray-500 transition-all duration-300"
              >
                Already a coach? Log in
              </button>
            </div>
          </div>

          {/* Right — benefits grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-gradient-to-b from-gray-800/60 to-gray-900/60 border border-gray-700/50 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
              >
                <div className="text-3xl mb-3">{benefit.icon}</div>
                <h3 className="text-white font-bold mb-2">{benefit.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom notice */}
        <div className="mt-16 p-6 bg-orange-600/10 border border-orange-500/20 rounded-2xl text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <span className="text-orange-400 text-2xl">⚠️</span>
            <p className="text-gray-300 text-sm">
              <span className="text-orange-300 font-semibold">Approval required.</span>{' '}
              All coaches must upload a valid certificate and pass admin verification before going live.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
