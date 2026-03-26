import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, Phone, MapPin, Mail } from 'lucide-react';

// Folosim imaginea locală (trebuie să pui logo.png în folderul public/)
const LOGO_URL = "/nautica-logo.png";

const navLinks = [
  { href: '/', label: 'Acasă' },
  { href: '/despre', label: 'Echipa' },
  { href: '/abonamente', label: 'Abonamente' },
  { href: '/locatii', label: 'Locații' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Adăugăm un efect pentru a face header-ul mai opac când dăm scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#050505]/95 backdrop-blur-md border-b border-white/5 shadow-2xl py-2' : 'bg-transparent py-4'
    }`}>
      <nav className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group" data-testid="header-logo">
            <img src={LOGO_URL} alt="Nautica Swimming" className="h-10 w-10 sm:h-12 sm:w-12 object-contain group-hover:scale-105 transition-transform" />
            <div className="hidden sm:block">
              <span className="font-heading text-xl font-bold text-white tracking-tight uppercase">NAUTICA</span>
              <span className="block text-[9px] text-[#CCFF00] font-black uppercase tracking-[0.3em] -mt-1">Swimming Club</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                data-testid={`nav-${link.href.replace('/', '') || 'home'}`}
                className={`font-heading text-sm font-bold uppercase tracking-widest transition-colors ${
                  location.pathname === link.href ? 'text-[#CCFF00]' : 'text-white/60 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/login"
              data-testid="nav-login"
              className="btn-primary px-8 py-3 text-xs font-black uppercase tracking-widest ml-4 hover:scale-105 transition-transform"
            >
              Intră în cont
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-[#CCFF00] p-2 bg-[#CCFF00]/10 rounded-sm"
            data-testid="mobile-menu-toggle"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="lg:hidden mt-4 pb-6 border-t border-white/10 pt-4 animate-fade-in bg-[#050505]">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`font-heading text-sm font-bold uppercase tracking-widest px-4 py-3 rounded-sm ${
                    location.pathname === link.href ? 'bg-[#CCFF00]/10 text-[#CCFF00]' : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="my-2 border-t border-white/5" />
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="btn-primary px-6 py-4 text-xs font-black uppercase tracking-widest text-center mt-2 flex justify-center items-center"
              >
                Intră în contul tău
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export const Footer = () => {
  return (
    <footer className="bg-[#0A0A0A] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <img src={LOGO_URL} alt="Nautica Swimming" className="h-14 w-14 object-contain group-hover:scale-105 transition-transform" />
              <div>
                <span className="font-heading text-2xl font-bold text-white tracking-tight uppercase">NAUTICA</span>
                <span className="block text-[10px] text-[#CCFF00] font-black uppercase tracking-[0.2em]">Swimming Club</span>
              </div>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed font-medium">
              Cel mai complex club sportiv de natație din Bacău. Formăm înotători de performanță și oferim cursuri adaptate pentru toate vârstele.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading text-[11px] font-black uppercase tracking-widest text-[#CCFF00] mb-6">Navigare Rapidă</h4>
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-white/50 hover:text-white hover:translate-x-1 text-sm font-bold tracking-wide transition-all w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-heading text-[11px] font-black uppercase tracking-widest text-[#CCFF00] mb-6">Legal & Politici</h4>
            <div className="flex flex-col gap-4">
              <Link to="/confidentialitate" className="text-white/50 hover:text-white hover:translate-x-1 text-sm font-medium transition-all w-fit">
                Politica de Confidențialitate
              </Link>
              <Link to="/termeni" className="text-white/50 hover:text-white hover:translate-x-1 text-sm font-medium transition-all w-fit">
                Termeni și Condiții
              </Link>
              <Link to="/cookies" className="text-white/50 hover:text-white hover:translate-x-1 text-sm font-medium transition-all w-fit">
                Politica de Cookies
              </Link>
              <a
                href="https://anpc.ro/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-[#CCFF00] text-sm font-medium transition-colors w-fit flex items-center gap-1"
              >
                Protecția Consumatorului
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-[11px] font-black uppercase tracking-widest text-[#CCFF00] mb-6">Informații Contact</h4>
            <div className="flex flex-col gap-5">
              <a
                href="tel:0745312668"
                className="flex items-center gap-3 text-white/60 hover:text-[#CCFF00] transition-colors group"
              >
                <div className="bg-white/5 p-2 rounded-sm group-hover:bg-[#CCFF00]/10 transition-colors">
                  <Phone size={16} />
                </div>
                <span className="font-bold tracking-wide">0745 312 668</span>
              </a>
              <a
                href="mailto:contact@nautica-swim.ro"
                className="flex items-center gap-3 text-white/60 hover:text-[#CCFF00] transition-colors group"
              >
                <div className="bg-white/5 p-2 rounded-sm group-hover:bg-[#CCFF00]/10 transition-colors">
                  <Mail size={16} />
                </div>
                <span className="font-bold tracking-wide">contact@nautica-swim.ro</span>
              </a>
              <div className="flex items-start gap-3 text-white/60">
                <div className="bg-white/5 p-2 rounded-sm">
                  <MapPin size={16} className="text-white" />
                </div>
                <span className="font-medium pt-1">Bacău, România</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-xs font-medium uppercase tracking-widest text-center">
            © {new Date().getFullYear()} Club Sportiv Nautica. Toate drepturile rezervate.
          </p>
        </div>
      </div>
    </footer>
  );
};

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#050505] font-sans selection:bg-[#CCFF00] selection:text-black">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default PublicLayout;