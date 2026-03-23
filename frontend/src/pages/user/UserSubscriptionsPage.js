import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { subscriptionsAPI } from '../../lib/api';
import { toast } from 'sonner';
import { 
  CreditCard, 
  Calendar, 
  Check, 
  Clock, 
  AlertTriangle,
  MapPin
} from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

const UserSubscriptionsPage = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, [user]);

  const fetchSubscriptions = async () => {
    if (!user) return;
    
    try {
      // Fetch subscriptions for user and all children
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
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'active':
        return { label: 'Activ', color: 'green', icon: Check };
      case 'queued':
        return { label: 'În Așteptare', color: 'blue', icon: Clock };
      case 'expired':
        return { label: 'Expirat', color: 'red', icon: AlertTriangle };
      case 'completed':
        return { label: 'Finalizat', color: 'gray', icon: Check };
      default:
        return { label: status, color: 'gray', icon: CreditCard };
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
    <div className="space-y-6" data-testid="user-subscriptions-page">
      <h1 className="font-heading text-2xl font-bold text-white uppercase">Abonamentele Mele</h1>

      {Object.values(subscriptions).map(({ person, subscriptions: subs }) => (
        <div key={person.id} className="space-y-4">
          {/* Person Header */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 flex items-center justify-center rounded-full ${
              person.type === 'user' ? 'bg-[#CCFF00]/20' : 'bg-purple-500/20'
            }`}>
              <span className={person.type === 'user' ? 'text-[#CCFF00]' : 'text-purple-400'}>
                {person.name.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-white font-medium">{person.name}</p>
              <p className="text-white/40 text-xs">{person.type === 'user' ? 'Adult' : 'Copil'}</p>
            </div>
          </div>

          {/* Subscriptions */}
          {subs.length === 0 ? (
            <div className="bg-[#0A0A0A] border border-white/5 p-6 text-center">
              <CreditCard size={32} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/40">Fără abonamente active</p>
            </div>
          ) : (
            <div className="space-y-3">
              {subs.map((sub) => {
                const statusConfig = getStatusConfig(sub.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div
                    key={sub.id}
                    className={`bg-[#0A0A0A] border p-4 ${
                      sub.status === 'active' ? 'border-[#CCFF00]/30' : 'border-white/5'
                    }`}
                    data-testid={`subscription-${sub.id}`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-white font-medium">{sub.plan_name}</h3>
                        <p className="text-white/40 text-sm flex items-center gap-1">
                          <MapPin size={12} />
                          {sub.location}
                        </p>
                      </div>
                      <span className={`flex items-center gap-1 text-xs uppercase px-2 py-1 ${
                        statusConfig.color === 'green' ? 'bg-green-500/20 text-green-400' :
                        statusConfig.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                        statusConfig.color === 'red' ? 'bg-red-500/20 text-red-400' :
                        'bg-white/10 text-white/60'
                      }`}>
                        <StatusIcon size={12} />
                        {statusConfig.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {sub.sessions_total && (
                        <div>
                          <p className="text-white/40 text-xs uppercase">Ședințe</p>
                          <p className={`font-heading text-xl font-bold ${
                            sub.sessions_remaining <= 2 ? 'text-yellow-400' : 'text-[#CCFF00]'
                          }`}>
                            {sub.sessions_remaining} / {sub.sessions_total}
                          </p>
                        </div>
                      )}
                      {sub.expires_at && (
                        <div>
                          <p className="text-white/40 text-xs uppercase">Expiră</p>
                          <p className="text-white flex items-center gap-1">
                            <Calendar size={12} />
                            {format(new Date(sub.expires_at), 'dd MMM yyyy', { locale: ro })}
                          </p>
                        </div>
                      )}
                    </div>

                    {sub.status === 'queued' && (
                      <p className="text-blue-400/70 text-xs mt-3 pt-3 border-t border-white/5">
                        Acest abonament se va activa automat când abonamentul curent expiră sau se termină.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      <p className="text-white/30 text-sm">
        Pentru a achiziționa un nou abonament, contactează administrația clubului.
      </p>
    </div>
  );
};

export default UserSubscriptionsPage;
