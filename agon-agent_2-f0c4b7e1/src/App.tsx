import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { handleGoogleRedirect } from './lib/googleAuth';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientRegistration from './pages/PatientRegistration';
import DoctorDashboard from './pages/DoctorDashboard';

// Handle Google OAuth redirect
handleGoogleRedirect();

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register-patient" element={<PatientRegistration />} />
          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/admin" element={<DoctorDashboard />} />
          <Route path="/patient" element={<DoctorDashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;