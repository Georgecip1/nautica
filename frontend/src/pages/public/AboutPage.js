import { useState, useEffect } from 'react';
import PublicLayout from '../../components/PublicLayout';
import { coachesAPI } from '../../lib/api';
import { 
  Target, 
  Award, 
  Heart, 
  Users, 
  Star,
  Phone,
  GraduationCap
} from 'lucide-react';

const objectives = [
  {
    icon: Target,
    title: "Adaptare la Mediul Acvatic",
    description: "Familiarizarea treptată cu apa, depășirea fricii și dezvoltarea confortului în mediul acvatic."
  },
  {
    icon: Heart,
    title: "Dezvoltarea Sistemului Imunitar",
    description: "Înotul regulat contribuie la întărirea sistemului imunitar și la o sănătate mai bună."
  },
  {
    icon: Users,
    title: "Dezvoltare Psihomotorie și Psihosocială",
    description: "Îmbunătățirea coordonării, echilibrului și a abilităților sociale prin activități de grup."
  },
  {
    icon: Award,
    title: "Dezvoltare Fizică Armonioasă",
    description: "Natația implică toate grupele musculare, contribuind la o dezvoltare echilibrată."
  },
  {
    icon: Star,
    title: "Capacitate de Efort Crescută",
    description: "Antrenamentul în apă îmbunătățește rezistența cardiovasculară și capacitatea de efort."
  },
  {
    icon: Target,
    title: "Performanță Sportivă în Competiții",
    description: "Pregătire pentru competiții la nivel local, național și internațional."
  }
];

const values = [
  "Profesionalism și dedicare în fiecare ședință",
  "Atenție individualizată pentru fiecare sportiv",
  "Mediu sigur și prietenos",
  "Metode moderne de antrenament",
  "Comunicare constantă cu părinții"
];

const differentiators = [
  {
    title: "Echipă de Elită",
    description: "Antrenori cu experiență olimpică și rezultate dovedite la nivel național."
  },
  {
    title: "Programe Personalizate",
    description: "Fiecare sportiv beneficiază de un program adaptat nivelului și obiectivelor sale."
  },
  {
    title: "3 Locații în Bacău",
    description: "Flexibilitate maximă cu antrenamente în cele mai bune bazine din oraș."
  },
  {
    title: "Toate Nivelurile",
    description: "De la BabySwim pentru cei mici până la performanță pentru sportivii de competiție."
  }
];

const AboutPage = () => {
  const [coaches, setCoaches] = useState([]);

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    try {
      const response = await coachesAPI.getAll();
      setCoaches(response.data);
    } catch (error) {
      console.error('Failed to fetch coaches:', error);
    }
  };

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-32 pb-20 bg-[#050505]" data-testid="about-hero">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <span className="text-[#CCFF00] text-xs font-heading uppercase tracking-[0.3em] mb-4 block">
              Despre Noi
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase leading-tight mb-6">
              Club Sportiv Nautica
            </h1>
            <p className="text-white/60 text-lg leading-relaxed">
              Suntem un club sportiv de natație din Bacău cu o tradiție de excelență în formarea înotătorilor. 
              De la cursuri de inițiere pentru copii până la pregătirea sportivilor de performanță, 
              oferim programe adaptate tuturor vârstelor și nivelurilor.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-20 bg-[#0A0A0A]" data-testid="mission-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <span className="text-[#CCFF00] text-xs font-heading uppercase tracking-[0.3em] mb-4 block">
                Misiunea Noastră
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white uppercase mb-6">
                Formăm Înotători, Construim Caracter
              </h2>
              <p className="text-white/60 leading-relaxed mb-6">
                Misiunea noastră este să oferim cea mai bună pregătire în natație, într-un mediu sigur și stimulativ. 
                Credem că natația nu este doar un sport, ci un instrument de dezvoltare personală care formează 
                disciplină, perseverență și încredere în sine.
              </p>
              <p className="text-white/60 leading-relaxed">
                Ne dedicăm fiecărui sportiv, fie că este la primele contacte cu apa sau se pregătește pentru 
                competiții de nivel înalt. Succesul elevilor noștri este măsura succesului nostru.
              </p>
            </div>
            <div>
              <span className="text-[#CCFF00] text-xs font-heading uppercase tracking-[0.3em] mb-4 block">
                Valorile Noastre
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white uppercase mb-6">
                Ce Ne Definește
              </h2>
              <div className="space-y-4">
                {values.map((value, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-[#CCFF00] mt-2 flex-shrink-0" />
                    <p className="text-white/70">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section className="py-20 bg-[#050505]" data-testid="objectives-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#CCFF00] text-xs font-heading uppercase tracking-[0.3em] mb-4 block">
              Obiective
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white uppercase">
              Obiectivele Antrenamentului Acvatic
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {objectives.map((objective, index) => (
              <div
                key={index}
                className="p-8 bg-[#0A0A0A] border border-white/5 hover:border-[#CCFF00]/30 transition-all"
              >
                <div className="w-12 h-12 bg-[#CCFF00]/10 flex items-center justify-center mb-6">
                  <objective.icon className="text-[#CCFF00]" size={24} />
                </div>
                <h3 className="font-heading text-lg font-bold text-white uppercase mb-3">
                  {objective.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  {objective.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-20 bg-[#0A0A0A]" data-testid="differentiators-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#CCFF00] text-xs font-heading uppercase tracking-[0.3em] mb-4 block">
              De Ce Nautica
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white uppercase">
              Ce Ne Face Diferiți
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {differentiators.map((item, index) => (
              <div
                key={index}
                className="p-6 bg-[#121212] border border-white/5"
              >
                <div className="text-[#CCFF00] font-heading text-5xl font-bold mb-4">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <h3 className="font-heading text-lg font-bold text-white uppercase mb-2">
                  {item.title}
                </h3>
                <p className="text-white/50 text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coaches Section */}
      <section className="py-20 bg-[#050505]" data-testid="coaches-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#CCFF00] text-xs font-heading uppercase tracking-[0.3em] mb-4 block">
              Echipa
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white uppercase">
              Antrenorii Noștri
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {coaches.map((coach) => (
              <div
                key={coach.id}
                className="group bg-[#0A0A0A] border border-white/5 overflow-hidden hover:border-[#CCFF00]/30 transition-all"
                data-testid={`coach-${coach.id}`}
              >
                <div className="aspect-[4/5] overflow-hidden relative">
                  <img
                    src={coach.photo_url || `https://images.unsplash.com/photo-1584380931214-dbb5b72e7fd0?w=400`}
                    alt={coach.name}
                    className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  
                  {/* Contact overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-[#CCFF00] text-xs font-heading uppercase tracking-widest mb-1">
                      {coach.role_title}
                    </p>
                    <h3 className="font-heading text-lg font-bold text-white uppercase">
                      {coach.name}
                    </h3>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {/* Coaching types */}
                  <div className="flex flex-wrap gap-1">
                    {coach.coaching_types?.map((type, i) => (
                      <span
                        key={i}
                        className="text-[10px] text-white/60 bg-white/10 px-2 py-0.5"
                      >
                        {type}
                      </span>
                    ))}
                  </div>

                  {/* Education */}
                  <div className="space-y-2">
                    {coach.education?.map((edu, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <GraduationCap size={12} className="text-[#CCFF00] flex-shrink-0 mt-0.5" />
                        <span className="text-white/50 text-xs leading-tight">{edu}</span>
                      </div>
                    ))}
                  </div>

                  {/* Phone */}
                  <a
                    href={`tel:${coach.phone}`}
                    className="flex items-center gap-2 text-white/60 hover:text-[#CCFF00] transition-colors text-sm"
                  >
                    <Phone size={14} />
                    {coach.phone}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default AboutPage;
