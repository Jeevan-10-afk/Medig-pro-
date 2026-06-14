import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, Activity, Users, QrCode, FileText, Smartphone, 
  Brain, Video, Watch, Globe, ChevronRight, CheckCircle,
  Lock, Database, Cloud, BarChart3, UserCheck, Hospital,
  Stethoscope, ClipboardList, Bell, Search, TrendingUp
} from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                Medig Pro+
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-300 hover:text-white transition">Features</a>
              <a href="#technology" className="text-gray-300 hover:text-white transition">Technology</a>
              <a href="#benefits" className="text-gray-300 hover:text-white transition">Benefits</a>
              <a href="#contact" className="text-gray-300 hover:text-white transition">Contact</a>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                to="/login"
                className="text-gray-300 hover:text-white transition px-4 py-2"
              >
                Sign In
              </Link>
              <Link 
                to="/register"
                className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-lg shadow-teal-500/25"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto relative">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Shield className="w-4 h-4 text-teal-400" />
              <span className="text-sm text-gray-300">Enterprise Healthcare Platform</span>
            </motion.div>
            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Revolutionizing
              <span className="bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"> Healthcare </span>
              Management
            </motion.h1>
            <motion.p variants={fadeIn} className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              A comprehensive healthcare management platform that collects, stores, and manages patient information digitally. 
              Empowering doctors with instant access to patient records for better diagnosis and care.
            </motion.p>
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register"
                className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-xl shadow-teal-500/25 flex items-center justify-center gap-2"
              >
                Start Here
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link 
                to="/login"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all border border-white/20"
              >
                Doctor Portal
              </Link>
            </motion.div>
            <motion.div variants={fadeIn} className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-teal-400" />
                HIPAA Compliant
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-teal-400" />
                256-bit Encryption
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-teal-400" />
                99.9% Uptime
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10K+', label: 'Patients Managed' },
              { value: '500+', label: 'Healthcare Providers' },
              { value: '99.9%', label: 'System Uptime' },
              { value: '24/7', label: 'Support Available' }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-gray-400 mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">About Medig Pro+</h2>
            <p className="text-gray-400 max-w-3xl mx-auto text-lg">
              Medig Pro+ is a cutting-edge healthcare management platform designed to streamline patient data management, 
              enhance doctor efficiency, and improve overall healthcare delivery through innovative technology.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Database className="w-8 h-8" />,
                title: 'Digital Records',
                description: 'Securely store and manage patient information digitally, eliminating paperwork and reducing errors.'
              },
              {
                icon: <Activity className="w-8 h-8" />,
                title: 'Real-time Access',
                description: 'Doctors can instantly access patient records, medical history, and test results from anywhere.'
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: 'Secure Platform',
                description: 'Enterprise-grade security with encryption, role-based access, and compliance with healthcare standards.'
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-teal-500/50 transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500/20 to-blue-500/20 flex items-center justify-center text-teal-400 mb-6">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gradient-to-b from-transparent via-blue-900/20 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Key Features</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Powerful tools designed to transform healthcare management
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <QrCode />, title: 'QR Code System', desc: 'Generate unique patient QR codes for instant record retrieval' },
              { icon: <FileText />, title: 'OCR Document Scanner', desc: 'Extract patient data from prescriptions and reports automatically' },
              { icon: <Users />, title: 'Patient Management', desc: 'Comprehensive patient registration and record management' },
              { icon: <Stethoscope />, title: 'Doctor Dashboard', desc: 'Intuitive dashboard for doctors to manage patients and records' },
              { icon: <ClipboardList />, title: 'Medical History', desc: 'Complete medical history tracking and analysis' },
              { icon: <Bell />, title: 'Smart Notifications', desc: 'Appointment reminders and health alerts' },
              { icon: <Search />, title: 'Advanced Search', desc: 'Find patients by ID, name, or QR code instantly' },
              { icon: <BarChart3 />, title: 'Analytics Dashboard', desc: 'Real-time statistics and health trend analysis' },
              { icon: <Lock />, title: 'Role-Based Access', desc: 'Secure access control for different user types' }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-teal-500/50 hover:bg-white/10 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500/20 to-blue-500/20 flex items-center justify-center text-teal-400 mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section id="technology" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Technology Stack</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Built with modern, enterprise-grade technologies
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Frontend', items: ['React.js', 'Next.js', 'Tailwind CSS', 'Framer Motion'] },
              { title: 'Backend', items: ['Node.js', 'Express.js', 'REST APIs', 'WebSockets'] },
              { title: 'Database', items: ['PostgreSQL', 'Supabase', 'Redis Cache', 'Cloud Storage'] },
              { title: 'Security', items: ['JWT Auth', 'RBAC', 'AES-256 Encryption', 'HTTPS/TLS'] }
            ].map((tech, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
              >
                <h3 className="font-semibold text-teal-400 mb-4">{tech.title}</h3>
                <ul className="space-y-2">
                  {tech.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-gray-300 text-sm">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Users */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-teal-900/10 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Who We Serve</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Trusted by healthcare professionals worldwide
            </p>
          </motion.div>
          <div className="grid md:grid-cols-5 gap-6">
            {[
              { icon: <Users />, title: 'Patients', desc: 'Easy access to health records' },
              { icon: <Stethoscope />, title: 'Doctors', desc: 'Efficient patient management' },
              { icon: <Hospital />, title: 'Hospitals', desc: 'Streamlined operations' },
              { icon: <UserCheck />, title: 'Clinics', desc: 'Modern practice management' },
              { icon: <TrendingUp />, title: 'Administrators', desc: 'Data-driven decisions' }
            ].map((user, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-teal-500/50 transition-all"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500/20 to-blue-500/20 flex items-center justify-center text-teal-400 mx-auto mb-4">
                  {user.icon}
                </div>
                <h3 className="font-semibold mb-2">{user.title}</h3>
                <p className="text-sm text-gray-400">{user.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Benefits</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Why healthcare providers choose Medig Pro+
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: 'Reduced Paperwork', desc: 'Eliminate manual paperwork and reduce administrative burden by up to 70%', stat: '70%', statLabel: 'Less Paperwork' },
              { title: 'Faster Diagnoses', desc: 'Instant access to patient history enables quicker and more accurate diagnoses', stat: '3x', statLabel: 'Faster Access' },
              { title: 'Improved Patient Care', desc: 'Comprehensive patient data leads to better treatment decisions', stat: '95%', statLabel: 'Patient Satisfaction' },
              { title: 'Enhanced Security', desc: 'Enterprise-grade security ensures patient data is always protected', stat: '256-bit', statLabel: 'Encryption' }
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-6 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
              >
                <div className="flex-shrink-0">
                  <div className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                    {benefit.stat}
                  </div>
                  <div className="text-sm text-gray-400">{benefit.statLabel}</div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-400">{benefit.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Future Enhancements */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-blue-900/20 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Future Enhancements</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our roadmap for continuous innovation
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Brain />, title: 'AI Health Insights', desc: 'Predictive analytics and personalized health recommendations' },
              { icon: <Video />, title: 'Telemedicine', desc: 'Video consultations and remote patient monitoring' },
              { icon: <Watch />, title: 'Wearable Integration', desc: 'Sync with fitness trackers and health devices' },
              { icon: <Globe />, title: 'Multi-Language', desc: 'Support for multiple languages and regions' },
              { icon: <Smartphone />, title: 'Mobile Apps', desc: 'Native iOS and Android applications' },
              { icon: <Cloud />, title: 'Cloud Sync', desc: 'Seamless data synchronization across devices' },
              { icon: <Activity />, title: 'Health Trends', desc: 'Advanced analytics and population health insights' },
              { icon: <Shield />, title: 'Enhanced Security', desc: 'Biometric authentication and advanced threat protection' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-teal-500/50 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-purple-400 mb-4">
                  {item.icon}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-teal-500/20 to-blue-500/20 backdrop-blur-xl rounded-3xl p-12 border border-white/10 text-center"
          >
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Practice?</h2>
            <p className="text-gray-300 mb-8 max-w-xl mx-auto">
              Join thousands of healthcare providers who are already using Medig Pro+ to deliver better patient care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register"
                className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-xl"
              >
                Start Here
              </Link>
              <Link 
                to="/login"
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold transition-all border border-white/20"
              >
                Schedule Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">Medig Pro+</span>
              </div>
              <p className="text-gray-400 text-sm">
                Transforming healthcare management with innovative technology solutions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#technology" className="hover:text-white transition">Technology</a></li>
                <li><a href="#benefits" className="hover:text-white transition">Benefits</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">HIPAA Compliance</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2024 Medig Pro+. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-400" />
                HIPAA Compliant
              </span>
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-teal-400" />
                256-bit Encryption
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}