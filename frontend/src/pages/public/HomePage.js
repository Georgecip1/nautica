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
    role: "Profesor • Antrenor • Coordonator",
    photo: "/team/ovidiu.jpg" // Asigură-te că există în /public/team/
  },
  {
    id: 2,
    name: "Cornelia Galeru",
    role: "Antrenor • Coordonator",
    photo: "/team/cornelia.jpg"
  },
  {
    id: 3,
    name: "Mara Nicola Galeru",
    role: "Antrenor",
    photo: "/team/mara.jpg"
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

  // Am eliminat complet useEffect-ul și stările (useState) inutile care încetineau pagina

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
                <div className="w-12 h-12 bg-[#CCFF00]/10 flex items-center justify-center mb-6 group-hover:bg-[#CCFF00]/20 transition-colors rounded-sm">
                  <card.icon className="text-[#CCFF00]" size={24} />
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

      {/* Coaches Teaser - ACUM ESTE HARDCODAT */}
      <section className="py-24 md:py-32 bg-[#0A0A0A]" data-testid="coaches-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
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
              className="flex items-center gap-2 text-white/60 hover:text-[#CCFF00] transition-colors text-sm font-heading uppercase tracking-wider"
            >
              Vezi toți antrenorii
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COACHES_TEASER.map((coach) => (
              <div
                key={coach.id}
                className="group relative overflow-hidden bg-[#121212] border border-white/5 hover:border-[#CCFF00]/30 transition-all"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={coach.photo}
                    alt={coach.name}
                    className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1584380931214-dbb5b72e7fd0?w=400'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                  <p className="text-[#CCFF00] text-xs font-heading uppercase tracking-widest mb-2">
                    {coach.role}
                  </p>
                  <h3 className="font-heading text-xl font-bold text-white uppercase">
                    {coach.name}
                  </h3>
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
                className="p-8 bg-[#0A0A0A] border border-white/5"
              >
                <div className="text-[#CCFF00] text-4xl font-serif mb-4">"</div>
                <p className="text-white/70 mb-6 leading-relaxed">
                  {testimonial.text}
                </p>
                <div>
                  <p className="font-heading text-white font-bold">{testimonial.name}</p>
                  <p className="text-white/40 text-sm">{testimonial.role}</p>
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
                className="border border-white/10 overflow-hidden bg-[#050505]"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-heading text-white font-medium pr-4">{faq.question}</span>
                  <ChevronRight
                    size={20}
                    className={`text-[#CCFF00] flex-shrink-0 transition-transform ${
                      openFaq === index ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6 text-white/60 text-sm leading-relaxed animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 bg-[#CCFF00]" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-black uppercase mb-6">
            Nu mai sta pe mal, <br className="hidden sm:block" /> intră cu noi în val!
          </h2>
          <p className="text-black/70 mb-10 max-w-2xl mx-auto font-medium">
            Fie că ești la primul contact cu apa sau vrei să îți rafinezi tehnica, echipa Nautica te ajută să ajungi la destinație.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="tel:0745312668"
              className="bg-black text-white px-8 py-4 font-heading font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-black/80 transition-colors"
            >
              <Phone size={18} />
              Sună Acum
            </a>
            <a
              href="https://wa.me/40745312668"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black/10 text-black px-8 py-4 font-heading font-bold uppercase tracking-wider hover:bg-black/20 transition-colors"
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