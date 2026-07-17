import { Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { logout } from '../../store/slices/authSlice';
import { OFFICE_NAV_GROUPS, PAGE_TITLES } from '../../config/navGroups';
import ErrorBoundary from '../common/ErrorBoundary';
import IconRailShell from './IconRailShell';
import Topbar from './Topbar';

const AppLayout = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const role = user?.role || 'employee';
  const title = PAGE_TITLES[location.pathname] || 'CA Hub';

  const handleLogout = async () => {
    await dispatch(logout());
    toast.success('Logged out successfully');
  };

  return (
    <IconRailShell
      groups={OFFICE_NAV_GROUPS}
      role={role}
      user={user}
      onLogout={handleLogout}
      brandSubtitle="CA Hub"
    >
      <Topbar title={title} />
      <main className="app-shell-main flex-1 overflow-y-auto p-3 sm:p-6 pb-24 lg:pb-6">
        <ErrorBoundary resetKey={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
    </IconRailShell>
  );
};

export default AppLayout;
