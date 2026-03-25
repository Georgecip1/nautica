import React, { useState, useCallback, useEffect } from 'react';
import PublicLayout from '../../components/PublicLayout';
import { MapPin, Navigation, Copy, Check, Phone, GalleryVerticalEnd, Heater, Car, Droplets, DoorClosedLocked } from 'lucide-react';
import ReactMapGL, { Marker, FlyToInterpolator } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// 1. Datele Hardcodate - Actualizate conform Abonamentelor
const LOCATIONS = [
  {
    id: "fiald",
    name: 'Bazin Fiald (Hotel Fiald)',
    address: 'Strada Tazlăului 7A, Bacău, 600372',
    latitude: 46.58216328636135,
    longitude: 26.90225368249042,
    facilities: ['Vestiare', 'Dușuri', 'Recepție', 'Parcare în zonă', 'SPA'],
    levels: ['Copii', 'Adulți', 'Personal Training', 'Performanță', 'BabySwim (2-4 ani)'],
    note: 'Acces prin recepția hotelului.',
    is_highlighted: true
  },
  {
    id: "olimpic",
    name: 'Bazinul Olimpic Bacău',
    address: 'Aleea Ghioceilor 10-14, Bacău, 600156',
    latitude: 46.55783882908194,
    longitude: 26.918723801004784,
    facilities: ['Vestiare', 'Dușuri', 'Tribună', 'Parcare'],
    levels: ['Copii', 'Adulți'],
    note: 'Programul poate varia în funcție de disponibilitatea bazinului (competiții sportive).'
  },
  {
    id: "emd",
    name: 'Bazinul EMD Academy',
    address: 'Bulevardul Unirii 43, Bacău, 600398',
    latitude: 46.57456179692856,
    longitude: 26.92605471702549,
    facilities: ['Vestiare', 'Dușuri'],
    levels: ['Copii'],
    note: 'Contact locație: office@complexemd.ro'
  }
];

const facilityIcons = {
  'Vestiare': DoorClosedLocked,
  'Dușuri': Droplets,
  'Parcare': Car,
  'Parcare în zonă': Car,
  'SPA': Heater,
  'Recepție': Phone,
  'Tribună': GalleryVerticalEnd,
};

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

const LocationsPage = () => {
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS.find(l => l.is_highlighted).id);
  const [copied, setCopied] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false); 
  
  const [viewport, setViewport] = useState({
    latitude: 46.57,
    longitude: 26.91,
    zoom: 13.5,
    pitch: 60,
    bearing: -20,
    width: '100%',
    height: '100%'
  });

  const selected = LOCATIONS.find(l => l.id === selectedLocation);

  // Funcția de zbor către locație
  const onSelectLocation = useCallback((location) => {
    setSelectedLocation(location.id);
    setIsAnimating(true);
    
    setViewport((prev) => ({
      ...prev,
      longitude: location.longitude,
      latitude: location.latitude,
      zoom: 15.5,
      pitch: 65,
      transitionDuration: 1500,
      transitionInterpolator: new FlyToInterpolator()
    }));
  }, []);

  // Curățăm setările de animație după ce FlyTo s-a terminat
  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setViewport(prev => {
          // Creăm o copie a viewport-ului FĂRĂ proprietățile de tranziție
          const { transitionDuration, transitionInterpolator, ...rest } = prev;
          return rest; 
        });
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  // Funcție pentru adăugarea stratului de clădiri 3D
  const onMapLoad = useCallback((evt) => {
    const map = evt.target;
    
    const layers = map.getStyle().layers;
    const labelLayerId = layers.find(
      (layer) => layer.type === 'symbol' && layer.layout['text-field']
    )?.id;

    map.addLayer(
      {
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 14,
        paint: {
          'fill-extrusion-color': '#1a1a1a',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 0.8
        }
      },
      labelLayerId
    );
  }, []);

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
      window.location.href = `geo:${latitude},${longitude}?q=${encodeURIComponent(name)}`;
    } else {
      window.open(
        `http://googleusercontent.com/maps.google.com/maps?q=${latitude},${longitude}`,
        '_blank'
      );
    }
  };

  // Optimizarea la drag/scroll manual pentru a elimina lag-ul
  const handleViewportChange = useCallback((nextViewport) => {
    if (isAnimating) {
       setIsAnimating(false);
       const { transitionDuration, transitionInterpolator, ...rest } = nextViewport;
       setViewport(rest);
    } else {
       setViewport(nextViewport);
    }
  }, [isAnimating]);

  return (
    <PublicLayout>
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

      <section className="pb-20 bg-[#050505]" data-testid="locations-map-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-8">
            
            <div className="order-2 lg:order-1">
              <div className="map-container border border-white/10 h-[400px] lg:h-[500px] relative overflow-hidden bg-[#121212]">
                {MAPBOX_TOKEN ? (
                  <ReactMapGL
                    {...viewport}
                    mapboxApiAccessToken={MAPBOX_TOKEN}
                    onViewportChange={handleViewportChange}
                    mapStyle="mapbox://styles/mapbox/dark-v11"
                    onLoad={onMapLoad}
                    dragPan={true}
                    scrollZoom={true}
                  >
                    {LOCATIONS.map((location) => {
                      const isSelected = selectedLocation === location.id;
                      const isHighlighted = location.is_highlighted;

                      return (
                        <Marker
                          key={location.id}
                          longitude={location.longitude}
                          latitude={location.latitude}
                          offsetLeft={-16}
                          offsetTop={-16}
                        >
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectLocation(location);
                            }}
                            className={`cursor-pointer transition-all ${isSelected ? 'scale-125 z-10' : 'hover:scale-110'}`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isHighlighted
                                ? 'bg-[#CCFF00] shadow-[0_0_20px_rgba(204,255,0,0.5)]'
                                : isSelected
                                  ? 'bg-[#CCFF00]'
                                  : 'bg-white/20 backdrop-blur-md hover:bg-white/40'
                            }`}>
                              <MapPin size={16} className={isHighlighted || isSelected ? 'text-black' : 'text-white'} />
                            </div>
                            {isSelected && (
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 whitespace-nowrap z-20">
                                <span className="bg-[#CCFF00] text-black text-[10px] font-heading font-bold uppercase px-2 py-1 shadow-lg">
                                  {location.name.replace('Bazin ', '').replace('Bazinul ', '')}
                                </span>
                              </div>
                            )}
                          </div>
                        </Marker>
                      );
                    })}
                  </ReactMapGL>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-6">
                     <div className="text-[#CCFF00]/20 font-heading text-6xl mb-4">BACĂU</div>
                     <p className="text-white/50 text-sm">Harta necesită Mapbox Token.</p>
                     <p className="text-white/30 text-xs mt-2">Adaugă REACT_APP_MAPBOX_TOKEN în fișierul .env</p>
                  </div>
                )}
              </div>

              {selected && (
                <div className="hidden lg:block mt-6 p-6 bg-[#0A0A0A] border border-white/5 animate-fade-in">
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
                        <span key={i} className="flex items-center gap-1.5 text-xs text-white/50 bg-white/5 px-3 py-1.5 rounded-sm">
                          <Icon size={12} className="text-[#CCFF00]" />
                          {facility}
                        </span>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {selected.levels?.map((level, i) => (
                      <span key={i} className="text-[10px] text-[#CCFF00] border border-[#CCFF00]/20 bg-[#CCFF00]/10 px-2.5 py-1 uppercase font-bold tracking-wide rounded-sm">
                        {level}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-8">
                    <button
                      onClick={handleNavigate}
                      className="bg-[#CCFF00] text-black px-6 py-3 flex items-center gap-2 text-sm font-heading font-bold uppercase tracking-wider hover:bg-white transition-colors"
                    >
                      <Navigation size={16} />
                      Navigare Google Maps
                    </button>
                    <button
                      onClick={handleCopyAddress}
                      className="bg-white/10 text-white px-6 py-3 flex items-center gap-2 text-sm font-heading font-bold uppercase tracking-wider hover:bg-white/20 transition-colors"
                    >
                      {copied ? <Check size={16} className="text-[#CCFF00]" /> : <Copy size={16} />}
                      {copied ? 'Copiat!' : 'Copiază Adresa'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="order-1 lg:order-2 space-y-4">
              {LOCATIONS.map((location) => {
                const isSelected = selectedLocation === location.id;
                return (
                  <button
                    key={location.id}
                    onClick={() => onSelectLocation(location)}
                    className={`w-full text-left p-6 border transition-all ${
                      isSelected
                        ? 'bg-[#CCFF00]/5 border-[#CCFF00]/50'
                        : 'bg-[#0A0A0A] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {location.is_highlighted && (
                          <span className="inline-block bg-[#CCFF00] text-black text-[10px] font-bold uppercase px-2 py-1 mb-2">
                            Sediu Principal
                          </span>
                        )}
                        <h3 className={`font-heading text-lg font-bold uppercase mb-2 transition-colors ${isSelected ? 'text-[#CCFF00]' : 'text-white'}`}>
                          {location.name}
                        </h3>
                        <p className="text-white/40 text-sm flex items-start gap-2">
                          <MapPin size={14} className="flex-shrink-0 mt-0.5" />
                          {location.address}
                        </p>
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected ? 'bg-[#CCFF00]' : 'bg-white/5'
                      }`}>
                        <MapPin size={16} className={isSelected ? 'text-black' : 'text-white/30'} />
                      </div>
                    </div>

                    {isSelected && (
                      <div className="lg:hidden mt-6 pt-6 border-t border-white/10 animate-fade-in">
                        {location.note && (
                          <p className="text-white/40 text-sm mb-4">
                            {location.note}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 mb-4">
                          {location.facilities?.map((facility, i) => {
                             const Icon = facilityIcons[facility] || Check;
                             return (
                              <span key={i} className="flex items-center gap-1 text-xs text-white/50 bg-white/5 px-3 py-1.5 rounded-sm">
                                <Icon size={12} className="text-[#CCFF00]" />
                                {facility}
                              </span>
                             )
                          })}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                          {location.levels?.map((level, i) => (
                            <span key={i} className="text-[10px] text-[#CCFF00] border border-[#CCFF00]/20 bg-[#CCFF00]/10 px-2.5 py-1 uppercase font-bold tracking-wide rounded-sm">
                              {level}
                            </span>
                          ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNavigate();
                            }}
                            className="bg-[#CCFF00] text-black px-4 py-3 flex justify-center items-center gap-2 text-sm font-heading font-bold uppercase w-full"
                          >
                            <Navigation size={14} />
                            Navigare
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyAddress();
                            }}
                            className="bg-white/10 text-white px-4 py-3 flex justify-center items-center gap-2 text-sm font-heading font-bold uppercase w-full"
                          >
                            {copied ? <Check size={14} className="text-[#CCFF00]" /> : <Copy size={14} />}
                            {copied ? 'Copiat' : 'Copiază'}
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