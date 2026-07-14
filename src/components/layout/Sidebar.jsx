import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, BarChart3, Receipt,
  CreditCard, FolderOpen, CheckSquare, UserCog, Bell,
  Calendar, Settings, LogOut, Building2, X,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

// Items visible to all authenticated roles (admin + employee)
const sharedNavItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/gst', icon: FileText, label: 'GST Returns' },
  { to: '/itr', icon: BarChart3, label: 'ITR Returns' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/documents', icon: FolderOpen, label: 'Documents' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
];

// Items visible only to admin
const adminNavItems = [
  { to: '/invoices', icon: Receipt, label: 'Invoices' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
  { to: '/employees', icon: UserCog, label: 'Employees' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
];

const ROLE_BADGE = {
  superadmin: { label: 'Super Admin', className: 'bg-purple-100 text-purple-700' },
  admin: { label: 'Admin', className: 'bg-blue-100 text-blue-700' },
  employee: { label: 'Employee', className: 'bg-green-100 text-green-700' },
};

const Sidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const role = user?.role || 'employee';
  const isAdmin = role === 'admin';
  const roleBadge = ROLE_BADGE[role] ?? ROLE_BADGE.employee;

  const handleLogout = async () => {
    await dispatch(logout());
    toast.success('Logged out successfully');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-30 h-full w-64 bg-white border-r border-gray-100 shadow-lg
          flex flex-col transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:static lg:translate-x-0 lg:shadow-none
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none">CA Office</p>
              <p className="text-xs text-gray-400 mt-0.5">Management</p>
            </div>
          </div>
          <button className="lg:hidden p-1 rounded-lg hover:bg-gray-100" onClick={onClose}>
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {sharedNavItems.map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
              onClick={onClose}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}

          {/* Admin-only section */}
          {isAdmin && (
            <>
              <p className="px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                Admin
              </p>
              {adminNavItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                  }
                  onClick={onClose}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* User section */}
        <div className="px-3 py-4 border-t border-gray-100 space-y-0.5">
          <NavLink to="/settings" className="sidebar-link" onClick={onClose}>
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>

        {/* User badge */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || 'User'}</p>
              <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${roleBadge.className}`}>
                {roleBadge.label}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
