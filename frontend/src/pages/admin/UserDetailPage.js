import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usersAPI, subscriptionsAPI, plansAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { 
  ArrowLeft, Mail, Phone, Edit, Trash2, Plus, QrCode, 
  Send, CreditCard, Calendar, AlertTriangle, Clock, 
  Check, X, User as UserIcon, Baby, Shield
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';

const UserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { isOwner: currentIsAdmin } = useAuth();
  
  const [user, setUser] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [showAddSubscriptionModal, setShowAddSubscriptionModal] = useState(false);
  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false);
  const [showDeleteChildDialog, setShowDeleteChildDialog] = useState(null);
  
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', role: 'USER' });
  const [newChild, setNewChild] = useState({ name: '', birth_date: '' });
  const [newSubscription, setNewSubscription] = useState({ person_id: '', person_type: 'child', plan_id: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
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
        phone: userRes.data.phone || '',
        role: userRes.data.role
      });

      // Setăm default person_id pentru abonament nou: primul copil sau user-ul dacă e client
      if (userRes.data.children?.length > 0) {
        setNewSubscription(s => ({ ...s, person_id: userRes.data.children[0].id, person_type: 'child' }));
      } else if (userRes.data.role === 'USER') {
        setNewSubscription(s => ({ ...s, person_id: userRes.data.id, person_type: 'user' }));
      }
    } catch (error) {
      toast.error('Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Logică Discount
  const subscriptionDiscount = useMemo(() => {
    if (newSubscription.person_type !== 'child') return 0;
    const activeSubsForOtherKids = (user?.children || []).filter(c => {
      if (c.id === newSubscription.person_id) return false;
      return subscriptions.some(s => s.person_id === c.id && s.status === 'active');
    });
    return activeSubsForOtherKids.length > 0 ? 0.1 : 0; 
  }, [newSubscription, user, subscriptions]);

  const selectedPlanPrice = useMemo(() => {
    const plan = plans.find(p => p.id === newSubscription.plan_id);
    if (!plan) return 0;
    return plan.price * (1 - subscriptionDiscount);
  }, [newSubscription.plan_id, plans, subscriptionDiscount]);

  // Handlers
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await usersAPI.update(userId, editForm);
      toast.success('Actualizat!');
      setShowEditModal(false);
      fetchData();
    } catch (error) { toast.error('Eroare'); } finally { setSaving(false); }
  };

  const handleDeleteUser = async () => {
    try {
      await usersAPI.delete(userId);
      toast.success('Utilizator șters');
      navigate('/admin/utilizatori');
    } catch (error) { toast.error('Eroare la ștergere'); }
  };

  const handleAddChild = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await usersAPI.addChild(userId, newChild);
      toast.success('Copil adăugat');
      setShowAddChildModal(false);
      setNewChild({ name: '', birth_date: '' });
      fetchData();
    } catch (error) { toast.error('Eroare'); } finally { setSaving(false); }
  };

  const handleDeleteChild = async (childId) => {
    try {
      await usersAPI.deleteChild(userId, childId);
      toast.success('Copil șters');
      setShowDeleteChildDialog(null);
      fetchData();
    } catch (error) { toast.error('Eroare'); }
  };

  const handleAddSubscription = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await subscriptionsAPI.create({
        user_id: userId,
        ...newSubscription,
        final_price: selectedPlanPrice 
      });
      toast.success('Abonament vândut!');
      setShowAddSubscriptionModal(false);
      fetchData();
    } catch (error) { toast.error('Eroare la vânzare'); } finally { setSaving(false); }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-[#6db025] font-heading">ÎNCĂRCARE...</div>;

  // Verificăm dacă persoana curentă ar trebui să aibă UI de abonament
  const shouldShowSubUI = (person) => {
    if (person.type === 'child') return true; // Copiii au mereu abonamente
    return user.role === 'USER'; // Adulții au abonamente doar dacă sunt "Clienți", nu Staff
  };

  const persons = [
    { id: user.id, type: 'user', name: user.name, isUser: true },
    ...(user.children || []).map(c => ({ id: c.id, type: 'child', name: c.name, qr_token: c.qr_token }))
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link to="/admin/utilizatori" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/40 hover:text-[#6db025] transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-3xl font-bold text-white uppercase">{user.name}</h1>
              <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${
                user.role === 'OWNER' ? 'bg-purple-500/20 text-purple-400' : 
                user.role === 'COACH' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white/40'
              }`}>
                {user.role}
              </span>
            </div>
            <div className="flex gap-4 mt-1">
               {user.email && <span className="text-white/40 text-xs flex items-center gap-1.5"><Mail size={12} /> {user.email}</span>}
               {user.phone && <span className="text-white/40 text-xs flex items-center gap-1.5"><Phone size={12} /> {user.phone}</span>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowEditModal(true)} className="btn-secondary px-4 py-2 flex items-center gap-2 text-xs font-bold uppercase"><Edit size={14} /> Edit</button>
          {currentIsAdmin && <button onClick={() => setShowDeleteUserDialog(true)} className="p-2 text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={16} /></button>}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <button onClick={() => setShowAddChildModal(true)} className="flex items-center justify-center gap-2 p-4 bg-[#0A0A0A] border border-white/5 text-white/60 hover:text-[#6db025] transition-all text-xs font-bold uppercase tracking-widest"><Plus size={16} /> Adaugă Copil</button>
        {/* Butonul de vânzare apare doar dacă există cineva care poate primi abonament (copii sau adult client) */}
        {(user.role === 'USER' || user.children?.length > 0) && (
          <button onClick={() => setShowAddSubscriptionModal(true)} className="flex items-center justify-center gap-2 p-4 bg-[#6db025]/10 border border-[#6db025]/20 text-[#6db025] hover:bg-[#6db025] hover:text-black transition-all text-xs font-bold uppercase tracking-widest"><CreditCard size={16} /> Vinde Abonament</button>
        )}
      </div>

      {/* Listă Membri Familie */}
      <div className="space-y-4">
        {persons.map((person) => {
          const active = subscriptions.find(s => s.person_id === person.id && s.status === 'active');
          const isStaff = person.isUser && (user.role === 'OWNER' || user.role === 'COACH');
          const needsSub = shouldShowSubUI(person);

          return (
            <div key={`${person.type}-${person.id}`} className="bg-[#0A0A0A] border border-white/5 p-6 rounded-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${person.isUser ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                    {isStaff ? <Shield size={20} /> : person.isUser ? <UserIcon size={20} /> : <Baby size={20} />}
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold text-white uppercase">{person.name}</h3>
                    <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">
                      {person.isUser ? `Titular (${user.role})` : 'Copil'}
                    </p>
                  </div>
                </div>

                {/* Secțiunea de Abonamente - Se afișează doar pentru Clienți și Copii */}
                {needsSub ? (
                  <div className="flex-1 max-w-md">
                    {active ? (
                      <div className="p-4 bg-[#6db025]/5 border border-[#6db025]/20">
                        <div className="flex justify-between mb-1">
                          <span className="text-[#6db025] text-[10px] font-black uppercase flex items-center gap-1.5"><Check size={12} /> Abonament Activ</span>
                          <span className="text-white/20 text-[10px] uppercase font-bold">{active.location}</span>
                        </div>
                        <p className="text-white font-bold text-sm uppercase">{active.plan_name}</p>
                        <p className="text-white/40 text-xs mt-1">{active.sessions_remaining} / {active.sessions_total} ședințe rămase</p>
                      </div>
                    ) : (
                      <div className="p-4 bg-white/[0.02] border border-white/5 flex items-center gap-3">
                        <AlertTriangle size={14} className="text-white/20" />
                        <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">Fără abonament activ</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 max-w-md p-4 border border-white/5 bg-white/[0.01] text-white/20 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <Shield size={14} /> Cont de administrare (fără abonament)
                  </div>
                )}

                {!person.isUser && (
                  <button onClick={() => setShowDeleteChildDialog(person.id)} className="text-white/10 hover:text-red-500 transition-colors p-2"><Trash2 size={16} /></button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Vânzare Abonament - Optimizat */}
      <Dialog open={showAddSubscriptionModal} onOpenChange={setShowAddSubscriptionModal}>
        <DialogContent className="bg-[#121212] border-white/10 max-w-md p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="p-6 border-b border-white/5"><DialogTitle className="text-white uppercase font-heading text-xl">Vânzare Abonament</DialogTitle></DialogHeader>
          <form onSubmit={handleAddSubscription} className="p-6 space-y-5">
            <div>
              <label className="text-white/30 text-[10px] font-black uppercase mb-1.5 block">Cumpărător</label>
              <select 
                value={`${newSubscription.person_type}-${newSubscription.person_id}`} 
                onChange={(e) => { const [type, id] = e.target.value.split('-'); setNewSubscription({ ...newSubscription, person_type: type, person_id: id }); }}
                className="w-full bg-[#0A0A0A] border border-white/10 p-4 text-white outline-none focus:border-[#6db025]"
              >
                {/* Arătăm adultul doar dacă nu e staff */}
                {user.role === 'USER' && <option value={`user-${user.id}`}>{user.name} (Adult)</option>}
                {user.children?.map(c => <option key={c.id} value={`child-${c.id}`}>{c.name} (Copil)</option>)}
              </select>
            </div>

            <div>
              <label className="text-white/30 text-[10px] font-black uppercase mb-1.5 block">Plan Abonament</label>
              <select 
                value={newSubscription.plan_id} required
                onChange={(e) => setNewSubscription({ ...newSubscription, plan_id: e.target.value })}
                className="w-full bg-[#0A0A0A] border border-white/10 p-4 text-white outline-none focus:border-[#6db025]"
              >
                <option value="">Alege oferta...</option>
                {plans.map(p => <option key={p.id} value={p.id}>{p.activity} - {p.price} LEI</option>)}
              </select>
            </div>

            {newSubscription.plan_id && (
               <div className="p-4 bg-[#6db025]/5 border border-[#6db025]/10 rounded-sm">
                  <div className="flex justify-between text-[10px] text-white/40 uppercase font-black"><span>Preț Standard:</span><span>{plans.find(p => p.id === newSubscription.plan_id)?.price} LEI</span></div>
                  {subscriptionDiscount > 0 && <div className="flex justify-between text-[10px] text-[#6db025] uppercase font-black mt-1"><span>Discount Familie (10%):</span><span>-{plans.find(p => p.id === newSubscription.plan_id)?.price * 0.1} LEI</span></div>}
                  <div className="flex justify-between pt-3 mt-3 border-t border-white/10 text-white font-black text-xl uppercase italic"><span>Total:</span><span className="text-[#6db025]">{selectedPlanPrice} LEI</span></div>
               </div>
            )}

            <button type="submit" disabled={saving || !newSubscription.plan_id} className="btn-primary w-full py-5 text-sm font-black uppercase tracking-widest disabled:opacity-20">{saving ? 'SE PROCESEAZĂ...' : 'FINALIZEAZĂ VÂNZAREA'}</button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Profil Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-[#121212] border-white/10 p-8 shadow-2xl">
          <DialogHeader><DialogTitle className="text-white uppercase font-heading text-xl">Modificare Profil</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4 mt-6">
            <div className="space-y-1">
              <label className="text-[10px] text-white/20 uppercase font-black pl-1">Nume Complet</label>
              <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required className="w-full bg-[#0A0A0A] border border-white/10 p-4 text-white focus:border-[#6db025] outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-white/20 uppercase font-black pl-1">Rol Sistem</label>
              <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="w-full bg-[#0A0A0A] border border-white/10 p-4 text-white outline-none">
                <option value="USER">Client (Părinte)</option>
                <option value="COACH">Antrenor</option>
                <option value="OWNER">Administrator</option>
              </select>
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full py-4 uppercase font-black tracking-widest mt-4">{saving ? 'Salvare...' : 'Actualizează'}</button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Adăugare Copil */}
      <Dialog open={showAddChildModal} onOpenChange={setShowAddChildModal}>
        <DialogContent className="bg-[#121212] border-white/10 p-8 shadow-2xl">
          <DialogHeader><DialogTitle className="text-white uppercase font-heading text-xl">Adăugare Copil</DialogTitle></DialogHeader>
          <form onSubmit={handleAddChild} className="space-y-4 mt-6">
            <input type="text" value={newChild.name} onChange={(e) => setNewChild({ ...newChild, name: e.target.value })} required className="w-full bg-[#0A0A0A] border border-white/10 p-4 text-white focus:border-[#6db025] outline-none placeholder:text-white/10" placeholder="Numele copilului" />
            <input type="date" value={newChild.birth_date} onChange={(e) => setNewChild({ ...newChild, birth_date: e.target.value })} className="w-full bg-[#0A0A0A] border border-white/10 p-4 text-white focus:border-[#6db025] outline-none" />
            <button type="submit" disabled={saving} className="btn-primary w-full py-4 uppercase font-black tracking-widest mt-4">Confirmă</button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialoguri Confirmare Ștergere */}
      <AlertDialog open={showDeleteUserDialog} onOpenChange={setShowDeleteUserDialog}>
        <AlertDialogContent className="bg-[#121212] border-white/10"><AlertDialogHeader><AlertDialogTitle className="text-white uppercase font-heading text-red-500">Eliminare Cont?</AlertDialogTitle><AlertDialogDescription className="text-white/40 text-sm">Toate datele acestui utilizator vor fi șterse din sistem.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="bg-white/5 border-0 text-white">Anulează</AlertDialogCancel><AlertDialogAction onClick={handleDeleteUser} className="bg-red-500 text-white">Șterge</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!showDeleteChildDialog} onOpenChange={() => setShowDeleteChildDialog(null)}>
        <AlertDialogContent className="bg-[#121212] border-white/10"><AlertDialogHeader><AlertDialogTitle className="text-white uppercase font-heading">Șterge Copilul</AlertDialogTitle><AlertDialogDescription className="text-white/40 text-sm">Vei elimina înregistrarea acestui copil.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="bg-white/5 border-0 text-white">Anulează</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteChild(showDeleteChildDialog)} className="bg-red-500 text-white">Șterge</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserDetailPage;