import { useState, useEffect, useCallback } from 'react';
import { CreditCard } from 'lucide-react';
import { invoiceApi } from '../../api/invoiceApi';
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
      const [statsRes, payRes] = await Promise.all([
        invoiceApi.getRevenueStats({}),
        invoiceApi.getPayments({ paymentMode: modeFilter || undefined, page, limit: LIMIT }),
      ]);
      setStats(statsRes.data.data?.[0]);
      setPayments(payRes.data.data);
      setTotal(payRes.data.meta.total);
    } finally {
      setLoading(false);
    }
  }, [modeFilter, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Payments</h1>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[
            { label: 'Total Invoiced', value: `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`, color: 'text-forest-500' },
            { label: 'Collected', value: `₹${(stats.totalPaid || 0).toLocaleString('en-IN')}`, color: 'text-emerald-600' },
            { label: 'Pending', value: `₹${(stats.totalPending || 0).toLocaleString('en-IN')}`, color: 'text-red-600' },
          ].map((s) => (
            <div key={s.label} className="card">
              <p className="text-xs text-forest-400 mb-1">{s.label}</p>
              <p className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card mb-4">
        <div className="flex gap-3 flex-wrap">
          {['', ...PAYMENT_MODES].map((m) => (
            <button
              key={m || 'all'}
              onClick={() => { setModeFilter(m); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                modeFilter === m ? 'bg-forest text-parchment border-forest' : 'bg-white text-forest-400 border-forest-200 hover:border-forest-400'
              }`}
            >
              {m || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-0">
        {loading ? <SectionLoader /> : payments.length === 0 ? (
          <EmptyState icon={CreditCard} title="No payments recorded" description="Record a payment against an invoice to see receipts here" />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Client</th>
                  <th>Invoice #</th>
                  <th>Amount</th>
                  <th>Mode</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id}>
                    <td className="font-mono text-sm font-semibold text-forest">{p.receiptNumber || '—'}</td>
                    <td>
                      <p className="font-medium text-sm text-forest">{p.client?.clientName || '—'}</p>
                      {p.client?.firmName && <p className="text-xs text-forest-400">{p.client.firmName}</p>}
                    </td>
                    <td className="font-mono text-sm text-forest-400">{p.invoice?.invoiceNumber || '—'}</td>
                    <td className="text-sm font-semibold font-mono text-emerald-600">₹{p.amount?.toLocaleString('en-IN')}</td>
                    <td><span className={`badge ${MODE_COLORS[p.paymentMode] || 'badge-gray'}`}>{p.paymentMode}</span></td>
                    <td className="text-sm text-forest-400">{p.paymentDate ? format(new Date(p.paymentDate), 'dd MMM yyyy') : '—'}</td>
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
