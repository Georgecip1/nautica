import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, Phone, MapPin, Mail } from 'lucide-react';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_ccb1a182-4c98-43e1-b457-d8fbdb54f772/artifacts/ew7jp05u_IMG_9819.png";

const navLinks = [
  { href: '/', label: 'Acasă' },
  { href: '/despre', label: 'Despre Noi' },
  { href: '/abonamente', label: 'Abonamente' },
  { href: '/locatii', label: 'Locații' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3" data-testid="header-logo">
            <img src={LOGO_URL} alt="Nautica Swimming" className="h-12 w-12 object-contain" />
            <div className="hidden sm:block">
              <span className="font-heading text-xl font-bold text-white tracking-tight">NAUTICA</span>
              <span className="block text-[10px] text-[#CCFF00] uppercase tracking-[0.3em]">Swimming Club</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                data-testid={`nav-${link.href.replace('/', '') || 'home'}`}
                className={`font-heading text-sm uppercase tracking-wider transition-colors ${
                  location.pathname === link.href
                    ? 'text-[#CCFF00]'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/login"
              data-testid="nav-login"
              className="btn-primary px-6 py-2 text-sm"
            >
              Intră în cont
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-white p-2"
            data-testid="mobile-menu-toggle"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-white/10 pt-4 animate-slide-down">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`font-heading text-sm uppercase tracking-wider ${
                    location.pathname === link.href
                      ? 'text-[#CCFF00]'
                      : 'text-white/70'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="btn-primary px-6 py-2 text-sm text-center mt-2"
              >
                Intră în cont
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
            <Link to="/" className="flex items-center gap-3 mb-6">
              <img src={LOGO_URL} alt="Nautica Swimming" className="h-14 w-14 object-contain" />
              <div>
                <span className="font-heading text-2xl font-bold text-white tracking-tight">NAUTICA</span>
                <span className="block text-xs text-[#CCFF00] uppercase tracking-[0.2em]">Swimming Club</span>
              </div>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed">
              Club sportiv de natație din Bacău. Formăm înotători de performanță și oferim cursuri pentru toate vârstele.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading text-sm uppercase tracking-wider text-[#CCFF00] mb-6">Navigare</h4>
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-white/50 hover:text-white text-sm transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-heading text-sm uppercase tracking-wider text-[#CCFF00] mb-6">Legal</h4>
            <div className="flex flex-col gap-3">
              <Link to="/confidentialitate" className="text-white/50 hover:text-white text-sm transition-colors">
                Politica de Confidențialitate
              </Link>
              <Link to="/termeni" className="text-white/50 hover:text-white text-sm transition-colors">
                Termeni și Condiții
              </Link>
              <Link to="/cookies" className="text-white/50 hover:text-white text-sm transition-colors">
                Politica de Cookies
              </Link>
              <a
                href="https://anpc.ro/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-white text-sm transition-colors"
              >
                ANPC
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-sm uppercase tracking-wider text-[#CCFF00] mb-6">Contact</h4>
            <div className="flex flex-col gap-4">
              <a
                href="tel:0745312668"
                className="flex items-center gap-3 text-white/50 hover:text-white text-sm transition-colors"
              >
                <Phone size={16} className="text-[#CCFF00]" />
                0745 312 668
              </a>
              <a
                href="mailto:contact@nautica-swim.ro"
                className="flex items-center gap-3 text-white/50 hover:text-white text-sm transition-colors"
              >
                <Mail size={16} className="text-[#CCFF00]" />
                contact@nautica-swim.ro
              </a>
              <div className="flex items-start gap-3 text-white/50 text-sm">
                <MapPin size={16} className="text-[#CCFF00] flex-shrink-0 mt-0.5" />
                <span>Bacău, România</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} Club Sportiv Nautica. Toate drepturile rezervate.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-white/30 text-xs">Bacău, România</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#050505]">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
