import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Phone, MapPin, Calendar, Ruler, Scale, Thermometer, 
  Heart, Activity, FileText, Cigarette, Wine, Frown, 
  Save, Send, ChevronRight, ChevronLeft, CheckCircle,
  AlertTriangle, Clock
} from 'lucide-react';
import QRCode from 'qrcode';

const steps = [
  { id: 'basic', title: 'Basic Information', icon: User },
  { id: 'assessment', title: 'Initial Assessment', icon: Activity },
  { id: 'medical', title: 'Medical History', icon: FileText },
  { id: 'lifestyle', title: 'Lifestyle', icon: Heart },
  { id: 'review', title: 'Review & Submit', icon: CheckCircle }
];

export default function PatientRegistration() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [patientData, setPatientData] = useState(null);
  const [formData, setFormData] = useState({
    // Basic Information
    full_name: '',
    date_of_birth: '',
    gender: '',
    address: '',
    phone: '',
    emergency_contact: '',
    // Initial Assessment
    height: '',
    weight: '',
    temperature: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    pulse_rate: '',
    // Medical History
    reason_for_visit: '',
    current_medications: '',
    allergies: '',
    pain_scale: 1,
    // Lifestyle
    smoking_status: 'never',
    alcohol_consumption: 'never',
    mood_swings: false,
    // Record Details
    assessment_date: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Calculate BMI
  const bmi = formData.height && formData.weight 
    ? (parseFloat(formData.weight) / Math.pow(parseFloat(formData.height) / 100, 2)).toFixed(1)
    : '';

  const getBMICategory = (bmi) => {
    if (!bmi) return '';
    const b = parseFloat(bmi);
    if (b < 18.5) return { label: 'Underweight', color: 'text-yellow-400' };
    if (b < 25) return { label: 'Normal', color: 'text-green-400' };
    if (b < 30) return { label: 'Overweight', color: 'text-orange-400' };
    return { label: 'Obese', color: 'text-red-400' };
  };

  const bmiCategory = getBMICategory(bmi);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 0) {
      if (!formData.full_name) newErrors.full_name = 'Full name is required';
      if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
      if (!formData.phone) newErrors.phone = 'Phone number is required';
    }
    
    if (step === 1) {
      if (!formData.height) newErrors.height = 'Height is required';
      if (!formData.weight) newErrors.weight = 'Weight is required';
    }
    
    if (step === 2) {
      if (!formData.reason_for_visit) newErrors.reason_for_visit = 'Reason for visit is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          ...formData,
          bmi: bmi ? parseFloat(bmi) : null
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      
      setPatientData(data);
      
      // Generate QR Code
      const qrData = JSON.stringify({
        patient_id: data.patient_id,
        name: data.full_name,
        dob: data.date_of_birth,
        phone: data.phone,
        mrn: data.qr_code,
        registered: data.created_at
      });
      
      const qr = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' }
      });
      
      setQrCodeUrl(qr);
      setSubmitted(true);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = (format) => {
    const link = document.createElement('a');
    link.download = `patient-qr-${patientData?.patient_id}.${format}`;
    link.href = qrCodeUrl;
    link.click();
  };

  const printQRCcard = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>Patient QR Card</title></head>
        <body style="display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: Arial, sans-serif;">
          <div style="text-align: center; padding: 40px; border: 2px solid #0ea5e9; border-radius: 16px;">
            <img src="${qrCodeUrl}" style="width: 200px; height: 200px;" />
            <h2 style="margin-top: 20px; color: #0f172a;">${patientData?.full_name}</h2>
            <p style="color: #64748b;">Patient ID: ${patientData?.patient_id}</p>
            <p style="color: #64748b;">DOB: ${patientData?.date_of_birth}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-green-500 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Registration Successful!</h2>
          <p className="text-gray-400 mb-6">Patient has been registered successfully.</p>
          
          {qrCodeUrl && (
            <div className="bg-white rounded-xl p-6 mb-6">
              <img src={qrCodeUrl} alt="Patient QR Code" className="mx-auto mb-4" />
              <p className="text-slate-900 font-semibold">{patientData?.full_name}</p>
              <p className="text-slate-600 text-sm">Patient ID: {patientData?.patient_id}</p>
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={() => downloadQR('png')}
              className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 rounded-lg transition"
            >
              Download QR
            </button>
            <button
              onClick={printQRCcard}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition"
            >
              Print Card
            </button>
          </div>
          
          <button
            onClick={() => navigate('/doctor')}
            className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white font-medium py-2 rounded-lg transition"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Patient Registration</h1>
          <p className="text-gray-400">Complete all sections to register a new patient</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  index === currentStep
                    ? 'border-teal-400 bg-teal-400/20 text-teal-400'
                    : index < currentStep
                    ? 'border-teal-400 bg-teal-400 text-white'
                    : 'border-gray-600 text-gray-600'
                }`}
              >
                {index < currentStep ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <span className={`hidden md:block ml-2 text-sm ${
                index === currentStep ? 'text-white' : 'text-gray-500'
              }`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-12 md:w-20 h-0.5 mx-2 ${
                  index < currentStep ? 'bg-teal-400' : 'bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Form */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/20"
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Information */}
            {currentStep === 0 && (
              <motion.div
                key="basic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <User className="w-6 h-6 text-teal-400" />
                  Basic Information
                </h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className={`w-full bg-white/10 border ${errors.full_name ? 'border-red-500' : 'border-white/20'} rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500`}
                      placeholder="John Doe"
                    />
                    {errors.full_name && <p className="text-red-400 text-sm mt-1">{errors.full_name}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth *</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      className={`w-full bg-white/10 border ${errors.date_of_birth ? 'border-red-500' : 'border-white/20'} rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    />
                    {errors.date_of_birth && <p className="text-red-400 text-sm mt-1">{errors.date_of_birth}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Gender *</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className={`w-full bg-white/10 border ${errors.gender ? 'border-red-500' : 'border-white/20'} rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    >
                      <option value="" className="bg-slate-800">Select Gender</option>
                      <option value="male" className="bg-slate-800">Male</option>
                      <option value="female" className="bg-slate-800">Female</option>
                      <option value="other" className="bg-slate-800">Other</option>
                    </select>
                    {errors.gender && <p className="text-red-400 text-sm mt-1">{errors.gender}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full bg-white/10 border ${errors.phone ? 'border-red-500' : 'border-white/20'} rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500`}
                      placeholder="+1 234 567 8900"
                    />
                    {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="123 Main St, City, State"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Emergency Contact</label>
                    <input
                      type="tel"
                      name="emergency_contact"
                      value={formData.emergency_contact}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Initial Assessment */}
            {currentStep === 1 && (
              <motion.div
                key="assessment"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Activity className="w-6 h-6 text-teal-400" />
                  Initial Assessment
                </h2>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Height (cm) *</label>
                    <input
                      type="number"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      className={`w-full bg-white/10 border ${errors.height ? 'border-red-500' : 'border-white/20'} rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500`}
                      placeholder="175"
                    />
                    {errors.height && <p className="text-red-400 text-sm mt-1">{errors.height}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Weight (kg) *</label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      step="0.1"
                      className={`w-full bg-white/10 border ${errors.weight ? 'border-red-500' : 'border-white/20'} rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500`}
                      placeholder="70"
                    />
                    {errors.weight && <p className="text-red-400 text-sm mt-1">{errors.weight}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">BMI</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={bmi ? `${bmi} (${bmiCategory?.label})` : 'Auto-calculated'}
                        disabled
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-400"
                      />
                      {bmi && <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${bmiCategory?.color}`} />}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Temperature (°C)</label>
                    <input
                      type="number"
                      name="temperature"
                      value={formData.temperature}
                      onChange={handleChange}
                      step="0.1"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="36.5"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Blood Pressure (Systolic)</label>
                    <input
                      type="number"
                      name="blood_pressure_systolic"
                      value={formData.blood_pressure_systolic}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="120"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Blood Pressure (Diastolic)</label>
                    <input
                      type="number"
                      name="blood_pressure_diastolic"
                      value={formData.blood_pressure_diastolic}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="80"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Pulse Rate (bpm)</label>
                    <input
                      type="number"
                      name="pulse_rate"
                      value={formData.pulse_rate}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="72"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Medical History */}
            {currentStep === 2 && (
              <motion.div
                key="medical"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <FileText className="w-6 h-6 text-teal-400" />
                  Medical History
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Reason for Visit *</label>
                    <textarea
                      name="reason_for_visit"
                      value={formData.reason_for_visit}
                      onChange={handleChange}
                      rows={3}
                      className={`w-full bg-white/10 border ${errors.reason_for_visit ? 'border-red-500' : 'border-white/20'} rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500`}
                      placeholder="Describe the reason for this visit..."
                    />
                    {errors.reason_for_visit && <p className="text-red-400 text-sm mt-1">{errors.reason_for_visit}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Current Medications</label>
                    <textarea
                      name="current_medications"
                      value={formData.current_medications}
                      onChange={handleChange}
                      rows={2}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="List any current medications..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Allergies</label>
                    <input
                      type="text"
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Penicillin, Peanuts, etc."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Pain Scale (1-10)</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        name="pain_scale"
                        min="1"
                        max="10"
                        value={formData.pain_scale}
                        onChange={handleChange}
                        className="flex-1 accent-teal-500"
                      />
                      <span className="text-2xl font-bold text-white w-10 text-center">{formData.pain_scale}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>No Pain</span>
                      <span>Severe Pain</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Lifestyle */}
            {currentStep === 3 && (
              <motion.div
                key="lifestyle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Heart className="w-6 h-6 text-teal-400" />
                  Lifestyle Observation
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Smoking Status</label>
                    <select
                      name="smoking_status"
                      value={formData.smoking_status}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="never" className="bg-slate-800">Never Smoked</option>
                      <option value="former" className="bg-slate-800">Former Smoker</option>
                      <option value="occasional" className="bg-slate-800">Occasional Smoker</option>
                      <option value="regular" className="bg-slate-800">Regular Smoker</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Alcohol Consumption</label>
                    <select
                      name="alcohol_consumption"
                      value={formData.alcohol_consumption}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="never" className="bg-slate-800">Never</option>
                      <option value="occasional" className="bg-slate-800">Occasional</option>
                      <option value="moderate" className="bg-slate-800">Moderate</option>
                      <option value="heavy" className="bg-slate-800">Heavy</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="mood_swings"
                        checked={formData.mood_swings}
                        onChange={handleChange}
                        className="w-5 h-5 rounded border-gray-600 bg-white/10 text-teal-500 focus:ring-teal-500"
                      />
                      <span className="text-gray-300">Recent Mood Swings</span>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Review */}
            {currentStep === 4 && (
              <motion.div
                key="review"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-teal-400" />
                  Review & Submit
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-teal-400 mb-3">Basic Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-400">Name:</span> <span className="text-white">{formData.full_name}</span></p>
                      <p><span className="text-gray-400">DOB:</span> <span className="text-white">{formData.date_of_birth}</span></p>
                      <p><span className="text-gray-400">Gender:</span> <span className="text-white">{formData.gender}</span></p>
                      <p><span className="text-gray-400">Phone:</span> <span className="text-white">{formData.phone}</span></p>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-teal-400 mb-3">Vitals</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-400">Height:</span> <span className="text-white">{formData.height} cm</span></p>
                      <p><span className="text-gray-400">Weight:</span> <span className="text-white">{formData.weight} kg</span></p>
                      <p><span className="text-gray-400">BMI:</span> <span className="text-white">{bmi} ({bmiCategory?.label})</span></p>
                      <p><span className="text-gray-400">BP:</span> <span className="text-white">{formData.blood_pressure_systolic}/{formData.blood_pressure_diastolic} mmHg</span></p>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-teal-400 mb-3">Medical History</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-400">Reason:</span> <span className="text-white">{formData.reason_for_visit}</span></p>
                      <p><span className="text-gray-400">Medications:</span> <span className="text-white">{formData.current_medications || 'None'}</span></p>
                      <p><span className="text-gray-400">Allergies:</span> <span className="text-white">{formData.allergies || 'None'}</span></p>
                      <p><span className="text-gray-400">Pain Scale:</span> <span className="text-white">{formData.pain_scale}/10</span></p>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-teal-400 mb-3">Lifestyle</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-400">Smoking:</span> <span className="text-white">{formData.smoking_status}</span></p>
                      <p><span className="text-gray-400">Alcohol:</span> <span className="text-white">{formData.alcohol_consumption}</span></p>
                      <p><span className="text-gray-400">Mood Swings:</span> <span className="text-white">{formData.mood_swings ? 'Yes' : 'No'}</span></p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Assessment Date</label>
                  <input
                    type="date"
                    name="assessment_date"
                    value={formData.assessment_date}
                    onChange={handleChange}
                    className="w-full md:w-1/2 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                
                {errors.submit && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200 text-sm">
                    {errors.submit}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>
            
            {currentStep < steps.length - 1 ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 rounded-lg text-white font-medium transition"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-400 hover:to-green-400 rounded-lg text-white font-medium transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Registration
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}