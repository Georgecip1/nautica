import PublicLayout from '../../components/PublicLayout';

const PrivacyPage = () => {
  return (
    <PublicLayout>
      <div className="pt-32 pb-20 bg-[#050505]">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-[#CCFF00] text-xs font-heading uppercase tracking-[0.3em] mb-4 block">
            Legal
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl font-black text-white uppercase leading-tight mb-8">
            Politica de Confidențialitate
          </h1>

          <div className="prose prose-invert max-w-none">
            <p className="text-white/60 leading-relaxed mb-8">
              Ultima actualizare: {new Date().toLocaleDateString('ro-RO')}
            </p>

            <section className="mb-8">
              <h2 className="font-heading text-xl font-bold text-white uppercase mb-4">
                1. Introducere
              </h2>
              <p className="text-white/60 leading-relaxed">
                Club Sportiv Nautica ("noi", "al nostru") respectă confidențialitatea datelor dumneavoastră personale. 
                Această politică descrie modul în care colectăm, utilizăm și protejăm informațiile dumneavoastră.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-xl font-bold text-white uppercase mb-4">
                2. Datele pe Care le Colectăm
              </h2>
              <ul className="text-white/60 space-y-2">
                <li>• Nume și prenume</li>
                <li>• Adresă de email</li>
                <li>• Număr de telefon</li>
                <li>• Date despre copiii înscriși la cursuri</li>
                <li>• Istoricul abonamentelor și prezențelor</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-xl font-bold text-white uppercase mb-4">
                3. Cum Utilizăm Datele
              </h2>
              <ul className="text-white/60 space-y-2">
                <li>• Pentru a gestiona contul și abonamentele dumneavoastră</li>
                <li>• Pentru a comunica informații despre cursuri și activități</li>
                <li>• Pentru a asigura securitatea în bazinele noastre</li>
                <li>• Pentru a vă contacta în caz de urgență</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-xl font-bold text-white uppercase mb-4">
                4. Protecția Datelor
              </h2>
              <p className="text-white/60 leading-relaxed">
                Implementăm măsuri tehnice și organizatorice adecvate pentru a proteja datele dumneavoastră 
                împotriva accesului neautorizat, pierderii sau distrugerii. Datele sunt stocate pe servere securizate 
                și accesul este limitat la personalul autorizat.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-xl font-bold text-white uppercase mb-4">
                5. Drepturile Dumneavoastră
              </h2>
              <p className="text-white/60 leading-relaxed mb-4">
                Conform GDPR, aveți următoarele drepturi:
              </p>
              <ul className="text-white/60 space-y-2">
                <li>• Dreptul de acces la datele dumneavoastră</li>
                <li>• Dreptul de rectificare</li>
                <li>• Dreptul de ștergere ("dreptul de a fi uitat")</li>
                <li>• Dreptul de restricționare a prelucrării</li>
                <li>• Dreptul la portabilitatea datelor</li>
                <li>• Dreptul de opoziție</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-xl font-bold text-white uppercase mb-4">
                6. Perioada de Stocare
              </h2>
              <p className="text-white/60 leading-relaxed">
                Păstrăm datele dumneavoastră atât timp cât aveți un cont activ sau un abonament în vigoare. 
                După încetarea relației contractuale, datele pot fi păstrate pentru o perioadă de până la 3 ani 
                pentru scopuri legale și de arhivare.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-xl font-bold text-white uppercase mb-4">
                7. Contact
              </h2>
              <p className="text-white/60 leading-relaxed">
                Pentru orice întrebări legate de confidențialitatea datelor, ne puteți contacta la:
              </p>
              <ul className="text-white/60 mt-4 space-y-2">
                <li>Email: contact@nautica-swim.ro</li>
                <li>Telefon: 0745 312 668</li>
                <li>Adresă: Strada Tazlăului 7A, Bacău</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default PrivacyPage;
