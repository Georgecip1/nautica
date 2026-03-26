import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_ccb1a182-4c98-43e1-b457-d8fbdb54f772/artifacts/ew7jp05u_IMG_9819.png";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect automat dacă ești deja logat
  useEffect(() => {
    if (user) {
      if (user.role === 'USER') {
        navigate('/portal');
      } else {
        navigate('/admin');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(form.email, form.password);
      toast.success('Autentificare reușită!');
      // Redirecționarea o va face useEffect-ul de mai sus imediat ce "user" se actualizează
    } catch (error) {
      const message = error.response?.data?.detail || 'Eroare la autentificare';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex">
      {/* Partea Stângă - Formular */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24">
        <div className="max-w-md mx-auto w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-12">
            <img src={LOGO_URL} alt="Nautica" className="h-14 w-14 object-contain" />
            <div>
              <span className="font-heading text-2xl font-bold text-white">NAUTICA</span>
              <span className="block text-xs text-[#CCFF00] uppercase tracking-[0.2em]">Swimming Club</span>
            </div>
          </Link>

          <h1 className="font-heading text-3xl sm:text-4xl font-black text-white uppercase mb-2">
            Bine ai venit
          </h1>
          <p className="text-white/50 mb-8">
            Conectează-te pentru a accesa contul tău
          </p>

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full bg-transparent border border-white/10 focus:border-[#CCFF00] px-4 py-3 text-white placeholder:text-white/30 transition-colors"
                placeholder="adresa@email.ro"
                data-testid="login-email"
              />
            </div>

            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">
                Parolă
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="w-full bg-transparent border border-white/10 focus:border-[#CCFF00] px-4 py-3 text-white placeholder:text-white/30 transition-colors pr-12"
                  placeholder="••••••••"
                  data-testid="login-password"
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

            <div className="flex items-center justify-between">
              <Link
                to="/reseteaza-parola"
                className="text-white/40 hover:text-[#CCFF00] text-sm transition-colors"
              >
                Ai uitat parola?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50"
              data-testid="login-submit"
            >
              {loading ? 'Se conectează...' : (
                <>
                  Conectare
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-white/30 text-sm">
              Nu ai cont? Contactează administrația clubului pentru înregistrare.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5">
            <Link
              to="/"
              className="text-white/40 hover:text-white text-sm transition-colors"
            >
              ← Înapoi la site
            </Link>
          </div>
        </div>
      </div>

      {/* Partea Dreaptă - Imagine */}
      <div className="hidden lg:block w-1/2 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(https://images.unsplash.com/photo-1532205924750-7e84f03402b2?w=1200&q=80)` 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-black/50 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12">
          <div className="text-[#CCFF00] font-heading text-7xl font-black opacity-20">
            SWIM
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;