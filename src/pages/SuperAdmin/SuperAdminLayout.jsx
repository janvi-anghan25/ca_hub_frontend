import { Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';
import IconRailShell from '../../components/layout/IconRailShell';
import { SUPER_ADMIN_NAV_GROUPS, PAGE_TITLES } from '../../config/navGroups';

const SuperAdminLayout = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((s) => s.auth);
  const title = PAGE_TITLES[location.pathname] || 'Super Admin';

  const handleLogout = async () => {
    await dispatch(logout());
    toast.success('Logged out successfully');
  };

  return (
    <IconRailShell
      groups={SUPER_ADMIN_NAV_GROUPS}
      role="superadmin"
      user={user}
      onLogout={handleLogout}
      brandSubtitle="Super Admin"
    >
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-forest-200 px-4 sm:px-6 py-3">
        <h1 className="page-title text-xl sm:text-2xl">{title}</h1>
        <div className="page-title-rule" />
      </header>
      <main className="app-shell-main flex-1 overflow-y-auto p-3 sm:p-6 pb-24 lg:pb-6">
        <Outlet />
      </main>
    </IconRailShell>
  );
};

export default SuperAdminLayout;
