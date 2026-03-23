import { useState } from 'react';
import PublicLayout from '../../components/PublicLayout';
import { contactAPI } from '../../lib/api';
import { toast } from 'sonner';
import { Phone, Mail, MapPin, Send, MessageCircle, Clock } from 'lucide-react';

const ContactPage = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await contactAPI.submit(form);
      toast.success('Mesajul a fost trimis cu succes!');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      toast.error('A apărut o eroare. Încercați din nou.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#050505]" data-testid="contact-hero">
        <div className="max-w-7xl mx-auto px-6">
          <span className="text-[#CCFF00] text-xs font-heading uppercase tracking-[0.3em] mb-4 block">
            Contact
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase leading-tight mb-4">
            Hai Să Vorbim
          </h1>
          <p className="text-white/60 text-lg max-w-2xl">
            Ai întrebări? Vrei să te înscrii la cursuri? Contactează-ne și îți răspundem cât mai curând.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-[#050505]" data-testid="contact-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-white uppercase mb-8">
                Informații de Contact
              </h2>

              <div className="space-y-6 mb-12">
                <a
                  href="tel:0745312668"
                  className="flex items-start gap-4 p-4 bg-[#0A0A0A] border border-white/5 hover:border-[#CCFF00]/30 transition-colors group"
                  data-testid="contact-phone"
                >
                  <div className="w-12 h-12 bg-[#CCFF00]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#CCFF00]/20 transition-colors">
                    <Phone className="text-[#CCFF00]" size={20} />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Telefon</p>
                    <p className="text-white font-heading text-lg">0745 312 668</p>
                    <p className="text-white/40 text-sm mt-1">Ovidiu Galeru - Coordonator</p>
                  </div>
                </a>

                <a
                  href="https://wa.me/40745312668"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-4 bg-[#0A0A0A] border border-white/5 hover:border-[#CCFF00]/30 transition-colors group"
                  data-testid="contact-whatsapp"
                >
                  <div className="w-12 h-12 bg-[#CCFF00]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#CCFF00]/20 transition-colors">
                    <MessageCircle className="text-[#CCFF00]" size={20} />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">WhatsApp</p>
                    <p className="text-white font-heading text-lg">Trimite un mesaj</p>
                    <p className="text-white/40 text-sm mt-1">Răspundem rapid!</p>
                  </div>
                </a>

                <a
                  href="mailto:contact@nautica-swim.ro"
                  className="flex items-start gap-4 p-4 bg-[#0A0A0A] border border-white/5 hover:border-[#CCFF00]/30 transition-colors group"
                  data-testid="contact-email"
                >
                  <div className="w-12 h-12 bg-[#CCFF00]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#CCFF00]/20 transition-colors">
                    <Mail className="text-[#CCFF00]" size={20} />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Email</p>
                    <p className="text-white font-heading text-lg">contact@nautica-swim.ro</p>
                  </div>
                </a>

                <div className="flex items-start gap-4 p-4 bg-[#0A0A0A] border border-white/5">
                  <div className="w-12 h-12 bg-[#CCFF00]/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-[#CCFF00]" size={20} />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Sediu Principal</p>
                    <p className="text-white font-heading text-lg">Bazin Fiald (Hotel Fiald)</p>
                    <p className="text-white/40 text-sm mt-1">Strada Tazlăului 7A, Bacău</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-[#0A0A0A] border border-white/5">
                  <div className="w-12 h-12 bg-[#CCFF00]/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="text-[#CCFF00]" size={20} />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Program</p>
                    <p className="text-white font-heading text-lg">Luni - Sâmbătă</p>
                    <p className="text-white/40 text-sm mt-1">Conform programului de antrenamente</p>
                  </div>
                </div>
              </div>

              {/* Quick CTAs */}
              <div className="flex flex-wrap gap-4">
                <a
                  href="tel:0745312668"
                  className="btn-primary px-6 py-3 flex items-center gap-2"
                >
                  <Phone size={18} />
                  Sună Acum
                </a>
                <a
                  href="https://wa.me/40745312668"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary px-6 py-3 flex items-center gap-2"
                >
                  <MessageCircle size={18} />
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-white uppercase mb-8">
                Trimite un Mesaj
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">
                    Nume *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full input-underline text-white"
                    placeholder="Numele dumneavoastră"
                    data-testid="contact-name-input"
                  />
                </div>

                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full input-underline text-white"
                    placeholder="adresa@email.ro"
                    data-testid="contact-email-input"
                  />
                </div>

                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full input-underline text-white"
                    placeholder="07XX XXX XXX"
                    data-testid="contact-phone-input"
                  />
                </div>

                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">
                    Mesaj *
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full input-underline text-white resize-none"
                    placeholder="Scrieți mesajul aici..."
                    data-testid="contact-message-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                  data-testid="contact-submit"
                >
                  {loading ? (
                    <span>Se trimite...</span>
                  ) : (
                    <>
                      <Send size={18} />
                      Trimite Mesajul
                    </>
                  )}
                </button>

                <p className="text-white/30 text-xs text-center">
                  Prin trimiterea formularului, sunteți de acord cu{' '}
                  <a href="/confidentialitate" className="text-[#CCFF00] hover:underline">
                    politica de confidențialitate
                  </a>
                  .
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default ContactPage;
