import { useState, useEffect, useRef, useCallback } from 'react';
import { attendanceAPI, locationsAPI, qrAPI } from '../../lib/api';
import { toast } from 'sonner';
import { QrCode, Camera, Check, X, AlertTriangle, RefreshCw } from 'lucide-react';

const QRScanPage = () => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [qrInput, setQrInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [cameraMode, setCameraMode] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (cameraMode) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [cameraMode]);

  const fetchLocations = async () => {
    try {
      const response = await locationsAPI.getAll();
      setLocations(response.data);
      if (response.data.length > 0) {
        setSelectedLocation(response.data[0].name);
      }
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    }
  };

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

  const scanFromVideoFrame = useCallback(async () => {
    if (!videoRef.current || videoRef.current.readyState < 2 || scanning) return;

    if (!('BarcodeDetector' in window)) {
      setCameraError('Browserul nu suportă scanarea QR prin cameră. Folosește Chrome sau Edge modern.');
      stopCamera();
      return;
    }

    try {
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      const codes = await detector.detect(videoRef.current);
      if (codes?.length) {
        const value = codes[0]?.rawValue;
        if (value) {
          stopCamera();
          await processQrToken(value, 'camera');
        }
      }
    } catch (error) {
      console.error('QR detect error:', error);
    }
  }, [processQrToken, scanning, stopCamera]);

  const startCamera = useCallback(async () => {
    setCameraError('');
    setLastResult(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera nu este disponibilă în acest browser.');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!qrInput.trim()) return;
    await processQrToken(qrInput.trim(), 'qr');
  };

  const handleValidateOnly = async () => {
    if (!qrInput.trim()) return;

    try {
      const response = await qrAPI.validate(qrInput.trim());
      if (response.data.valid) {
        toast.success(`QR valid: ${response.data.person_name}`);
      } else {
        toast.error('Cod QR invalid');
      }
    } catch (error) {
      toast.error('Eroare la validare');
    }
  };

  return (
    <div className="space-y-6" data-testid="qr-scan-page">
      <div>
        <h1 className="font-heading text-3xl font-bold text-white uppercase">Scanare QR</h1>
        <p className="text-white/40 text-sm mt-1">Scanează cu camera sau introdu manual codul QR</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setCameraMode(false)}
          className={`px-4 py-2 flex items-center gap-2 transition-colors ${
            !cameraMode ? 'bg-[#CCFF00] text-black' : 'bg-white/5 text-white/60'
          }`}
        >
          <QrCode size={16} />
          Manual
        </button>
        <button
          onClick={() => setCameraMode(true)}
          className={`px-4 py-2 flex items-center gap-2 transition-colors ${
            cameraMode ? 'bg-[#CCFF00] text-black' : 'bg-white/5 text-white/60'
          }`}
        >
          <Camera size={16} />
          Cameră
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-[#0A0A0A] border border-white/5 p-6 space-y-4">
          <div>
            <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Locație</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full bg-[#121212] border border-white/10 px-4 py-3 text-white"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.name}>{loc.name}</option>
              ))}
            </select>
          </div>

          {cameraMode ? (
            <div className="space-y-4">
              <div className="aspect-video bg-[#121212] border border-white/10 overflow-hidden relative">
                <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-56 border-2 border-[#CCFF00] rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
                </div>
              </div>

              {cameraError ? (
                <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                  {cameraError}
                </div>
              ) : (
                <p className="text-white/50 text-sm">
                  {cameraActive ? 'Îndreaptă camera spre codul QR. Scanarea pornește automat.' : 'Pornește camera pentru scanare.'}
                </p>
              )}

              <div className="flex gap-2">
                <button onClick={startCamera} type="button" className="flex-1 btn-primary py-3 inline-flex items-center justify-center gap-2">
                  <RefreshCw size={16} />
                  Repornește camera
                </button>
                <button onClick={stopCamera} type="button" className="flex-1 btn-secondary py-3">
                  Oprește camera
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="qr-form">
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">
                  Cod QR / Token
                </label>
                <textarea
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  placeholder="Lipește sau introdu codul QR aici..."
                  className="w-full bg-[#121212] border border-white/10 focus:border-[#CCFF00] px-4 py-3 text-white placeholder:text-white/30 h-32 resize-none font-mono text-sm"
                  data-testid="qr-input"
                />
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={handleValidateOnly} className="flex-1 btn-secondary py-3">
                  Doar validează
                </button>
                <button
                  type="submit"
                  disabled={scanning || !qrInput.trim()}
                  className="flex-1 btn-primary py-3 disabled:opacity-50"
                  data-testid="qr-submit"
                >
                  {scanning ? 'Se procesează...' : 'Înregistrează prezență'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="bg-[#0A0A0A] border border-white/5 p-6">
          <h3 className="font-heading text-lg font-bold text-white uppercase mb-4">Rezultat scanare</h3>

          {lastResult ? (
            lastResult.success ? (
              <div className="space-y-4" data-testid="scan-success">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Check size={32} className="text-green-400" />
                </div>
                <div className="text-center">
                  <p className="text-white text-xl font-heading font-bold">{lastResult.person_name}</p>
                  <p className="text-white/40 text-sm mt-1">
                    {lastResult.person_type === 'child' ? 'Copil' : 'Adult'}
                  </p>
                </div>

                {lastResult.sessions_remaining !== null && (
                  <div className={`p-4 text-center ${
                    lastResult.sessions_remaining <= 2 ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-white/5'
                  }`}>
                    <p className={`font-heading text-3xl font-bold ${
                      lastResult.sessions_remaining <= 2 ? 'text-yellow-400' : 'text-[#CCFF00]'
                    }`}>
                      {lastResult.sessions_remaining}
                    </p>
                    <p className="text-white/40 text-sm">ședințe rămase</p>
                  </div>
                )}

                {lastResult.warnings?.length > 0 && (
                  <div className="space-y-2">
                    {lastResult.warnings.map((warning, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30">
                        <AlertTriangle size={14} className="text-yellow-400" />
                        <span className="text-yellow-400 text-sm">{warning}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center space-y-4" data-testid="scan-error">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                  <X size={32} className="text-red-400" />
                </div>
                <p className="text-red-400">{lastResult.error}</p>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <QrCode size={48} className="text-white/10 mx-auto mb-4" />
              <p className="text-white/30 text-sm">Scanează un cod QR pentru a vedea rezultatul</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#0A0A0A] border border-white/5 p-6">
        <h3 className="font-heading text-lg font-bold text-white uppercase mb-4">Instrucțiuni</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-[#CCFF00] font-heading text-sm uppercase mb-2">1. Selectează locația</p>
            <p className="text-white/50 text-sm">Alege bazinul în care se face prezența.</p>
          </div>
          <div>
            <p className="text-[#CCFF00] font-heading text-sm uppercase mb-2">2. Scanează QR</p>
            <p className="text-white/50 text-sm">Poți folosi camera sau poți lipi tokenul manual.</p>
          </div>
          <div>
            <p className="text-[#CCFF00] font-heading text-sm uppercase mb-2">3. Verifică rezultatul</p>
            <p className="text-white/50 text-sm">Sistemul afișează imediat persoana și ședințele rămase.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanPage;
