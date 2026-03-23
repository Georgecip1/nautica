import { useState, useEffect } from 'react';
import { attendanceAPI, usersAPI, locationsAPI } from '../../lib/api';
import { toast } from 'sonner';
import { 
  Search, 
  Plus, 
  Trash2, 
  Calendar,
  MapPin,
  User,
  Check,
  X,
  Download
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

const AttendancePage = () => {
  const [attendance, setAttendance] = useState([]);
  const [locations, setLocations] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPersons, setSelectedPersons] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [searchUsers, setSearchUsers] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [attRes, locRes] = await Promise.all([
        attendanceAPI.getAll({ limit: 100 }),
        locationsAPI.getAll()
      ]);
      setAttendance(attRes.data);
      setLocations(locRes.data);
      if (locRes.data.length > 0) {
        setSelectedLocation(locRes.data[0].name);
      }
    } catch (error) {
      toast.error('Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveUsers = async () => {
    try {
      const response = await usersAPI.getWithActiveSubscriptions({ search: searchUsers });
      setActiveUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch active users:', error);
    }
  };

  useEffect(() => {
    if (showAddModal) {
      fetchActiveUsers();
    }
  }, [showAddModal, searchUsers]);

  const handleRecordAttendance = async () => {
    if (selectedPersons.length === 0) {
      toast.error('Selectează cel puțin o persoană');
      return;
    }
    if (!selectedLocation) {
      toast.error('Selectează o locație');
      return;
    }

    setSaving(true);
    try {
      const data = selectedPersons.map(p => ({
        person_id: p.person_id,
        person_type: p.person_type,
        location: selectedLocation,
        method: 'manual'
      }));
      
      const results = await attendanceAPI.recordManual(data);
      
      const successes = results.data.filter(r => r.success);
      const errors = results.data.filter(r => r.error);
      
      if (successes.length > 0) {
        toast.success(`${successes.length} prezență/prezențe înregistrate`);
      }
      errors.forEach(e => {
        toast.error(`${e.person_name}: ${e.error}`);
      });
      
      setShowAddModal(false);
      setSelectedPersons([]);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Eroare la înregistrare');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAttendance = async (id) => {
    try {
      await attendanceAPI.delete(id);
      toast.success('Prezență ștearsă');
      fetchData();
    } catch (error) {
      toast.error('Eroare la ștergere');
    }
  };

  const handleExport = async () => {
    try {
      const response = await attendanceAPI.export({});
      // Create CSV
      const headers = ['Nume', 'Locație', 'Metodă', 'Data'];
      const rows = response.data.map(a => [
        a.person_name,
        a.location,
        a.method,
        format(new Date(a.recorded_at), 'dd.MM.yyyy HH:mm')
      ]);
      
      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prezente_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      
      toast.success('Export realizat');
    } catch (error) {
      toast.error('Eroare la export');
    }
  };

  const togglePerson = (person) => {
    const exists = selectedPersons.find(p => p.person_id === person.person_id);
    if (exists) {
      setSelectedPersons(selectedPersons.filter(p => p.person_id !== person.person_id));
    } else {
      setSelectedPersons([...selectedPersons, person]);
    }
  };

  return (
    <div className="space-y-6" data-testid="attendance-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white uppercase">Prezență</h1>
          <p className="text-white/40 text-sm mt-1">Gestionează prezențele zilnice</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="btn-secondary px-4 py-2 flex items-center gap-2"
            data-testid="export-attendance"
          >
            <Download size={16} />
            Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary px-4 py-2 flex items-center gap-2"
            data-testid="add-attendance-button"
          >
            <Plus size={16} />
            Înregistrează Prezență
          </button>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="bg-[#0A0A0A] border border-white/5">
        <div className="p-4 border-b border-white/5">
          <h2 className="font-heading text-lg font-bold text-white uppercase">Prezențe Recente</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-pulse text-[#CCFF00]">SE ÎNCARCĂ...</div>
          </div>
        ) : attendance.length === 0 ? (
          <div className="p-8 text-center text-white/40">
            Nu există prezențe înregistrate
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {attendance.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                data-testid={`attendance-row-${att.id}`}
              >
                <div className="w-10 h-10 bg-[#CCFF00]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-[#CCFF00]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium">{att.person_name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-white/40 text-xs flex items-center gap-1">
                      <MapPin size={10} />
                      {att.location}
                    </span>
                    <span className="text-white/40 text-xs flex items-center gap-1">
                      <Calendar size={10} />
                      {format(new Date(att.recorded_at), 'dd MMM yyyy, HH:mm', { locale: ro })}
                    </span>
                    <span className={`text-[10px] uppercase px-2 py-0.5 ${
                      att.method === 'qr' ? 'bg-blue-500/20 text-blue-400' :
                      att.method === 'camera' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-white/10 text-white/60'
                    }`}>
                      {att.method}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteAttendance(att.id)}
                  className="text-red-400 hover:bg-red-500/10 p-2 transition-colors"
                  data-testid={`delete-attendance-${att.id}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Attendance Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="bg-[#121212] border-white/10 max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl text-white uppercase">
              Înregistrează Prezență
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4 flex-1 overflow-hidden flex flex-col">
            {/* Location Select */}
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Locație</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/10 px-4 py-3 text-white"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>

            {/* Search Users */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={16} />
              <input
                type="text"
                placeholder="Caută utilizatori..."
                value={searchUsers}
                onChange={(e) => setSearchUsers(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/10 pl-10 pr-4 py-3 text-white placeholder:text-white/30"
              />
            </div>

            {/* Selected Count */}
            {selectedPersons.length > 0 && (
              <div className="bg-[#CCFF00]/10 border border-[#CCFF00]/30 p-3 flex items-center justify-between">
                <span className="text-[#CCFF00] text-sm">
                  {selectedPersons.length} persoană/persoane selectate
                </span>
                <button
                  onClick={() => setSelectedPersons([])}
                  className="text-white/60 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Users List */}
            <div className="flex-1 overflow-y-auto border border-white/5 divide-y divide-white/5">
              {activeUsers.length === 0 ? (
                <div className="p-4 text-center text-white/40 text-sm">
                  Nu există utilizatori cu abonamente active
                </div>
              ) : (
                activeUsers.map((person) => {
                  const isSelected = selectedPersons.find(p => p.person_id === person.person_id);
                  return (
                    <button
                      key={`${person.person_type}-${person.person_id}`}
                      onClick={() => togglePerson(person)}
                      className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                        isSelected ? 'bg-[#CCFF00]/10' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className={`w-6 h-6 border flex items-center justify-center ${
                        isSelected ? 'bg-[#CCFF00] border-[#CCFF00]' : 'border-white/20'
                      }`}>
                        {isSelected && <Check size={14} className="text-black" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{person.person_name}</p>
                        <p className="text-white/40 text-xs">
                          {person.person_type === 'child' ? 'Copil' : 'Adult'} • {person.subscription?.plan_name}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 btn-secondary py-3"
              >
                Anulează
              </button>
              <button
                onClick={handleRecordAttendance}
                disabled={saving || selectedPersons.length === 0}
                className="flex-1 btn-primary py-3 disabled:opacity-50"
              >
                {saving ? 'Se înregistrează...' : `Înregistrează (${selectedPersons.length})`}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttendancePage;
