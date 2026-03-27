import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { alertsAPI } from '../../lib/api';
import { toast } from 'sonner';
import { 
  Bell, AlertTriangle, Clock, CreditCard,
  Check, CheckCheck, User as UserIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

// Configurația de UI
const alertTypeConfig = {
  low_entries: { icon: AlertTriangle, color: 'yellow', label: 'Ședințe Puține' },
  expiring_soon: { icon: Clock, color: 'orange', label: 'Expiră Curând' },
  expired: { icon: CreditCard, color: 'red', label: 'Expirat' },
  no_plan: { icon: CreditCard, color: 'gray', label: 'Fără Abonament' }
};

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('unseen');

  const fetchAlerts = useCallback(async () => {
    try {
      const params = filter === 'unseen' ? { unseen_only: true } : {};
      const response = await alertsAPI.getAll(params);
      setAlerts(response.data);
    } catch (error) {
      toast.error('Eroare la încărcarea alertelor');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleMarkSeen = async (alert, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const alertId = alert.id || alert._id;
    
    if (!alertId) {
      toast.error('Eroare internă: ID alertă lipsă');
      return;
    }

    try {
      await alertsAPI.markSeen(alertId);
      toast.success('Notificare marcată ca rezolvată!');
      fetchAlerts(); // Reîmprospătăm lista
    } catch (error) {
      toast.error('Nu s-a putut marca alerta.');
    }
  };

  const handleMarkAllSeen = async () => {
    try {
      await alertsAPI.markAllSeen();
      toast.success('Toate notificările au fost curățate!');
      fetchAlerts();
    } catch (error) {
      toast.error('Eroare la curățarea alertelor.');
    }
  };

  const unseenCount = alerts.filter(a => !a.is_seen).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white uppercase tracking-tight">Alerte Sistem</h1>
          <p className="text-white/40 text-sm mt-1">
            {unseenCount > 0 ? (
               <span className="text-yellow-500 font-bold">{unseenCount} notificări care necesită atenție</span>
            ) : 'Sistemul funcționează optim. Zero notificări.'}
          </p>
        </div>
        {unseenCount > 0 && (
          <button
            onClick={handleMarkAllSeen}
            className="btn-secondary px-4 py-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
          >
            <CheckCheck size={16} /> Marchează tot ca citit
          </button>
        )}
      </div>

      {/* Toggles */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('unseen')}
          className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${
            filter === 'unseen' ? 'bg-[#6db025] text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'
          }`}
        >
          Doar Noi
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${
            filter === 'all' ? 'bg-[#6db025] text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'
          }`}
        >
          Istoric Complet
        </button>
      </div>

      {/* Lista */}
      <div className="bg-[#0A0A0A] border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-[#6db025] animate-pulse font-heading text-xs tracking-widest uppercase">
            Se încarcă alertele...
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center gap-4 opacity-30">
            <Bell size={48} className="text-white" />
            <p className="text-white font-bold uppercase tracking-widest text-sm">
              {filter === 'unseen' ? 'Nicio alertă nouă' : 'Inbox gol'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {alerts.map((alert) => {
              const config = alertTypeConfig[alert.alert_type] || alertTypeConfig.no_plan;
              const Icon = config.icon;
              
              return (
                <div
                  key={alert.id || alert._id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 transition-all ${
                    !alert.is_seen ? 'bg-white/[0.03] border-l-2 border-l-[#6db025]' : 'border-l-2 border-l-transparent hover:bg-white/[0.01]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border ${
                      config.color === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                      config.color === 'orange' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' :
                      config.color === 'red' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                      'bg-white/5 border-white/10 text-white/40'
                    }`}>
                      <Icon size={20} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className={`text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded-sm ${
                          config.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-500' :
                          config.color === 'orange' ? 'bg-orange-500/20 text-orange-500' :
                          config.color === 'red' ? 'bg-red-500/20 text-red-500' :
                          'bg-white/10 text-white/40'
                        }`}>
                          {config.label}
                        </span>
                        {!alert.is_seen && <span className="text-[9px] text-[#6db025] font-black uppercase tracking-widest">Nerezolvată</span>}
                      </div>
                      <p className={`text-sm md:text-base pr-4 ${!alert.is_seen ? 'text-white font-bold' : 'text-white/60 font-medium'}`}>
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-[10px] uppercase font-bold tracking-widest">
                        <span className="text-white/20">
                          {format(new Date(alert.created_at), 'dd MMM yyyy • HH:mm', { locale: ro })}
                        </span>
                        <span className="text-white/10">•</span>
                        <Link to={`/admin/utilizatori/${alert.user_id}`} className="text-[#6db025] hover:underline flex items-center gap-1.5 z-10 relative">
                          <UserIcon size={12} /> Vezi Cont Client
                        </Link>
                      </div>
                    </div>
                  </div>

                  {!alert.is_seen && (
                    <button
                      onClick={(e) => handleMarkSeen(alert, e)}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-[#6db025] text-white/40 hover:text-black transition-colors rounded-sm sm:self-center z-10 relative cursor-pointer"
                    >
                      <Check size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Rezolvat</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPage;