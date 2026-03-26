import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI, usersAPI } from '../../lib/api';
import { toast } from 'sonner';
import { User, Mail, Phone, Edit, Save, Baby } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';

const UserProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editingChildId, setEditingChildId] = useState(null);
  
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  
  const [childForm, setChildForm] = useState({ name: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await authAPI.updateMe(form);
      updateUser(response.data);
      toast.success('Profilul a fost actualizat cu succes!');
      setEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Eroare la actualizare');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateChild = async (e) => {
    e.preventDefault();
    if (!childForm.name.trim()) return;
    
    setSaving(true);
    try {
      await usersAPI.updateChild(user.id, editingChildId, { name: childForm.name });
      const response = await authAPI.getMe();
      updateUser(response.data);
      toast.success('Numele copilului a fost modificat!');
      setEditingChildId(null);
    } catch (error) {
      toast.error('Eroare la actualizarea datelor copilului');
    } finally {
      setSaving(false);
    }
  };

  const openChildEdit = (child) => {
    setChildForm({ name: child.name });
    setEditingChildId(child.id);
  };

  return (
    <div className="space-y-6">
      {/* Header Mobile / Desktop */}
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-white uppercase tracking-tight">Setări Cont</h1>
        <p className="text-white/40 text-sm mt-1">Gestionează datele tale și ale familiei tale</p>
      </div>

      {/* Profilul Meu */}
      <div className="bg-[#0A0A0A] border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-start justify-between bg-white/[0.02]">
          <div>
            <h2 className="font-heading text-lg font-bold text-white uppercase tracking-widest">Datele Tale</h2>
            <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mt-1">Titular Abonament</p>
          </div>
          <button
            onClick={() => {
              setForm({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
              setEditing(true);
            }}
            className="text-white/40 hover:text-[#CCFF00] p-2 bg-white/5 hover:bg-[#CCFF00]/10 transition-colors rounded-sm"
          >
            <Edit size={16} />
          </button>
        </div>

        <div className="divide-y divide-white/5">
          <div className="flex items-center gap-4 p-6">
            <div className="w-12 h-12 bg-[#CCFF00]/10 flex items-center justify-center border border-[#CCFF00]/20">
              <User size={20} className="text-[#CCFF00]" />
            </div>
            <div>
              <p className="text-white/30 text-[10px] uppercase font-black tracking-widest mb-1">Nume Complet</p>
              <p className="text-white font-bold uppercase tracking-wide text-sm">{user?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-6">
            <div className="w-12 h-12 bg-[#CCFF00]/10 flex items-center justify-center border border-[#CCFF00]/20">
              <Mail size={20} className="text-[#CCFF00]" />
            </div>
            <div>
              <p className="text-white/30 text-[10px] uppercase font-black tracking-widest mb-1">Adresa Email</p>
              <p className="text-white font-bold tracking-wide text-sm">{user?.email || 'Nespecificat'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-6">
            <div className="w-12 h-12 bg-[#CCFF00]/10 flex items-center justify-center border border-[#CCFF00]/20">
              <Phone size={20} className="text-[#CCFF00]" />
            </div>
            <div>
              <p className="text-white/30 text-[10px] uppercase font-black tracking-widest mb-1">Număr Telefon</p>
              <p className="text-white font-bold tracking-wide text-sm">{user?.phone || 'Nespecificat'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Secțiunea Copii */}
      {user?.children && user.children.length > 0 && (
        <div className="bg-[#0A0A0A] border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-white/[0.02]">
             <h2 className="font-heading text-lg font-bold text-white uppercase tracking-widest">Membri Familie</h2>
             <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mt-1">Copii Înscriși</p>
          </div>
          
          <div className="divide-y divide-white/5">
            {user.children.map((child) => (
              <div key={child.id} className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Baby size={20} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold uppercase tracking-wide text-sm">{child.name}</p>
                    {child.birth_date && (
                      <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-1">
                        Născut: {new Date(child.birth_date).toLocaleDateString('ro-RO')}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => openChildEdit(child)}
                  className="text-white/40 hover:text-purple-400 p-2 bg-white/5 hover:bg-purple-500/10 transition-colors rounded-sm"
                >
                  <Edit size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mesaj informativ pentru adăugare */}
      <div className="bg-white/[0.02] border border-white/5 p-4 text-center">
         <p className="text-white/40 text-[10px] uppercase font-black tracking-widest">Ai nevoie să adaugi un membru nou?</p>
         <p className="text-white/30 text-[10px] mt-1">Te rugăm să contactezi antrenorul tău la următorul curs.</p>
      </div>

      {/* Modal Editare Profil Adult */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="bg-[#121212] border-white/10 p-0 shadow-2xl overflow-hidden max-w-sm">
          <DialogHeader className="p-6 border-b border-white/5 bg-white/[0.02]">
            <DialogTitle className="font-heading text-xl text-white uppercase tracking-tight">Editare Date Profil</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="text-white/30 text-[10px] font-black uppercase tracking-widest">Nume Complet</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-[#0A0A0A] border border-white/10 focus:border-[#CCFF00] p-4 text-white outline-none" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-white/30 text-[10px] font-black uppercase tracking-widest">Adresă de Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-[#0A0A0A] border border-white/10 focus:border-[#CCFF00] p-4 text-white outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-white/30 text-[10px] font-black uppercase tracking-widest">Număr de Telefon</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-[#0A0A0A] border border-white/10 focus:border-[#CCFF00] p-4 text-white outline-none" />
            </div>
            
            <button type="submit" disabled={saving} className="btn-primary w-full py-4 text-[10px] font-black uppercase tracking-widest mt-4 flex items-center justify-center gap-2">
              <Save size={16} /> {saving ? 'Se procesează...' : 'Salvează Modificările'}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Editare Nume Copil */}
      <Dialog open={!!editingChildId} onOpenChange={() => setEditingChildId(null)}>
        <DialogContent className="bg-[#121212] border-white/10 p-0 shadow-2xl overflow-hidden max-w-sm">
          <DialogHeader className="p-6 border-b border-white/5 bg-white/[0.02]">
            <DialogTitle className="font-heading text-xl text-white uppercase tracking-tight">Corectare Nume Copil</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateChild} className="p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="text-white/30 text-[10px] font-black uppercase tracking-widest">Nume Complet Copil</label>
              <input type="text" value={childForm.name} onChange={(e) => setChildForm({ name: e.target.value })} className="w-full bg-[#0A0A0A] border border-purple-500/30 focus:border-purple-500 p-4 text-white outline-none" required />
            </div>
            <button type="submit" disabled={saving} className="w-full py-4 bg-purple-500 hover:bg-purple-400 text-white font-black uppercase text-[10px] tracking-widest transition-colors flex items-center justify-center gap-2 mt-4">
              <Save size={16} /> {saving ? 'Se procesează...' : 'Salvează Modificarea'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserProfilePage;