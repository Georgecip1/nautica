import { useState, useEffect } from 'react';
import { reportsAPI } from '../../lib/api';
import { toast } from 'sonner';
import { 
  TrendingUp, 
  Calendar, 
  MapPin, 
  Clock,
  Download
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const ReportsPage = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [locationsData, setLocationsData] = useState([]);
  const [hoursData, setHoursData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [revenue, attendance, locations, hours] = await Promise.all([
        reportsAPI.getRevenue(6),
        reportsAPI.getAttendance(6),
        reportsAPI.getLocations(),
        reportsAPI.getHours()
      ]);
      setRevenueData(revenue.data);
      setAttendanceData(attendance.data);
      setLocationsData(locations.data);
      setHoursData(hours.data.filter(h => h.count > 0));
    } catch (error) {
      toast.error('Eroare la încărcarea rapoartelor');
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalAttendance = attendanceData.reduce((sum, d) => sum + d.attendance, 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1a1a] border border-white/10 p-3">
          <p className="text-white text-sm font-medium">{label}</p>
          <p className="text-[#CCFF00] text-sm">
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
        <div className="animate-pulse text-[#CCFF00]">SE ÎNCARCĂ...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="reports-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white uppercase">Rapoarte</h1>
          <p className="text-white/40 text-sm mt-1">Statistici și analize</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0A0A0A] border border-white/5 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#CCFF00]/10 flex items-center justify-center">
              <TrendingUp size={20} className="text-[#CCFF00]" />
            </div>
            <span className="text-white/40 text-xs uppercase tracking-wider">Venituri 6 Luni</span>
          </div>
          <p className="font-heading text-3xl font-bold text-white">{totalRevenue.toLocaleString()} LEI</p>
        </div>
        <div className="bg-[#0A0A0A] border border-white/5 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#CCFF00]/10 flex items-center justify-center">
              <Calendar size={20} className="text-[#CCFF00]" />
            </div>
            <span className="text-white/40 text-xs uppercase tracking-wider">Prezențe 6 Luni</span>
          </div>
          <p className="font-heading text-3xl font-bold text-white">{totalAttendance.toLocaleString()}</p>
        </div>
        <div className="bg-[#0A0A0A] border border-white/5 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#CCFF00]/10 flex items-center justify-center">
              <MapPin size={20} className="text-[#CCFF00]" />
            </div>
            <span className="text-white/40 text-xs uppercase tracking-wider">Top Locație</span>
          </div>
          <p className="font-heading text-xl font-bold text-white truncate">
            {locationsData[0]?.location || 'N/A'}
          </p>
        </div>
        <div className="bg-[#0A0A0A] border border-white/5 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#CCFF00]/10 flex items-center justify-center">
              <Clock size={20} className="text-[#CCFF00]" />
            </div>
            <span className="text-white/40 text-xs uppercase tracking-wider">Oră de Vârf</span>
          </div>
          <p className="font-heading text-3xl font-bold text-white">
            {hoursData.length > 0 ? `${hoursData.reduce((max, h) => h.count > max.count ? h : max).hour}:00` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-[#0A0A0A] border border-white/5 p-6">
          <h3 className="font-heading text-lg font-bold text-white uppercase mb-6">Venituri Lunare</h3>
          <div className="h-64">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#666"
                    tick={{ fill: '#666', fontSize: 11 }}
                    tickFormatter={(value) => value.split(' ')[0].substring(0, 3)}
                  />
                  <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" fill="#CCFF00" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-white/40">
                Nu există date
              </div>
            )}
          </div>
        </div>

        {/* Attendance Chart */}
        <div className="bg-[#0A0A0A] border border-white/5 p-6">
          <h3 className="font-heading text-lg font-bold text-white uppercase mb-6">Prezențe Lunare</h3>
          <div className="h-64">
            {attendanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#666"
                    tick={{ fill: '#666', fontSize: 11 }}
                    tickFormatter={(value) => value.split(' ')[0].substring(0, 3)}
                  />
                  <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="attendance" 
                    stroke="#CCFF00" 
                    strokeWidth={2}
                    dot={{ fill: '#CCFF00', strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-white/40">
                Nu există date
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Locations Ranking */}
        <div className="bg-[#0A0A0A] border border-white/5 p-6">
          <h3 className="font-heading text-lg font-bold text-white uppercase mb-4">Top Locații</h3>
          {locationsData.length > 0 ? (
            <div className="space-y-3">
              {locationsData.map((loc, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-[#CCFF00] font-heading font-bold w-6">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-sm">{loc.location}</span>
                      <span className="text-white/60 text-sm">{loc.count}</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded">
                      <div 
                        className="h-full bg-[#CCFF00] rounded"
                        style={{ width: `${(loc.count / (locationsData[0]?.count || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/40 text-sm">Nu există date</p>
          )}
        </div>

        {/* Hours Distribution */}
        <div className="bg-[#0A0A0A] border border-white/5 p-6">
          <h3 className="font-heading text-lg font-bold text-white uppercase mb-4">Ore de Vârf</h3>
          <div className="h-48">
            {hoursData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hoursData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis 
                    dataKey="hour" 
                    stroke="#666"
                    tick={{ fill: '#666', fontSize: 10 }}
                    tickFormatter={(value) => `${value}:00`}
                  />
                  <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#CCFF00" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-white/40">
                Nu există date
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
