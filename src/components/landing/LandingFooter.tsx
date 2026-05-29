import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../router/routes';

export const LandingFooter = () => {
  const navigate = useNavigate();

  const footerLinks = {
    platform: [
      { label: 'Find Tracks', path: ROUTES.TRACKS },
      { label: 'How It Works', path: '/' },
      { label: 'Pricing', path: '/' },
      { label: 'About Us', path: '/' },
    ],
    riders: [
      { label: 'Register', path: ROUTES.REGISTER },
      { label: 'Login', path: ROUTES.LOGIN },
      { label: 'My Bookings', path: ROUTES.RESERVATIONS },
      { label: 'Help Center', path: '/' },
    ],
    business: [
      { label: 'List Your Track', path: ROUTES.REGISTER },
      { label: 'Partner Benefits', path: '/' },
      { label: 'Success Stories', path: '/' },
      { label: 'Resources', path: '/' },
    ],
    coaches: [
      { label: 'Become a Coach', path: ROUTES.REGISTER },
      { label: 'Upload Certificate', path: ROUTES.UPLOAD_CERTIFICATE },
      { label: 'Coach Benefits', path: '/' },
      { label: 'Login', path: ROUTES.LOGIN },
    ],
    legal: [
      { label: 'Privacy Policy', path: '/' },
      { label: 'Terms of Service', path: '/' },
      { label: 'Cookie Policy', path: '/' },
      { label: 'Contact', path: '/' },
    ],
  };

  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏍️</span>
              </div>
              <span className="text-xl font-black text-white">MotoTrax</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              The leading motocross platform to discover tracks, book rides, and connect with the community.
            </p>
            <div className="flex items-center gap-3">
              {/* Social icons */}
              <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-orange-600 transition-colors duration-300">
                <span className="text-sm">📘</span>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-orange-600 transition-colors duration-300">
                <span className="text-sm">📷</span>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-orange-600 transition-colors duration-300">
                <span className="text-sm">🐦</span>
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-white font-bold mb-4">Platform</h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-gray-400 hover:text-orange-400 transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* For Riders */}
          <div>
            <h3 className="text-white font-bold mb-4">For Riders</h3>
            <ul className="space-y-2">
              {footerLinks.riders.map((link, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-gray-400 hover:text-orange-400 transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* For Business */}
          <div>
            <h3 className="text-white font-bold mb-4">For Business</h3>
            <ul className="space-y-2">
              {footerLinks.business.map((link, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-gray-400 hover:text-orange-400 transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* For Coaches */}
          <div>
            <h3 className="text-white font-bold mb-4">For Coaches</h3>
            <ul className="space-y-2">
              {footerLinks.coaches.map((link, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-gray-400 hover:text-orange-400 transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-gray-400 hover:text-orange-400 transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Motocross App. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <span>Built with</span>
                <span className="text-red-500 animate-pulse">❤️</span>
                <span>for riders</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
