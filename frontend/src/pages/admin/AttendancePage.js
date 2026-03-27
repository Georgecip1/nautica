import { useState, useEffect, useCallback } from 'react';
import { attendanceAPI, usersAPI } from '../../lib/api';
import { toast } from 'sonner';
import { 
  Search, Plus, Trash2, Calendar, MapPin, 
  User, Check, X, Download, AlertCircle 
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

const LOCATIONS = [
  { id: "fiald", name: 'Bazin Fiald (Hotel Fiald)' },
  { id: "olimpic", name: 'Bazinul Olimpic Bacău' },
  { id: "emd", name: 'Bazinul EMD Academy' }
];

const AttendancePage = () => {
  const [attendance, setAttendance] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPersons, setSelectedPersons] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0].name);
  const [searchUsers, setSearchUsers] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await attendanceAPI.getAll({ limit: 100 });
      setAttendance(res.data);
    } catch (error) {
      toast.error('Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const fetchActive = async () => {
      try {
        const res = await usersAPI.getWithActiveSubscriptions({ search: searchUsers });
        setActiveUsers(res.data);
      } catch (error) {
        console.error('Failed to fetch active users');
      }
    };

    if (showAddModal) {
      const timer = setTimeout(fetchActive, 300);
      return () => clearTimeout(timer);
    }
  }, [showAddModal, searchUsers]);

  const handleRecordAttendance = async () => {
    if (selectedPersons.length === 0) return;
    setSaving(true);
    try {
      const payload = selectedPersons.map(p => ({
        person_id: p.person_id, person_type: p.person_type,
        location: selectedLocation, method: 'manual'
      }));
      await attendanceAPI.recordManual(payload);
      toast.success('Prezențe înregistrate');
      setShowAddModal(false);
      setSelectedPersons([]);
      fetchData();
    } catch (error) {
      toast.error('Eroare la salvare');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await attendanceAPI.export({});
      const headers = ['Nume', 'Locație', 'Metodă', 'Data'];
      const rows = response.data.map(a => [
        a.person_name, a.location, a.method, 
        format(new Date(a.recorded_at), 'dd.MM.yyyy HH:mm')
      ]);
      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prezente_nautica_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      toast.success('Export descărcat');
    } catch (error) {
      toast.error('Eroare la export');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white uppercase tracking-tight">Prezență</h1>
          <p className="text-white/40 text-sm mt-1">Istoricul accesului în bazine</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="btn-secondary px-4 py-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <Download size={16} /> Export CSV
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary px-4 py-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <Plus size={16} /> Înregistrare Nouă
          </button>
        </div>
      </div>

      <div className="bg-[#0A0A0A] border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-white/[0.02]">
          <h2 className="text-[10px] font-black text-[#6db025] uppercase tracking-[0.2em]">Activitate Recentă</h2>
        </div>

        {loading ? (
          <div className="p-20 text-center text-[#6db025] animate-pulse uppercase font-heading text-xs tracking-widest">Sincronizare date...</div>
        ) : attendance.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
            <AlertCircle size={40} className="text-white/10" />
            <p className="text-white/20 font-heading uppercase text-sm tracking-widest">Nu există prezențe înregistrate în sistem</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {attendance.map((att) => (
              <div key={att.id} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors group">
                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-[#6db025]/10 transition-colors">
                  <User size={16} className="text-white/40 group-hover:text-[#6db025]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm uppercase tracking-tight">{att.person_name}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                    <span className="text-white/40 text-[10px] uppercase font-medium flex items-center gap-1">
                      <MapPin size={10} className="text-[#6db025]" /> {att.location}
                    </span>
                    <span className="text-white/40 text-[10px] uppercase font-medium flex items-center gap-1">
                      <Calendar size={10} /> {format(new Date(att.recorded_at), 'dd MMM yyyy, HH:mm', { locale: ro })}
                    </span>
                    <span className="text-[9px] bg-white/5 text-white/40 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">
                      {att.method}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={async () => {
                    if(window.confirm('Ștergi înregistrarea?')) {
                       await attendanceAPI.delete(att.id);
                       fetchData();
                    }
                  }} 
                  className="p-2 text-white/10 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="bg-[#121212] border-white/10 max-w-lg h-[80vh] flex flex-col p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="p-6 border-b border-white/5 bg-white/[0.02]">
            <DialogTitle className="text-white font-heading uppercase text-xl">Înregistrare Manuală</DialogTitle>
          </DialogHeader>
          
          <div className="p-6 space-y-6 flex-1 flex flex-col overflow-hidden">
            <div className="space-y-2">
              <label className="text-white/40 text-[10px] font-black uppercase tracking-widest">Locația de antrenament</label>
              <select 
                value={selectedLocation} 
                onChange={(e) => setSelectedLocation(e.target.value)} 
                className="w-full bg-[#0A0A0A] border border-white/10 p-4 text-white focus:border-[#6db025] outline-none transition-all appearance-none"
              >
                {LOCATIONS.map(loc => <option key={loc.id} value={loc.name}>{loc.name}</option>)}
              </select>
            </div>

            <div className="space-y-2 flex-1 flex flex-col overflow-hidden">
              <label className="text-white/40 text-[10px] font-black uppercase tracking-widest">Selectează membrii</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input 
                  type="text" 
                  placeholder="Caută în lista de abonamente active..." 
                  value={searchUsers} 
                  onChange={(e) => setSearchUsers(e.target.value)} 
                  className="w-full bg-[#0A0A0A] border border-white/10 p-4 pl-12 text-white focus:border-[#6db025] outline-none placeholder:text-white/10" 
                />
              </div>

              <div className="flex-1 overflow-y-auto mt-2 border border-white/5 bg-black/20 rounded-sm">
                {activeUsers.length > 0 ? activeUsers.map(person => {
                  const isSelected = selectedPersons.find(p => p.person_id === person.person_id);
                  return (
                    <div 
                      key={`${person.person_type}-${person.person_id}`} 
                      onClick={() => setSelectedPersons(prev => isSelected ? prev.filter(p => p.person_id !== person.person_id) : [...prev, person])}
                      className={`p-4 flex items-center gap-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-all ${isSelected ? 'bg-[#6db025]/5' : ''}`}
                    >
                      <div className={`w-6 h-6 border flex items-center justify-center transition-all ${isSelected ? 'bg-[#6db025] border-[#6db025]' : 'border-white/10'}`}>
                        {isSelected && <Check size={14} className="text-black" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-bold uppercase tracking-tight truncate">{person.person_name}</p>
                        <p className="text-[#6db025] text-[9px] font-black uppercase tracking-tighter opacity-60 truncate">{person.subscription?.plan_name}</p>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="p-10 text-center text-white/20 text-xs uppercase tracking-widest">Niciun membru activ găsit</p>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#0A0A0A] border-t border-white/5">
            <button 
              onClick={handleRecordAttendance} 
              disabled={saving || selectedPersons.length === 0} 
              className="btn-primary w-full py-5 text-sm font-black uppercase tracking-[0.2em] disabled:opacity-20"
            >
              {saving ? 'Se procesează...' : `Confirmă intrarea (${selectedPersons.length})`}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttendancePage;