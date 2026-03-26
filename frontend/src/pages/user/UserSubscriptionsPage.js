import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { subscriptionsAPI } from '../../lib/api';
import { toast } from 'sonner';
import { 
  CreditCard, Calendar, Check, Clock, AlertTriangle,
  MapPin, Activity, User, Baby, RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

const UserSubscriptionsPage = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = useCallback(async () => {
    if (!user) return;
    
    try {
      const persons = [
        { id: user.id, type: 'user', name: user.name },
        ...(user.children || []).map(c => ({ id: c.id, type: 'child', name: c.name }))
      ];

      const results = {};
      for (const person of persons) {
        const response = await subscriptionsAPI.getForPerson(person.id, person.type);
        results[person.id] = {
          person,
          subscriptions: response.data
        };
      }
      setSubscriptions(results);
    } catch (error) {
      toast.error('Eroare la încărcarea abonamentelor');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'active': return { label: 'Activ', color: 'green', icon: Check };
      case 'queued': return { label: 'În Așteptare', color: 'blue', icon: Clock };
      case 'expired': return { label: 'Expirat', color: 'red', icon: AlertTriangle };
      case 'completed': return { label: 'Finalizat', color: 'gray', icon: Check };
      default: return { label: status, color: 'gray', icon: CreditCard };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-[#CCFF00] font-heading uppercase tracking-widest text-xs">Se încarcă abonamentele...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white uppercase tracking-tight">Abonamente</h1>
          <p className="text-white/40 text-sm mt-1">Situația pachetelor achiziționate</p>
        </div>
        <button onClick={fetchSubscriptions} className="text-white/40 hover:text-[#CCFF00] transition-colors p-2 bg-white/5 rounded-sm flex items-center gap-2 text-[10px] uppercase font-black tracking-widest">
           <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {Object.values(subscriptions).map(({ person, subscriptions: subs }) => (
          <div key={person.id} className="bg-[#0A0A0A] border border-white/5 overflow-hidden">
            
            {/* Person Header */}
            <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center gap-4">
              <div className={`w-12 h-12 flex items-center justify-center border ${
                person.type === 'user' ? 'bg-[#CCFF00]/10 border-[#CCFF00]/20 text-[#CCFF00]' : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
              }`}>
                {person.type === 'user' ? <User size={20} /> : <Baby size={20} />}
              </div>
              <div>
                <p className="text-white font-bold uppercase tracking-tight text-lg">{person.name}</p>
                <p className="text-white/40 text-[10px] uppercase font-black tracking-widest">
                  {person.type === 'user' ? 'Titular Cont' : 'Copil Înscris'}
                </p>
              </div>
            </div>

            {/* Subscriptions List */}
            <div className="p-4 sm:p-6">
              {subs.length === 0 ? (
                <div className="text-center py-8 opacity-40">
                  <CreditCard size={32} className="text-white mx-auto mb-3" />
                  <p className="text-white text-xs uppercase font-bold tracking-widest">Niciun abonament activ</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subs.map((sub) => {
                    const statusConfig = getStatusConfig(sub.status);
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <div key={sub.id} className={`relative p-5 border ${
                        sub.status === 'active' ? 'bg-[#CCFF00]/5 border-[#CCFF00]/30' : 'bg-[#121212] border-white/10'
                      }`}>
                        {/* Status Badge */}
                        <div className="absolute top-0 right-0 transform translate-x-px -translate-y-px">
                           <span className={`flex items-center gap-1.5 text-[9px] uppercase font-black tracking-widest px-3 py-1 ${
                             statusConfig.color === 'green' ? 'bg-[#CCFF00] text-black' :
                             statusConfig.color === 'blue' ? 'bg-blue-500 text-white' :
                             statusConfig.color === 'red' ? 'bg-red-500 text-white' :
                             'bg-white/20 text-white/60'
                           }`}>
                             <StatusIcon size={12} /> {statusConfig.label}
                           </span>
                        </div>

                        <h3 className={`font-bold uppercase tracking-tight mt-2 ${sub.status === 'active' ? 'text-[#CCFF00]' : 'text-white'}`}>
                          {sub.plan_name}
                        </h3>
                        
                        <div className="mt-4 space-y-2">
                           <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                             <MapPin size={14} className="opacity-50" /> {sub.location}
                           </p>
                           {sub.sessions_total && (
                             <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                               <Activity size={14} className="opacity-50" /> 
                               <span className={sub.sessions_remaining <= 2 && sub.status === 'active' ? 'text-yellow-400' : 'text-white'}>
                                 {sub.sessions_remaining} din {sub.sessions_total} ședințe
                               </span>
                             </p>
                           )}
                           {sub.expires_at && (
                             <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                               <Calendar size={14} className="opacity-50" /> Expiră: {format(new Date(sub.expires_at), 'dd MMM yyyy', { locale: ro })}
                             </p>
                           )}
                        </div>

                        {sub.status === 'queued' && (
                          <div className="mt-4 pt-3 border-t border-white/10 text-blue-400/80 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                            Acest abonament se va activa automat la prima scanare după expirarea celui curent.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white/[0.02] border border-white/5 p-4 text-center">
         <p className="text-white/40 text-[10px] uppercase font-black tracking-widest">Informații Plată</p>
         <p className="text-white/30 text-[10px] mt-1">Abonamentele noi se achită fizic la recepția bazinului (Cash/Card).</p>
      </div>
    </div>
  );
};

export default UserSubscriptionsPage;