import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Lazy-loaded pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const CitizenLogin = lazy(() => import('./pages/Auth/CitizenLogin'));
const AgentLogin = lazy(() => import('./pages/Auth/AgentLogin'));
const AdminLogin = lazy(() => import('./pages/Auth/AdminLogin'));
const Register = lazy(() => import('./pages/Auth/Register'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));

// Citizen Pages
const CitizenDashboard = lazy(() => import('./pages/Citizen/Dashboard'));
const NewRequest = lazy(() => import('./pages/Citizen/NewRequest'));
const RequestTracking = lazy(() => import('./pages/Citizen/RequestTracking'));
const RequestDetail = lazy(() => import('./pages/Citizen/RequestDetail'));
const Payment = lazy(() => import('./pages/Citizen/Payment'));
const PaymentConfirm = lazy(() => import('./pages/Citizen/PaymentConfirm'));
const Profile = lazy(() => import('./pages/Citizen/Profile'));
const CitizenNotifications = lazy(() => import('./pages/Citizen/Notifications'));

// Agent Pages
const AgentDashboard = lazy(() => import('./pages/Agent/Dashboard'));
const RequestsList = lazy(() => import('./pages/Agent/RequestsList'));
const ProcessRequest = lazy(() => import('./pages/Agent/ProcessRequest'));
const GenerateDocument = lazy(() => import('./pages/Agent/GenerateDocument'));
const History = lazy(() => import('./pages/Agent/History'));
const AgentProfile = lazy(() => import('./pages/Agent/Profile'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard'));
const UserManagement = lazy(() => import('./pages/Admin/UserManagement'));
const DocumentTypes = lazy(() => import('./pages/Admin/DocumentTypes'));
const PaymentTracking = lazy(() => import('./pages/Admin/PaymentTracking'));
const Statistics = lazy(() => import('./pages/Admin/Statistics'));
const CreateAgent = lazy(() => import('./pages/Admin/CreateAgent'));
const AdminNotifications = lazy(() => import('./pages/Admin/Notifications'));
const AdminProfile = lazy(() => import('./pages/Admin/Profile'));

const App = () => {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
      <Suspense fallback={<LoadingSpinner size="large" />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth routes */}
          <Route path="/citizen/login" element={<CitizenLogin />} />
          <Route path="/agent/login" element={<AgentLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Protected routes */}
          <Route path="/citizen" element={
          <ProtectedRoute userType="citizen">
              <Layout userType="citizen" />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/citizen/dashboard" replace />} />
            <Route path="dashboard" element={<CitizenDashboard />} />
            <Route path="new-request" element={<NewRequest />} />
            <Route path="requests" element={<RequestTracking />} />
            <Route path="requests/:id" element={<RequestDetail />} />
            <Route path="payment/:id" element={<Payment />} />
          <Route path="payment/confirm/:id" element={<PaymentConfirm />} />
            <Route path="profile" element={<Profile />} />
            <Route path="notifications" element={<CitizenNotifications />} />
          </Route>
          
          <Route path="/agent" element={
          <ProtectedRoute userType="agent">
              <Layout userType="agent" />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/agent/dashboard" replace />} />
            <Route path="dashboard" element={<AgentDashboard />} />
            <Route path="requests" element={<RequestsList />} />
            <Route path="process/:id" element={<ProcessRequest />} />
            <Route path="generate/:id" element={<GenerateDocument />} />
            <Route path="history" element={<History />} />
            <Route path="profile" element={<AgentProfile />} />
          </Route>
          
          <Route path="/admin" element={
          <ProtectedRoute userType="admin">
              <Layout userType="admin" />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
          <Route path="users/create-agent" element={<CreateAgent />} />
            <Route path="document-types" element={<DocumentTypes />} />
            <Route path="payments" element={<PaymentTracking />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
  );
};

export default App;