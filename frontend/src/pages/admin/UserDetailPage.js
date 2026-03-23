import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usersAPI, subscriptionsAPI, plansAPI, attendanceAPI, qrAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Edit, 
  Trash2, 
  Plus, 
  QrCode, 
  Send,
  CreditCard,
  Calendar,
  AlertTriangle,
  Clock,
  Check,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';

const UserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { isOwner } = useAuth();
  
  const [user, setUser] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [showAddSubscriptionModal, setShowAddSubscriptionModal] = useState(false);
  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false);
  const [showDeleteChildDialog, setShowDeleteChildDialog] = useState(null);
  
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });
  const [newChild, setNewChild] = useState({ name: '', birth_date: '' });
  const [newSubscription, setNewSubscription] = useState({ person_id: '', person_type: 'user', plan_id: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      const [userRes, subsRes, plansRes] = await Promise.all([
        usersAPI.getOne(userId),
        subscriptionsAPI.getAll({ user_id: userId }),
        plansAPI.getAll()
      ]);
      setUser(userRes.data);
      setSubscriptions(subsRes.data);
      setPlans(plansRes.data);
      setEditForm({
        name: userRes.data.name,
        email: userRes.data.email || '',
        phone: userRes.data.phone || ''
      });
    } catch (error) {
      toast.error('Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await usersAPI.update(userId, editForm);
      toast.success('Utilizator actualizat!');
      setShowEditModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Eroare la actualizare');
    } finally {
      setSaving(false);
    }
  };

  const handleAddChild = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await usersAPI.addChild(userId, newChild);
      toast.success('Copil adăugat!');
      setShowAddChildModal(false);
      setNewChild({ name: '', birth_date: '' });
      fetchData();
    } catch (error) {
      toast.error('Eroare la adăugarea copilului');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteChild = async (childId) => {
    try {
      await usersAPI.deleteChild(userId, childId);
      toast.success('Copil șters!');
      setShowDeleteChildDialog(null);
      fetchData();
    } catch (error) {
      toast.error('Eroare la ștergerea copilului');
    }
  };

  const handleAddSubscription = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await subscriptionsAPI.create({
        user_id: userId,
        ...newSubscription
      });
      toast.success('Abonament adăugat!');
      setShowAddSubscriptionModal(false);
      setNewSubscription({ person_id: '', person_type: 'user', plan_id: '' });
      fetchData();
    } catch (error) {
      toast.error('Eroare la adăugarea abonamentului');
    } finally {
      setSaving(false);
    }
  };

  const handleResendSetup = async () => {
    try {
      await usersAPI.resendSetup(userId);
      toast.success('Link trimis!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Eroare la trimiterea linkului');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await usersAPI.delete(userId);
      toast.success('Utilizator șters!');
      navigate('/admin/utilizatori');
    } catch (error) {
      toast.error('Eroare la ștergerea utilizatorului');
    }
  };

  const getPersonSubscriptions = (personId, personType) => {
    return subscriptions.filter(s => s.person_id === personId && s.person_type === personType);
  };

  const getActiveSubscription = (personId, personType) => {
    return subscriptions.find(s => s.person_id === personId && s.person_type === personType && s.status === 'active');
  };

  const getQueuedSubscription = (personId, personType) => {
    return subscriptions.find(s => s.person_id === personId && s.person_type === personType && s.status === 'queued');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-[#CCFF00]">SE ÎNCARCĂ...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-white/40 mb-4">Utilizator negăsit</p>
        <Link to="/admin/utilizatori" className="text-[#CCFF00]">Înapoi la utilizatori</Link>
      </div>
    );
  }

  const persons = [
    { id: user.id, type: 'user', name: user.name, isUser: true },
    ...(user.children || []).map(c => ({ id: c.id, type: 'child', name: c.name, qr_token: c.qr_token }))
  ];

  return (
    <div className="space-y-6" data-testid="user-detail-page">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            to="/admin/utilizatori" 
            className="text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-bold text-white uppercase">{user.name}</h1>
            <div className="flex items-center gap-4 mt-1">
              {user.email && (
                <span className="text-white/40 text-sm flex items-center gap-1">
                  <Mail size={12} /> {user.email}
                </span>
              )}
              {user.phone && (
                <span className="text-white/40 text-sm flex items-center gap-1">
                  <Phone size={12} /> {user.phone}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="btn-secondary px-4 py-2 flex items-center gap-2 text-sm"
            data-testid="edit-user-button"
          >
            <Edit size={14} />
            Editează
          </button>
          {isOwner && (
            <button
              onClick={() => setShowDeleteUserDialog(true)}
              className="px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors text-sm"
              data-testid="delete-user-button"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap gap-2">
        {user.email && (
          <button
            onClick={handleResendSetup}
            className="btn-secondary px-4 py-2 flex items-center gap-2 text-sm"
            data-testid="resend-setup-button"
          >
            <Send size={14} />
            Retrimite Link Parolă
          </button>
        )}
        <button
          onClick={() => setShowAddChildModal(true)}
          className="btn-secondary px-4 py-2 flex items-center gap-2 text-sm"
          data-testid="add-child-button"
        >
          <Plus size={14} />
          Adaugă Copil
        </button>
        <button
          onClick={() => {
            setNewSubscription({ person_id: user.id, person_type: 'user', plan_id: '' });
            setShowAddSubscriptionModal(true);
          }}
          className="btn-primary px-4 py-2 flex items-center gap-2 text-sm"
          data-testid="add-subscription-button"
        >
          <CreditCard size={14} />
          Vinde Abonament
        </button>
      </div>

      {/* Persons (User + Children) */}
      <div className="space-y-4">
        {persons.map((person) => {
          const active = getActiveSubscription(person.id, person.type);
          const queued = getQueuedSubscription(person.id, person.type);
          
          return (
            <div 
              key={`${person.type}-${person.id}`}
              className="bg-[#0A0A0A] border border-white/5 p-6"
              data-testid={`person-card-${person.id}`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-lg font-bold text-white">{person.name}</h3>
                    <span className={`text-[10px] uppercase px-2 py-0.5 ${
                      person.isUser ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {person.isUser ? 'Adult' : 'Copil'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!person.isUser && (
                    <button
                      onClick={() => setShowDeleteChildDialog(person.id)}
                      className="text-red-400 hover:bg-red-500/10 p-2 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setNewSubscription({ person_id: person.id, person_type: person.type, plan_id: '' });
                      setShowAddSubscriptionModal(true);
                    }}
                    className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1"
                  >
                    <Plus size={12} />
                    Abonament
                  </button>
                </div>
              </div>

              {/* Active Subscription */}
              {active ? (
                <div className="p-4 bg-[#CCFF00]/5 border border-[#CCFF00]/20 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Check size={14} className="text-[#CCFF00]" />
                    <span className="text-[#CCFF00] text-xs uppercase font-bold">Abonament Activ</span>
                  </div>
                  <p className="text-white font-medium">{active.plan_name}</p>
                  <p className="text-white/50 text-sm">{active.location}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    {active.sessions_total && (
                      <span className="text-white/60">
                        {active.sessions_remaining} / {active.sessions_total} ședințe
                      </span>
                    )}
                    {active.expires_at && (
                      <span className="text-white/60 flex items-center gap-1">
                        <Calendar size={12} />
                        Expiră: {new Date(active.expires_at).toLocaleDateString('ro-RO')}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-500/5 border border-red-500/20 mb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-red-400" />
                    <span className="text-red-400 text-sm">Fără abonament activ</span>
                  </div>
                </div>
              )}

              {/* Queued Subscription */}
              {queued && (
                <div className="p-4 bg-blue-500/5 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={14} className="text-blue-400" />
                    <span className="text-blue-400 text-xs uppercase font-bold">În Așteptare</span>
                  </div>
                  <p className="text-white font-medium">{queued.plan_name}</p>
                  <p className="text-white/50 text-sm">{queued.location}</p>
                  <p className="text-white/40 text-xs mt-2">
                    Se va activa automat când abonamentul curent expiră sau se termină.
                  </p>
                </div>
              )}

              {/* QR Code Link */}
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                <QrCode size={14} className="text-white/40" />
                <span className="text-white/40 text-sm">Token QR: </span>
                <code className="text-[#CCFF00] text-xs bg-black/30 px-2 py-1">
                  {person.isUser ? user.qr_token?.substring(0, 16) : person.qr_token?.substring(0, 16)}...
                </code>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit User Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-[#121212] border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl text-white uppercase">
              Editează Utilizator
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4 mt-4">
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Nume</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
                className="w-full bg-transparent border border-white/10 focus:border-[#CCFF00] px-4 py-3 text-white"
              />
            </div>
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Email</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full bg-transparent border border-white/10 focus:border-[#CCFF00] px-4 py-3 text-white"
              />
            </div>
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Telefon</label>
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full bg-transparent border border-white/10 focus:border-[#CCFF00] px-4 py-3 text-white"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 btn-secondary py-3">
                Anulează
              </button>
              <button type="submit" disabled={saving} className="flex-1 btn-primary py-3 disabled:opacity-50">
                {saving ? 'Se salvează...' : 'Salvează'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Child Modal */}
      <Dialog open={showAddChildModal} onOpenChange={setShowAddChildModal}>
        <DialogContent className="bg-[#121212] border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl text-white uppercase">
              Adaugă Copil
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddChild} className="space-y-4 mt-4">
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Nume</label>
              <input
                type="text"
                value={newChild.name}
                onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                required
                className="w-full bg-transparent border border-white/10 focus:border-[#CCFF00] px-4 py-3 text-white"
                placeholder="Nume copil"
              />
            </div>
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Data nașterii (opțional)</label>
              <input
                type="date"
                value={newChild.birth_date}
                onChange={(e) => setNewChild({ ...newChild, birth_date: e.target.value })}
                className="w-full bg-transparent border border-white/10 focus:border-[#CCFF00] px-4 py-3 text-white"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setShowAddChildModal(false)} className="flex-1 btn-secondary py-3">
                Anulează
              </button>
              <button type="submit" disabled={saving} className="flex-1 btn-primary py-3 disabled:opacity-50">
                {saving ? 'Se adaugă...' : 'Adaugă'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Subscription Modal */}
      <Dialog open={showAddSubscriptionModal} onOpenChange={setShowAddSubscriptionModal}>
        <DialogContent className="bg-[#121212] border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl text-white uppercase">
              Vinde Abonament
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubscription} className="space-y-4 mt-4">
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Pentru</label>
              <select
                value={`${newSubscription.person_type}-${newSubscription.person_id}`}
                onChange={(e) => {
                  const [type, id] = e.target.value.split('-');
                  setNewSubscription({ ...newSubscription, person_type: type, person_id: id });
                }}
                className="w-full bg-[#0A0A0A] border border-white/10 px-4 py-3 text-white"
              >
                <option value={`user-${user.id}`}>{user.name} (Adult)</option>
                {user.children?.map(c => (
                  <option key={c.id} value={`child-${c.id}`}>{c.name} (Copil)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Abonament</label>
              <select
                value={newSubscription.plan_id}
                onChange={(e) => setNewSubscription({ ...newSubscription, plan_id: e.target.value })}
                required
                className="w-full bg-[#0A0A0A] border border-white/10 px-4 py-3 text-white"
              >
                <option value="">Selectează abonament</option>
                {plans.map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.activity} - {plan.location} ({plan.price} LEI)
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setShowAddSubscriptionModal(false)} className="flex-1 btn-secondary py-3">
                Anulează
              </button>
              <button type="submit" disabled={saving} className="flex-1 btn-primary py-3 disabled:opacity-50">
                {saving ? 'Se adaugă...' : 'Vinde'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog open={showDeleteUserDialog} onOpenChange={setShowDeleteUserDialog}>
        <AlertDialogContent className="bg-[#121212] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Șterge Utilizator</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Ești sigur că vrei să ștergi acest utilizator? Toate datele asociate (copii, abonamente, prezențe) vor fi șterse permanent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 text-white border-0">Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-500 text-white">
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Child Dialog */}
      <AlertDialog open={!!showDeleteChildDialog} onOpenChange={() => setShowDeleteChildDialog(null)}>
        <AlertDialogContent className="bg-[#121212] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Șterge Copil</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Ești sigur că vrei să ștergi acest copil? Abonamentele asociate vor fi de asemenea șterse.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 text-white border-0">Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeleteChild(showDeleteChildDialog)} className="bg-red-500 text-white">
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserDetailPage;
