import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../lib/api';
import { toast } from 'sonner';
import { Eye, EyeOff, Check } from 'lucide-react';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_ccb1a182-4c98-43e1-b457-d8fbdb54f772/artifacts/ew7jp05u_IMG_9819.png";

const SetupPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Parolele nu coincid');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Parola trebuie să aibă cel puțin 6 caractere');
      return;
    }

    setLoading(true);

    try {
      await authAPI.setupPassword(token, password);
      setSuccess(true);
      toast.success('Parolă setată cu succes!');
    } catch (error) {
      const message = error.response?.data?.detail || 'Eroare la setarea parolei';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold text-white uppercase mb-4">
            Link Invalid
          </h1>
          <p className="text-white/50 mb-6">
            Linkul de setare a parolei este invalid sau a expirat.
          </p>
          <Link to="/login" className="text-[#CCFF00] hover:underline">
            Mergi la pagina de conectare
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-[#CCFF00] rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={32} className="text-black" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-white uppercase mb-4">
            Parolă Setată!
          </h1>
          <p className="text-white/50 mb-6">
            Parola ta a fost setată cu succes. Acum te poți conecta.
          </p>
          <Link to="/login" className="btn-primary px-8 py-3 inline-block">
            Conectare
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
          Setează Parola
        </h1>
        <p className="text-white/50 mb-8 text-center">
          Alege o parolă pentru contul tău
        </p>

        <form onSubmit={handleSubmit} className="space-y-6" data-testid="setup-password-form">
          <div>
            <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">
              Parolă nouă
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-transparent border border-white/10 focus:border-[#CCFF00] px-4 py-3 text-white placeholder:text-white/30 transition-colors pr-12"
                placeholder="Minimum 6 caractere"
                data-testid="setup-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">
              Confirmă parola
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-transparent border border-white/10 focus:border-[#CCFF00] px-4 py-3 text-white placeholder:text-white/30 transition-colors"
              placeholder="Repetă parola"
              data-testid="setup-password-confirm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 disabled:opacity-50"
            data-testid="setup-password-submit"
          >
            {loading ? 'Se salvează...' : 'Salvează Parola'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupPasswordPage;
