import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Printer, Copy, CheckCircle } from 'lucide-react';
import QRCode from 'qrcode';

export default function QRGenerator({ patient }) {
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (patient) {
      generateQR();
    }
  }, [patient]);

  const generateQR = async () => {
    const qrData = JSON.stringify({
      patient_id: patient.patient_id,
      name: patient.full_name,
      dob: patient.date_of_birth,
      phone: patient.phone,
      mrn: patient.qr_code,
      registered: patient.created_at
    });

    const url = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' }
    });
    setQrUrl(url);
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.download = `patient-qr-${patient.patient_id}.png`;
    link.href = qrUrl;
    link.click();
  };

  const printCard = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Patient QR Card - ${patient.full_name}</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f8fafc; }
            .card { background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; max-width: 300px; }
            .logo { color: #0ea5e9; font-size: 24px; font-weight: bold; margin-bottom: 16px; }
            .qr-img { width: 200px; height: 200px; margin: 16px auto; }
            .name { font-size: 20px; font-weight: 600; color: #0f172a; margin: 8px 0; }
            .info { color: #64748b; font-size: 14px; margin: 4px 0; }
            .footer { margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo">🏥 Medig Pro+</div>
            <img src="${qrUrl}" class="qr-img" />
            <div class="name">${patient.full_name}</div>
            <div class="info">Patient ID: ${patient.patient_id}</div>
            <div class="info">DOB: ${patient.date_of_birth}</div>
            <div class="info">Phone: ${patient.phone}</div>
            <div class="footer">Scan QR code for instant patient record access</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const copyPatientId = () => {
    navigator.clipboard.writeText(patient.patient_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!patient) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-xl"
    >
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Patient QR Code</h3>
      
      <div className="flex flex-col items-center">
        {qrUrl && (
          <div className="bg-slate-50 rounded-xl p-4 mb-4">
            <img src={qrUrl} alt="Patient QR Code" className="w-48 h-48" />
          </div>
        )}
        
        <div className="text-center mb-4">
          <p className="font-semibold text-slate-900">{patient.full_name}</p>
          <p className="text-sm text-slate-500">Patient ID: {patient.patient_id}</p>
        </div>
        
        <div className="flex gap-2 w-full">
          <button
            onClick={downloadQR}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={printCard}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
        
        <button
          onClick={copyPatientId}
          className="mt-3 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition"
        >
          {copied ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-green-500">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Patient ID
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}