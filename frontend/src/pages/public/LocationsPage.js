import { useState, useEffect } from 'react';
import PublicLayout from '../../components/PublicLayout';
import { locationsAPI } from '../../lib/api';
import { MapPin, Navigation, Copy, Check, Phone, Mail, Wifi, Car, Droplets } from 'lucide-react';

// Placeholder Mapbox - in production, integrate real Mapbox
const MapPlaceholder = ({ locations, selectedId, onMarkerClick }) => {
  return (
    <div className="w-full h-full bg-[#121212] relative overflow-hidden">
      {/* Dark map background simulation */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]">
        {/* Grid lines for map feel */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>
      
      {/* Map placeholder text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#CCFF00]/20 font-heading text-6xl mb-4">BACĂU</div>
          <p className="text-white/20 text-sm">Hartă interactivă Mapbox</p>
          <p className="text-white/10 text-xs mt-2">Integrare în așteptare pentru API key</p>
        </div>
      </div>

      {/* Location markers */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-64 h-64">
          {locations.map((location, index) => {
            const positions = [
              { top: '20%', left: '30%' },
              { top: '60%', left: '50%' },
              { top: '40%', left: '70%' }
            ];
            const pos = positions[index] || { top: '50%', left: '50%' };
            const isSelected = selectedId === location.id;
            const isHighlighted = location.is_highlighted;

            return (
              <button
                key={location.id}
                onClick={() => onMarkerClick(location.id)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all ${
                  isSelected ? 'scale-125 z-10' : 'hover:scale-110'
                }`}
                style={{ top: pos.top, left: pos.left }}
                data-testid={`map-marker-${location.id}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isHighlighted
                    ? 'bg-[#CCFF00] shadow-[0_0_20px_rgba(204,255,0,0.5)]'
                    : isSelected
                      ? 'bg-[#CCFF00]'
                      : 'bg-white/20 hover:bg-white/30'
                }`}>
                  <MapPin size={16} className={isHighlighted || isSelected ? 'text-black' : 'text-white'} />
                </div>
                {isSelected && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 whitespace-nowrap">
                    <span className="bg-[#CCFF00] text-black text-xs font-bold px-2 py-1">
                      {location.name.replace('Bazin ', '').replace('Bazinul ', '')}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const facilityIcons = {
  'Vestiare': Droplets,
  'Dușuri': Droplets,
  'Parcare': Car,
  'Parcare în zonă': Car,
  'SPA': Wifi,
  'Recepție': Phone,
  'Tribună': Mail,
};

const LocationsPage = () => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await locationsAPI.getAll();
      setLocations(response.data);
      // Select highlighted location by default
      const highlighted = response.data.find(l => l.is_highlighted);
      if (highlighted) {
        setSelectedLocation(highlighted.id);
      } else if (response.data.length > 0) {
        setSelectedLocation(response.data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const selected = locations.find(l => l.id === selectedLocation);

  const handleCopyAddress = () => {
    if (selected) {
      navigator.clipboard.writeText(selected.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNavigate = () => {
    if (!selected) return;
    
    const { latitude, longitude, name } = selected;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Try to open native navigation
      window.location.href = `geo:${latitude},${longitude}?q=${encodeURIComponent(name)}`;
    } else {
      // Open Google Maps in new tab
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
        '_blank'
      );
    }
  };

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-32 pb-8 bg-[#050505]" data-testid="locations-hero">
        <div className="max-w-7xl mx-auto px-6">
          <span className="text-[#CCFF00] text-xs font-heading uppercase tracking-[0.3em] mb-4 block">
            Locații
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase leading-tight mb-4">
            Bazinele Noastre
          </h1>
          <p className="text-white/60 text-lg max-w-2xl">
            Antrenamente în cele mai bune bazine din Bacău. Alege locația cea mai convenabilă pentru tine.
          </p>
        </div>
      </section>

      {/* Map & Locations */}
      <section className="pb-20 bg-[#050505]" data-testid="locations-map-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Map */}
            <div className="order-2 lg:order-1">
              <div className="map-container border border-white/10">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center bg-[#121212]">
                    <div className="animate-pulse text-[#CCFF00]">SE ÎNCARCĂ...</div>
                  </div>
                ) : (
                  <MapPlaceholder
                    locations={locations}
                    selectedId={selectedLocation}
                    onMarkerClick={setSelectedLocation}
                  />
                )}
              </div>

              {/* Selected Location Details (Desktop) */}
              {selected && (
                <div className="hidden lg:block mt-6 p-6 bg-[#0A0A0A] border border-white/5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      {selected.is_highlighted && (
                        <span className="inline-block bg-[#CCFF00] text-black text-[10px] font-bold uppercase px-2 py-1 mb-2">
                          Sediu Principal
                        </span>
                      )}
                      <h3 className="font-heading text-xl font-bold text-white uppercase">
                        {selected.name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-white/60 text-sm mb-4">
                    <MapPin size={16} className="flex-shrink-0 mt-0.5 text-[#CCFF00]" />
                    {selected.address}
                  </div>

                  {selected.note && (
                    <p className="text-white/40 text-sm mb-4 pl-6">
                      {selected.note}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-6">
                    {selected.facilities?.map((facility, i) => {
                      const Icon = facilityIcons[facility] || Check;
                      return (
                        <span key={i} className="flex items-center gap-1 text-xs text-white/50 bg-white/5 px-3 py-1">
                          <Icon size={12} />
                          {facility}
                        </span>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {selected.levels?.map((level, i) => (
                      <span key={i} className="text-xs text-[#CCFF00]/70 bg-[#CCFF00]/10 px-3 py-1">
                        {level}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleNavigate}
                      className="btn-primary px-6 py-3 flex items-center gap-2 text-sm"
                      data-testid="navigate-button"
                    >
                      <Navigation size={16} />
                      Navigare
                    </button>
                    <button
                      onClick={handleCopyAddress}
                      className="btn-secondary px-6 py-3 flex items-center gap-2 text-sm"
                      data-testid="copy-address-button"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      {copied ? 'Copiat!' : 'Copiază adresa'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Locations List */}
            <div className="order-1 lg:order-2 space-y-4">
              {locations.map((location) => {
                const isSelected = selectedLocation === location.id;
                return (
                  <button
                    key={location.id}
                    onClick={() => setSelectedLocation(location.id)}
                    className={`w-full text-left p-6 border transition-all ${
                      isSelected
                        ? 'bg-[#CCFF00]/5 border-[#CCFF00]/50'
                        : 'bg-[#0A0A0A] border-white/5 hover:border-white/10'
                    }`}
                    data-testid={`location-card-${location.id}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {location.is_highlighted && (
                          <span className="inline-block bg-[#CCFF00] text-black text-[10px] font-bold uppercase px-2 py-1 mb-2">
                            Sediu Principal
                          </span>
                        )}
                        <h3 className="font-heading text-lg font-bold text-white uppercase mb-2">
                          {location.name}
                        </h3>
                        <p className="text-white/40 text-sm flex items-start gap-2">
                          <MapPin size={14} className="flex-shrink-0 mt-0.5" />
                          {location.address}
                        </p>
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-[#CCFF00]' : 'bg-white/10'
                      }`}>
                        <MapPin size={16} className={isSelected ? 'text-black' : 'text-white/50'} />
                      </div>
                    </div>

                    {/* Expanded content for mobile */}
                    {isSelected && (
                      <div className="lg:hidden mt-6 pt-6 border-t border-white/10">
                        {location.note && (
                          <p className="text-white/40 text-sm mb-4">
                            {location.note}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 mb-4">
                          {location.facilities?.map((facility, i) => (
                            <span key={i} className="text-xs text-white/50 bg-white/5 px-3 py-1">
                              {facility}
                            </span>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                          {location.levels?.map((level, i) => (
                            <span key={i} className="text-xs text-[#CCFF00]/70 bg-[#CCFF00]/10 px-3 py-1">
                              {level}
                            </span>
                          ))}
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNavigate();
                            }}
                            className="btn-primary px-4 py-2 flex items-center gap-2 text-sm"
                          >
                            <Navigation size={14} />
                            Navigare
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyAddress();
                            }}
                            className="btn-secondary px-4 py-2 flex items-center gap-2 text-sm"
                          >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            Copiază
                          </button>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default LocationsPage;
