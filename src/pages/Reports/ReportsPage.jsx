import { useState, useEffect } from 'react';
import { BarChart3, Download, TrendingUp, Users, FileText } from 'lucide-react';
import { invoiceApi } from '../../api/invoiceApi';
import { clientApi } from '../../api/clientApi';
import { SectionLoader } from '../../components/common/LoadingSpinner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const ReportsPage = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [clientStats, setClientStats] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [revenueRes, clientStatsRes] = await Promise.all([
          invoiceApi.getMonthlyRevenue({ year }),
          clientApi.getStats(),
        ]);
        const revenue = MONTHS.map((month, idx) => {
          const entry = revenueRes.data.data?.find((r) => r._id === idx + 1);
          return { month, invoiced: entry?.revenue || 0, collected: entry?.paid || 0 };
        });
        setRevenueData(revenue);
        setClientStats(revenueRes.data.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [year]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
        <div className="flex items-center gap-3">
          <select
            className="input w-auto"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[2022, 2023, 2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading ? <SectionLoader /> : (
        <div className="space-y-6">
          {/* Revenue Report */}
          <div className="card">
            <h3 className="section-title flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600" /> Revenue Report {year}
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  formatter={(v, name) => [`₹${v.toLocaleString('en-IN')}`, name]}
                  contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="invoiced" name="Invoiced" fill="#bfdbfe" radius={[4, 4, 0, 0]} />
                <Bar dataKey="collected" name="Collected" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Invoiced', value: `₹${revenueData.reduce((s, d) => s + d.invoiced, 0).toLocaleString('en-IN')}`, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Total Collected', value: `₹${revenueData.reduce((s, d) => s + d.collected, 0).toLocaleString('en-IN')}`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Outstanding', value: `₹${(revenueData.reduce((s, d) => s + d.invoiced, 0) - revenueData.reduce((s, d) => s + d.collected, 0)).toLocaleString('en-IN')}`, color: 'text-red-600', bg: 'bg-red-50' },
              { label: 'Avg Monthly', value: `₹${(revenueData.reduce((s, d) => s + d.collected, 0) / 12).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map((s) => (
              <div key={s.label} className={`card ${s.bg} border-0`}>
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
