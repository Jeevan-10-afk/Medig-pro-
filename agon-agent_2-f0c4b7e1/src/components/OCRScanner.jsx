import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Loader2, Copy, CheckCircle, X } from 'lucide-react';
import Tesseract from 'tesseract.js';

export default function OCRScanner({ onExtract, onClose }) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);

    // OCR Processing
    setLoading(true);
    setProgress(0);

    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      setExtractedText(result.data.text);
      
      // Try to extract patient data
      const extracted = extractPatientData(result.data.text);
      if (onExtract) {
        onExtract(extracted);
      }
    } catch (err) {
      console.error('OCR Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const extractPatientData = (text) => {
    const data = {};
    
    // Try to find name patterns
    const nameMatch = text.match(/(?:name|patient)[:\s]+([A-Za-z\s]+)/i);
    if (nameMatch) data.full_name = nameMatch[1].trim();
    
    // Try to find date of birth
    const dobMatch = text.match(/(?:dob|date of birth|birth date)[:\s]+([\d\/\-]+)/i);
    if (dobMatch) data.date_of_birth = dobMatch[1];
    
    // Try to find medications
    const medsMatch = text.match(/(?:medications?|medicine)[:\s]+([\w\s,]+)/i);
    if (medsMatch) data.current_medications = medsMatch[1].trim();
    
    // Try to find diagnosis
    const diagMatch = text.match(/(?:diagnosis|condition)[:\s]+([\w\s,]+)/i);
    if (diagMatch) data.diagnosis = diagMatch[1].trim();
    
    // Try to find date
    const dateMatch = text.match(/(?:date)[:\s]+([\d\/\-]+)/i);
    if (dateMatch) data.report_date = dateMatch[1];
    
    return data;
  };

  const copyText = () => {
    navigator.clipboard.writeText(extractedText);
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
        className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-teal-400" />
            Document Scanner (OCR)
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-teal-500/50 transition"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 mb-2">Click to upload document image</p>
            <p className="text-gray-500 text-sm">Supports prescriptions, reports, medical documents</p>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="bg-white/5 rounded-xl p-4">
              <img
                src={imagePreview}
                alt="Document preview"
                className="max-h-64 mx-auto rounded-lg"
              />
            </div>
          )}

          {/* Progress */}
          {loading && (
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-gray-300">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing document... {progress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Extracted Text */}
          {extractedText && !loading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-teal-400">Extracted Text</h4>
                <button
                  onClick={copyText}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>
              <div className="bg-white/5 rounded-xl p-4 max-h-64 overflow-y-auto">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                  {extractedText}
                </pre>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}