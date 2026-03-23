import { useState, useEffect } from 'react';
import PublicLayout from '../../components/PublicLayout';
import { plansAPI, locationsAPI } from '../../lib/api';
import { MapPin, Check, Info } from 'lucide-react';

const categories = [
  { id: 'all', label: 'Toate' },
  { id: 'KIDS', label: 'Copii' },
  { id: 'ADULTS', label: 'Adulți' },
  { id: 'PERFORMANCE', label: 'Performanță' },
];

const SubscriptionsPage = () => {
  const [plans, setPlans] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plansRes, locationsRes] = await Promise.all([
        plansAPI.getAll(),
        locationsAPI.getAll()
      ]);
      setPlans(plansRes.data);
      setLocations(locationsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = plans.filter(plan => {
    if (selectedLocation !== 'all' && plan.location !== selectedLocation) return false;
    if (selectedCategory !== 'all' && plan.category !== selectedCategory) return false;
    return true;
  });

  const groupedByLocation = filteredPlans.reduce((acc, plan) => {
    if (!acc[plan.location]) acc[plan.location] = [];
    acc[plan.location].push(plan);
    return acc;
  }, {});

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#050505]" data-testid="subscriptions-hero">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <span className="text-[#CCFF00] text-xs font-heading uppercase tracking-[0.3em] mb-4 block">
              Abonamente
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase leading-tight mb-6">
              Planuri Pentru<br />Fiecare Nivel
            </h1>
            <p className="text-white/60 text-lg">
              Alegeți abonamentul potrivit pentru dumneavoastră sau copilul dumneavoastră. 
              Oferim programe flexibile în 3 locații din Bacău.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-[#0A0A0A] border-y border-white/5 sticky top-20 z-30" data-testid="filters-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Location Filter */}
            <div className="flex-1">
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Locație</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedLocation('all')}
                  className={`px-4 py-2 text-sm font-heading uppercase tracking-wider transition-all ${
                    selectedLocation === 'all'
                      ? 'bg-[#CCFF00] text-black'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  Toate
                </button>
                {locations.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => setSelectedLocation(loc.name)}
                    className={`px-4 py-2 text-sm font-heading uppercase tracking-wider transition-all ${
                      selectedLocation === loc.name
                        ? 'bg-[#CCFF00] text-black'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {loc.name.replace('Bazin ', '').replace('Bazinul ', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Categorie</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    data-testid={`filter-${cat.id}`}
                    className={`px-4 py-2 text-sm font-heading uppercase tracking-wider transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-[#CCFF00] text-black'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16 bg-[#050505]" data-testid="plans-section">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-pulse text-[#CCFF00] font-heading">SE ÎNCARCĂ...</div>
            </div>
          ) : Object.keys(groupedByLocation).length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/40">Nu există abonamente pentru filtrele selectate.</p>
            </div>
          ) : (
            <div className="space-y-16">
              {Object.entries(groupedByLocation).map(([locationName, locationPlans]) => {
                const location = locations.find(l => l.name === locationName);
                return (
                  <div key={locationName} data-testid={`location-${locationName}`}>
                    {/* Location Header */}
                    <div className="mb-8">
                      <div className="flex items-start gap-4 mb-4">
                        {location?.is_highlighted && (
                          <span className="bg-[#CCFF00] text-black text-[10px] font-bold uppercase px-2 py-1">
                            Sediu Principal
                          </span>
                        )}
                      </div>
                      <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white uppercase mb-2">
                        {locationName}
                      </h2>
                      {location && (
                        <p className="text-white/40 text-sm flex items-center gap-2">
                          <MapPin size={14} />
                          {location.address}
                        </p>
                      )}
                    </div>

                    {/* Plans Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {locationPlans.map((plan) => (
                        <div
                          key={plan.id}
                          className={`relative p-6 border transition-all hover:-translate-y-1 ${
                            plan.badge
                              ? 'bg-[#CCFF00]/5 border-[#CCFF00]/30'
                              : 'bg-[#0A0A0A] border-white/5 hover:border-white/10'
                          }`}
                          data-testid={`plan-${plan.id}`}
                        >
                          {/* Badge */}
                          {plan.badge && (
                            <span className="absolute top-4 right-4 bg-[#CCFF00] text-black text-[10px] font-bold uppercase px-2 py-1">
                              {plan.badge}
                            </span>
                          )}

                          {/* Category */}
                          <span className={`text-xs uppercase tracking-wider ${
                            plan.category === 'KIDS' ? 'text-blue-400' :
                            plan.category === 'ADULTS' ? 'text-green-400' :
                            'text-purple-400'
                          }`}>
                            {plan.category === 'KIDS' ? 'Copii' :
                             plan.category === 'ADULTS' ? 'Adulți' : 'Performanță'}
                          </span>

                          {/* Plan Name */}
                          <h3 className="font-heading text-lg font-bold text-white uppercase mt-2 mb-4 pr-16">
                            {plan.activity}
                          </h3>

                          {/* Price */}
                          <div className="mb-4">
                            <span className="font-heading text-3xl font-bold text-[#CCFF00]">
                              {plan.price}
                            </span>
                            <span className="text-white/40 text-sm ml-1">LEI</span>
                          </div>

                          {/* Details */}
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-white/60">
                              <Check size={14} className="text-[#CCFF00]" />
                              {plan.sessions ? `${plan.sessions} ședințe` : 'Ședințe nelimitate'}
                            </div>
                            <div className="flex items-center gap-2 text-white/60">
                              <Check size={14} className="text-[#CCFF00]" />
                              Valabilitate {plan.validity_days} zile
                            </div>
                            {plan.scope !== 'both' && (
                              <div className="flex items-center gap-2 text-white/60">
                                <Check size={14} className="text-[#CCFF00]" />
                                Pentru {plan.scope === 'child' ? 'copii' : 'adulți'}
                              </div>
                            )}
                          </div>

                          {/* Note */}
                          {plan.note && (
                            <div className="mt-4 pt-4 border-t border-white/5">
                              <p className="text-white/40 text-xs flex items-start gap-2">
                                <Info size={12} className="flex-shrink-0 mt-0.5" />
                                {plan.note}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Sibling Discount Notice */}
                    <div className="mt-6 p-4 bg-[#CCFF00]/10 border border-[#CCFF00]/20 flex items-center gap-3">
                      <Info size={18} className="text-[#CCFF00] flex-shrink-0" />
                      <p className="text-white/70 text-sm">
                        <span className="text-[#CCFF00] font-bold">10% reducere</span> pentru al doilea copil din familie înscris la cursuri.
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#0A0A0A]" data-testid="subscriptions-cta">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white uppercase mb-4">
            Ai Întrebări?
          </h2>
          <p className="text-white/60 mb-8">
            Contactează-ne pentru mai multe informații despre abonamente sau pentru a te înscrie.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="tel:0745312668"
              className="btn-primary px-8 py-4"
            >
              Sună: 0745 312 668
            </a>
            <a
              href="https://wa.me/40745312668"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary px-8 py-4"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default SubscriptionsPage;
