import { useEffect, useMemo, useState } from "react";
import { contactAPI } from "../../lib/api";
import { toast } from "sonner";
import { Mail, Phone, CheckCheck, Search } from "lucide-react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";

const ContactMessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchMessages = async () => {
    try {
      const response = await contactAPI.getMessages();
      setMessages(response.data);
    } catch (error) {
      toast.error("Eroare la încărcarea mesajelor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

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
      setMessages((current) => current.map((message) => message.id === id ? { ...message, is_read: true } : message));
      toast.success("Mesaj marcat ca citit");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Eroare la actualizare");
    }
  };

  const unreadCount = messages.filter((message) => !message.is_read).length;

  return (
    <div className="space-y-6" data-testid="contact-messages-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white uppercase">Mesaje contact</h1>
          <p className="text-white/40 text-sm mt-1">Mesajele trimise din formularul public</p>
        </div>
        <div className="bg-[#CCFF00]/10 border border-[#CCFF00]/20 px-4 py-3 text-[#CCFF00] text-sm">
          Necitite: <strong>{unreadCount}</strong>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_auto] gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Caută după nume, email sau mesaj..."
            className="w-full bg-[#0A0A0A] border border-white/10 pl-10 pr-4 py-3 text-white placeholder:text-white/30"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-[#0A0A0A] border border-white/10 px-4 py-3 text-white"
        >
          <option value="all">Toate mesajele</option>
          <option value="unread">Necitite</option>
          <option value="read">Citite</option>
        </select>
      </div>

      <div className="bg-[#0A0A0A] border border-white/5">
        {loading ? (
          <div className="p-8 text-center text-[#CCFF00] animate-pulse">SE ÎNCARCĂ...</div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-8 text-center text-white/40">Nu există mesaje pentru filtrul selectat</div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredMessages.map((message) => (
              <div key={message.id} className="p-5 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-white font-semibold">{message.name}</h3>
                      {!message.is_read && (
                        <span className="text-[10px] uppercase px-2 py-0.5 bg-red-500/20 text-red-400">Nou</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-white/40 text-xs">
                      <span className="flex items-center gap-1"><Mail size={12} /> {message.email}</span>
                      {message.phone && <span className="flex items-center gap-1"><Phone size={12} /> {message.phone}</span>}
                      <span>{format(new Date(message.created_at), "dd MMM yyyy, HH:mm", { locale: ro })}</span>
                    </div>
                  </div>
                  {!message.is_read && (
                    <button
                      onClick={() => handleMarkRead(message.id)}
                      className="btn-secondary px-4 py-2 inline-flex items-center gap-2"
                    >
                      <CheckCheck size={14} />
                      Marchează citit
                    </button>
                  )}
                </div>
                <div className="bg-[#121212] border border-white/5 p-4 text-white/80 whitespace-pre-wrap leading-6">
                  {message.message}
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
