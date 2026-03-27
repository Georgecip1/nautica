import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Public Pages
import HomePage from "./pages/public/HomePage";
import AboutPage from "./pages/public/AboutPage";
import SubscriptionsPage from "./pages/public/SubscriptionsPage";
import LocationsPage from "./pages/public/LocationsPage";
import BlogPage from "./pages/public/BlogPage";
import BlogPostPage from "./pages/public/BlogPostPage";
import ContactPage from "./pages/public/ContactPage";
import PrivacyPage from "./pages/public/PrivacyPage";
import TermsPage from "./pages/public/TermsPage";
import CookiesPage from "./pages/public/CookiesPage";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import SetupPasswordPage from "./pages/auth/SetupPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

// Admin Pages
import AdminLayout from "./layouts/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import UsersPage from "./pages/admin/UsersPage";
import UserDetailPage from "./pages/admin/UserDetailPage";
import AttendancePage from "./pages/admin/AttendancePage";
import QRScanPage from "./pages/admin/QRScanPage";
import AlertsPage from "./pages/admin/AlertsPage";
import BlogAdminPage from "./pages/admin/BlogAdminPage";
import ReportsPage from "./pages/admin/ReportsPage";
import ContactMessagesPage from "./pages/admin/ContactMessagesPage";

// User Portal Pages
import UserLayout from "./layouts/UserLayout";
import UserProfilePage from "./pages/user/UserProfilePage";
import UserSubscriptionsPage from "./pages/user/UserSubscriptionsPage";
import UserQRPage from "./pages/user/UserQRPage";
import UserAlertsPage from "./pages/user/UserAlertsPage";

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="animate-pulse text-[#CCFF00] font-heading text-xl">SE ÎNCARCĂ...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    if (user.role === "USER") {
      return <Navigate to="/portal" replace />;
    }
    return <Navigate to="/admin" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/despre" element={<AboutPage />} />
          <Route path="/abonamente" element={<SubscriptionsPage />} />
          <Route path="/locatii" element={<LocationsPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/confidentialitate" element={<PrivacyPage />} />
          <Route path="/termeni" element={<TermsPage />} />
          <Route path="/cookies" element={<CookiesPage />} />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/seteaza-parola" element={<SetupPasswordPage />} />
          <Route path="/reseteaza-parola" element={<ResetPasswordPage />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["OWNER", "COACH"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="utilizatori" element={<UsersPage />} />
            <Route path="utilizatori/:userId" element={<UserDetailPage />} />
            <Route path="prezenta" element={<AttendancePage />} />
            <Route path="qr-scan" element={<QRScanPage />} />
            <Route path="alerte" element={<AlertsPage />} />
            <Route path="blog" element={<BlogAdminPage />} />
            <Route path="rapoarte" element={<ReportsPage />} />
            <Route path="mesaje" element={<ContactMessagesPage />} />
          </Route>

          {/* User Portal Routes */}
          <Route
            path="/portal"
            element={
              <ProtectedRoute roles={["USER"]}>
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<UserProfilePage />} />
            <Route path="abonamente" element={<UserSubscriptionsPage />} />
            <Route path="qr" element={<UserQRPage />} />
            <Route path="alerte" element={<UserAlertsPage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#121212',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;

//uvicorn server:app --reload