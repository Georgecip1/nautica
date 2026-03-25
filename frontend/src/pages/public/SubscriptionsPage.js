import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout';
import { MapPin, Info, ArrowRight, Users } from 'lucide-react';

// Notele globale care se aplică la toate locațiile
const GLOBAL_NOTES = [
  "Abonamentele sunt nominale și netransmisibile.",
  "Valabilitatea abonamentului începe de la data cumpărării acestuia."
];

// Datele hardcodate 
const PACKS = [
  {
    id: "fiald",
    title: "Bazin Fiald (Hotel Fiald)",
    meta: "Strada Tazlăului 7A, Bacău",
    sections: [
      {
        title: "Copii",
        offers: [
          { id: "f1", activity: "Ședință copii inițiere / perfecționare", sessions: "1", duration: "50 min", validity: "30 zile", priceLei: 80 },
          { id: "f2", activity: "Abonament copii", badge: "Popular", sessions: "8", duration: "50 min", validity: "30 zile", priceLei: 440 },
          { id: "f3", activity: "Abonament copii", sessions: "12", duration: "50 min", validity: "30 zile", priceLei: 550 },
          { id: "f4", activity: "Program grădiniță", sessions: "4", duration: "50 min", validity: "30 zile", priceLei: 230 },
        ]
      },
      {
        title: "Adulți",
        offers: [
          { id: "f5", activity: "Abonament adulți", sessions: "4", duration: "50 min", validity: "30 zile", priceLei: 290 },
          { id: "f6", activity: "Abonament adulți", badge: "Popular", sessions: "8", duration: "50 min", validity: "30 zile", priceLei: 490 },
        ]
      },
      {
        title: "Special & Performanță",
        offers: [
          { id: "f7", activity: "Personal Training", badge: "PT", sessions: "1", duration: "50 min", validity: "30 zile", priceLei: 180 },
          { id: "f8", activity: "Personal Training", badge: "PT", sessions: "4", duration: "50 min", validity: "30 zile", priceLei: 620 },
          { id: "f9", activity: "Abonament Performanță", badge: "Nelimitat", sessions: "Nelimitat", duration: "Specificație Antrenor", validity: "30 zile", priceLei: 450 },
          { id: "f10", activity: "BabySwim (2-4 ani)", badge: "BabySwim", sessions: "1", duration: "50 min", validity: "30 zile", priceLei: 180 },
          { id: "f11", activity: "BabySwim (2-4 ani)", badge: "BabySwim", sessions: "4", duration: "50 min", validity: "30 zile", priceLei: 620 },
        ]
      }
    ],
    footerNotes: [
      ...GLOBAL_NOTES,
      "Accesul se face prin recepția hotelului Fiald."
    ]
  },
  {
    id: "olimpic",
    title: "Bazinul Olimpic Bacău",
    meta: "Aleea Ghioceilor 10-14, Bacău",
    sections: [
      {
        title: "Copii & Adulți",
        offers: [
          { id: "o1", activity: "Ședință copii", sessions: "1", duration: "50 min", validity: "45 zile", priceLei: 80 },
          { id: "o2", activity: "Abonament copii", sessions: "10", duration: "50 min", validity: "45 zile", priceLei: 550 },
          { id: "o3", activity: "Abonament adulți", sessions: "10", duration: "50 min", validity: "45 zile", priceLei: 550 },
        ]
      }
    ],
    footerNotes: [
      ...GLOBAL_NOTES,
      "Programul poate varia în funcție de disponibilitatea bazinului (competiții sportive)."
    ]
  },
  {
    id: "emd",
    title: "Bazinul EMD Academy",
    meta: "Bulevardul Unirii 43, Bacău",
    sections: [
      {
        title: "Copii",
        offers: [
          { id: "e1", activity: "Ședință copii", sessions: "1", duration: "50 min", validity: "45 zile", priceLei: 80 },
          { id: "e2", activity: "Abonament copii", badge: "Popular", sessions: "8+1", duration: "50 min", validity: "45 zile", priceLei: 500 },
        ]
      }
    ],
    footerNotes: [
      ...GLOBAL_NOTES,
      "Contact locație pentru detalii administrative: office@complexemd.ro"
    ]
  }
];

const SubscriptionsPage = () => {
  const [activeId, setActiveId] = useState(PACKS[0].id);

  const activePack = useMemo(
    () => PACKS.find((p) => p.id === activeId),
    [activeId]
  );

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-[#050505] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <span className="text-[#CCFF00] text-xs font-heading uppercase tracking-[0.3em] mb-4 block">
                Tarife & Opțiuni
              </span>
              <h1 className="font-heading text-4xl md:text-5xl font-black text-white uppercase mb-6 leading-tight">
                Abonamente
              </h1>
              <p className="text-white/60 text-lg leading-relaxed">
                Alege locația și tipul de activitate potrivit pentru tine sau copilul tău. 
                Pentru programare, stabilirea grupei și detalii suplimentare, te rugăm să ne contactezi.
              </p>
            </div>
            <Link
              to="/contact"
              className="bg-white/10 text-white px-8 py-4 font-heading font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-white/20 transition-colors backdrop-blur-sm shrink-0"
            >
              Contactează-ne
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-[#0A0A0A] min-h-screen">
        <div className="max-w-7xl mx-auto px-6">

          {/* Banner Reducere Frați */}
          <div className="mb-12 bg-[#CCFF00]/10 border border-[#CCFF00]/20 p-6 flex flex-col md:flex-row items-start md:items-center gap-5">
            <div className="bg-[#CCFF00] p-3 shrink-0">
              <Users className="text-black" size={24} />
            </div>
            <div>
              <h3 className="font-heading text-[#CCFF00] font-bold uppercase tracking-wider mb-2 text-lg">
                Reducere pentru Familii
              </h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Încurajăm sportul în familie! Oferim <strong className="text-white font-bold">10% reducere</strong> din prețul abonamentului pentru al doilea copil înscris (frate/soră). Se aplică pentru orice pachet de ședințe.
              </p>
            </div>
          </div>
          
          {/* Tabs Selector Locații */}
          <div className="flex flex-wrap gap-3 mb-12">
            {PACKS.map((p) => {
              const active = p.id === activeId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActiveId(p.id)}
                  className={`px-6 py-4 font-heading uppercase tracking-wider text-sm font-bold transition-all border ${
                    active 
                      ? "bg-[#CCFF00] text-black border-[#CCFF00]" 
                      : "bg-[#121212] border-white/5 text-white/50 hover:text-white hover:border-white/20"
                  }`}
                >
                  {p.title}
                </button>
              );
            })}
          </div>

          {activePack && (
            <div className="animate-fade-in">
              {/* Header Locație Activă */}
              <div className="mb-12 flex items-center gap-3 text-white/40">
                <MapPin size={18} className="text-[#CCFF00]" />
                <span className="text-sm font-heading tracking-widest uppercase">{activePack.meta}</span>
              </div>

              {/* Secțiunile de abonamente (Copii / Adulți / etc) */}
              <div className="space-y-16">
                {activePack.sections.map((section) => (
                  <div key={section.title}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-2 h-2 bg-[#CCFF00]" />
                      <h2 className="font-heading text-2xl font-bold text-white uppercase">
                        {section.title}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {section.offers.map((o) => (
                        <div
                          key={o.id}
                          className={`bg-[#121212] border p-6 flex flex-col transition-colors group ${
                            o.badge === 'Popular' ? 'border-[#CCFF00]/50 hover:border-[#CCFF00]' : 'border-white/5 hover:border-[#CCFF00]/30'
                          }`}
                        >
                          {/* Titlu & Badge */}
                          <div className="flex items-start justify-between gap-4 mb-6">
                            <h3 className="text-white font-bold text-lg leading-tight group-hover:text-[#CCFF00] transition-colors">
                              {o.activity}
                            </h3>
                            {o.badge && (
                              <span className={`text-[10px] font-bold uppercase px-2.5 py-1 shrink-0 rounded-sm ${
                                o.badge === 'Popular' 
                                  ? 'bg-[#CCFF00] text-black' 
                                  : 'bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20'
                              }`}>
                                {o.badge}
                              </span>
                            )}
                          </div>

                          {/* Detalii (Ședințe, Durată, Valabilitate) */}
                          <div className="space-y-3 mb-8 flex-grow">
                            <div className="flex justify-between border-b border-white/5 pb-2 text-sm">
                              <span className="text-white/40">Ședințe</span>
                              <span className="text-white font-medium">{o.sessions}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2 text-sm">
                              <span className="text-white/40">Durată</span>
                              <span className="text-white font-medium">{o.duration}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2 text-sm">
                              <span className="text-white/40">Valabil</span>
                              <span className="text-white font-medium">{o.validity}</span>
                            </div>
                          </div>

                          {/* Preț */}
                          <div className="flex items-end justify-between mt-auto">
                            <div className="text-xs text-white/30 max-w-[50%] leading-tight">
                              {o.note}
                            </div>
                            <div className="text-4xl font-heading font-black text-white flex items-baseline gap-1">
                              {o.priceLei}
                              <span className="text-sm font-bold text-[#CCFF00] uppercase tracking-widest">Lei</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Note subsol locație */}
              {activePack.footerNotes?.length > 0 && (
                <div className="mt-16 bg-[#121212] border border-[#CCFF00]/20 p-8 flex gap-4">
                  <Info className="text-[#CCFF00] shrink-0" size={24} />
                  <div>
                    <h4 className="font-heading text-white uppercase font-bold mb-4">Note Importante</h4>
                    <ul className="space-y-3">
                      {activePack.footerNotes.map((n, idx) => (
                        <li key={idx} className="text-white/60 text-sm flex items-start gap-3 leading-relaxed">
                          {/* Bulina aliniată perfect cu primul rând de text */}
                          <div className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]/50 shrink-0 mt-1.5" />
                          <span>{n}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* FAQ Rapid - Cum funcționează */}
              <div className="mt-16 grid gap-6 md:grid-cols-3">
                <div className="bg-[#050505] border border-white/5 p-6">
                  <div className="text-[#CCFF00] font-heading font-bold uppercase mb-2">1. Cum mă înscriu?</div>
                  <div className="text-white/50 text-sm leading-relaxed">
                    Contactează-ne telefonic sau pe WhatsApp și îți recomandăm oferta potrivită.
                  </div>
                </div>
                <div className="bg-[#050505] border border-white/5 p-6">
                  <div className="text-[#CCFF00] font-heading font-bold uppercase mb-2">2. Programarea</div>
                  <div className="text-white/50 text-sm leading-relaxed">
                    Se stabilește grupa în funcție de vârstă, nivel de experiență și disponibilitate.
                  </div>
                </div>
                <div className="bg-[#050505] border border-white/5 p-6">
                  <div className="text-[#CCFF00] font-heading font-bold uppercase mb-2">3. Echipament</div>
                  <div className="text-white/50 text-sm leading-relaxed">
                    Nu uita să aduci costum de baie, cască, ochelari, prosop și papuci de piscină.
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
};

export default SubscriptionsPage;