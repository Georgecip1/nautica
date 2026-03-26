import { useState, useEffect, useCallback } from 'react';
import { alertsAPI } from '../../lib/api';
import { toast } from 'sonner';
import { Bell, AlertTriangle, Clock, CreditCard, Inbox } from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

const alertTypeConfig = {
  low_entries: { icon: AlertTriangle, color: 'yellow', label: 'Atenție: Ședințe Puține' },
  expiring_soon: { icon: Clock, color: 'orange', label: 'Expiră Curând' },
  expired: { icon: CreditCard, color: 'red', label: 'Abonament Expirat' },
  no_plan: { icon: CreditCard, color: 'gray', label: 'Lipsă Abonament' }
};

const UserAlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await alertsAPI.getMine();
      setAlerts(response.data);
    } catch (error) {
      toast.error('Nu am putut încărca notificările');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-[#CCFF00] font-heading uppercase tracking-widest text-xs">Sincronizare Sistem...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-white uppercase tracking-tight">Notificări</h1>
        <p className="text-white/40 text-sm mt-1">Alerte legate de valabilitatea abonamentelor tale</p>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-[#0A0A0A] border border-white/5 p-16 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
             <Bell size={32} className="text-green-500" />
          </div>
          <p className="text-white font-bold uppercase tracking-widest text-sm">Totul este în regulă</p>
          <p className="text-white/30 text-[10px] uppercase font-black tracking-widest mt-2">Nu ai nicio alertă activă în acest moment.</p>
        </div>
      ) : (
        <div className="bg-[#0A0A0A] border border-white/5 overflow-hidden divide-y divide-white/5">
          {alerts.map((alert) => {
            const config = alertTypeConfig[alert.alert_type] || alertTypeConfig.no_plan;
            const Icon = config.icon;
            
            return (
              <div key={alert.id} className="p-6">
                <div className="flex items-start gap-5">
                  <div className={`w-12 h-12 flex items-center justify-center flex-shrink-0 border ${
                    config.color === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                    config.color === 'orange' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' :
                    config.color === 'red' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                    'bg-white/5 border-white/10 text-white/40'
                  }`}>
                    <Icon size={20} />
                  </div>
                  
                  <div className="flex-1 min-w-0 pt-1">
                    <span className={`text-[9px] uppercase px-2 py-0.5 rounded-sm font-black tracking-widest inline-block mb-2 ${
                      config.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-500' :
                      config.color === 'orange' ? 'bg-orange-500/20 text-orange-500' :
                      config.color === 'red' ? 'bg-red-500/20 text-red-500' :
                      'bg-white/10 text-white/40'
                    }`}>
                      {config.label}
                    </span>
                    <p className="text-white font-bold text-sm tracking-wide leading-relaxed">{alert.message}</p>
                    <p className="text-white/20 text-[10px] font-black uppercase tracking-widest mt-3">
                      Primit la: {format(new Date(alert.created_at), 'dd MMM yyyy, HH:mm', { locale: ro })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {alerts.length > 0 && (
         <div className="bg-white/[0.02] border border-white/5 p-4 text-center">
            <p className="text-white/40 text-[10px] uppercase font-black tracking-widest">Cum rezolv aceste alerte?</p>
            <p className="text-white/30 text-[10px] mt-1">Aceste mesaje sunt strict informative. Pentru a reînnoi un abonament, te rugăm să te adresezi antrenorului tău.</p>
         </div>
      )}
    </div>
  );
};

export default UserAlertsPage;