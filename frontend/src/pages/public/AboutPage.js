import React from 'react';
import PublicLayout from '../../components/PublicLayout';
import { Phone, GraduationCap, CheckCircle2, Waves } from 'lucide-react';

// Am eliminat "Instructaj" din array-urile de specializări pentru a-l folosi ca titlu
const COACHES = [
  {
    name: "Ovidiu Galeru",
    role: "Profesor • Antrenor • Coordonator",
    phone: "0745 312 668",
    specialties: ["Performanță"],
    education: [
      "Doctorat în Științele Educației",
      "Masterat în Psihologia Sportului de Performanţă",
      "Antrenor al Lotului Olimpic de Nataţie al României (JO Londra 2012, Rio 2016)"
    ],
    photo: "/team/ovidiu.jpeg" 
  },
  {
    name: "Cornelia Galeru",
    role: "Antrenor • Coordonator",
    phone: "0740 251 626",
    specialties: ["Inițiere", "Adulți", "PT"],
    education: [
      "Kinetoterapeut",
      "Masterat în Kinetoterapie",
      "Fostă medaliată la Campionatele Naţionale de copii şi juniori"
    ],
    photo: "/team/cornelia.jpeg"
  },
  {
    name: "Mara Nicola Galeru",
    role: "Antrenor",
    phone: "0758 071 073",
    specialties: ["Inițiere", "Copii", "Adulți", "PT"],
    education: [
      "Instructor de înot",
      "Licențiată în Comunicare și relații publice"
    ],
    photo: "/team/mara.jpeg"
  },
  {
    name: "Alexandru Petrișor Pojoreanu",
    role: "Antrenor",
    phone: "0742 468 649",
    specialties: ["Inițiere", "Copii", "Adulți", "Performanță", "PT"],
    education: [
      "Profesor de Educație Fizică și Sport",
      "Instructor de înot",
      "Masterand la Universitatea Vasile Alecsandri din Bacău",
      "Fost înotător de performanță"
    ],
    photo: "/team/pojoreanu.jpeg"
  },
  {
    name: "Sabin Jitaru",
    role: "Antrenor",
    phone: "0766 416 273",
    specialties: ["Inițiere", "Copii", "Adulți", "Performanță", "PT"],
    education: [
      "Masterat în Educaţie Fizică şi Sport",
      "Fost campion naţional de juniori şi multiplu medaliat",
      "Component al Lotului Național de Juniori al României"
    ],
    photo: "/team/sabin.jpeg"
  },
  {
    name: "Adrian Nicu Poeană",
    role: "Antrenor",
    phone: "0761 681 499",
    specialties: ["Inițiere", "Performanță"],
    education: [
      "Masterand în Performanță Sportivă",
      "Fost campion naţional de copii"
    ],
    photo: "/team/adrian.jpeg"
  },
  {
    name: "Alexandru Popa",
    role: "Antrenor",
    phone: "0749 038 205",
    specialties: ["Inițiere", "Performanță"],
    education: [
      "Masterand în Performanță Sportivă",
      "Fost înotător de performanţă"
    ],
    photo: "/team/alexandru-popa.jpeg"
  }
];

const OBJECTIVES = [
  "Adaptare la mediul acvatic",
  "Dezvoltarea sistemului imunitar",
  "Stimularea dezvoltării psihomotorii şi psihosociale",
  "Dezvoltarea fizică armonioasă",
  "Creşterea capacitaţii de efort",
  "Îmbunătățirea performanțelor sportive în competiții"
];

const AboutPage = () => {
  return (
    <PublicLayout>
      {/* Misiune */}
      <section className="py-24 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <span className="text-[#CCFF00] text-xs font-heading uppercase tracking-[0.3em] mb-4 block">
              Misiunea Noastră
            </span>
            <h1 className="font-heading text-4xl md:text-5xl font-black text-white uppercase mb-8 leading-tight">
              Clubul Sportiv Nautica răspunde nevoilor de mişcare şi sport a copiilor noştri.
            </h1>
            <p className="text-white/60 text-lg leading-relaxed mb-12">
              Echipa Nautica este formată din profesori – antrenori cu experienţă şi vocaţie în activități cu copii, 
              care pe parcursul orelor de înot vor urmări învăţarea şi perfecţionarea înotului în condiţiile cele mai bune.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mt-16 items-center">
            <div className="space-y-6">
              <h2 className="font-heading text-2xl text-white uppercase font-bold">
                Obiective Principale
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {OBJECTIVES.map((obj, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white/5 p-4 border border-white/5">
                    <CheckCircle2 className="text-[#CCFF00] mt-1 shrink-0" size={18} />
                    <span className="text-white/80 text-sm">{obj}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="aspect-video bg-[#0A0A0A] border border-white/10 overflow-hidden">
               <img 
                src="https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&q=80&w=1000" 
                alt="Antrenament"
                className="w-full h-full object-cover opacity-80"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Echipa */}
      <section className="py-24 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#CCFF00] text-xs font-heading uppercase tracking-[0.3em] mb-4 block">
              Echipa Noastră
            </span>
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-white uppercase">
              Profesionalism & Experiență
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {COACHES.map((coach, index) => (
              <div key={index} className="bg-[#121212] border border-white/5 flex flex-col h-full group hover:border-[#CCFF00]/30 transition-all duration-300">
                
                {/* Header Antrenor cu Animație de Zoom */}
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img 
                    src={coach.photo} 
                    alt={coach.name} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1584380931214-dbb5b72e7fd0?w=400'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />
                  <div className="absolute bottom-6 left-6 right-6 z-10">
                    <h3 className="text-white font-heading text-2xl font-black uppercase leading-none">{coach.name}</h3>
                    <p className="text-[#CCFF00] text-xs font-heading uppercase tracking-widest mt-2">{coach.role}</p>
                  </div>
                </div>

                <div className="p-8 flex-grow flex flex-col">
                  {/* Contact Rapid */}
                  <div className="mb-8">
                    <a href={`tel:${coach.phone.replace(/\s/g, '')}`} className="flex items-center gap-3 text-white/70 hover:text-[#CCFF00] transition-colors w-fit">
                      <Phone size={16} className="text-[#CCFF00]" />
                      <span className="font-heading text-sm uppercase tracking-wider">{coach.phone}</span>
                    </a>
                  </div>

                  {/* Secțiunea Instructaj (Nouă) */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                      <Waves size={16} className="text-[#CCFF00]" />
                      <span className="text-white/50 text-xs font-heading uppercase tracking-widest">Instructaj</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {coach.specialties.map((s, i) => (
                        <span key={i} className="text-[10px] bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 font-bold uppercase px-2.5 py-1 rounded-sm">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Educație / Realizări */}
                  <div className="mt-auto pt-2">
                    {/* Titlul secțiunii (perfect centrat) */}
                    <div className="flex items-center gap-2 mb-4">
                      <GraduationCap size={16} className="text-[#CCFF00]" />
                      <span className="text-white/50 text-xs font-heading uppercase tracking-widest">
                        Experiență & Studii
                      </span>
                    </div>
                    
                    {/* Lista de realizări */}
                    <ul className="space-y-3">
                      {coach.education.map((edu, i) => (
                        <li key={i} className="flex items-start gap-3 text-white/40 text-xs leading-relaxed">
                          {/* Bullet point perfect aliniat cu primul rând de text */}
                          <div className="w-1 h-1 rounded-full bg-[#CCFF00]/40 shrink-0 mt-1.5" />
                          <span>{edu}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

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