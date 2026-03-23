import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Search, 
  Plus, 
  ChevronRight, 
  User, 
  Mail, 
  Phone,
  Shield,
  Users as UsersIcon,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';

const roleLabels = {
  OWNER: 'Proprietar',
  COACH: 'Antrenor',
  USER: 'Utilizator'
};

const UsersPage = () => {
  const { isOwner } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', role: 'USER' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const fetchUsers = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      
      const response = await usersAPI.getAll(params);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Eroare la încărcarea utilizatorilor');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      await usersAPI.create(newUser);
      toast.success('Utilizator creat cu succes!');
      setShowCreateModal(false);
      setNewUser({ name: '', email: '', phone: '', role: 'USER' });
      fetchUsers();
    } catch (error) {
      const message = error.response?.data?.detail || 'Eroare la crearea utilizatorului';
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="users-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white uppercase">Utilizatori</h1>
          <p className="text-white/40 text-sm mt-1">Gestionează utilizatorii și conturile</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary px-4 py-2 flex items-center gap-2"
          data-testid="create-user-button"
        >
          <Plus size={16} />
          Adaugă Utilizator
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input
            type="text"
            placeholder="Caută după nume sau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-white/10 focus:border-[#CCFF00] pl-12 pr-4 py-3 text-white placeholder:text-white/30 transition-colors"
            data-testid="users-search"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-[#0A0A0A] border border-white/10 px-4 py-3 text-white min-w-[150px]"
          data-testid="users-role-filter"
        >
          <option value="">Toate rolurile</option>
          <option value="USER">Utilizatori</option>
          <option value="COACH">Antrenori</option>
          <option value="OWNER">Proprietari</option>
        </select>
      </div>

      {/* Users List */}
      <div className="bg-[#0A0A0A] border border-white/5">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-pulse text-[#CCFF00]">SE ÎNCARCĂ...</div>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-white/40">
            Nu au fost găsiți utilizatori
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {users.map((user) => (
              <Link
                key={user.id}
                to={`/admin/utilizatori/${user.id}`}
                className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors group"
                data-testid={`user-row-${user.id}`}
              >
                <div className="w-10 h-10 bg-[#CCFF00]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-[#CCFF00] font-bold">
                    {user.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium truncate">{user.name}</p>
                    {user.role !== 'USER' && (
                      <span className={`text-[10px] uppercase px-2 py-0.5 ${
                        user.role === 'OWNER' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {roleLabels[user.role]}
                      </span>
                    )}
                    {user.marked_for_deletion && (
                      <span className="text-[10px] uppercase px-2 py-0.5 bg-red-500/20 text-red-400">
                        Inactiv
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    {user.email && (
                      <span className="text-white/40 text-xs flex items-center gap-1">
                        <Mail size={10} />
                        {user.email}
                      </span>
                    )}
                    {user.phone && (
                      <span className="text-white/40 text-xs flex items-center gap-1">
                        <Phone size={10} />
                        {user.phone}
                      </span>
                    )}
                    {user.children?.length > 0 && (
                      <span className="text-white/40 text-xs flex items-center gap-1">
                        <UsersIcon size={10} />
                        {user.children.length} {user.children.length === 1 ? 'copil' : 'copii'}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight size={16} className="text-white/20 group-hover:text-[#CCFF00] transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-[#121212] border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl text-white uppercase">
              Adaugă Utilizator
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-4" data-testid="create-user-form">
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">
                Nume *
              </label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
                className="w-full bg-transparent border border-white/10 focus:border-[#CCFF00] px-4 py-3 text-white"
                placeholder="Nume complet"
                data-testid="create-user-name"
              />
            </div>
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">
                Email (opțional)
              </label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full bg-transparent border border-white/10 focus:border-[#CCFF00] px-4 py-3 text-white"
                placeholder="adresa@email.ro"
                data-testid="create-user-email"
              />
              <p className="text-white/30 text-xs mt-1">
                Dacă adaugi email, utilizatorul va primi un link pentru setarea parolei.
              </p>
            </div>
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">
                Telefon (opțional)
              </label>
              <input
                type="tel"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                className="w-full bg-transparent border border-white/10 focus:border-[#CCFF00] px-4 py-3 text-white"
                placeholder="07XX XXX XXX"
                data-testid="create-user-phone"
              />
            </div>
            {isOwner && (
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">
                  Rol
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-white/10 px-4 py-3 text-white"
                  data-testid="create-user-role"
                >
                  <option value="USER">Utilizator</option>
                  <option value="COACH">Antrenor</option>
                  <option value="OWNER">Proprietar</option>
                </select>
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 btn-secondary py-3"
              >
                Anulează
              </button>
              <button
                type="submit"
                disabled={creating}
                className="flex-1 btn-primary py-3 disabled:opacity-50"
                data-testid="create-user-submit"
              >
                {creating ? 'Se creează...' : 'Creează'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
