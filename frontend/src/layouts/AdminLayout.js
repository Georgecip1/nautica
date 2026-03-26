import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { alertsAPI } from '../lib/api';
import { LayoutDashboard, Users, CalendarCheck, QrCode, Bell, FileText, BarChart3, Mail, LogOut, Menu, ChevronRight } from 'lucide-react';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_ccb1a182-4c98-43e1-b457-d8fbdb54f772/artifacts/ew7jp05u_IMG_9819.png";

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/utilizatori', label: 'Utilizatori', icon: Users },
  { href: '/admin/prezenta', label: 'Prezență', icon: CalendarCheck },
  { href: '/admin/qr-scan', label: 'Scanare QR', icon: QrCode },
  { href: '/admin/alerte', label: 'Alerte Sistem', icon: Bell, showBadge: true },
  { href: '/admin/blog', label: 'CMS Blog', icon: FileText },
  { href: '/admin/rapoarte', label: 'Rapoarte', icon: BarChart3 },
  { href: '/admin/mesaje', label: 'Inbox Contact', icon: Mail },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alertsCount, setAlertsCount] = useState(0);

  const fetchAlertsCount = useCallback(async () => {
    try {
      const response = await alertsAPI.getCount();
      setAlertsCount(response.data.count);
    } catch (error) {
      console.error('Failed to fetch alerts count');
    }
  }, []);

  useEffect(() => {
    fetchAlertsCount();
    const interval = setInterval(fetchAlertsCount, 60000); // Polling la 1 min
    return () => clearInterval(interval);
  }, [fetchAlertsCount, location.pathname]); // Refresh extra la schimbarea paginii

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (href) => {
    if (href === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex font-sans">
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0A0A0A] border-r border-white/5 transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col ${
        sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}>
        
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 border-b border-white/5 bg-black">
          <Link to="/" className="flex items-center gap-4 group">
            <img src={LOGO_URL} alt="Nautica" className="h-10 w-10 object-contain group-hover:scale-105 transition-transform" />
            <div>
              <span className="font-heading text-xl font-bold text-white uppercase tracking-tight">NAUTICA</span>
              <span className="block text-[9px] text-[#CCFF00] uppercase font-black tracking-[0.2em] -mt-1">Workspace</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-sm transition-all font-bold text-xs uppercase tracking-widest ${
                  active ? 'bg-[#CCFF00] text-black shadow-[0_0_15px_rgba(204,255,0,0.15)]' : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} className={active ? 'text-black' : 'text-white/40'} />
                <span className="flex-1">{link.label}</span>
                {link.showBadge && alertsCount > 0 && (
                  <span className={`px-2 py-0.5 text-[9px] rounded-sm ${active ? 'bg-black text-[#CCFF00]' : 'bg-[#CCFF00] text-black'}`}>
                    {alertsCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-white/5 bg-black">
          <div className="flex items-center gap-3 px-4 py-3 mb-3 bg-white/5 rounded-sm border border-white/5">
            <div className="w-8 h-8 bg-[#CCFF00]/20 flex items-center justify-center">
              <span className="text-[#CCFF00] font-black text-sm">{user?.name?.charAt(0) || 'A'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-bold uppercase tracking-tight truncate">{user?.name}</p>
              <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mt-0.5">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center justify-center gap-2 px-4 py-3 w-full text-red-500/80 hover:text-red-500 hover:bg-red-500/10 transition-colors text-[10px] font-black uppercase tracking-widest rounded-sm border border-red-500/10">
            <LogOut size={14} /> Deconectare Sistem
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-72 min-h-screen">
        
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-20 bg-[#050505]/95 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[#CCFF00] p-2 bg-[#CCFF00]/10 rounded-sm">
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-white/30 text-[10px] font-black uppercase tracking-widest">
              <span>Admin Workspace</span>
              {location.pathname !== '/admin' && (
                <>
                  <ChevronRight size={12} className="opacity-50" />
                  <span className="text-[#CCFF00]">
                    {sidebarLinks.find(l => isActive(l.href))?.label || 'Aplicație'}
                  </span>
                </>
              )}
            </div>
          </div>
          
          <Link to="/" className="text-white/40 hover:text-white px-4 py-2 bg-white/5 hover:bg-white/10 transition-colors text-[10px] font-black uppercase tracking-widest rounded-sm flex items-center gap-2">
            Vedere Site Public <ChevronRight size={12} />
          </Link>
        </header>

        {/* Page specific content inject */}
        <main className="flex-1 p-4 sm:p-8 overflow-x-hidden">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;