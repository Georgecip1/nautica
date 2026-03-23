import PublicLayout from '../../components/PublicLayout';

const TermsPage = () => {
  return (
    <PublicLayout>
      <div className="pt-32 pb-20 bg-[#050505]">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-[#CCFF00] text-xs font-heading uppercase tracking-[0.3em] mb-4 block">
            Legal
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl font-black text-white uppercase leading-tight mb-8">
            Termeni și Condiții
          </h1>

          <div className="prose prose-invert max-w-none">
            <p className="text-white/60 leading-relaxed mb-8">
              Ultima actualizare: {new Date().toLocaleDateString('ro-RO')}
            </p>

            <section className="mb-8">
              <h2 className="font-heading text-xl font-bold text-white uppercase mb-4">
                1. Dispoziții Generale
              </h2>
              <p className="text-white/60 leading-relaxed">
                Prezentele termeni și condiții reglementează utilizarea serviciilor oferite de Club Sportiv Nautica, 
                inclusiv cursurile de natație, abonamentele și accesul la platformă online.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-xl font-bold text-white uppercase mb-4">
                2. Înscrierea la Cursuri
              </h2>
              <ul className="text-white/60 space-y-2">
                <li>• Înscrierea se face prin intermediul administrației clubului</li>
                <li>• Nu există înscriere publică online - conturile sunt create de personal</li>
                <li>• Pentru minori, este necesară semnătura părintelui/tutorelui legal</li>
                <li>• Fiecare participant trebuie să prezinte aviz medical înainte de prima ședință</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-xl font-bold text-white uppercase mb-4">
                3. Abonamente și Plăți
              </h2>
              <ul className="text-white/60 space-y-2">
                <li>• Plata se efectuează în avans pentru perioada abonamentului</li>
                <li>• Abonamentele sunt nominale și netransferabile</li>
                <li>• Ședințele neutilizate nu se reportează în luna următoare, cu excepția cazurilor de boală (certificat medical)</li>
                <li>• Reducerea de 10% pentru frați se aplică pentru al doilea copil din familie</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-xl font-bold text-white uppercase mb-4">
                4. Prezența și Anulări
              </h2>
              <ul className="text-white/60 space-y-2">
                <li>• Prezența se înregistrează la fiecare ședință</li>
                <li>• Anulările trebuie comunicate cu minimum 24 de ore înainte</li>
                <li>• Absențele nemotivate duc la pierderea ședinței</li>
                <li>• În caz de boală, se acceptă recuperarea ședințelor cu certificat medical</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-xl font-bold text-white uppercase mb-4">
                5. Reguli de Conduită
              </h2>
              <ul className="text-white/60 space-y-2">
                <li>• Dușul înainte de intrarea în bazin este obligatoriu</li>
                <li>• Echipamentul de înot (costum, ochelari, cască) este obligatoriu</li>
                <li>• Respectarea indicațiilor antrenorului este obligatorie</li>
                <li>• Comportamentul necorespunzător poate duce la excludere</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-xl font-bold text-white uppercase mb-4">
                6. Răspundere
              </h2>
              <p className="text-white/60 leading-relaxed">
                Clubul nu își asumă răspunderea pentru obiectele personale pierdute sau furate. 
                Participanții sunt responsabili pentru propria sănătate și trebuie să informeze antrenorul 
                despre orice condiție medicală relevantă.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-xl font-bold text-white uppercase mb-4">
                7. Modificări
              </h2>
              <p className="text-white/60 leading-relaxed">
                Ne rezervăm dreptul de a modifica acești termeni și condiții. Modificările vor fi comunicate 
                cu minimum 14 zile înainte de intrarea în vigoare.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-xl font-bold text-white uppercase mb-4">
                8. Contact
              </h2>
              <p className="text-white/60 leading-relaxed">
                Pentru orice întrebări referitoare la acești termeni, ne puteți contacta:
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

export default TermsPage;
