import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout';
import { coachesAPI, locationsAPI, plansAPI, seedAPI } from '../../lib/api';
import { 
  ChevronRight, 
  Droplets, 
  Shield, 
  Trophy, 
  Heart, 
  Users, 
  Zap,
  MapPin,
  Phone,
  ArrowRight
} from 'lucide-react';

const HERO_IMAGE = "https://images.unsplash.com/photo-1532205924750-7e84f03402b2?w=1920&q=80";

const benefits = [
  {
    icon: Droplets,
    title: "Adaptare la Mediul Acvatic",
    description: "Dezvoltăm confortul și încrederea în apă de la primele lecții."
  },
  {
    icon: Shield,
    title: "Sistem Imunitar Puternic",
    description: "Înotul regulat întărește sistemul imunitar natural."
  },
  {
    icon: Heart,
    title: "Dezvoltare Armonioasă",
    description: "Creștere fizică și psihomotorie echilibrată."
  },
  {
    icon: Zap,
    title: "Capacitate de Efort",
    description: "Îmbunătățirea rezistenței și a performanței generale."
  },
  {
    icon: Trophy,
    title: "Performanță Sportivă",
    description: "Pregătire pentru competiții la nivel național și internațional."
  },
  {
    icon: Users,
    title: "Dezvoltare Socială",
    description: "Lucrul în echipă și prietenii durabile."
  }
];

const testimonials = [
  {
    name: "Maria Popescu",
    role: "Părinte",
    text: "Copilul meu a învățat să înoate în doar câteva luni. Antrenorii sunt extraordinari!",
  },
  {
    name: "Alexandru Ionescu",
    role: "Înotător adult",
    text: "La 40 de ani am învățat în sfârșit să înot corect. Recomand cu încredere!",
  },
  {
    name: "Elena Dumitrescu",
    role: "Părinte",
    text: "Profesionalismul și dedicarea echipei Nautica sunt de neegalat.",
  }
];

const faqs = [
  {
    question: "De la ce vârstă pot începe cursurile?",
    answer: "Oferim cursuri BabySwim pentru copii de la 6 luni și cursuri de inițiere de la 4 ani."
  },
  {
    question: "Ce echipament este necesar?",
    answer: "Costum de baie, ochelari de înot, cască și papuci de piscină. Echipa vă poate ghida la achiziție."
  },
  {
    question: "Cât durează o ședință?",
    answer: "Ședințele durează între 45 minute și 1 oră, în funcție de program și nivel."
  },
  {
    question: "Există reduceri pentru frați?",
    answer: "Da, oferim 10% reducere pentru al doilea copil din familie înscris la cursuri."
  }
];

const HomePage = () => {
  const [coaches, setCoaches] = useState([]);
  const [locations, setLocations] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coachesRes, locationsRes] = await Promise.all([
        coachesAPI.getAll(),
        locationsAPI.getAll()
      ]);
      setCoaches(coachesRes.data.slice(0, 3));
      setLocations(locationsRes.data);
      
      // If no data, seed it
      if (coachesRes.data.length === 0) {
        setSeeding(true);
        await seedAPI.seed();
        // Refetch after seeding
        const [c, l] = await Promise.all([
          coachesAPI.getAll(),
          locationsAPI.getAll()
        ]);
        setCoaches(c.data.slice(0, 3));
        setLocations(l.data);
        setSeeding(false);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center" data-testid="hero-section">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
          <div className="max-w-2xl">
            <span className="inline-block text-[#CCFF00] text-xs font-heading uppercase tracking-[0.3em] mb-6 animate-fade-in">
              Club Sportiv Nautica • Bacău
            </span>
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-black text-white uppercase leading-none mb-6 animate-slide-up">
              Înoată
              <span className="text-[#CCFF00] block">Spre Succes</span>
            </h1>
            <p className="text-white/70 text-lg mb-10 max-w-lg animate-slide-up stagger-2">
              De peste un deceniu formăm campioni și oferim cursuri de natație pentru toate vârstele și nivelurile.
            </p>
            <div className="flex flex-wrap gap-4 animate-slide-up stagger-3">
              <Link
                to="/abonamente"
                data-testid="hero-cta-primary"
                className="btn-primary px-8 py-4 text-base flex items-center gap-2"
              >
                Vezi Abonamentele
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/contact"
                data-testid="hero-cta-secondary"
                className="btn-secondary px-8 py-4 text-base"
              >
                Contactează-ne
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <div className="w-1 h-2 bg-[#CCFF00] rounded-full" />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 md:py-32 bg-[#050505]" data-testid="benefits-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#CCFF00] text-xs font-heading uppercase tracking-[0.3em] mb-4 block">
              De ce Nautica
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white uppercase">
              Beneficiile Natației
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group p-8 bg-[#0A0A0A] border border-white/5 hover:border-[#CCFF00]/30 transition-all duration-300 card-hover"
              >
                <div className="w-12 h-12 bg-[#CCFF00]/10 flex items-center justify-center mb-6 group-hover:bg-[#CCFF00]/20 transition-colors">
                  <benefit.icon className="text-[#CCFF00]" size={24} />
                </div>
                <h3 className="font-heading text-xl font-bold text-white uppercase mb-3">
                  {benefit.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coaches Teaser */}
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
              to="/despre"
              className="flex items-center gap-2 text-white/60 hover:text-[#CCFF00] transition-colors text-sm font-heading uppercase tracking-wider"
            >
              Vezi toți antrenorii
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coaches.map((coach, index) => (
              <div
                key={coach.id}
                className="group relative overflow-hidden bg-[#121212] border border-white/5 hover:border-[#CCFF00]/30 transition-all"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={coach.photo_url || `https://images.unsplash.com/photo-1584380931214-dbb5b72e7fd0?w=400`}
                    alt={coach.name}
                    className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-[#CCFF00] text-xs font-heading uppercase tracking-widest mb-2">
                    {coach.role_title}
                  </p>
                  <h3 className="font-heading text-xl font-bold text-white uppercase">
                    {coach.name}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {coach.coaching_types?.slice(0, 3).map((type, i) => (
                      <span key={i} className="text-xs text-white/50 bg-white/10 px-2 py-1">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscriptions Teaser */}
      <section className="py-24 md:py-32 bg-[#050505]" data-testid="subscriptions-teaser">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[#CCFF00] text-xs font-heading uppercase tracking-[0.3em] mb-4 block">
                Abonamente Flexibile
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white uppercase mb-6">
                Planuri Pentru<br />Fiecare Nivel
              </h2>
              <p className="text-white/50 mb-8 leading-relaxed">
                De la cursuri de inițiere pentru cei mici, până la antrenamente de performanță pentru sportivii de competiție. 
                Oferim abonamente adaptate nevoilor tale, cu opțiuni de personal training și programe speciale.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/abonamente"
                  data-testid="subscriptions-cta"
                  className="btn-primary px-8 py-4 flex items-center gap-2"
                >
                  Vezi Toate Abonamentele
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-[#0A0A0A] border border-white/5">
                <div className="text-[#CCFF00] font-heading text-4xl font-bold mb-2">80</div>
                <div className="text-white/50 text-sm">LEI / ședință</div>
                <div className="text-white font-heading uppercase text-sm mt-2">Copii Inițiere</div>
              </div>
              <div className="p-6 bg-[#0A0A0A] border border-white/5">
                <div className="text-[#CCFF00] font-heading text-4xl font-bold mb-2">440</div>
                <div className="text-white/50 text-sm">LEI / 8 ședințe</div>
                <div className="text-white font-heading uppercase text-sm mt-2">Abonament Copii</div>
              </div>
              <div className="p-6 bg-[#0A0A0A] border border-white/5">
                <div className="text-[#CCFF00] font-heading text-4xl font-bold mb-2">490</div>
                <div className="text-white/50 text-sm">LEI / 8 ședințe</div>
                <div className="text-white font-heading uppercase text-sm mt-2">Abonament Adulți</div>
              </div>
              <div className="p-6 bg-[#CCFF00] text-black">
                <div className="font-heading text-4xl font-bold mb-2">10%</div>
                <div className="text-black/70 text-sm">reducere</div>
                <div className="font-heading uppercase text-sm mt-2">Al 2-lea copil</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Locations Teaser */}
      <section className="py-24 md:py-32 bg-[#0A0A0A]" data-testid="locations-teaser">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-[#CCFF00] text-xs font-heading uppercase tracking-[0.3em] mb-4 block">
              Locații
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white uppercase mb-4">
              3 Bazine în Bacău
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              Antrenamente în cele mai bune bazine din oraș, cu facilități moderne și acces facil.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {locations.map((location) => (
              <div
                key={location.id}
                className={`p-6 border transition-all ${
                  location.is_highlighted
                    ? 'bg-[#CCFF00]/5 border-[#CCFF00]/30'
                    : 'bg-[#121212] border-white/5 hover:border-white/10'
                }`}
              >
                {location.is_highlighted && (
                  <span className="inline-block bg-[#CCFF00] text-black text-[10px] font-bold uppercase px-2 py-1 mb-4">
                    Sediu Principal
                  </span>
                )}
                <h3 className="font-heading text-lg font-bold text-white uppercase mb-2">
                  {location.name}
                </h3>
                <p className="text-white/40 text-sm mb-4 flex items-start gap-2">
                  <MapPin size={14} className="flex-shrink-0 mt-0.5" />
                  {location.address}
                </p>
                <div className="flex flex-wrap gap-2">
                  {location.facilities?.slice(0, 3).map((f, i) => (
                    <span key={i} className="text-xs text-white/30 bg-white/5 px-2 py-1">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/locatii"
              className="inline-flex items-center gap-2 text-white/60 hover:text-[#CCFF00] transition-colors text-sm font-heading uppercase tracking-wider"
            >
              Vezi toate locațiile pe hartă
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 md:py-32 bg-[#050505]" data-testid="testimonials-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-[#CCFF00] text-xs font-heading uppercase tracking-[0.3em] mb-4 block">
              Testimoniale
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

      {/* FAQ */}
      <section className="py-24 md:py-32 bg-[#0A0A0A]" data-testid="faq-section">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-[#CCFF00] text-xs font-heading uppercase tracking-[0.3em] mb-4 block">
              Întrebări Frecvente
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white uppercase">
              FAQ
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-white/10 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                  data-testid={`faq-${index}`}
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
                  <div className="px-6 pb-6 text-white/60 text-sm leading-relaxed animate-slide-down">
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
            Începe Să Înoți Astăzi
          </h2>
          <p className="text-black/70 mb-10 max-w-2xl mx-auto">
            Contactează-ne pentru mai multe informații sau pentru a te înscrie la cursuri. Echipa noastră te așteaptă!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="tel:0745312668"
              data-testid="cta-phone"
              className="bg-black text-white px-8 py-4 font-heading font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-black/80 transition-colors"
            >
              <Phone size={18} />
              Sună Acum
            </a>
            <a
              href="https://wa.me/40745312668"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="cta-whatsapp"
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
