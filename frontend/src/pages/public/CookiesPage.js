import PublicLayout from '../../components/PublicLayout';

const CookiesPage = () => {
  return (
    <PublicLayout>
      <div className="pt-32 pb-20 bg-[#050505]">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-[#CCFF00] text-xs font-heading uppercase tracking-[0.3em] mb-4 block">
            Legal
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl font-black text-white uppercase leading-tight mb-8">
            Politica de Cookies
          </h1>

          <div className="prose prose-invert max-w-none">
            <p className="text-white/60 leading-relaxed mb-8">
              Ultima actualizare: {new Date().toLocaleDateString('ro-RO')}
            </p>

            <section className="mb-8">
              <h2 className="font-heading text-xl font-bold text-white uppercase mb-4">
                1. Ce Sunt Cookie-urile?
              </h2>
              <p className="text-white/60 leading-relaxed">
                Cookie-urile sunt fișiere text mici care sunt stocate pe dispozitivul dumneavoastră atunci când 
                vizitați un site web. Acestea ajută site-ul să funcționeze corect și să vă ofere o experiență 
                personalizată.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-xl font-bold text-white uppercase mb-4">
                2. Tipuri de Cookie-uri Utilizate
              </h2>
              
              <h3 className="font-heading text-lg font-bold text-white mt-6 mb-3">
                Cookie-uri Esențiale
              </h3>
              <p className="text-white/60 leading-relaxed mb-4">
                Sunt necesare pentru funcționarea de bază a site-ului. Include cookie-uri pentru autentificare 
                și securitate.
              </p>

              <h3 className="font-heading text-lg font-bold text-white mt-6 mb-3">
                Cookie-uri de Performanță
              </h3>
              <p className="text-white/60 leading-relaxed mb-4">
                Ne ajută să înțelegem cum utilizați site-ul pentru a-l îmbunătăți. Nu colectează informații 
                care să vă identifice personal.
              </p>

              <h3 className="font-heading text-lg font-bold text-white mt-6 mb-3">
                Cookie-uri Funcționale
              </h3>
              <p className="text-white/60 leading-relaxed">
                Permit site-ului să rețină alegerile dumneavoastră (cum ar fi limba preferată) pentru o 
                experiență personalizată.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-xl font-bold text-white uppercase mb-4">
                3. Gestionarea Cookie-urilor
              </h2>
              <p className="text-white/60 leading-relaxed">
                Puteți controla și/sau șterge cookie-urile după cum doriți. Detalii sunt disponibile pe 
                aboutcookies.org. Puteți șterge toate cookie-urile care sunt deja pe dispozitivul dumneavoastră 
                și puteți seta majoritatea browserelor să prevină plasarea lor.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-xl font-bold text-white uppercase mb-4">
                4. Cookie-uri Terțe Părți
              </h2>
              <p className="text-white/60 leading-relaxed">
                În anumite cazuri, utilizăm cookie-uri furnizate de terțe părți de încredere. Acestea pot include 
                servicii de analiză web pentru a înțelege mai bine cum este utilizat site-ul nostru.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-xl font-bold text-white uppercase mb-4">
                5. Actualizări ale Politicii
              </h2>
              <p className="text-white/60 leading-relaxed">
                Această politică poate fi actualizată periodic. Vă recomandăm să verificați această pagină 
                pentru a fi la curent cu orice modificări.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-xl font-bold text-white uppercase mb-4">
                6. Contact
              </h2>
              <p className="text-white/60 leading-relaxed">
                Dacă aveți întrebări despre utilizarea cookie-urilor pe site-ul nostru, ne puteți contacta:
              </p>
              <ul className="text-white/60 mt-4 space-y-2">
                <li>Email: contact@nautica-swim.ro</li>
                <li>Telefon: 0745 312 668</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default CookiesPage;
