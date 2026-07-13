import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile } from './store/slices/authSlice';
import { PageLoader } from './components/common/LoadingSpinner';
import AppLayout from './components/layout/AppLayout';

const LoginPage = lazy(() => import('./pages/Auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/Auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/Auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/Auth/ResetPasswordPage'));
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage'));
const ClientsPage = lazy(() => import('./pages/Clients/ClientsPage'));
const GSTPage = lazy(() => import('./pages/GST/GSTPage'));
const ITRPage = lazy(() => import('./pages/ITR/ITRPage'));
const InvoicePage = lazy(() => import('./pages/Invoice/InvoicePage'));
const TasksPage = lazy(() => import('./pages/Tasks/TasksPage'));
const EmployeesPage = lazy(() => import('./pages/Employees/EmployeesPage'));
const NotificationsPage = lazy(() => import('./pages/Notifications/NotificationsPage'));
const ReportsPage = lazy(() => import('./pages/Reports/ReportsPage'));
const DocumentsPage = lazy(() => import('./pages/Documents/DocumentsPage'));
const PaymentsPage = lazy(() => import('./pages/Payment/PaymentsPage'));

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((s) => s.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((s) => s.auth);
  return !isAuthenticated ? children : <Navigate to="/" replace />;
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
        {/* Public routes */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="gst" element={<GSTPage />} />
          <Route path="itr" element={<ITRPage />} />
          <Route path="invoices" element={<InvoicePage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="calendar" element={<DashboardPage />} />
          <Route path="settings" element={<DashboardPage />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
