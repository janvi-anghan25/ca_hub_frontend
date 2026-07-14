import {
  LayoutDashboard, Users, FileText, Receipt, Settings, Shield,
} from 'lucide-react';

export const OFFICE_NAV_GROUPS = [
  {
    id: 'work',
    label: 'Work',
    icon: LayoutDashboard,
    links: [
      { to: '/', label: 'Dashboard', exact: true },
      { to: '/clients', label: 'Clients' },
      { to: '/tasks', label: 'Tasks' },
      { to: '/documents', label: 'Documents' },
    ],
  },
  {
    id: 'compliance',
    label: 'Compliance',
    icon: FileText,
    links: [
      { to: '/gst', label: 'GST Returns' },
      { to: '/itr', label: 'ITR Returns' },
      { to: '/calendar', label: 'Calendar' },
    ],
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: Receipt,
    links: [
      { to: '/invoices', label: 'Invoices' },
      { to: '/payments', label: 'Payments' },
      { to: '/reports', label: 'Reports' },
    ],
  },
  {
    id: 'team',
    label: 'Team',
    icon: Users,
    links: [
      { to: '/employees', label: 'Employees', adminOnly: true },
      { to: '/notifications', label: 'Notifications' },
    ],
  },
  {
    id: 'system',
    label: 'System',
    icon: Settings,
    links: [
      { to: '/settings', label: 'Settings' },
    ],
  },
];

export const SUPER_ADMIN_NAV_GROUPS = [
  {
    id: 'platform',
    label: 'Platform',
    icon: Shield,
    links: [
      { to: '/super-admin', label: 'Dashboard', exact: true },
      { to: '/super-admin/offices', label: 'CA Offices' },
      { to: '/super-admin/admins', label: 'Admins' },
    ],
  },
];

/**
 * @param {typeof OFFICE_NAV_GROUPS} groups
 * @param {string} role
 */
export function filterNavGroups(groups, role) {
  const isAdmin = role === 'admin';

  return groups
    .map((group) => ({
      ...group,
      links: group.links.filter((link) => {
        if (link.adminOnly && !isAdmin) return false;
        return true;
      }),
    }))
    .filter((group) => group.links.length > 0);
}

export const PAGE_TITLES = {
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
  '/super-admin': 'Dashboard',
  '/super-admin/offices': 'CA Offices',
  '/super-admin/admins': 'Admins',
};
