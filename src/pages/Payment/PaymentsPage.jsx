import { useState, useEffect, useCallback } from 'react';
import { CreditCard, TrendingUp } from 'lucide-react';
import api from '../../api/axiosInstance';
import { SectionLoader } from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { format } from 'date-fns';

const PAYMENT_MODES = ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'NEFT', 'RTGS', 'Other'];
const MODE_COLORS = {
  Cash: 'badge-green',
  UPI: 'badge-blue',
  'Bank Transfer': 'badge-purple',
  Cheque: 'badge-yellow',
  NEFT: 'badge-blue',
  RTGS: 'badge-blue',
  Other: 'badge-gray',
};

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modeFilter, setModeFilter] = useState('');
  const [stats, setStats] = useState(null);
  const LIMIT = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/invoices/stats/revenue');
      setStats(data.data?.[0]);
      const payments = await api.get('/invoices', { params: { paymentStatus: 'Paid', page, limit: LIMIT } });
      setPayments(payments.data.data);
      setTotal(payments.data.meta.total);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Payments</h1>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[
            { label: 'Total Invoiced', value: `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`, color: 'text-blue-600' },
            { label: 'Collected', value: `₹${(stats.totalPaid || 0).toLocaleString('en-IN')}`, color: 'text-emerald-600' },
            { label: 'Pending', value: `₹${(stats.totalPending || 0).toLocaleString('en-IN')}`, color: 'text-red-600' },
          ].map((s) => (
            <div key={s.label} className="card">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card p-0">
        {loading ? <SectionLoader /> : payments.length === 0 ? (
          <EmptyState icon={CreditCard} title="No payments recorded" />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Invoice #</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((inv) => (
                  <tr key={inv._id}>
                    <td>
                      <p className="font-medium text-sm text-gray-900">{inv.client?.clientName}</p>
                    </td>
                    <td className="font-mono text-sm text-blue-700">{inv.invoiceNumber}</td>
                    <td className="text-sm font-semibold text-gray-900">₹{inv.totalAmount?.toLocaleString('en-IN')}</td>
                    <td className="text-sm text-gray-600">{format(new Date(inv.invoiceDate), 'dd MMM yyyy')}</td>
                    <td><span className="badge badge-green">Paid</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && payments.length > 0 && (
          <div className="px-5 pb-4 pt-2">
            <Pagination page={page} totalPages={Math.ceil(total / LIMIT)} onPageChange={setPage} total={total} limit={LIMIT} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;
