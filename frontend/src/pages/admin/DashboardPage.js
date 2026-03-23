import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportsAPI, alertsAPI, seedAPI } from '../../lib/api';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  CalendarCheck, 
  Bell,
  ChevronRight,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, trend, color = 'primary' }) => (
  <div className="bg-[#0A0A0A] border border-white/5 p-6 hover:border-white/10 transition-colors">
    <div className="flex items-start justify-between">
      <div className={`w-10 h-10 flex items-center justify-center ${
        color === 'primary' ? 'bg-[#CCFF00]/10' : 
        color === 'error' ? 'bg-red-500/10' : 'bg-white/5'
      }`}>
        <Icon size={20} className={
          color === 'primary' ? 'text-[#CCFF00]' :
          color === 'error' ? 'text-red-400' : 'text-white/60'
        } />
      </div>
      {trend && (
        <span className={`text-xs font-medium ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div className="mt-4">
      <p className="text-white/40 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="font-heading text-3xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const QuickAction = ({ icon: Icon, label, to }) => (
  <Link
    to={to}
    className="flex items-center gap-3 p-4 bg-[#0A0A0A] border border-white/5 hover:border-[#CCFF00]/30 transition-all group"
  >
    <div className="w-10 h-10 bg-[#CCFF00]/10 flex items-center justify-center group-hover:bg-[#CCFF00]/20 transition-colors">
      <Icon size={18} className="text-[#CCFF00]" />
    </div>
    <span className="text-white font-medium flex-1">{label}</span>
    <ChevronRight size={16} className="text-white/40 group-hover:text-[#CCFF00] transition-colors" />
  </Link>
);

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await reportsAPI.getDashboard();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedAPI.seed();
      fetchStats();
    } catch (error) {
      console.error('Failed to seed:', error);
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-[#CCFF00] font-heading">SE ÎNCARCĂ...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="admin-dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white uppercase">Dashboard</h1>
          <p className="text-white/40 text-sm mt-1">Bine ai venit în panoul de administrare</p>
        </div>
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="btn-secondary px-4 py-2 flex items-center gap-2 text-sm"
          data-testid="seed-button"
        >
          <RefreshCw size={14} className={seeding ? 'animate-spin' : ''} />
          {seeding ? 'Se inițializează...' : 'Reinițializează Date'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Utilizatori"
          value={stats?.total_users || 0}
        />
        <StatCard
          icon={CreditCard}
          label="Abonamente Active"
          value={stats?.active_subscriptions || 0}
        />
        <StatCard
          icon={TrendingUp}
          label="Venituri Luna"
          value={`${stats?.monthly_revenue || 0} LEI`}
        />
        <StatCard
          icon={CalendarCheck}
          label="Prezențe Luna"
          value={stats?.monthly_attendance || 0}
        />
      </div>

      {/* Alerts Banner */}
      {stats?.unseen_alerts > 0 && (
        <Link
          to="/admin/alerte"
          className="flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/30 hover:border-red-500/50 transition-colors"
          data-testid="alerts-banner"
        >
          <Bell className="text-red-400" size={24} />
          <div className="flex-1">
            <p className="text-white font-medium">Ai {stats.unseen_alerts} alerte nevăzute</p>
            <p className="text-white/50 text-sm">Click pentru a vedea detalii</p>
          </div>
          <ChevronRight className="text-red-400" size={20} />
        </Link>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div>
          <h2 className="font-heading text-lg font-bold text-white uppercase mb-4">Acțiuni Rapide</h2>
          <div className="space-y-2">
            <QuickAction icon={Users} label="Adaugă Utilizator Nou" to="/admin/utilizatori" />
            <QuickAction icon={CalendarCheck} label="Înregistrează Prezență" to="/admin/prezenta" />
            <QuickAction icon={Bell} label="Vezi Alerte" to="/admin/alerte" />
            <QuickAction icon={TrendingUp} label="Vezi Rapoarte" to="/admin/rapoarte" />
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="font-heading text-lg font-bold text-white uppercase mb-4">Activitate Recentă</h2>
          <div className="bg-[#0A0A0A] border border-white/5 divide-y divide-white/5">
            {stats?.recent_attendance?.length > 0 ? (
              stats.recent_attendance.map((att, i) => (
                <div key={i} className="p-4 flex items-center gap-4">
                  <div className="w-8 h-8 bg-[#CCFF00]/10 rounded-full flex items-center justify-center">
                    <CalendarCheck size={14} className="text-[#CCFF00]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{att.person_name}</p>
                    <p className="text-white/40 text-xs">{att.location}</p>
                  </div>
                  <span className="text-white/30 text-xs">
                    {new Date(att.recorded_at).toLocaleDateString('ro-RO')}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-white/40 text-sm">
                Nu există activitate recentă
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
