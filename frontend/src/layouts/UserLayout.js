import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { alertsAPI } from '../lib/api';
import { User, CreditCard, QrCode, Bell, LogOut, Menu, X, Home } from 'lucide-react';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_ccb1a182-4c98-43e1-b457-d8fbdb54f772/artifacts/ew7jp05u_IMG_9819.png";

const navLinks = [
  { href: '/portal', label: 'Profil', icon: User },
  { href: '/portal/abonamente', label: 'Abonamente', icon: CreditCard },
  { href: '/portal/qr', label: 'Cod Acces QR', icon: QrCode },
  { href: '/portal/alerte', label: 'Notificări', icon: Bell, showBadge: true },
];

const UserLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [alertsCount, setAlertsCount] = useState(0);

  const fetchAlertsCount = useCallback(async () => {
    try {
      const response = await alertsAPI.getMine();
      const unseen = response.data.filter(a => !a.is_seen).length;
      setAlertsCount(unseen);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  }, []);

  useEffect(() => {
    fetchAlertsCount();
  }, [fetchAlertsCount, location.pathname]); // Update la schimbarea rutei

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (href) => {
    if (href === '/portal') return location.pathname === '/portal';
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A] border-b border-white/5 shadow-2xl">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <img src={LOGO_URL} alt="Nautica" className="h-10 w-10 object-contain group-hover:scale-105 transition-transform" />
              <div className="hidden sm:block">
                <span className="font-heading text-xl font-bold text-white uppercase tracking-tight">NAUTICA</span>
                <span className="block text-[9px] text-[#CCFF00] uppercase font-black tracking-[0.2em] -mt-1">Client Portal</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-sm transition-all relative font-bold text-xs uppercase tracking-widest ${
                      active ? 'bg-[#CCFF00]/10 text-[#CCFF00]' : 'text-white/40 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{link.label}</span>
                    {link.showBadge && alertsCount > 0 && (
                      <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </Link>
                );
              })}
              <div className="w-px h-6 bg-white/10 mx-2" />
              <button onClick={handleLogout} className="p-2.5 text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-colors rounded-sm" title="Ieșire Cont">
                <LogOut size={18} />
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-[#CCFF00] p-2 bg-[#CCFF00]/10 rounded-sm">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Nav (Dropdown) */}
          {menuOpen && (
            <nav className="md:hidden py-4 border-t border-white/5 animate-fade-in">
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-4 text-xs font-bold uppercase tracking-widest rounded-sm ${
                        active ? 'bg-[#CCFF00] text-black' : 'text-white/60 hover:bg-white/5'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{link.label}</span>
                      {link.showBadge && alertsCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-sm">
                          {alertsCount} Noi
                        </span>
                      )}
                    </Link>
                  );
                })}
                <div className="my-2 border-t border-white/5" />
                <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-4 text-xs font-bold uppercase tracking-widest text-white/60 hover:bg-white/5 rounded-sm">
                  <Home size={18} /> <span>Înapoi la Site</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-4 text-xs font-bold uppercase tracking-widest text-red-400 hover:bg-red-500/10 rounded-sm w-full text-left">
                  <LogOut size={18} /> <span>Deconectare</span>
                </button>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* User Quick Info Bar */}
      <div className="bg-[#CCFF00]/5 border-b border-[#CCFF00]/10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#CCFF00] flex items-center justify-center rounded-sm">
              <span className="text-black font-black text-lg">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <p className="text-white font-bold uppercase tracking-tight text-sm">Salut, {user?.name}</p>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;