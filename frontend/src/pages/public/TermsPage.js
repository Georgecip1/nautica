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
                <li>• Înscrierea se face prin intermediul administrației clubului și recepției</li>
                <li>• Nu există înscriere publică online - conturile sunt create de personal</li>
                <li>• Pentru minori, este necesară semnătura părintelui/tutorelui legal</li>
                </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-xl font-bold text-white uppercase mb-4">
                3. Abonamente și Plăți
              </h2>
              <ul className="text-white/60 space-y-2">
                <li>• Abonamentele se pot cumpăra de la recepție sau de la staff-ul clubului</li>
                <li>• În cazul în care vi se oferă abonamente de către o persoane necunoscută, vă rugăm să verificați autenticitatea acestora la numărul de telefon sau pe email-ul de la finalul acestei pagini</li>
                <li>• Plata se efectuează în avans pentru perioada abonamentului sau la recepția hotelului</li>
                <li>• Abonamentele sunt nominale și netransferabile</li>
                <li>• Ședințele neutilizate nu se transferă în luna următoare, cu excepția cazurilor de boală (certificat medical)</li>
                <li>• Reducerea de 10% pentru frați se aplică pentru toate abonamentele cumpărate împreună</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-xl font-bold text-white uppercase mb-4">
                4. Prezență
              </h2>
              <ul className="text-white/60 space-y-2">
                <li>• Prezența se înregistrează la fiecare ședință</li>
                <li>• În cazul în care participantul nu se poate prezenta, poate participa în altă zi</li>
                <li>• Este de preferat ca participantul să aibă la în prezența sa codul QR pe telefon, ca poză sau pe cardul clubului</li>
                <li>• În cazul în care participantul nu are codul QR, prezența se poate înregistra manual de către antrenor sau recepție, dar este responsabilitatea participantului să aibă codul QR la îndemână pentru a facilita check-in-ul rapid și eficient</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-xl font-bold text-white uppercase mb-4">
                5. Reguli de Conduită
              </h2>
              <ul className="text-white/60 space-y-2">
                <li>• Dușul înainte de intrarea în bazin este obligatoriu</li>
                <li>• Echipamentul de înot (costum, ochelari, cască, prosop) este obligatoriu</li>
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
