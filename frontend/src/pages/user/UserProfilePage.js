import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI, usersAPI } from '../../lib/api';
import { toast } from 'sonner';
import { User, Mail, Phone, Edit, Plus, Save } from 'lucide-react';
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
      toast.success('Profil actualizat!');
      setEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Eroare la actualizare');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateChild = async (childId) => {
    if (!childForm.name.trim()) return;
    
    setSaving(true);
    try {
      await usersAPI.updateChild(user.id, childId, { name: childForm.name });
      // Refresh user data
      const response = await authAPI.getMe();
      updateUser(response.data);
      toast.success('Nume copil actualizat!');
      setEditingChildId(null);
    } catch (error) {
      toast.error('Eroare la actualizare');
    } finally {
      setSaving(false);
    }
  };

  const openChildEdit = (child) => {
    setChildForm({ name: child.name });
    setEditingChildId(child.id);
  };

  return (
    <div className="space-y-6" data-testid="user-profile-page">
      {/* Profile Card */}
      <div className="bg-[#0A0A0A] border border-white/5 p-6">
        <div className="flex items-start justify-between mb-6">
          <h2 className="font-heading text-xl font-bold text-white uppercase">Profilul Meu</h2>
          <button
            onClick={() => {
              setForm({
                name: user?.name || '',
                email: user?.email || '',
                phone: user?.phone || ''
              });
              setEditing(true);
            }}
            className="btn-secondary px-4 py-2 flex items-center gap-2 text-sm"
            data-testid="edit-profile-button"
          >
            <Edit size={14} />
            Editează
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-[#121212] border border-white/5">
            <div className="w-10 h-10 bg-[#CCFF00]/10 flex items-center justify-center">
              <User size={18} className="text-[#CCFF00]" />
            </div>
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider">Nume</p>
              <p className="text-white font-medium">{user?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-[#121212] border border-white/5">
            <div className="w-10 h-10 bg-[#CCFF00]/10 flex items-center justify-center">
              <Mail size={18} className="text-[#CCFF00]" />
            </div>
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider">Email</p>
              <p className="text-white font-medium">{user?.email || 'Nesetat'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-[#121212] border border-white/5">
            <div className="w-10 h-10 bg-[#CCFF00]/10 flex items-center justify-center">
              <Phone size={18} className="text-[#CCFF00]" />
            </div>
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider">Telefon</p>
              <p className="text-white font-medium">{user?.phone || 'Nesetat'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Children */}
      {user?.children && user.children.length > 0 && (
        <div className="bg-[#0A0A0A] border border-white/5 p-6">
          <h2 className="font-heading text-xl font-bold text-white uppercase mb-6">Copiii Mei</h2>
          <div className="space-y-3">
            {user.children.map((child) => (
              <div
                key={child.id}
                className="flex items-center justify-between p-4 bg-[#121212] border border-white/5"
                data-testid={`child-${child.id}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-500/20 flex items-center justify-center rounded-full">
                    <span className="text-purple-400 font-bold">{child.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{child.name}</p>
                    {child.birth_date && (
                      <p className="text-white/40 text-xs">
                        Data nașterii: {new Date(child.birth_date).toLocaleDateString('ro-RO')}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => openChildEdit(child)}
                  className="text-white/40 hover:text-white p-2 transition-colors"
                >
                  <Edit size={14} />
                </button>
              </div>
            ))}
          </div>
          <p className="text-white/30 text-xs mt-4">
            Pentru a adăuga sau șterge copii, contactează administrația clubului.
          </p>
        </div>
      )}

      {/* Edit Profile Modal */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="bg-[#121212] border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl text-white uppercase">
              Editează Profilul
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-4">
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Nume</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-transparent border border-white/10 focus:border-[#CCFF00] px-4 py-3 text-white"
              />
            </div>
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-transparent border border-white/10 focus:border-[#CCFF00] px-4 py-3 text-white"
              />
            </div>
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Telefon</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-transparent border border-white/10 focus:border-[#CCFF00] px-4 py-3 text-white"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setEditing(false)} className="flex-1 btn-secondary py-3">
                Anulează
              </button>
              <button type="submit" disabled={saving} className="flex-1 btn-primary py-3 disabled:opacity-50">
                {saving ? 'Se salvează...' : 'Salvează'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Child Modal */}
      <Dialog open={!!editingChildId} onOpenChange={() => setEditingChildId(null)}>
        <DialogContent className="bg-[#121212] border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl text-white uppercase">
              Editează Nume Copil
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Nume</label>
              <input
                type="text"
                value={childForm.name}
                onChange={(e) => setChildForm({ name: e.target.value })}
                className="w-full bg-transparent border border-white/10 focus:border-[#CCFF00] px-4 py-3 text-white"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setEditingChildId(null)} className="flex-1 btn-secondary py-3">
                Anulează
              </button>
              <button 
                onClick={() => handleUpdateChild(editingChildId)} 
                disabled={saving}
                className="flex-1 btn-primary py-3 disabled:opacity-50"
              >
                {saving ? 'Se salvează...' : 'Salvează'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserProfilePage;
