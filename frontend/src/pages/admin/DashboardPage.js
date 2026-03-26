import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { reportsAPI, seedAPI } from '../../lib/api';
import { Users, CreditCard, TrendingUp, CalendarCheck, Bell, ChevronRight, RefreshCw } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, trend, color = 'primary' }) => (
  <div className="bg-[#0A0A0A] border border-white/5 p-6 hover:bg-white/[0.02] transition-colors group">
    <div className="flex items-start justify-between">
      <div className={`w-12 h-12 flex items-center justify-center transition-colors ${
        color === 'primary' ? 'bg-[#CCFF00]/10 group-hover:bg-[#CCFF00] text-[#CCFF00] group-hover:text-black' : 
        'bg-white/5 text-white/40'
      }`}>
        <Icon size={20} />
      </div>
      {trend && (
        <span className={`text-[10px] font-black uppercase tracking-widest ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div className="mt-6">
      <p className="text-white/40 text-[10px] uppercase font-black tracking-widest mb-1">{label}</p>
      <p className="font-heading text-3xl font-bold text-white tracking-tight">{value}</p>
    </div>
  </div>
);

const QuickAction = ({ icon: Icon, label, to }) => (
  <Link to={to} className="flex items-center gap-4 p-4 bg-[#0A0A0A] border border-white/5 hover:border-[#CCFF00]/30 transition-all group">
    <div className="w-10 h-10 bg-[#CCFF00]/10 flex items-center justify-center group-hover:bg-[#CCFF00]/20 transition-colors">
      <Icon size={18} className="text-[#CCFF00]" />
    </div>
    <span className="text-white font-bold uppercase text-xs tracking-widest flex-1">{label}</span>
    <ChevronRight size={16} className="text-white/20 group-hover:text-[#CCFF00] group-hover:translate-x-1 transition-all" />
  </Link>
);

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const response = await reportsAPI.getDashboard();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedAPI.seed();
      await fetchStats();
    } catch (error) {
      console.error('Failed to seed:', error);
    } finally {
      setSeeding(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-pulse text-[#CCFF00] font-heading tracking-widest uppercase">Preluare Date...</div></div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white uppercase tracking-tight">Panou Control</h1>
          <p className="text-white/40 text-sm mt-1">Sumarul activității clubului tău</p>
        </div>
        <button onClick={handleSeed} disabled={seeding} className="btn-secondary px-4 py-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
          <RefreshCw size={14} className={seeding ? 'animate-spin' : ''} /> {seeding ? 'Se execută...' : 'Re-Seed Bază Date'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Utilizatori" value={stats?.total_users || 0} />
        <StatCard icon={CreditCard} label="Abonamente Active" value={stats?.active_subscriptions || 0} />
        <StatCard icon={TrendingUp} label="Venituri Luna Asta" value={`${stats?.monthly_revenue || 0} LEI`} />
        <StatCard icon={CalendarCheck} label="Prezențe Luna Asta" value={stats?.monthly_attendance || 0} />
      </div>

      {stats?.unseen_alerts > 0 && (
        <Link to="/admin/alerte" className="flex items-center gap-4 p-4 bg-yellow-500/10 border border-yellow-500/20 hover:border-yellow-500/40 transition-colors group">
          <div className="bg-yellow-500/20 p-2 rounded-sm"><Bell className="text-yellow-500" size={20} /></div>
          <div className="flex-1">
            <p className="text-yellow-500 font-bold text-sm uppercase tracking-wider">{stats.unseen_alerts} Notificări de Sistem</p>
            <p className="text-white/40 text-[10px] uppercase font-black tracking-widest">Acțiuni necesare privind abonamentele</p>
          </div>
          <ChevronRight className="text-yellow-500/40 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" size={20} />
        </Link>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Acțiuni Rapide</h2>
          <div className="space-y-2">
            <QuickAction icon={Users} label="Adaugă Utilizator" to="/admin/utilizatori" />
            <QuickAction icon={CalendarCheck} label="Înregistrare Intrare Bazin" to="/admin/prezenta" />
            <QuickAction icon={Bell} label="Verificare Alerte" to="/admin/alerte" />
            <QuickAction icon={TrendingUp} label="Analiză Financiară" to="/admin/rapoarte" />
          </div>
        </div>

        <div>
          <h2 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Ultimele Accesări Bazin</h2>
          <div className="bg-[#0A0A0A] border border-white/5 overflow-hidden">
            {stats?.recent_attendance?.length > 0 ? (
              <div className="divide-y divide-white/5">
                {stats.recent_attendance.map((att, i) => (
                  <div key={i} className="p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                    <div className="w-10 h-10 bg-[#CCFF00]/5 flex items-center justify-center">
                      <CalendarCheck size={16} className="text-[#CCFF00]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold uppercase truncate">{att.person_name}</p>
                      <p className="text-[#CCFF00]/60 text-[10px] uppercase font-black tracking-widest mt-0.5">{att.location}</p>
                    </div>
                    <span className="text-white/20 text-[10px] font-bold uppercase tracking-wider bg-white/5 px-2 py-1">
                      {new Date(att.recorded_at).toLocaleDateString('ro-RO')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-white/20 text-xs font-bold uppercase tracking-widest">Nicio activitate recentă</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;