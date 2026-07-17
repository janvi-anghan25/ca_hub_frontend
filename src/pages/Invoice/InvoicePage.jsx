import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Eye, CreditCard } from 'lucide-react';
import { invoiceApi } from '../../api/invoiceApi';
import { SectionLoader } from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import InvoiceFormModal from './InvoiceFormModal';
import PaymentModal from './PaymentModal';
import { format } from 'date-fns';

const PAYMENT_STATUSES = ['Pending', 'Partially Paid', 'Paid', 'Overdue'];

const InvoicePage = () => {
  const [invoices, setInvoices] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editInvoice, setEditInvoice] = useState(null);
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [stats, setStats] = useState(null);
  const LIMIT = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [res, statsRes] = await Promise.all([
        invoiceApi.getInvoices({ paymentStatus: statusFilter || undefined, page, limit: LIMIT }),
        invoiceApi.getRevenueStats({}),
      ]);
      setInvoices(res.data.data);
      setTotal(res.data.meta.total);
      setStats(statsRes.data.data?.[0]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices</h1>
          {stats && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-forest-400">
              <span>Total: <strong className="font-mono text-forest">₹{stats.totalRevenue?.toLocaleString('en-IN')}</strong></span>
              <span>Collected: <strong className="font-mono text-emerald-600">₹{stats.totalPaid?.toLocaleString('en-IN')}</strong></span>
              <span>Pending: <strong className="font-mono text-red-600">₹{stats.totalPending?.toLocaleString('en-IN')}</strong></span>
            </div>
          )}
        </div>
        <button className="btn-primary" onClick={() => { setEditInvoice(null); setShowForm(true); }}>
          <Plus size={16} /> Create Invoice
        </button>
      </div>

      <div className="card mb-4">
        <div className="flex gap-2 flex-wrap">
          {['', ...PAYMENT_STATUSES].map((s) => (
            <button
              key={s || 'all'}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                statusFilter === s ? 'bg-forest text-parchment border-forest' : 'bg-white text-forest-400 border-forest-200 hover:border-forest-400'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-0">
        {loading ? <SectionLoader /> : invoices.length === 0 ? (
          <EmptyState title="No invoices found" />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv._id}>
                    <td className="font-mono text-sm font-semibold text-forest">{inv.invoiceNumber}</td>
                    <td>
                      <p className="font-medium text-sm text-forest">{inv.client?.clientName}</p>
                      <p className="text-xs text-forest-400">{inv.client?.firmName}</p>
                    </td>
                    <td className="text-sm text-forest-400">{format(new Date(inv.invoiceDate), 'dd MMM yyyy')}</td>
                    <td className="text-sm font-medium font-mono text-forest">₹{inv.totalAmount?.toLocaleString('en-IN')}</td>
                    <td className="text-sm text-emerald-600 font-medium font-mono">₹{inv.paidAmount?.toLocaleString('en-IN')}</td>
                    <td className={`text-sm font-semibold font-mono ${inv.balanceDue > 0 ? 'text-red-600' : 'text-forest-400'}`}>
                      ₹{inv.balanceDue?.toLocaleString('en-IN')}
                    </td>
                    <td><StatusBadge status={inv.paymentStatus} /></td>
                    <td>
                      <div className="flex items-center gap-1">
                        {inv.paymentStatus !== 'Paid' && (
                          <button onClick={() => setPaymentInvoice(inv)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600" title="Record Payment">
                            <CreditCard size={14} />
                          </button>
                        )}
                        <button onClick={() => { setEditInvoice(inv); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600">
                          <Edit2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && invoices.length > 0 && (
          <div className="px-5 pb-4 pt-2">
            <Pagination page={page} totalPages={Math.ceil(total / LIMIT)} onPageChange={setPage} total={total} limit={LIMIT} />
          </div>
        )}
      </div>

      {showForm && (
        <InvoiceFormModal invoice={editInvoice} onSuccess={() => { setShowForm(false); setEditInvoice(null); load(); }} onClose={() => { setShowForm(false); setEditInvoice(null); }} />
      )}
      {paymentInvoice && (
        <PaymentModal invoice={paymentInvoice} onSuccess={() => { setPaymentInvoice(null); load(); }} onClose={() => setPaymentInvoice(null)} />
      )}
    </div>
  );
};

export default InvoicePage;
