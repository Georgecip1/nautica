import { useAuth } from '../../contexts/AuthContext';
import { QrCode, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';

// Simple QR display component
const QRDisplay = ({ value, size = 200 }) => {
  // Generate a simple visual representation since we can't use actual QR library
  return (
    <div className="bg-white p-4 inline-block">
      <QRCode value={value} size={size} />
    </div>
  );
};

const UserQRPage = () => {
  const { user } = useAuth();
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (token, id) => {
    navigator.clipboard.writeText(token);
    setCopiedId(id);
    toast.success('Token copiat!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const persons = [
    { id: user?.id, type: 'user', name: user?.name, qr_token: user?.qr_token },
    ...(user?.children || []).map(c => ({ id: c.id, type: 'child', name: c.name, qr_token: c.qr_token }))
  ];

  return (
    <div className="space-y-6" data-testid="user-qr-page">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white uppercase">Coduri QR</h1>
        <p className="text-white/40 text-sm mt-1">
          Arată codul QR la recepție pentru a înregistra prezența
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {persons.map((person) => (
          <div
            key={person.id}
            className="bg-[#0A0A0A] border border-white/5 p-6"
            data-testid={`qr-card-${person.id}`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 flex items-center justify-center rounded-full ${
                person.type === 'user' ? 'bg-[#CCFF00]/20' : 'bg-purple-500/20'
              }`}>
                <span className={person.type === 'user' ? 'text-[#CCFF00]' : 'text-purple-400'}>
                  {person.name?.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-white font-medium">{person.name}</p>
                <p className="text-white/40 text-xs">{person.type === 'user' ? 'Adult' : 'Copil'}</p>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-6">
              {person.qr_token ? (
                <QRDisplay value={person.qr_token} size={180} />
              ) : (
                <div className="w-[212px] h-[212px] bg-[#121212] flex items-center justify-center">
                  <QrCode size={48} className="text-white/20" />
                </div>
              )}
            </div>

            {/* Token Display */}
            <div className="bg-[#121212] p-3 flex items-center justify-between gap-2">
              <code className="text-[#CCFF00] text-xs truncate flex-1">
                {person.qr_token?.substring(0, 24)}...
              </code>
              <button
                onClick={() => handleCopy(person.qr_token, person.id)}
                className="text-white/40 hover:text-white p-1 transition-colors"
              >
                {copiedId === person.id ? (
                  <Check size={14} className="text-green-400" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#CCFF00]/10 border border-[#CCFF00]/20 p-4">
        <h3 className="text-[#CCFF00] font-heading text-sm uppercase mb-2">Cum funcționează</h3>
        <ol className="text-white/60 text-sm space-y-2">
          <li>1. Deschide această pagină pe telefonul tău</li>
          <li>2. Arată codul QR antrenorului la intrare</li>
          <li>3. Prezența ta va fi înregistrată automat</li>
        </ol>
      </div>
    </div>
  );
};

export default UserQRPage;
