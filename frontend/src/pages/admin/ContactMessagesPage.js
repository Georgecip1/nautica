import { useEffect, useMemo, useState, useCallback } from "react";
import { contactAPI } from "../../lib/api";
import { toast } from "sonner";
import { Mail, Phone, CheckCheck, Search, Inbox } from "lucide-react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";

const ContactMessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchMessages = useCallback(async () => {
    try {
      const response = await contactAPI.getMessages();
      setMessages(response.data);
    } catch (error) {
      toast.error("Eroare la încărcarea mesajelor");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const filteredMessages = useMemo(() => {
    return messages.filter((message) => {
      const matchesFilter = filter === "all" ? true : filter === "unread" ? !message.is_read : !!message.is_read;
      const haystack = `${message.name} ${message.email} ${message.phone || ""} ${message.message}`.toLowerCase();
      return matchesFilter && haystack.includes(search.toLowerCase());
    });
  }, [messages, filter, search]);

  const handleMarkRead = async (id) => {
    try {
      await contactAPI.markRead(id);
      setMessages((current) => current.map((m) => m.id === id ? { ...m, is_read: true } : m));
      toast.success("Marcat ca citit");
    } catch (error) {
      toast.error("Eroare sistem");
    }
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  // Funcție antiglonț pentru a preveni crash-ul "Invalid time value" la mesajele vechi
  const safeDateRender = (dateString) => {
    if (!dateString) return "Dată necunoscută";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Dată invalidă";
    return format(d, "dd MMM yyyy, HH:mm", { locale: ro });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white uppercase tracking-tight">Inbox Contact</h1>
          <p className="text-white/40 text-sm mt-1">Cereri venite de pe site-ul public</p>
        </div>
        <div className="bg-white/5 border border-white/10 px-4 py-3 flex items-center gap-3">
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Mesaje Noi:</span>
          <span className="text-[#6db025] font-heading font-bold text-xl">{unreadCount}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-[#0A0A0A] p-4 border border-white/5">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Caută în mesaje..."
            className="w-full bg-[#050505] border border-white/10 pl-12 pr-4 py-3 text-white focus:border-[#6db025] outline-none transition-all placeholder:text-white/10"
          />
        </div>
        <select
          value={filter} onChange={(e) => setFilter(e.target.value)}
          className="bg-[#050505] border border-white/10 px-6 py-3 text-white text-[10px] font-black uppercase tracking-widest outline-none focus:border-[#6db025]"
        >
          <option value="all">Istoric Complet</option>
          <option value="unread">Doar Necitite</option>
          <option value="read">Deja Citite</option>
        </select>
      </div>

      <div className="bg-[#0A0A0A] border border-white/5 overflow-hidden">
        {loading ? (
           <div className="p-16 text-center text-[#6db025] animate-pulse font-heading text-xs tracking-widest uppercase">Sincronizare Inbox...</div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center gap-4 opacity-30">
             <Inbox size={40} className="text-white" />
             <p className="text-white text-xs font-bold uppercase tracking-widest">Inbox Gol</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredMessages.map((msg) => (
              <div key={msg.id} className={`p-6 transition-colors ${!msg.is_read ? 'bg-white/[0.03] border-l-2 border-l-[#6db025]' : 'border-l-2 border-transparent hover:bg-white/[0.01]'}`}>
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h3 className={`text-lg font-bold uppercase tracking-tight ${!msg.is_read ? 'text-white' : 'text-white/60'}`}>{msg.name}</h3>
                      {!msg.is_read && <span className="text-[9px] uppercase px-2 py-0.5 bg-[#6db025]/20 text-[#6db025] font-black tracking-widest">Mesaj Nou</span>}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4 text-[11px] font-bold uppercase tracking-widest text-white/30">
                      <span className="flex items-center gap-2"><Mail size={14} className="text-[#6db025]/40" /> {msg.email}</span>
                      {msg.phone && <span className="flex items-center gap-2"><Phone size={14} className="text-[#6db025]/40" /> {msg.phone}</span>}
                    </div>

                    <div className="bg-[#050505] border border-white/5 p-5 text-white/70 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                      {msg.message}
                    </div>
                    <div className="mt-3 text-[10px] text-white/20 uppercase font-black tracking-widest">
                       Primit la: {safeDateRender(msg.created_at)}
                    </div>
                  </div>
                  
                  {!msg.is_read && (
                    <button onClick={() => handleMarkRead(msg.id)} className="btn-secondary px-4 py-3 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest self-start">
                      <CheckCheck size={16} /> Finalizat
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactMessagesPage;