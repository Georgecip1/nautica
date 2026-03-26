import { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout';
import { 
  ChevronRight, 
  MapPin,
  Phone,
  ArrowRight,
  Calendar,
  UserCheck
} from 'lucide-react';

const HERO_IMAGE = "https://images.unsplash.com/photo-1532205924750-7e84f03402b2?w=1920&q=80";

const infoCards = [
  {
    icon: MapPin,
    title: "Locații",
    description: "Hotel Fiald, Bazinul Olimpic, Hotel EMD"
  },
  {
    icon: Calendar,
    title: "Program",
    description: "Luni-Sâmbătă"
  },
  {
    icon: UserCheck,
    title: "Abonamente",
    description: "Cu antrenor personal sau în grupă"
  }
];

const COACHES_TEASER = [
  {
    id: 1,
    name: "Ovidiu Galeru",
    role: "Profesor • Antrenor",
    photo: "/team/ovidiu.jpeg" 
  },
  {
    id: 2,
    name: "Cornelia Galeru",
    role: "Antrenor • Coordonator",
    photo: "/team/cornelia.jpeg"
  },
  {
    id: 3,
    name: "Sabin Jitaru",
    role: "Antrenor",
    photo: "/team/sabin.jpeg"
  }
];

const testimonials = [
  {
    name: "Andreea Mărgineanu",
    role: "Părinte",
    text: "Matei abia așteaptă zilele de antrenament. Evoluția lui de la frică de apă la primele lungimi de bazin a fost incredibilă!",
  },
  {
    name: "Bogdan Stănescu",
    role: "Înotător Adult",
    text: "Am venit pentru recuperare medicală și am rămas pentru tehnică. Atmosfera la EMD este exact ce aveam nevoie după birou.",
  },
  {
    name: "Simona Vasiliu",
    role: "Părinte",
    text: "Răbdarea antrenorilor de la Fiald este de neegalat. Se vede că fac asta din pasiune, nu doar ca pe un job.",
  }
];

const faqs = [
  {
    question: "Ce echipament este necesar?",
    answer: "Costum de baie, ochelari de înot, cască și papuci de piscină. Echipa vă poate ghida la achiziție dacă aveți nevoie de recomandări."
  },
  {
    question: "Cât durează o ședință?",
    answer: "Ședințele durează între 45 minute și 1 oră, în funcție de programul ales și nivelul de pregătire al cursantului."
  },
  {
    question: "Există reduceri pentru frați?",
    answer: "Da, încurajăm familiile sportive! Oferim o reducere de 10% pentru al doilea copil înscris la cursurile noastre."
  }
];

const HomePage = () => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center" data-testid="hero-section">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        <div className="absolute inset-0 hero-overlay bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 w-full">
          <div className="max-w-2xl">
            <span className="inline-block text-[#CCFF00] text-xs font-heading uppercase tracking-[0.3em] mb-6 animate-fade-in">
              Club Sportiv Nautica • Bacău
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase leading-tight mb-6 animate-slide-up">
              Cursuri de înot pentru copii, adulți 
              <span className="text-[#CCFF00] block text-2xl sm:text-3xl lg:text-4xl mt-2 font-bold tracking-tight">
                - învățare și perfecționare -
              </span>
            </h1>
            <p className="text-white/70 text-lg mb-10 max-w-lg animate-slide-up stagger-2">
              Cel mai mare club de înot din Bacău. Antrenori dedicați, progres rapid într-un mediu prietenos și sigur.
            </p>
            <div className="flex flex-wrap gap-4 animate-slide-up stagger-3">
              <Link
                to="/subscriptions"
                className="btn-primary bg-[#CCFF00] text-black px-8 py-4 text-base font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-white transition-colors"
              >
                Vezi Abonamentele
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/contact"
                className="btn-secondary bg-white/10 text-white px-8 py-4 text-base font-bold uppercase tracking-wider hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                Contactează-ne
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <div className="w-1 h-2 bg-[#CCFF00] rounded-full" />
          </div>
        </div>
      </section>

      {/* Info Cards Section */}
      <section className="py-24 md:py-32 bg-[#050505]" data-testid="info-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#CCFF00] text-xs font-heading uppercase tracking-[0.3em] mb-4 block">
              Informații Esențiale
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white uppercase">
              Tot ce trebuie să știi
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {infoCards.map((card, index) => (
              <div
                key={index}
                className="group p-8 bg-[#0A0A0A] border border-white/5 hover:border-[#CCFF00]/30 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-[#CCFF00]/10 flex items-center justify-center mb-6 group-hover:bg-[#CCFF00] group-hover:text-black transition-colors rounded-sm text-[#CCFF00]">
                  <card.icon size={24} />
                </div>
                <h3 className="font-heading text-xl font-bold text-white uppercase mb-3">
                  {card.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coaches Teaser - ACUM IDENTIC CU ABOUT PAGE */}
      <section className="py-24 md:py-32 bg-[#0A0A0A]" data-testid="coaches-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
            <div>
              <span className="text-[#CCFF00] text-xs font-heading uppercase tracking-[0.3em] mb-4 block">
                Echipa Noastră
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white uppercase">
                Antrenori Profesioniști
              </h2>
            </div>
            <Link
              to="/about"
              className="flex items-center gap-2 text-white/60 hover:text-[#CCFF00] transition-colors text-sm font-heading uppercase tracking-wider group"
            >
              Vezi toți antrenorii
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {COACHES_TEASER.map((coach, index) => (
              <div key={index} className="bg-[#121212] border border-white/5 flex flex-col h-full group hover:border-[#CCFF00]/30 transition-all duration-300">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img 
                    src={coach.photo} 
                    alt={coach.name} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1584380931214-dbb5b72e7fd0?w=400'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent opacity-80" />
                  <div className="absolute bottom-6 left-6 right-6 z-10">
                    <h3 className="text-white font-heading text-2xl font-black uppercase leading-none">{coach.name}</h3>
                    <p className="text-[#CCFF00] text-xs font-heading uppercase tracking-widest mt-2">{coach.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 md:py-32 bg-[#050505]" data-testid="testimonials-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-[#CCFF00] text-xs font-heading uppercase tracking-[0.3em] mb-4 block">
              Părerea Lor
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white uppercase">
              Ce Spun Clienții
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-8 bg-[#0A0A0A] border border-white/5 hover:bg-white/[0.02] transition-colors flex flex-col"
              >
                <div className="text-[#CCFF00] text-5xl font-serif mb-2 leading-none">"</div>
                <p className="text-white/70 mb-8 leading-relaxed text-sm flex-1">
                  {testimonial.text}
                </p>
                <div className="border-t border-white/10 pt-4">
                  <p className="font-heading text-white font-bold uppercase tracking-tight">{testimonial.name}</p>
                  <p className="text-[#CCFF00] text-[10px] uppercase font-black tracking-widest mt-1">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 md:py-32 bg-[#0A0A0A]" data-testid="faq-section">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-[#CCFF00] text-xs font-heading uppercase tracking-[0.3em] mb-4 block">
              FAQ
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white uppercase">
              Informații utile
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-white/5 overflow-hidden bg-[#050505] transition-colors hover:border-[#CCFF00]/20"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-heading text-white font-bold tracking-wide pr-4">{faq.question}</span>
                  <ChevronRight
                    size={20}
                    className={`text-[#CCFF00] flex-shrink-0 transition-transform duration-300 ${
                      openFaq === index ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                <div 
                  className={`px-6 text-white/60 text-sm leading-relaxed transition-all duration-300 overflow-hidden ${
                    openFaq === index ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - PUN LOCAL */}
      <section className="py-24 md:py-32 bg-[#CCFF00] relative overflow-hidden" data-testid="cta-section">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <span className="inline-block text-black font-black uppercase tracking-[0.3em] text-sm mb-4">
            Transformăm Bistrița în ocean!
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black text-black uppercase mb-6 leading-none tracking-tighter">
            Bacăul n-are mare, <br className="hidden sm:block" /> dar te facem înotător tare!
          </h2>
          <p className="text-black/80 mb-10 max-w-2xl mx-auto font-bold tracking-wide">
            Rezervă un loc la bazin. Promitem că apa e mai curată decât cea din Insula de Agrement!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="tel:0745312668"
              className="bg-black text-[#CCFF00] px-8 py-5 font-heading font-black uppercase tracking-widest flex items-center gap-3 hover:bg-black/80 hover:scale-105 transition-all"
            >
              <Phone size={18} />
              Sună Acum
            </a>
            <a
              href="https://wa.me/40745312668"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black/10 text-black border-2 border-black px-8 py-5 font-heading font-black uppercase tracking-widest hover:bg-black hover:text-[#CCFF00] hover:scale-105 transition-all"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default HomePage;