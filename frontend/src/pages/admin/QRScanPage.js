import { useState, useEffect, useRef, useCallback } from 'react';
import { attendanceAPI, qrAPI } from '../../lib/api';
import { toast } from 'sonner';
import { QrCode, Camera, Check, X, AlertTriangle, RefreshCw } from 'lucide-react';

// Locațiile statice (la fel ca în restul aplicației)
const LOCATIONS = [
  { id: "fiald", name: 'Bazin Fiald (Hotel Fiald)' },
  { id: "olimpic", name: 'Bazinul Olimpic Bacău' },
  { id: "emd", name: 'Bazinul EMD Academy' }
];

const QRScanPage = () => {
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0].name);
  const [qrInput, setQrInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  
  const [cameraMode, setCameraMode] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Funcția principală de procesare a token-ului (folosită și de manual și de cameră)
  const processQrToken = useCallback(async (token, method = 'qr') => {
    if (!token || scanning) return;

    setScanning(true);
    setLastResult(null);

    try {
      const response = await attendanceAPI.recordQR(token.trim(), selectedLocation);
      setLastResult({ success: true, ...response.data, method });
      toast.success(`Prezență înregistrată pentru ${response.data.person_name}`);
      setQrInput('');
    } catch (error) {
      const message = error.response?.data?.detail || 'Cod QR invalid';
      setLastResult({ success: false, error: message });
      toast.error(message);
    } finally {
      setScanning(false);
    }
  }, [scanning, selectedLocation]);

  // Funcția de oprire a camerei
  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Funcția care rulează la fiecare x milisecunde pentru a citi frame-ul video
  const scanFromVideoFrame = useCallback(async () => {
    if (!videoRef.current || videoRef.current.readyState < 2 || scanning) return;

    if (!('BarcodeDetector' in window)) {
      setCameraError('Browserul nu suportă scanarea prin cameră. Folosește Chrome modern.');
      stopCamera();
      return;
    }

    try {
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      const codes = await detector.detect(videoRef.current);
      if (codes?.length) {
        const value = codes[0]?.rawValue;
        if (value) {
          stopCamera(); // Oprim camera imediat ce am găsit un cod pentru a nu scana de 10 ori
          await processQrToken(value, 'camera');
        }
      }
    } catch (error) {
      console.error('QR detect error:', error);
    }
  }, [processQrToken, scanning, stopCamera]);

  // Funcția de pornire a camerei
  const startCamera = useCallback(async () => {
    setCameraError('');
    setLastResult(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera nu este disponibilă în acest browser/dispozitiv.');
      return;
    }

    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      scanIntervalRef.current = setInterval(scanFromVideoFrame, 500);
    } catch (error) {
      console.error('Camera start failed:', error);
      setCameraError('Nu am putut porni camera. Verifică permisiunile browserului.');
      stopCamera();
    }
  }, [scanFromVideoFrame, stopCamera]);

  // Gestionarea ciclului de viață al camerei în funcție de Tab-ul selectat (Manual/Camera)
  useEffect(() => {
    if (cameraMode) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera(); // Cleanup la unmount
    };
  }, [cameraMode, startCamera, stopCamera]);

  const handleSubmitManual = async (e) => {
    e.preventDefault();
    if (!qrInput.trim()) return;
    await processQrToken(qrInput.trim(), 'qr');
  };

  const handleValidateOnly = async () => {
    if (!qrInput.trim()) return;
    try {
      const response = await qrAPI.validate(qrInput.trim());
      if (response.data.valid) {
        toast.success(`QR Valid: Aparține lui ${response.data.person_name}`);
      } else {
        toast.error('Cod QR invalid sau expirat');
      }
    } catch (error) {
      toast.error('Eroare la validare');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-white uppercase tracking-tight">Scanare QR</h1>
        <p className="text-white/40 text-sm mt-1">Înregistrare rapidă a prezenței la intrarea în bazin</p>
      </div>

      {/* Tabs / Selectors */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCameraMode(false)}
          className={`px-6 py-3 flex items-center gap-2 font-heading uppercase text-sm tracking-widest transition-colors ${
            !cameraMode ? 'bg-[#CCFF00] text-black font-bold' : 'bg-white/5 text-white/40 hover:bg-white/10'
          }`}
        >
          <QrCode size={16} /> Manual
        </button>
        <button
          onClick={() => setCameraMode(true)}
          className={`px-6 py-3 flex items-center gap-2 font-heading uppercase text-sm tracking-widest transition-colors ${
            cameraMode ? 'bg-[#CCFF00] text-black font-bold' : 'bg-white/5 text-white/40 hover:bg-white/10'
          }`}
        >
          <Camera size={16} /> Cameră Telefon
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Partea de Input / Video */}
        <div className="bg-[#0A0A0A] border border-white/5 p-6 space-y-6">
          <div>
            <label className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2 block">Locația Curentă</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full bg-[#121212] border border-white/10 px-4 py-4 text-white focus:border-[#CCFF00] outline-none appearance-none"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.name}>{loc.name}</option>
              ))}
            </select>
          </div>

          {cameraMode ? (
            <div className="space-y-4">
              <div className="aspect-video bg-[#121212] border border-white/10 relative overflow-hidden flex items-center justify-center">
                <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" muted playsInline />
                
                {/* Chenarul vizual pentru focus (HUD) */}
                <div className="absolute inset-0 pointer-events-none z-10">
                  <div className="w-full h-full border-[40px] border-black/50" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.3)]">
                     <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#CCFF00] bg-[#121212] -translate-x-1/2 -translate-y-1/2" />
                     <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#CCFF00] bg-[#121212] translate-x-1/2 -translate-y-1/2" />
                     <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#CCFF00] bg-[#121212] -translate-x-1/2 translate-y-1/2" />
                     <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#CCFF00] bg-[#121212] translate-x-1/2 translate-y-1/2" />
                  </div>
                </div>

                {!cameraActive && !cameraError && (
                  <p className="text-white/30 text-xs uppercase tracking-widest relative z-20">Se inițializează camera...</p>
                )}
              </div>

              {cameraError ? (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <AlertTriangle size={16} /> {cameraError}
                </div>
              ) : (
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest text-center">
                  {cameraActive ? 'Încadrează codul QR al clientului în centrul ecranului.' : 'Camera este oprită.'}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button onClick={startCamera} className="flex-1 btn-primary py-4 text-xs tracking-widest flex items-center justify-center gap-2">
                  <RefreshCw size={14} /> Repornește 
                </button>
                <button onClick={stopCamera} className="flex-1 btn-secondary py-4 text-xs tracking-widest">
                  Oprește
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitManual} className="space-y-4">
              <div>
                <label className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2 block">
                  Token QR Manual
                </label>
                <textarea
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  placeholder="Lipește textul codului aici..."
                  className="w-full bg-[#121212] border border-white/10 focus:border-[#CCFF00] px-4 py-4 text-white placeholder:text-white/20 h-32 resize-none font-mono text-sm outline-none transition-all"
                />
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={handleValidateOnly} className="flex-1 btn-secondary py-4 text-[10px] font-black tracking-widest">
                  Verifică Token
                </button>
                <button type="submit" disabled={scanning || !qrInput.trim()} className="flex-1 btn-primary py-4 text-[10px] font-black tracking-widest disabled:opacity-20">
                  {scanning ? 'Se înregistrează...' : 'Marchează Prezența'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Partea de Rezultate */}
        <div className="bg-[#0A0A0A] border border-white/5 p-6 flex flex-col">
          <h3 className="font-heading text-lg font-bold text-white uppercase mb-6">Rezultat Interogare</h3>

          <div className="flex-1 flex flex-col items-center justify-center">
            {lastResult ? (
              lastResult.success ? (
                <div className="w-full space-y-6 text-center animate-fade-in">
                  <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                    <Check size={32} className="text-green-500" />
                  </div>
                  <div>
                    <p className="text-white text-2xl font-heading font-bold uppercase tracking-tight">{lastResult.person_name}</p>
                    <span className="inline-block mt-2 text-[10px] uppercase font-black px-3 py-1 bg-white/5 text-white/40 tracking-widest">
                      {lastResult.person_type === 'child' ? 'Copil' : 'Adult / Titular'}
                    </span>
                  </div>

                  {lastResult.sessions_remaining !== null && (
                    <div className={`p-6 mt-4 border ${
                      lastResult.sessions_remaining <= 2 ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-white/[0.02] border-white/5'
                    }`}>
                      <p className={`font-heading text-5xl font-black mb-1 ${
                        lastResult.sessions_remaining <= 2 ? 'text-yellow-400' : 'text-[#CCFF00]'
                      }`}>
                        {lastResult.sessions_remaining}
                      </p>
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Ședințe Disponibile</p>
                    </div>
                  )}

                  {lastResult.warnings?.length > 0 && (
                    <div className="space-y-2 mt-4 text-left">
                      {lastResult.warnings.map((warning, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 bg-yellow-500/5 border border-yellow-500/20">
                          <AlertTriangle size={16} className="text-yellow-500 flex-shrink-0" />
                          <span className="text-yellow-500 text-xs font-bold uppercase">{warning}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full text-center space-y-4 animate-fade-in">
                  <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                    <X size={32} className="text-red-500" />
                  </div>
                  <h4 className="text-white font-heading text-xl uppercase font-bold tracking-tight">Acces Respins</h4>
                  <p className="text-red-400 text-sm font-medium p-4 bg-red-500/5 border border-red-500/10">{lastResult.error}</p>
                </div>
              )
            ) : (
              <div className="text-center opacity-30">
                <QrCode size={64} className="mx-auto mb-6 text-white" />
                <p className="text-white text-xs font-bold uppercase tracking-widest">Sistem pregătit.</p>
                <p className="text-white text-xs mt-1">Aștept scanarea token-ului...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanPage;