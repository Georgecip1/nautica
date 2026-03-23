import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { alertsAPI } from '../../lib/api';
import { toast } from 'sonner';
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  CreditCard,
  Check,
  CheckCheck,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

const alertTypeConfig = {
  low_entries: {
    icon: AlertTriangle,
    color: 'yellow',
    label: 'Ședințe Puține'
  },
  expiring_soon: {
    icon: Clock,
    color: 'orange',
    label: 'Expiră Curând'
  },
  expired: {
    icon: CreditCard,
    color: 'red',
    label: 'Expirat'
  },
  no_plan: {
    icon: CreditCard,
    color: 'gray',
    label: 'Fără Abonament'
  }
};

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('unseen');

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  const fetchAlerts = async () => {
    try {
      const params = filter === 'unseen' ? { unseen_only: true } : {};
      const response = await alertsAPI.getAll(params);
      setAlerts(response.data);
    } catch (error) {
      toast.error('Eroare la încărcarea alertelor');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSeen = async (alertId) => {
    try {
      await alertsAPI.markSeen(alertId);
      fetchAlerts();
    } catch (error) {
      toast.error('Eroare');
    }
  };

  const handleMarkAllSeen = async () => {
    try {
      await alertsAPI.markAllSeen();
      toast.success('Toate alertele marcate ca văzute');
      fetchAlerts();
    } catch (error) {
      toast.error('Eroare');
    }
  };

  const unseenCount = alerts.filter(a => !a.is_seen).length;

  return (
    <div className="space-y-6" data-testid="alerts-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white uppercase">Alerte</h1>
          <p className="text-white/40 text-sm mt-1">
            {unseenCount > 0 ? `${unseenCount} alerte nevăzute` : 'Fără alerte noi'}
          </p>
        </div>
        {unseenCount > 0 && (
          <button
            onClick={handleMarkAllSeen}
            className="btn-secondary px-4 py-2 flex items-center gap-2 text-sm"
            data-testid="mark-all-seen"
          >
            <CheckCheck size={14} />
            Marchează toate ca văzute
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('unseen')}
          className={`px-4 py-2 text-sm font-heading uppercase tracking-wider transition-colors ${
            filter === 'unseen' ? 'bg-[#CCFF00] text-black' : 'bg-white/5 text-white/60'
          }`}
        >
          Nevăzute
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-heading uppercase tracking-wider transition-colors ${
            filter === 'all' ? 'bg-[#CCFF00] text-black' : 'bg-white/5 text-white/60'
          }`}
        >
          Toate
        </button>
      </div>

      {/* Alerts List */}
      <div className="bg-[#0A0A0A] border border-white/5">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-pulse text-[#CCFF00]">SE ÎNCARCĂ...</div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-12 text-center">
            <Bell size={48} className="text-white/10 mx-auto mb-4" />
            <p className="text-white/40">
              {filter === 'unseen' ? 'Nu există alerte nevăzute' : 'Nu există alerte'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {alerts.map((alert) => {
              const config = alertTypeConfig[alert.alert_type] || alertTypeConfig.no_plan;
              const Icon = config.icon;
              
              return (
                <div
                  key={alert.id}
                  className={`flex items-start gap-4 p-4 transition-colors ${
                    !alert.is_seen ? 'bg-white/5' : ''
                  }`}
                  data-testid={`alert-${alert.id}`}
                >
                  <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${
                    config.color === 'yellow' ? 'bg-yellow-500/20' :
                    config.color === 'orange' ? 'bg-orange-500/20' :
                    config.color === 'red' ? 'bg-red-500/20' :
                    'bg-white/10'
                  }`}>
                    <Icon size={18} className={
                      config.color === 'yellow' ? 'text-yellow-400' :
                      config.color === 'orange' ? 'text-orange-400' :
                      config.color === 'red' ? 'text-red-400' :
                      'text-white/60'
                    } />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] uppercase px-2 py-0.5 ${
                        config.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                        config.color === 'orange' ? 'bg-orange-500/20 text-orange-400' :
                        config.color === 'red' ? 'bg-red-500/20 text-red-400' :
                        'bg-white/10 text-white/60'
                      }`}>
                        {config.label}
                      </span>
                      {!alert.is_seen && (
                        <span className="w-2 h-2 bg-[#CCFF00] rounded-full" />
                      )}
                    </div>
                    <p className="text-white font-medium">{alert.message}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Link
                        to={`/admin/utilizatori/${alert.user_id}`}
                        className="text-[#CCFF00] text-sm hover:underline flex items-center gap-1"
                      >
                        <User size={12} />
                        Vezi utilizator
                      </Link>
                      <span className="text-white/30 text-xs">
                        {format(new Date(alert.created_at), 'dd MMM yyyy, HH:mm', { locale: ro })}
                      </span>
                    </div>
                  </div>

                  {!alert.is_seen && (
                    <button
                      onClick={() => handleMarkSeen(alert.id)}
                      className="text-white/40 hover:text-[#CCFF00] p-2 transition-colors"
                      title="Marchează ca văzut"
                    >
                      <Check size={16} />
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
