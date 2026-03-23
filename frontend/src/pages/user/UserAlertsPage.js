import { useState, useEffect } from 'react';
import { alertsAPI } from '../../lib/api';
import { toast } from 'sonner';
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  CreditCard
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

const UserAlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await alertsAPI.getMine();
      setAlerts(response.data);
    } catch (error) {
      toast.error('Eroare la încărcarea alertelor');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-[#CCFF00]">SE ÎNCARCĂ...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="user-alerts-page">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white uppercase">Alertele Mele</h1>
        <p className="text-white/40 text-sm mt-1">
          Notificări despre abonamentele tale
        </p>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-[#0A0A0A] border border-white/5 p-12 text-center">
          <Bell size={48} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/40">Nu ai alerte</p>
          <p className="text-white/30 text-sm mt-1">Totul este în regulă!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const config = alertTypeConfig[alert.alert_type] || alertTypeConfig.no_plan;
            const Icon = config.icon;
            
            return (
              <div
                key={alert.id}
                className={`bg-[#0A0A0A] border p-4 ${
                  !alert.is_seen ? 'border-white/10' : 'border-white/5'
                }`}
                data-testid={`alert-${alert.id}`}
              >
                <div className="flex items-start gap-4">
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
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] uppercase px-2 py-0.5 ${
                        config.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                        config.color === 'orange' ? 'bg-orange-500/20 text-orange-400' :
                        config.color === 'red' ? 'bg-red-500/20 text-red-400' :
                        'bg-white/10 text-white/60'
                      }`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-white">{alert.message}</p>
                    <p className="text-white/30 text-xs mt-2">
                      {format(new Date(alert.created_at), 'dd MMM yyyy, HH:mm', { locale: ro })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-white/30 text-sm">
        Pentru reînnoire sau alte întrebări, contactează administrația clubului.
      </p>
    </div>
  );
};

export default UserAlertsPage;
