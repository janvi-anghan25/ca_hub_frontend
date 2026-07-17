import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile } from './store/slices/authSlice';
import { PageLoader } from './components/common/LoadingSpinner';
import AppLayout from './components/layout/AppLayout';
import RoleGuard from './components/common/RoleGuard';

// Auth pages
const LoginPage = lazy(() => import('./pages/Auth/LoginPage'));
const ForgotPasswordPage = lazy(() => import('./pages/Auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/Auth/ResetPasswordPage'));
const ChangePasswordPage = lazy(() => import('./pages/Auth/ChangePasswordPage'));

// Shared pages (admin + employee)
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage'));
const ClientsPage = lazy(() => import('./pages/Clients/ClientsPage'));
const GSTPage = lazy(() => import('./pages/GST/GSTPage'));
const ITRPage = lazy(() => import('./pages/ITR/ITRPage'));
const TasksPage = lazy(() => import('./pages/Tasks/TasksPage'));
const NotificationsPage = lazy(() => import('./pages/Notifications/NotificationsPage'));
const DocumentsPage = lazy(() => import('./pages/Documents/DocumentsPage'));

// Admin-only pages
const InvoicePage = lazy(() => import('./pages/Invoice/InvoicePage'));
const EmployeesPage = lazy(() => import('./pages/Employees/EmployeesPage'));
const ReportsPage = lazy(() => import('./pages/Reports/ReportsPage'));
const PaymentsPage = lazy(() => import('./pages/Payment/PaymentsPage'));

// Full-feature pages (previously placeholders)
const CalendarPage = lazy(() => import('./pages/Calendar/CalendarPage'));
const SettingsPage = lazy(() => import('./pages/Settings/SettingsPage'));

// Super Admin pages
const SuperAdminLayout = lazy(() => import('./pages/SuperAdmin/SuperAdminLayout'));
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdmin/SuperAdminDashboard'));
const OfficesPage = lazy(() => import('./pages/SuperAdmin/OfficesPage'));
const AdminsPage = lazy(() => import('./pages/SuperAdmin/AdminsPage'));

const getHomePath = (user) => {
  if (user?.mustChangePassword) return '/change-password';
  if (user?.role === 'superadmin') return '/super-admin';
  return '/';
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.mustChangePassword) return <Navigate to="/change-password" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  if (isAuthenticated) return <Navigate to={getHomePath(user)} replace />;
  return children;
};

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getProfile());
    }
  }, [isAuthenticated, dispatch]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes — no self-registration */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<Navigate to="/login" replace />} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />

        {/* Forced password change after temp invite */}
        <Route
          path="/change-password"
          element={
            isAuthenticated ? <ChangePasswordPage /> : <Navigate to="/login" replace />
          }
        />

        {/* Super Admin portal */}
        <Route
          path="/super-admin"
          element={
            <ProtectedRoute>
              <RoleGuard roles={['superadmin']} redirect="/login">
                <SuperAdminLayout />
              </RoleGuard>
            </ProtectedRoute>
          }
        >
          <Route index element={<SuperAdminDashboard />} />
          <Route path="offices" element={<OfficesPage />} />
          <Route path="admins" element={<AdminsPage />} />
        </Route>

        {/* Main app — admin + employee */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RoleGuard roles={['admin', 'employee']} redirect="/super-admin">
                <AppLayout />
              </RoleGuard>
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="gst" element={<GSTPage />} />
          <Route path="itr" element={<ITRPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="invoices" element={<InvoicePage />} />
          <Route
            path="employees"
            element={
              <RoleGuard roles={['admin']}>
                <EmployeesPage />
              </RoleGuard>
            }
          />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
