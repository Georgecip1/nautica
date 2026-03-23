import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { alertsAPI } from '../lib/api';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  QrCode,
  Bell,
  FileText,
  BarChart3,
  Mail,
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_ccb1a182-4c98-43e1-b457-d8fbdb54f772/artifacts/ew7jp05u_IMG_9819.png";

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/utilizatori', label: 'Utilizatori', icon: Users },
  { href: '/admin/prezenta', label: 'Prezență', icon: CalendarCheck },
  { href: '/admin/qr-scan', label: 'Scanare QR', icon: QrCode },
  { href: '/admin/alerte', label: 'Alerte', icon: Bell, showBadge: true },
  { href: '/admin/blog', label: 'Blog', icon: FileText },
  { href: '/admin/rapoarte', label: 'Rapoarte', icon: BarChart3 },
  { href: '/admin/mesaje', label: 'Mesaje', icon: Mail },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alertsCount, setAlertsCount] = useState(0);

  useEffect(() => {
    fetchAlertsCount();
    const interval = setInterval(fetchAlertsCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlertsCount = async () => {
    try {
      const response = await alertsAPI.getCount();
      setAlertsCount(response.data.count);
    } catch (error) {
      console.error('Failed to fetch alerts count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (href) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0A0A0A] border-r border-white/5 transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/5">
            <Link to="/" className="flex items-center gap-3" data-testid="admin-logo">
              <img src={LOGO_URL} alt="Nautica" className="h-10 w-10 object-contain" />
              <div>
                <span className="font-heading text-lg font-bold text-white">NAUTICA</span>
                <span className="block text-[9px] text-[#CCFF00] uppercase tracking-[0.2em]">Admin</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setSidebarOpen(false)}
                    data-testid={`sidebar-${link.label.toLowerCase().replace(' ', '-')}`}
                    className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-all ${
                      active
                        ? 'bg-[#CCFF00]/10 text-[#CCFF00]'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-medium text-sm">{link.label}</span>
                    {link.showBadge && alertsCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {alertsCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-[#CCFF00] flex items-center justify-center">
                <span className="text-black font-bold text-sm">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                <p className="text-white/40 text-xs">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              data-testid="logout-button"
              className="flex items-center gap-3 px-4 py-3 w-full text-white/60 hover:text-red-400 transition-colors"
            >
              <LogOut size={18} />
              <span className="text-sm">Deconectare</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-lg border-b border-white/5">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-white p-2"
                data-testid="mobile-sidebar-toggle"
              >
                <Menu size={20} />
              </button>
              <div className="flex items-center gap-2 text-white/40 text-sm">
                <Link to="/admin" className="hover:text-white">Admin</Link>
                {location.pathname !== '/admin' && (
                  <>
                    <ChevronRight size={14} />
                    <span className="text-white">
                      {sidebarLinks.find(l => isActive(l.href))?.label || 'Pagină'}
                    </span>
                  </>
                )}
              </div>
            </div>
            <Link
              to="/"
              className="text-white/40 hover:text-white text-sm transition-colors"
            >
              Vedere publică
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
