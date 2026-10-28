import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ROLES } from "./constants";
import PageLayout from "./components/shared/PageLayout";

import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import OnboardingStep1 from "./pages/onboarding/OnboardingStep1";
import OnboardingStep2 from "./pages/onboarding/OnboardingStep2";
import OnboardingStep3 from "./pages/onboarding/OnboardingStep3";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientReports from "./pages/patient/PatientReports";
import SummaryPage from "./pages/shared/SummaryPage";
import PatientProfile from "./pages/patient/PatientProfile";
import PatientDoctors from "./pages/patient/PatientDoctors";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import DoctorProfile from "./pages/doctor/DoctorProfile";
import DoctorPatientDetail from "./pages/doctor/DoctorPatientDetail";
import OverallSummaryPage from "./pages/shared/OverallSummaryPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// ─── Route Guards ────────────────────────────────────────────────────────────

const PatientRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, profile, loading } = useAuth();

  // Still checking auth status — wait silently
  if (loading) return null;

  // Not logged in
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;

  // Profile hasn't loaded yet — wait rather than redirect
  if (!profile) return null;

  // Wrong role — redirect to their actual dashboard
  if (profile.role !== ROLES.PATIENT) return <Navigate to="/doctor/dashboard" replace />;

  return <PageLayout role={ROLES.PATIENT}>{children}</PageLayout>;
};

const DoctorRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, profile, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;

  if (!profile) return null;

  if (profile.role !== ROLES.DOCTOR) return <Navigate to="/patient/dashboard" replace />;

  return <PageLayout role={ROLES.DOCTOR}>{children}</PageLayout>;
};

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/auth/login" replace />} />

            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/signup" element={<SignupPage />} />

            <Route path="/onboarding" element={<OnboardingStep1 />} />
            <Route path="/onboarding/step-1" element={<OnboardingStep1 />} />
            <Route path="/onboarding/step-2" element={<OnboardingStep2 />} />
            <Route path="/onboarding/step-3" element={<OnboardingStep3 />} />

            {/* Patient Routes */}
            <Route path="/patient/dashboard" element={<PatientRoute><PatientDashboard /></PatientRoute>} />
            <Route path="/patient/reports" element={<PatientRoute><PatientReports /></PatientRoute>} />
            <Route path="/patient/doctors" element={<PatientRoute><PatientDoctors /></PatientRoute>} />
            <Route path="/patient/overall-summary" element={<PatientRoute><OverallSummaryPage /></PatientRoute>} />
            <Route path="/patient/summary/:id" element={<PatientRoute><SummaryPage /></PatientRoute>} />
            <Route path="/patient/profile" element={<PatientRoute><PatientProfile /></PatientRoute>} />
            <Route path="/patient/*" element={<Navigate to="/patient/dashboard" replace />} />

            {/* Doctor Routes */}
            <Route path="/doctor/dashboard" element={<DoctorRoute><DoctorDashboard /></DoctorRoute>} />
            <Route path="/doctor/patients" element={<DoctorRoute><DoctorPatients /></DoctorRoute>} />
            <Route path="/doctor/patient/:patientId" element={<DoctorRoute><DoctorPatientDetail /></DoctorRoute>} />
            <Route path="/doctor/overall-summary/:patientId" element={<DoctorRoute><OverallSummaryPage /></DoctorRoute>} />
            <Route path="/doctor/summary/:id" element={<DoctorRoute><SummaryPage /></DoctorRoute>} />
            <Route path="/doctor/profile" element={<DoctorRoute><DoctorProfile /></DoctorRoute>} />
            <Route path="/doctor/*" element={<Navigate to="/doctor/dashboard" replace />} />
          </Routes>
        </Router>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
