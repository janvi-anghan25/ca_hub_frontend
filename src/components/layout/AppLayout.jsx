import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/clients': 'Clients',
  '/gst': 'GST Returns',
  '/itr': 'ITR Returns',
  '/invoices': 'Invoices',
  '/payments': 'Payments',
  '/documents': 'Documents',
  '/tasks': 'Tasks',
  '/employees': 'Employees',
  '/calendar': 'Calendar',
  '/notifications': 'Notifications',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const title = PAGE_TITLES[location.pathname] || 'CA Management';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
