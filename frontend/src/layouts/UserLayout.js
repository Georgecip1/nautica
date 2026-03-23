import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { alertsAPI } from '../lib/api';
import {
  User,
  CreditCard,
  QrCode,
  Bell,
  LogOut,
  Menu,
  X,
  Home
} from 'lucide-react';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_ccb1a182-4c98-43e1-b457-d8fbdb54f772/artifacts/ew7jp05u_IMG_9819.png";

const navLinks = [
  { href: '/portal', label: 'Profil', icon: User },
  { href: '/portal/abonamente', label: 'Abonamente', icon: CreditCard },
  { href: '/portal/qr', label: 'Cod QR', icon: QrCode },
  { href: '/portal/alerte', label: 'Alerte', icon: Bell, showBadge: true },
];

const UserLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [alertsCount, setAlertsCount] = useState(0);

  useEffect(() => {
    fetchAlertsCount();
  }, []);

  const fetchAlertsCount = async () => {
    try {
      const response = await alertsAPI.getMine();
      const unseen = response.data.filter(a => !a.is_seen).length;
      setAlertsCount(unseen);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (href) => {
    if (href === '/portal') {
      return location.pathname === '/portal';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A] border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3" data-testid="portal-logo">
              <img src={LOGO_URL} alt="Nautica" className="h-10 w-10 object-contain" />
              <div className="hidden sm:block">
                <span className="font-heading text-lg font-bold text-white">NAUTICA</span>
                <span className="block text-[9px] text-[#CCFF00] uppercase tracking-[0.2em]">Contul meu</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    data-testid={`portal-nav-${link.label.toLowerCase()}`}
                    className={`flex items-center gap-2 text-sm transition-colors relative ${
                      active ? 'text-[#CCFF00]' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{link.label}</span>
                    {link.showBadge && alertsCount > 0 && (
                      <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {alertsCount}
                      </span>
                    )}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                data-testid="portal-logout"
                className="flex items-center gap-2 text-sm text-white/60 hover:text-red-400 transition-colors"
              >
                <LogOut size={16} />
                <span>Ieșire</span>
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-white p-2"
              data-testid="portal-mobile-menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile Nav */}
          {menuOpen && (
            <nav className="md:hidden pb-4 border-t border-white/5 pt-4 animate-slide-down">
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 text-sm ${
                        active ? 'text-[#CCFF00]' : 'text-white/60'
                      }`}
                    >
                      <Icon size={16} />
                      <span>{link.label}</span>
                      {link.showBadge && alertsCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {alertsCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 text-sm text-white/60"
                >
                  <Home size={16} />
                  <span>Site public</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 text-sm text-red-400 pt-2 border-t border-white/5"
                >
                  <LogOut size={16} />
                  <span>Deconectare</span>
                </button>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* User Info Bar */}
      <div className="bg-[#121212] border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#CCFF00] flex items-center justify-center">
              <span className="text-black font-bold">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <p className="text-white font-medium">{user?.name}</p>
              <p className="text-white/40 text-sm">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
