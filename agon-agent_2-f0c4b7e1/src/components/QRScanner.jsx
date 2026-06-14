import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Scan, User, AlertCircle } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function QRScanner({ onScan, onClose }) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [manualId, setManualId] = useState('');
  const scannerRef = useRef(null);

  useEffect(() => {
    if (scanning) {
      const scanner = new Html5QrcodeScanner('qr-reader', {
        qrbox: { width: 250, height: 250 },
        fps: 5,
      }, false);

      scanner.render(
        (decodedText) => {
          try {
            const data = JSON.parse(decodedText);
            scanner.clear();
            setScanning(false);
            onScan(data.patient_id || data.mrn);
          } catch (err) {
            // If not JSON, try as plain patient ID
            scanner.clear();
            setScanning(false);
            onScan(decodedText);
          }
        },
        (err) => {
          // Ignore scan errors (no QR found)
        }
      );

      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [scanning, onScan]);

  const handleManualSearch = () => {
    if (manualId.trim()) {
      onScan(manualId.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-white/20"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Scan className="w-6 h-6 text-teal-400" />
            QR Scanner
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4 flex items-center gap-2 text-red-200 text-sm">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {!scanning ? (
          <div className="space-y-4">
            <button
n              onClick={() => setScanning(true)}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-white rounded-xl font-medium transition"
            >
              <Camera className="w-6 h-6" />
              Start Scanning
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-slate-900 text-gray-400 text-sm">or enter manually</span>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                placeholder="Enter Patient ID"
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                onClick={handleManualSearch}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition"
              >
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div id="qr-reader" className="rounded-xl overflow-hidden"></div>
            <button
              onClick={() => {
                if (scannerRef.current) {
                  scannerRef.current.clear();
                }
                setScanning(false);
              }}
              className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
            >
              Cancel Scan
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}