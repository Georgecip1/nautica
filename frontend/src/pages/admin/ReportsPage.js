import { useState, useEffect, useCallback } from 'react';
import { reportsAPI } from '../../lib/api';
import { toast } from 'sonner';
import { TrendingUp, Calendar, MapPin, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const ReportsPage = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [locationsData, setLocationsData] = useState([]);
  const [hoursData, setHoursData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [revenue, attendance, locations, hours] = await Promise.all([
        reportsAPI.getRevenue(6),
        reportsAPI.getAttendance(6),
        reportsAPI.getLocations(),
        reportsAPI.getHours()
      ]);
      setRevenueData(revenue.data || []);
      setAttendanceData(attendance.data || []);
      setLocationsData(locations.data || []);
      setHoursData((hours.data || []).filter(h => h.count > 0));
    } catch (error) {
      toast.error('Eroare la sincronizarea statisticilor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalRevenue = revenueData.reduce((sum, d) => sum + (d.revenue || 0), 0);
  const totalAttendance = attendanceData.reduce((sum, d) => sum + (d.attendance || 0), 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#050505] border border-white/10 p-4 shadow-2xl">
          <p className="text-white text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
          <p className="text-[#6db025] font-black text-lg">
            {payload[0].value} {payload[0].dataKey === 'revenue' ? 'LEI' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-[#6db025] font-heading tracking-widest uppercase">Generare Rapoarte...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-white uppercase tracking-tight">Performanță Club</h1>
        <p className="text-white/40 text-sm mt-1">Statistici financiare și operaționale (Ultimele 6 luni)</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0A0A0A] border border-white/5 p-6 hover:bg-white/[0.02] transition-colors group">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#6db025]/10 flex items-center justify-center group-hover:bg-[#6db025] group-hover:text-black text-[#6db025] transition-colors">
              <TrendingUp size={20} />
            </div>
            <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Încasări</span>
          </div>
          <p className="font-heading text-3xl font-bold text-white tracking-tight">{totalRevenue.toLocaleString()} <span className="text-[#6db025] text-lg">LEI</span></p>
        </div>
        
        <div className="bg-[#0A0A0A] border border-white/5 p-6 hover:bg-white/[0.02] transition-colors group">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#6db025]/10 flex items-center justify-center group-hover:bg-[#6db025] group-hover:text-black text-[#6db025] transition-colors">
              <Calendar size={20} />
            </div>
            <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Intrări Total</span>
          </div>
          <p className="font-heading text-3xl font-bold text-white tracking-tight">{totalAttendance.toLocaleString()}</p>
        </div>
        
        <div className="bg-[#0A0A0A] border border-white/5 p-6 hover:bg-white/[0.02] transition-colors group">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#6db025]/10 flex items-center justify-center group-hover:bg-[#6db025] group-hover:text-black text-[#6db025] transition-colors">
              <MapPin size={20} />
            </div>
            <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Bazin Principal</span>
          </div>
          <p className="font-heading text-xl font-bold text-white truncate tracking-tight">{locationsData[0]?.location || 'N/A'}</p>
        </div>
        
        <div className="bg-[#0A0A0A] border border-white/5 p-6 hover:bg-white/[0.02] transition-colors group">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#6db025]/10 flex items-center justify-center group-hover:bg-[#6db025] group-hover:text-black text-[#6db025] transition-colors">
              <Clock size={20} />
            </div>
            <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Oră Aglomerată</span>
          </div>
          <p className="font-heading text-3xl font-bold text-white tracking-tight">
            {hoursData.length > 0 ? `${hoursData.reduce((max, h) => h.count > max.count ? h : max).hour}:00` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-[#0A0A0A] border border-white/5 p-6">
          <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6">Evoluție Venituri</h3>
          <div className="h-64">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="month" stroke="#666" tick={{ fill: '#666', fontSize: 10, textTransform: 'uppercase' }} tickFormatter={(value) => value.split(' ')[0].substring(0, 3)} axisLine={false} tickLine={false} />
                  <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: '#ffffff05'}} />
                  <Bar dataKey="revenue" fill="#6db025" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-white/20 text-xs font-bold uppercase tracking-widest">Date Insuficiente</div>
            )}
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/5 p-6">
          <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6">Trafic Prezențe</h3>
          <div className="h-64">
            {attendanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="month" stroke="#666" tick={{ fill: '#666', fontSize: 10, textTransform: 'uppercase' }} tickFormatter={(value) => value.split(' ')[0].substring(0, 3)} axisLine={false} tickLine={false} />
                  <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="attendance" stroke="#6db025" strokeWidth={3} dot={{ fill: '#050505', stroke: '#6db025', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#6db025' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-white/20 text-xs font-bold uppercase tracking-widest">Date Insuficiente</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-[#0A0A0A] border border-white/5 p-6">
          <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6">Performanță Locații</h3>
          {locationsData.length > 0 ? (
            <div className="space-y-4">
              {locationsData.map((loc, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <span className="text-[#6db025] font-heading font-black opacity-40 group-hover:opacity-100 transition-opacity">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-white text-xs font-bold uppercase tracking-wide">{loc.location}</span>
                      <span className="text-white/60 text-xs font-medium">{loc.count} intrări</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#6db025]" style={{ width: `${(loc.count / (locationsData[0]?.count || 1)) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-white/20 text-xs font-bold uppercase tracking-widest">Date Insuficiente</div>
          )}
        </div>

        <div className="bg-[#0A0A0A] border border-white/5 p-6">
          <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6">Distribuție Orară</h3>
          <div className="h-48 mt-4">
            {hoursData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hoursData}>
                  <XAxis dataKey="hour" stroke="#666" tick={{ fill: '#666', fontSize: 10 }} tickFormatter={(value) => `${value}:00`} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: '#ffffff05'}} />
                  <Bar dataKey="count" fill="#6db025" radius={[2, 2, 0, 0]} opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-white/20 text-xs font-bold uppercase tracking-widest">Date Insuficiente</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;