import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, QrCode, FileText, Users, Activity, Calendar,
  Bell, Settings, LogOut, Plus, Eye, Edit, Download,
  ChevronRight, TrendingUp, UserCheck, Clock, BarChart3,
  Upload, FileScan, Stethoscope, Menu, X, AlertCircle, Camera
} from 'lucide-react';
import QRScanner from '../components/QRScanner';
import OCRScanner from '../components/OCRScanner';
import QRGenerator from '../components/QRGenerator';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function DoctorDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showOCRScanner, setShowOCRScanner] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }
  const navigate = useNavigate();

  const showToastMessage = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const [patientsRes, appointmentsRes, notificationsRes, analyticsRes, recordsRes] = await Promise.all([
        fetch('/api/patients', { headers }),
        fetch('/api/appointments', { headers }),
        fetch('/api/notifications', { headers }),
        fetch('/api/analytics', { headers }),
        fetch('/api/medical-records', { headers })
      ]);

      const patientsData = await patientsRes.json();
      const appointmentsData = await appointmentsRes.json();
      const notificationsData = await notificationsRes.json();
      const analyticsData = await analyticsRes.json();
      const recordsData = recordsRes.ok ? await recordsRes.json() : [];

      setPatients(Array.isArray(patientsData) ? patientsData : []);
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      setMedicalRecords(Array.isArray(recordsData) ? recordsData : []);
      setNotifications(notificationsData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = async (patientId) => {
    setShowQRScanner(false);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(`/api/patients?qr_code=${patientId}`, { headers });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Patient lookup failed');
      }

      const patient = await res.json();
      if (patient && !patient.error) {
        setSelectedPatient(patient);
        setShowPatientModal(true);
        showToastMessage(`Successfully loaded details for ${patient.full_name}`, 'success');
      } else {
        throw new Error(patient?.error || 'Invalid patient record format');
      }
    } catch (err) {
      console.error('Patient lookup failed:', err);
      showToastMessage(err.message || 'Patient not found', 'error');
    }
  };

  const handleOCRExtract = (data) => {
    console.log('OCR Extracted:', data);
    // Could pre-fill forms with extracted data
  };

  const filteredPatients = patients.filter(p =>
    p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.patient_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone?.includes(searchQuery)
  );

  // Chart data
  const ageChartData = {
    labels: analytics?.ageGroups ? Object.keys(analytics.ageGroups) : [],
    datasets: [{
      label: 'Patients by Age',
      data: analytics?.ageGroups ? Object.values(analytics.ageGroups) : [],
      backgroundColor: ['rgba(20, 184, 166, 0.8)', 'rgba(59, 130, 246, 0.8)', 'rgba(168, 85, 247, 0.8)', 'rgba(236, 72, 153, 0.8)', 'rgba(245, 158, 11, 0.8)'],
      borderWidth: 0
    }]
  };

  const genderChartData = {
    labels: analytics?.genderGroups ? Object.keys(analytics.genderGroups).map(g => g.charAt(0).toUpperCase() + g.slice(1)) : [],
    datasets: [{
      data: analytics?.genderGroups ? Object.values(analytics.genderGroups) : [],
      backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(236, 72, 153, 0.8)', 'rgba(168, 85, 247, 0.8)'],
      borderWidth: 0
    }]
  };

  const registrationTrendData = {
    labels: analytics?.registrationsByDay ? Object.keys(analytics.registrationsByDay).slice(-7) : [],
    datasets: [{
      label: 'Registrations',
      data: analytics?.registrationsByDay ? Object.values(analytics.registrationsByDay).slice(-7) : [],
      borderColor: 'rgb(20, 184, 166)',
      backgroundColor: 'rgba(20, 184, 166, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 256 : 80 }}
        className="bg-slate-800 border-r border-white/10 flex flex-col"
      >
        <div className="p-4 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center flex-shrink-0">
              <Activity className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                Medig Pro+
              </span>
            )}
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
            { id: 'patients', icon: Users, label: 'Patients' },
            { id: 'appointments', icon: Calendar, label: 'Appointments' },
            { id: 'records', icon: FileText, label: 'Medical Records' },
            { id: 'reports', icon: Upload, label: 'Reports' },
            { id: 'scanner', icon: QrCode, label: 'QR Scanner' },
            { id: 'ocr', icon: FileScan, label: 'OCR Scanner' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (item.id === 'ocr') setShowOCRScanner(true);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-teal-500/20 to-blue-500/20 text-teal-400 border border-teal-500/30'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-slate-800/50 backdrop-blur-sm border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-400 hover:text-white transition"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg pl-11 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 w-64"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative text-gray-400 hover:text-white transition">
                <Bell className="w-6 h-6" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <div className="hidden md:block">
                  <p className="text-white font-medium">Dr. Smith</p>
                  <p className="text-gray-400 text-sm">General Medicine</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: 'Total Patients', value: analytics?.totalPatients || 0, icon: Users, color: 'teal', trend: '+12%' },
                  { title: 'Today\'s Registrations', value: analytics?.todayRegistrations || 0, icon: UserCheck, color: 'blue', trend: '+5%' },
                  { title: 'Pending Appointments', value: analytics?.pendingAppointments || 0, icon: Clock, color: 'purple', trend: '-3%' },
                  { title: 'Total Appointments', value: analytics?.totalAppointments || 0, icon: Calendar, color: 'pink', trend: '+8%' }
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-slate-800 rounded-xl p-6 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/20 flex items-center justify-center`}>
                        <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                      </div>
                      <span className="text-sm text-green-400">{stat.trend}</span>
                    </div>
                    <p className="text-gray-400 text-sm">{stat.title}</p>
                    <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-800 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Registration Trend</h3>
                  <Line data={registrationTrendData} options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#9ca3af' } },
                      x: { grid: { display: false }, ticks: { color: '#9ca3af' } }
                    }
                  }} />
                </div>

                <div className="bg-slate-800 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Gender Distribution</h3>
                  <Doughnut data={genderChartData} options={{
                    responsive: true,
                    plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af' } } }
                  }} />
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-slate-800 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Age Distribution</h3>
                  <Bar data={ageChartData} options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#9ca3af' } },
                      x: { grid: { display: false }, ticks: { color: '#9ca3af' } }
                    }
                  }} />
                </div>

                <div className="bg-slate-800 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Patients</h3>
                  <div className="space-y-3">
                    {patients.slice(0, 5).map((patient, i) => (
                      <div
                        key={patient.id}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition cursor-pointer"
                        onClick={() => {
                          setSelectedPatient(patient);
                          setShowPatientModal(true);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                            {patient.full_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white font-medium">{patient.full_name}</p>
                            <p className="text-gray-400 text-sm">{patient.patient_id}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Patients Tab */}
          {activeTab === 'patients' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Patients</h2>
                <Link
                  to="/register-patient"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-white rounded-lg font-medium transition"
                >
                  <Plus className="w-5 h-5" />
                  Register Patient
                </Link>
              </div>

              <div className="bg-slate-800 rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Patient</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">ID</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Phone</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Gender</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredPatients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-white/5 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                              {patient.full_name?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-white font-medium">{patient.full_name}</p>
                              <p className="text-gray-400 text-sm">{patient.date_of_birth}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300">{patient.patient_id}</td>
                        <td className="px-6 py-4 text-gray-300">{patient.phone}</td>
                        <td className="px-6 py-4 text-gray-300 capitalize">{patient.gender}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedPatient(patient);
                                setShowPatientModal(true);
                              }}
                              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition">
                              <Edit className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Appointments</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-white rounded-lg font-medium transition">
                  <Plus className="w-5 h-5" />
                  New Appointment
                </button>
              </div>

              <div className="grid gap-4">
                {appointments.map((apt) => (
                  <div key={apt.id} className="bg-slate-800 rounded-xl p-6 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                          {apt.patients?.full_name?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <p className="text-white font-medium">{apt.patients?.full_name || 'Unknown'}</p>
                          <p className="text-gray-400 text-sm">{apt.appointment_date} at {apt.appointment_time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          apt.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                          apt.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          apt.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                    </div>
                    {apt.notes && (
                      <p className="mt-4 text-gray-400 text-sm">{apt.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Medical Records Tab */}
          {activeTab === 'records' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Medical Records</h2>
                <div className="text-sm text-gray-400">{medicalRecords.length} record{medicalRecords.length !== 1 ? 's' : ''}</div>
              </div>

              {medicalRecords.length === 0 ? (
                <div className="bg-slate-800 rounded-xl p-12 border border-white/10 text-center">
                  <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No medical records found</p>
                  <p className="text-gray-500 text-sm mt-1">Records will appear here after patient consultations</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {medicalRecords.map((record) => {
                    const patient = patients.find(p => p.id === record.patient_id);
                    return (
                      <motion.div
                        key={record.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-800 rounded-xl p-6 border border-white/10 hover:border-teal-500/30 transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                              {patient?.full_name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="text-white font-semibold text-lg">{patient?.full_name || 'Unknown Patient'}</p>
                              <p className="text-gray-400 text-sm">{patient?.patient_id || record.patient_id}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                              {new Date(record.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="bg-white/5 rounded-lg p-4">
                            <p className="text-teal-400 text-xs font-semibold uppercase tracking-wider mb-2">Diagnosis</p>
                            <p className="text-white text-sm">{record.diagnosis || 'N/A'}</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-4">
                            <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">Treatment</p>
                            <p className="text-white text-sm">{record.treatment || 'N/A'}</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-4">
                            <p className="text-purple-400 text-xs font-semibold uppercase tracking-wider mb-2">Prescription</p>
                            <p className="text-white text-sm">{record.prescription || 'None'}</p>
                          </div>
                        </div>

                        {record.notes && (
                          <div className="mt-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3">
                            <p className="text-yellow-400 text-xs font-semibold uppercase tracking-wider mb-1">Notes</p>
                            <p className="text-gray-300 text-sm">{record.notes}</p>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Reports & Documents</h2>
              </div>

              {/* Upload Area */}
              <div className="bg-slate-800 rounded-xl border-2 border-dashed border-white/20 hover:border-teal-500/50 transition-all p-10 text-center group">
                <div className="w-16 h-16 rounded-2xl bg-teal-500/10 group-hover:bg-teal-500/20 transition flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-teal-400" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-1">Upload Medical Report</h3>
                <p className="text-gray-400 text-sm mb-4">Drag &amp; drop or click to upload PDF, images, or documents</p>
                <label
                  htmlFor="report-upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-white rounded-lg font-medium cursor-pointer transition"
                >
                  <Upload className="w-4 h-4" />
                  Choose File
                </label>
                <input id="report-upload" type="file" accept="image/*,.pdf,.doc,.docx" className="hidden" />
              </div>

              {/* Empty State */}
              <div className="bg-slate-800 rounded-xl p-10 border border-white/10 text-center">
                <FileScan className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No reports uploaded yet</p>
                <p className="text-gray-500 text-sm mt-1">Uploaded lab reports, scans, and documents will appear here</p>
              </div>
            </motion.div>
          )}

          {/* QR Scanner Tab */}
          {activeTab === 'scanner' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">QR Scanner</h2>
                <p className="text-gray-400 text-sm">Scan a patient QR code or enter ID manually to view records</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Inline Scanner Card */}
                <div className="bg-slate-800 rounded-xl p-6 border border-white/10">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-teal-400" />
                    Scan or Lookup Patient
                  </h3>

                  <button
                    onClick={() => setShowQRScanner(true)}
                    className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-white rounded-xl font-medium transition mb-4"
                  >
                    <Camera className="w-6 h-6" />
                    Open Camera Scanner
                  </button>

                  <div className="relative py-3">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/20"></div></div>
                    <div className="relative flex justify-center"><span className="px-4 bg-slate-800 text-gray-400 text-xs uppercase tracking-wider">or enter manually</span></div>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      id="inline-qr-input"
                      placeholder="Patient ID or QR Code (e.g. PMQET789S)"
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                      onKeyDown={(e) => { if (e.key === 'Enter') handleQRScan(e.target.value.trim()); }}
                    />
                    <button
                      onClick={() => {
                        const el = document.getElementById('inline-qr-input');
                        if (el?.value.trim()) handleQRScan(el.value.trim());
                      }}
                      className="px-5 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition flex items-center gap-2 text-sm font-medium"
                    >
                      <Search className="w-4 h-4" />
                      Search
                    </button>
                  </div>
                </div>

                {/* Quick Patient List */}
                <div className="bg-slate-800 rounded-xl p-6 border border-white/10">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    Recent Patients
                  </h3>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {patients.slice(0, 8).map(patient => (
                      <button
                        key={patient.id}
                        onClick={() => handleQRScan(patient.patient_id)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition text-left"
                      >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {patient.full_name?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">{patient.full_name}</p>
                          <p className="text-gray-400 text-xs">{patient.patient_id}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-500 ml-auto flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showQRScanner && (
          <QRScanner
            onScan={handleQRScan}
            onClose={() => setShowQRScanner(false)}
          />
        )}
        {showOCRScanner && (
          <OCRScanner
            onExtract={handleOCRExtract}
            onClose={() => setShowOCRScanner(false)}
          />
        )}
        {showPatientModal && selectedPatient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowPatientModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Patient Details</h3>
                <button
                  onClick={() => setShowPatientModal(false)}
                  className="text-gray-400 hover:text-white transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  {/* Basic Info */}
                  <div className="bg-white/5 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Basic Information</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Full Name</p>
                        <p className="text-white font-medium">{selectedPatient.full_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Patient ID</p>
                        <p className="text-white font-medium">{selectedPatient.patient_id}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Date of Birth</p>
                        <p className="text-white font-medium">{selectedPatient.date_of_birth}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Gender</p>
                        <p className="text-white font-medium capitalize">{selectedPatient.gender}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Phone</p>
                        <p className="text-white font-medium">{selectedPatient.phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Emergency Contact</p>
                        <p className="text-white font-medium">{selectedPatient.emergency_contact || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Vitals */}
                  <div className="bg-white/5 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Vitals & Assessment</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Height</p>
                        <p className="text-white font-medium">{selectedPatient.height ? `${selectedPatient.height} cm` : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Weight</p>
                        <p className="text-white font-medium">{selectedPatient.weight ? `${selectedPatient.weight} kg` : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">BMI</p>
                        <p className="text-white font-medium">{selectedPatient.bmi || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Blood Pressure</p>
                        <p className="text-white font-medium">
                          {selectedPatient.blood_pressure_systolic && selectedPatient.blood_pressure_diastolic
                            ? `${selectedPatient.blood_pressure_systolic}/${selectedPatient.blood_pressure_diastolic} mmHg`
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Pulse Rate</p>
                        <p className="text-white font-medium">{selectedPatient.pulse_rate ? `${selectedPatient.pulse_rate} bpm` : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Temperature</p>
                        <p className="text-white font-medium">{selectedPatient.temperature ? `${selectedPatient.temperature}°C` : 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Medical History */}
                  <div className="bg-white/5 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Medical History</h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-gray-400 text-sm">Reason for Visit</p>
                        <p className="text-white">{selectedPatient.reason_for_visit || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Current Medications</p>
                        <p className="text-white">{selectedPatient.current_medications || 'None'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Allergies</p>
                        <p className="text-white">{selectedPatient.allergies || 'None'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Pain Scale</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                              style={{ width: `${(selectedPatient.pain_scale || 1) * 10}%` }}
                            />
                          </div>
                          <span className="text-white font-medium">{selectedPatient.pain_scale || 1}/10</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                <div>
                  <QRGenerator patient={selectedPatient} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Toast Notification */}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-lg backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-red-500/20 border-red-500/30 text-red-200'
                : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-200'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
            ) : (
              <UserCheck className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            )}
            <span className="font-medium text-sm text-white">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}