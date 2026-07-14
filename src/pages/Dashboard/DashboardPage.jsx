import { useState, useEffect } from 'react';
import {
  Users, FileText, BarChart3, Receipt, CreditCard,
  CheckSquare, TrendingUp, ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboardApi';
import { invoiceApi } from '../../api/invoiceApi';
import { SectionLoader } from '../../components/common/LoadingSpinner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const StatCard = ({ icon: Icon, label, value, sub, color, to }) => (
  <Link to={to || '#'} className="stat-card group">
    <div className={`stat-icon ${color}`}>
      <Icon size={22} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-2xl font-bold text-forest">{value}</p>
      <p className="text-sm font-medium text-forest-500">{label}</p>
      {sub && <p className="text-xs text-forest-400 mt-0.5">{sub}</p>}
    </div>
    <ArrowRight size={16} className="text-forest-300 group-hover:text-forest-500 transition-colors" />
  </Link>
);

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [overdueInvoices, setOverdueInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [dashRes, chartRes, overdueRes] = await Promise.all([
          dashboardApi.getHomeDashboard(),
          dashboardApi.getChartData({ year: new Date().getFullYear() }),
          invoiceApi.getOverdue(),
        ]);
        setData(dashRes.data.data);
        setChartData(chartRes.data.data);
        setOverdueInvoices(overdueRes.data.data?.slice(0, 5) || []);
      } catch {
        // errors handled by interceptor
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <SectionLoader />;
  if (!data) return null;

  const revenueChartData = MONTHS.map((month, idx) => {
    const entry = chartData?.revenueData?.find((r) => r._id === idx + 1);
    return { month, collected: entry?.amount || 0 };
  });

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Users} label="Total Clients" value={data.clients.total}
          sub={`${data.clients.active} active`} color="bg-forest" to="/clients"
        />
        <StatCard
          icon={FileText} label="Pending GST" value={data.gst.pending}
          sub={`${data.gst.dueToday} due today`} color="bg-amber-due" to="/gst"
        />
        <StatCard
          icon={BarChart3} label="Pending ITR" value={data.itr.pending}
          sub={`${data.itr.dueToday} due today`} color="bg-amber-due" to="/itr"
        />
        <StatCard
          icon={CreditCard} label="Pending Payment"
          value={`₹${(data.payments.pendingAmount / 1000).toFixed(0)}K`}
          sub={`${data.payments.pendingCount} invoices`} color="bg-amber-due" to="/invoices"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={CheckSquare} label="Today's Tasks" value={data.tasks.todaysCount}
          color="bg-forest-500" to="/tasks"
        />
        <StatCard
          icon={Receipt} label="Monthly Invoiced"
          value={`₹${(data.revenue.monthlyInvoiced / 1000).toFixed(1)}K`}
          color="bg-brass text-forest" to="/invoices"
        />
        <StatCard
          icon={TrendingUp} label="Monthly Collected"
          value={`₹${(data.revenue.monthlyCollected / 1000).toFixed(1)}K`}
          color="bg-forest-500" to="/payments"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Collection Chart */}
        <div className="card">
          <h3 className="section-title">Monthly Collection ({new Date().getFullYear()})</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EFEB" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#5A7A72' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#5A7A72' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Collected']}
                contentStyle={{ borderRadius: '10px', border: '1px solid #D5E3DE', fontSize: 12 }}
              />
              <Bar dataKey="collected" fill="#0F2F2A" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Overdue Invoices */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title mb-0">Overdue Invoices</h3>
            <Link to="/invoices?status=Overdue" className="text-xs text-forest-500 hover:text-forest hover:underline font-medium">View all</Link>
          </div>
          {overdueInvoices.length === 0 ? (
            <div className="py-10 text-center text-forest-400 text-sm">No overdue invoices</div>
          ) : (
            <div className="space-y-3">
              {overdueInvoices.map((inv) => (
                <div key={inv._id} className="flex items-center justify-between p-3 bg-amber-due/5 border border-amber-due/20 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-ink">{inv.client?.clientName}</p>
                    <p className="text-xs text-forest-400 font-mono">#{inv.invoiceNumber} · Due {format(new Date(inv.dueDate), 'dd MMM')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-due">₹{inv.balanceDue?.toLocaleString('en-IN')}</p>
                    <span className="badge badge-red text-xs">Overdue</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
