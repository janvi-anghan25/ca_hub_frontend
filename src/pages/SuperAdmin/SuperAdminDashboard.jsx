import { useEffect, useState } from 'react';
import { Building2, Users, UserCheck, AlertCircle } from 'lucide-react';
import { superAdminApi } from '../../api/superAdminApi';

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="bg-white rounded-xl border border-forest-100 shadow-card p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-parchment ${color}`}>
      <Icon size={22} />
    </div>
    <div>
      <p className="text-sm text-forest-500">{label}</p>
      <p className="text-2xl font-bold text-forest">{value ?? '—'}</p>
      {sub && <p className="text-xs text-forest-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    superAdminApi.getStats()
      .then(({ data }) => setStats(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-forest border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="section-title mb-1">Platform overview</h2>
        <p className="text-sm text-forest-500">All CA offices on the platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Building2}
          label="Total CA Offices"
          value={stats?.offices?.total}
          sub={`${stats?.offices?.active ?? 0} active`}
          color="bg-forest"
        />
        <StatCard
          icon={AlertCircle}
          label="Inactive Offices"
          value={stats?.offices?.inactive}
          sub="suspended"
          color="bg-amber-due"
        />
        <StatCard
          icon={UserCheck}
          label="Active Admins"
          value={stats?.admins?.active}
          sub={`${stats?.admins?.total ?? 0} total`}
          color="bg-forest-500"
        />
        <StatCard
          icon={Users}
          label="Total Clients"
          value={stats?.clients?.total}
          sub={`${stats?.employees?.total ?? 0} employees`}
          color="bg-brass text-forest"
        />
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
