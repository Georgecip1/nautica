import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../lib/api';
import { toast } from 'sonner';
import { Mail, Check } from 'lucide-react';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_ccb1a182-4c98-43e1-b457-d8fbdb54f772/artifacts/ew7jp05u_IMG_9819.png";

const ResetPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAPI.requestReset(email);
      setSent(true);
      toast.success('Dacă emailul există, vei primi un link de resetare');
    } catch (error) {
      toast.error('A apărut o eroare');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-[#CCFF00]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail size={32} className="text-[#CCFF00]" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-white uppercase mb-4">
            Verifică Email-ul
          </h1>
          <p className="text-white/50 mb-6">
            Dacă adresa de email există în sistemul nostru, vei primi un link pentru resetarea parolei.
          </p>
          <Link to="/login" className="text-[#CCFF00] hover:underline">
            Înapoi la conectare
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <Link to="/" className="flex items-center gap-3 mb-12 justify-center">
          <img src={LOGO_URL} alt="Nautica" className="h-14 w-14 object-contain" />
          <div>
            <span className="font-heading text-2xl font-bold text-white">NAUTICA</span>
            <span className="block text-xs text-[#CCFF00] uppercase tracking-[0.2em]">Swimming Club</span>
          </div>
        </Link>

        <h1 className="font-heading text-3xl font-black text-white uppercase mb-2 text-center">
          Resetează Parola
        </h1>
        <p className="text-white/50 mb-8 text-center">
          Introdu adresa de email pentru a primi un link de resetare
        </p>

        <form onSubmit={handleSubmit} className="space-y-6" data-testid="reset-password-form">
          <div>
            <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent border border-white/10 focus:border-[#CCFF00] px-4 py-3 text-white placeholder:text-white/30 transition-colors"
              placeholder="adresa@email.ro"
              data-testid="reset-email-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 disabled:opacity-50"
            data-testid="reset-submit"
          >
            {loading ? 'Se trimite...' : 'Trimite Link'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/login" className="text-white/40 hover:text-white text-sm transition-colors">
            ← Înapoi la conectare
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
