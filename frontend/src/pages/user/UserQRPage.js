import { useAuth } from '../../contexts/AuthContext';
import { QrCode, Copy, Check, Info, ScanLine, ListOrdered } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';

const QRDisplay = ({ value }) => {
  return (
    <div className="bg-white p-4 inline-block rounded-xl shadow-[0_0_30px_rgba(204,255,0,0.15)] border-4 border-[#CCFF00]">
      <QRCode 
        value={value} 
        size={220} 
        bgColor="#ffffff"
        fgColor="#000000"
        level="H" 
      />
    </div>
  );
};

const UserQRPage = () => {
  const { user } = useAuth();
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (token, id) => {
    navigator.clipboard.writeText(token);
    setCopiedId(id);
    toast.success('Token QR copiat în memorie!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const persons = [
    { id: user?.id, type: 'user', name: user?.name, qr_token: user?.qr_token },
    ...(user?.children || []).map(c => ({ id: c.id, type: 'child', name: c.name, qr_token: c.qr_token }))
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center md:text-left mb-8">
        <h1 className="font-heading text-3xl font-bold text-white uppercase tracking-tight">Coduri de Acces</h1>
        <p className="text-white/40 text-sm mt-1">
          Cardul tău digital pentru intrarea la antrenamente
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {persons.map((person) => (
          <div key={person.id} className="bg-[#0A0A0A] border border-white/5 overflow-hidden flex flex-col">
            
            {/* Header Nume */}
            <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center gap-4 justify-center md:justify-start">
              <div className={`w-10 h-10 flex items-center justify-center border ${
                person.type === 'user' ? 'bg-[#CCFF00]/10 border-[#CCFF00]/20 text-[#CCFF00]' : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
              }`}>
                <span className="font-bold uppercase text-lg">{person.name?.charAt(0)}</span>
              </div>
              <div className="text-left">
                <p className="text-white font-bold uppercase tracking-tight">{person.name}</p>
                <p className="text-white/40 text-[10px] uppercase font-black tracking-widest">
                  {person.type === 'user' ? 'Titular Cont' : 'Abonament Copil'}
                </p>
              </div>
            </div>

            {/* Zona QR Code */}
            <div className="flex-1 p-8 flex flex-col items-center justify-center relative">
              <ScanLine size={120} className="absolute text-white/[0.02] z-0" />
              
              <div className="relative z-10 mb-6">
                {person.qr_token ? (
                  <QRDisplay value={person.qr_token} />
                ) : (
                  <div className="w-[240px] h-[240px] bg-[#121212] border border-white/10 flex flex-col items-center justify-center gap-4 rounded-xl">
                    <QrCode size={48} className="text-white/20" />
                    <span className="text-white/30 text-[10px] font-black uppercase tracking-widest">Cod Indisponibil</span>
                  </div>
                )}
              </div>

              {/* Zona Copy Token */}
              <div className="w-full max-w-[280px] bg-[#050505] border border-white/10 p-1 pl-4 flex items-center justify-between gap-3">
                <code className="text-[#CCFF00] text-[10px] font-mono truncate flex-1 opacity-70">
                  {person.qr_token || 'N/A'}
                </code>
                <button
                  onClick={() => person.qr_token && handleCopy(person.qr_token, person.id)}
                  disabled={!person.qr_token}
                  className="bg-white/5 hover:bg-[#CCFF00] text-white/40 hover:text-black p-3 transition-colors disabled:opacity-20"
                  title="Copiază token manual"
                >
                  {copiedId === person.id ? <Check size={14} className="text-black" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        {/* Instrucțiuni */}
        <div className="bg-[#0A0A0A] border border-white/5 p-6">
          <div className="flex items-center gap-3 mb-4">
            <ListOrdered size={20} className="text-[#CCFF00]" />
            <h3 className="text-white font-heading text-lg uppercase font-bold tracking-tight">Cum funcționează</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex gap-4">
              <span className="text-[#CCFF00] font-black text-lg opacity-40">1</span>
              <div>
                <p className="text-white text-sm font-bold uppercase tracking-wide">Salvează Codul</p>
                <p className="text-white/40 text-xs mt-1">Poți face un screenshot, îl poți trimite copilului tău pe telefon sau îl poți printa pe un card fizic.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-[#CCFF00] font-black text-lg opacity-40">2</span>
              <div>
                <p className="text-white text-sm font-bold uppercase tracking-wide">Arată la Bazin</p>
                <p className="text-white/40 text-xs mt-1">Prezintă imaginea QR la recepție sau antrenorului tău la intrarea la antrenament.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-[#CCFF00] font-black text-lg opacity-40">3</span>
              <div>
                <p className="text-white text-sm font-bold uppercase tracking-wide">Check-in Automat</p>
                <p className="text-white/40 text-xs mt-1">Odată scanat, prezența ta este înregistrată automat în sistemul clubului Nautica.</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Info Banner */}
        <div className="bg-[#CCFF00]/5 border border-[#CCFF00]/20 p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-3">
            <Info size={20} className="text-[#CCFF00]" />
            <h3 className="text-[#CCFF00] font-bold text-xs uppercase tracking-widest">Informație importantă</h3>
          </div>
          <p className="text-white/60 text-sm leading-relaxed">
            Acest cod QR este <strong className="text-white">permanent și unic</strong> pentru fiecare membru. Reprezintă legitimația ta digitală, așadar nu este nevoie să te loghezi în platformă de fiecare dată pentru a-l genera.
            <br /><br />
            Te rugăm să te asiguri din panoul tău că ai un <strong className="text-white">abonament activ</strong> înainte de a te prezenta la antrenament, pentru a permite un acces rapid și fără întârzieri la bazin. Dacă totuși nu ai un abonament valid, achiziționează unul când te afli la recepție, iar data viitoare când vei prezenta acest cod QR, sistemul va recunoaște noul tău status și îți va permite accesul fără probleme.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserQRPage;