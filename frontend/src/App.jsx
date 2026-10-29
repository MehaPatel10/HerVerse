import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { trackVisit } from './utils/trackVisit.js';
import { useAuth } from './context/AuthContext.jsx';

import PublicLayout from './components/common/PublicLayout.jsx';
import Home from './components/home/Home.jsx';
import ArticlesPage from './components/pages/ArticlesPage.jsx';
import CalculatorsPage from './components/pages/CalculatorsPage.jsx';
import LunaPage from './components/pages/LunaPage.jsx';
import CalendarPage from './components/pages/CalendarPage.jsx';
import FaqPage from './components/pages/FaqPage.jsx';
import StoriesPage from './components/pages/StoriesPage.jsx';
import LegalPage from './components/pages/LegalPage.jsx';
import Auth from './components/auth/Auth.jsx';
import Subscription from './components/subscription/Subscription.jsx';
import CompleteProfile from './components/profile/CompleteProfile.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';

import Overview from './components/layout/Overview.jsx';
import PeriodTracker from './components/period/PeriodTracker.jsx';
import LunaChat from './components/luna/LunaChat.jsx';
import DietPlanner from './components/diet/DietPlanner.jsx';
import HealthTracker from './components/health/HealthTracker.jsx';
import DoctorsHospitals from './components/doctors/DoctorsHospitals.jsx';
import Emergency from './components/emergency/Emergency.jsx';
import Reports from './components/reports/Reports.jsx';
import Settings from './components/settings/Settings.jsx';
import MaintenanceGate from './components/common/MaintenanceGate.jsx';

import AdminLayout from './components/admin/AdminLayout.jsx';
import AdminAuth from './components/admin/AdminAuth.jsx';
import AdminDashboard from './components/admin/AdminDashboard.jsx';
import AdminGroqUsage from './components/admin/AdminGroqUsage.jsx';
import AdminPricing from './components/admin/AdminPricing.jsx';
import AdminUsers from './components/admin/AdminUsers.jsx';
import AdminTestimonials from './components/admin/AdminTestimonials.jsx';
import AdminPayments from './components/admin/AdminPayments.jsx';
import AdminMaintenance from './components/admin/AdminMaintenance.jsx';
import AdminBlogs from './components/admin/AdminBlogs.jsx';
import AdminFaqs from './components/admin/AdminFaqs.jsx';
import AdminReportActivity from './components/admin/AdminReportActivity.jsx';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/auth" replace />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/admin/login" replace />;
  return children;
}

export default function App() {
  // Count one visit per browser per day (admin pages are not counted).
  useEffect(() => {
    if (!window.location.pathname.startsWith('/admin')) trackVisit();
  }, []);

  return (
    <MaintenanceGate>
    <Routes>
      {/* Public site - accessible without login */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/calculators" element={<CalculatorsPage />} />
        <Route path="/luna" element={<LunaPage />} />
        <Route path="/awareness" element={<CalendarPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/stories" element={<StoriesPage />} />
        <Route path="/legal" element={<LegalPage />} />
        <Route path="/subscription" element={<Subscription />} />
      </Route>

      <Route path="/auth" element={<Auth />} />
      <Route path="/admin/login" element={<AdminAuth />} />
      <Route path="/complete-profile" element={<CompleteProfile />} />

      {/* Authenticated app */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Overview />} />
        <Route path="period" element={<PeriodTracker />} />
        <Route path="luna" element={<LunaChat />} />
        <Route path="diet" element={<DietPlanner />} />
        <Route path="health" element={<HealthTracker />} />
        <Route path="doctors" element={<DoctorsHospitals />} />
        <Route path="emergency" element={<Emergency />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Admin dashboard */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="groq" element={<AdminGroqUsage />} />
        <Route path="pricing" element={<AdminPricing />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="testimonials" element={<AdminTestimonials />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="reports" element={<AdminReportActivity />} />
        <Route path="blogs" element={<AdminBlogs />} />
        <Route path="faqs" element={<AdminFaqs />} />
        <Route path="maintenance" element={<AdminMaintenance />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </MaintenanceGate>
  );
}
