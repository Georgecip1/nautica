import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Search, Plus, ChevronRight, Mail, Users as UsersIcon, 
  AlertCircle, ChevronLeft, Filter, ChevronsLeft, ChevronsRight 
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';

const roleLabels = { OWNER: 'Proprietar', COACH: 'Antrenor', USER: 'Utilizator' };

const UsersPage = () => {
  const { isOwner } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Paginare & Filtre
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name_asc');
  const [roleFilter, setRoleFilter] = useState('');
  
  // Modale
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'USER', is_shared_family: false });
  const [creating, setCreating] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Dacă e selectat "problems_first", trimitem parametrul special backend-ului
      const isProblemsFirst = sortBy === 'problems_first';
      
      const response = await usersAPI.getAll({
        page,
        limit,
        search,
        sort_by: isProblemsFirst ? 'name_asc' : sortBy, 
        filter_status: isProblemsFirst ? 'problems' : undefined,
        role: roleFilter || undefined
      });

      setUsers(response.data.data || []);
      setTotalPages(response.data.total_pages || 1);
      setTotalUsers(response.data.total || 0);
    } catch (error) {
      toast.error('Eroare la încărcarea utilizatorilor');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, roleFilter]);

  // Debounce pentru căutare
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      // FIX 400 Bad Request: Dacă emailul e gol, îl trimitem ca null pentru ca Pydantic să nu dea crash pe EmailStr
      const payload = {
        ...newUser,
        email: newUser.email.trim() === '' ? null : newUser.email.trim()
      };

      await usersAPI.create(payload);
      toast.success('Utilizator creat cu succes!');
      setShowCreateModal(false);
      setNewUser({ name: '', email: '', role: 'USER', is_shared_family: false });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Eroare la creare');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white uppercase">Utilizatori</h1>
          <p className="text-white/40 text-sm mt-1">Gestionează clienții și personalul ({totalUsers} total)</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-[#6db025] hover:bg-opacity-90 text-white rounded flex items-center gap-2 font-bold uppercase tracking-widest text-xs transition-colors">
          <Plus size={16} /> Adaugă Utilizator
        </button>
      </div>

      {/* Bara de Filtre */}
      <div className="bg-[#0A0A0A] border border-white/5 p-4 rounded flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Caută după nume sau email..."
            className="w-full bg-[#121212] border border-white/10 pl-10 pr-4 py-2.5 rounded text-white focus:border-[#6db025] outline-none transition-colors text-sm placeholder:text-white/30"
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-[#121212] border border-white/10 rounded px-3">
            <Filter size={14} className="text-white/40" />
            <select 
              value={roleFilter} 
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="bg-transparent text-white/60 text-sm py-2.5 outline-none cursor-pointer"
            >
              <option value="">Toate Rolurile</option>
              <option value="USER">Clienți</option>
              <option value="COACH">Antrenori</option>
              <option value="OWNER">Administratori</option>
            </select>
          </div>

          <select 
            value={sortBy} 
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="bg-[#121212] border border-white/10 text-white/60 text-sm py-2.5 px-3 rounded outline-none cursor-pointer focus:border-[#6db025]"
          >
            <option value="name_asc">A-Z (Nume)</option>
            <option value="name_desc">Z-A (Nume)</option>
            <option value="newest">Cei mai noi</option>
            <option value="problems_first">Cu probleme primii</option>
          </select>
        </div>
      </div>

      {/* Lista de Utilizatori */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded divide-y divide-white/5">
        {loading && users.length === 0 ? (
          <div className="p-16 text-center text-[#6db025] animate-pulse font-bold tracking-widest text-xs uppercase">Se preiau datele...</div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center gap-4">
             <AlertCircle size={40} className="text-white/10" />
             <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Niciun utilizator găsit</p>
          </div>
        ) : users.map((u) => (
          <Link key={u.id} to={`/admin/utilizatori/${u.id}`} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors group">
            <div className="relative w-10 h-10 bg-[#6db025]/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[#6db025]/20 transition-colors">
              <span className="text-[#6db025] font-bold uppercase">{u.name?.charAt(0) || 'U'}</span>
              {/* Punct colorat pentru probleme */}
              {u.status_color === 'red' && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-[#0A0A0A] rounded-full" title="Abonament Expirat"></span>}
              {u.status_color === 'yellow' && <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 border-2 border-[#0A0A0A] rounded-full" title="Atenție Necesară"></span>}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-white font-medium truncate">{u.name}</p>
                {u.role !== 'USER' && (
                  <span className={`text-[9px] uppercase px-2 py-0.5 rounded font-black tracking-widest ${
                    u.role === 'OWNER' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {roleLabels[u.role]}
                  </span>
                )}
                {u.is_shared_family && (
                  <span className="text-[9px] uppercase px-2 py-0.5 bg-blue-500/10 text-blue-400 font-black tracking-widest rounded">Familie (Shared)</span>
                )}
                {u.marked_for_deletion && (
                  <span className="text-[9px] uppercase px-2 py-0.5 bg-red-500/20 text-red-400 font-black tracking-widest rounded">Inactiv</span>
                )}
              </div>
              <div className="flex items-center gap-4 text-white/40 text-xs">
                {u.email ? (
                  <span className="flex items-center gap-1.5"><Mail size={12} />{u.email}</span>
                ) : (
                  <span className="flex items-center gap-1.5 opacity-50"><Mail size={12} />Fără email</span>
                )}
                {u.children?.length > 0 && <span className="flex items-center gap-1.5 text-[#6db025]/60"><UsersIcon size={12} />{u.children.length} copii</span>}
              </div>
            </div>
            <ChevronRight size={16} className="text-white/20 group-hover:text-[#6db025] transition-colors" />
          </Link>
        ))}
      </div>

      {/* Controale de Paginare Komplexe */}
      {totalPages > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between bg-[#0A0A0A] border border-white/5 p-4 rounded gap-4">
          <div className="text-white/40 text-xs font-bold uppercase tracking-widest">
            Pagina <span className="text-white">{page}</span> din <span className="text-white">{totalPages}</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            {/* Prima pagina */}
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="p-2 rounded bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 transition-colors"
            >
              <ChevronsLeft size={16} />
            </button>
            {/* Pagina anterioara */}
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            
            {/* Selector rezultate per pagina */}
            <div className="flex items-center bg-[#121212] border border-white/10 rounded px-2 mx-1">
               <select 
                 value={limit} 
                 onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                 className="bg-transparent text-white/60 text-xs font-bold uppercase tracking-widest outline-none cursor-pointer py-2"
               >
                 <option value="15">15 / pag</option>
                 <option value="30">30 / pag</option>
                 <option value="50">50 / pag</option>
               </select>
            </div>

            {/* Pagina urmatoare */}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
            {/* Ultima pagina */}
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="p-2 rounded bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 transition-colors"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modal Adaugare Utilizator */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-[#121212] border-white/10 max-w-md rounded-xl p-0 shadow-2xl">
          <DialogHeader className="p-6 border-b border-white/5">
            <DialogTitle className="text-white uppercase font-heading text-xl">Adaugă Utilizator</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="p-6 space-y-4">
            <div>
              <label className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1.5 block">Nume Complet</label>
              <input type="text" placeholder="Ex: Ion Popescu" required value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} className="w-full bg-[#0A0A0A] border border-white/10 rounded p-4 text-white focus:border-[#6db025] outline-none transition-colors" />
            </div>
            
            <div>
              <label className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1.5 block">Adresă Email (Opțional)</label>
              <input type="email" placeholder="Fără email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="w-full bg-[#0A0A0A] border border-white/10 rounded p-4 text-white focus:border-[#6db025] outline-none transition-colors placeholder:text-white/20" />
            </div>

            {isOwner && (
              <div>
                <label className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1.5 block">Rol în sistem</label>
                <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})} className="w-full bg-[#0A0A0A] border border-white/10 rounded p-4 text-white focus:border-[#6db025] outline-none transition-colors">
                  <option value="USER">Client (Abonat)</option>
                  <option value="COACH">Antrenor</option>
                  <option value="OWNER">Administrator</option>
                </select>
              </div>
            )}

            {/* QoL: Cont Shared Family (Vizibil doar pt clienți) */}
            {newUser.role === 'USER' && (
              <label className="flex items-center gap-3 mt-4 p-4 bg-white/[0.02] border border-white/5 rounded cursor-pointer hover:bg-white/[0.04] transition-colors">
                <input 
                  type="checkbox" 
                  checked={newUser.is_shared_family} 
                  onChange={(e) => setNewUser({...newUser, is_shared_family: e.target.checked})} 
                  className="w-4 h-4 accent-[#6db025] rounded bg-[#0A0A0A] border-white/20"
                />
                <div>
                  <p className="text-white text-sm font-bold">Cont de Familie (Shared)</p>
                  <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-0.5">Ambii părinți pot accesa contul</p>
                </div>
              </label>
            )}

            <button type="submit" disabled={creating} className="w-full bg-[#6db025] hover:bg-opacity-90 text-white py-4 rounded uppercase font-black tracking-widest text-xs disabled:opacity-50 mt-6 transition-colors">
              {creating ? 'Se creează...' : 'Confirmă Crearea'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;