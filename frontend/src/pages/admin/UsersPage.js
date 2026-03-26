import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { Search, Plus, ChevronRight, Mail, Users as UsersIcon, UserPlus, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';

const roleLabels = { OWNER: 'Proprietar', COACH: 'Antrenor', USER: 'Utilizator' };

const UsersPage = () => {
  const { isOwner } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'USER' });
  const [creating, setCreating] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const response = await usersAPI.getAll(params);
      setUsers(response.data);
    } catch (error) {
      toast.error('Eroare la încărcarea utilizatorilor');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    const delay = setTimeout(fetchUsers, 300);
    return () => clearTimeout(delay);
  }, [fetchUsers]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await usersAPI.create(newUser);
      toast.success('Utilizator creat cu succes!');
      setShowCreateModal(false);
      setNewUser({ name: '', email: '', role: 'USER' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Eroare la creare');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white uppercase">Utilizatori</h1>
          <p className="text-white/40 text-sm mt-1">Gestionează utilizatorii și conturile</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary px-4 py-2 flex items-center gap-2">
          <Plus size={16} /> Adaugă Utilizator
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input 
            type="text" placeholder="Caută după nume sau email..." value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full bg-[#0A0A0A] border border-white/10 focus:border-[#CCFF00] pl-12 pr-4 py-3 text-white transition-colors" 
          />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="bg-[#0A0A0A] border border-white/10 px-4 py-3 text-white min-w-[150px]">
          <option value="">Toate rolurile</option>
          <option value="USER">Utilizatori</option>
          <option value="COACH">Antrenori</option>
          <option value="OWNER">Proprietari</option>
        </select>
      </div>

      <div className="bg-[#0A0A0A] border border-white/5 divide-y divide-white/5">
        {loading ? (
          <div className="p-8 text-center text-[#CCFF00] animate-pulse">SE ÎNCARCĂ...</div>
        ) : users.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center gap-4">
             <AlertCircle size={40} className="text-white/10" />
             <p className="text-white/40">Nu au fost găsiți utilizatori</p>
          </div>
        ) : users.map((user) => (
          <Link key={user.id} to={`/admin/utilizatori/${user.id}`} className="flex items-center gap-4 p-4 hover:bg-white/5 group">
            {/* Restaurat: Iconița verde cu litera numelui */}
            <div className="w-10 h-10 bg-[#CCFF00]/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-[#CCFF00] font-bold uppercase">{user.name?.charAt(0) || 'U'}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-white font-medium truncate">{user.name}</p>
                {/* Restaurat: Tag-uri colorate Mov/Albastru */}
                {user.role !== 'USER' && (
                  <span className={`text-[10px] uppercase px-2 py-0.5 font-bold ${
                    user.role === 'OWNER' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {roleLabels[user.role]}
                  </span>
                )}
                {user.marked_for_deletion && (
                  <span className="text-[10px] uppercase px-2 py-0.5 bg-red-500/20 text-red-400">Inactiv</span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-1">
                {user.email && <span className="text-white/40 text-xs flex items-center gap-1"><Mail size={10} />{user.email}</span>}
                {user.children?.length > 0 && <span className="text-white/40 text-xs flex items-center gap-1"><UsersIcon size={10} />{user.children.length} copii</span>}
              </div>
            </div>
            <ChevronRight size={16} className="text-white/20 group-hover:text-[#CCFF00]" />
          </Link>
        ))}
      </div>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-[#121212] border-white/10 max-w-md">
          <DialogHeader><DialogTitle className="text-white uppercase">Adaugă Utilizator</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-4">
            <input type="text" placeholder="Nume complet" required value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} className="w-full bg-[#0A0A0A] border border-white/10 p-3 text-white" />
            <input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="w-full bg-[#0A0A0A] border border-white/10 p-3 text-white" />
            {isOwner && (
              <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})} className="w-full bg-[#0A0A0A] border border-white/10 p-3 text-white">
                <option value="USER">Utilizator</option>
                <option value="COACH">Antrenor</option>
                <option value="OWNER">Proprietar</option>
              </select>
            )}
            <button type="submit" disabled={creating} className="btn-primary w-full py-4 uppercase font-bold">{creating ? 'Se creează...' : 'Creează'}</button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;