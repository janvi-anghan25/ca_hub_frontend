import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { gstApi } from '../../api/gstApi';
import { SectionLoader } from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import GSTFormModal from './GSTFormModal';
import { format, isPast, isToday } from 'date-fns';
import toast from 'react-hot-toast';

const RETURN_TYPES = ['GSTR-1', 'GSTR-3B', 'GSTR-9', 'GSTR-9C', 'CMP-08', 'Other'];
const STATUSES = ['Pending', 'Data Received', 'In Progress', 'Filed', 'Late Filed'];

const GSTPage = () => {
  const [returns, setReturns] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editReturn, setEditReturn] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [summary, setSummary] = useState({ pending: 0, overdue: 0 });
  const LIMIT = 15;

  const loadReturns = useCallback(async () => {
    setLoading(true);
    try {
      const [res, pendingRes, overdueRes] = await Promise.all([
        gstApi.getReturns({ status: statusFilter || undefined, returnType: typeFilter || undefined, page, limit: LIMIT }),
        gstApi.getPending({ days: 30 }),
        gstApi.getOverdue(),
      ]);
      setReturns(res.data.data);
      setTotal(res.data.meta.total);
      setSummary({ pending: pendingRes.data.data?.length || 0, overdue: overdueRes.data.data?.length || 0 });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, page]);

  useEffect(() => { loadReturns(); }, [loadReturns]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await gstApi.deleteReturn(deleteId);
      toast.success('Return deleted');
      setDeleteId(null);
      loadReturns();
    } finally {
      setDeleting(false);
    }
  };

  const getDueDateClass = (dueDate, status) => {
    if (['Filed', 'Late Filed'].includes(status)) return 'text-gray-500';
    const d = new Date(dueDate);
    if (isPast(d)) return 'text-red-600 font-semibold';
    if (isToday(d)) return 'text-orange-600 font-semibold';
    return 'text-gray-700';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">GST Returns</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="badge badge-yellow">{summary.pending} due soon</span>
            <span className="badge badge-red">{summary.overdue} overdue</span>
          </div>
        </div>
        <button className="btn-primary" onClick={() => { setEditReturn(null); setShowForm(true); }}>
          <Plus size={16} /> Add Return
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="flex flex-wrap gap-3">
          <select className="input w-auto min-w-36" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="input w-auto min-w-36" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
            <option value="">All Types</option>
            {RETURN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="card p-0">
        {loading ? <SectionLoader /> : returns.length === 0 ? (
          <EmptyState title="No GST returns found" description="Add GST return records for your clients" />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Return Type</th>
                  <th>Period</th>
                  <th>Due Date</th>
                  <th>Filed Date</th>
                  <th>Status</th>
                  <th>Late Fee</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <p className="font-medium text-gray-900 text-sm">{r.client?.clientName}</p>
                      <p className="text-xs text-gray-400 font-mono">{r.client?.gstNumber}</p>
                    </td>
                    <td><span className="badge badge-blue">{r.returnType}</span></td>
                    <td className="text-sm text-gray-600">
                      {r.period?.month ? `${r.period.month}/${r.period.year}` : r.period?.year}
                    </td>
                    <td className={`text-sm ${getDueDateClass(r.dueDate, r.status)}`}>
                      {format(new Date(r.dueDate), 'dd MMM yyyy')}
                    </td>
                    <td className="text-sm text-gray-600">
                      {r.filedDate ? format(new Date(r.filedDate), 'dd MMM yyyy') : '—'}
                    </td>
                    <td><StatusBadge status={r.status} /></td>
                    <td className="text-sm">
                      {r.lateFee > 0 ? <span className="text-red-600 font-medium">₹{r.lateFee.toLocaleString('en-IN')}</span> : '—'}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditReturn(r); setShowForm(true); }}
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteId(r._id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && returns.length > 0 && (
          <div className="px-5 pb-4 pt-2">
            <Pagination page={page} totalPages={Math.ceil(total / LIMIT)} onPageChange={setPage} total={total} limit={LIMIT} />
          </div>
        )}
      </div>

      {showForm && (
        <GSTFormModal
          gstReturn={editReturn}
          onSuccess={() => { setShowForm(false); setEditReturn(null); loadReturns(); }}
          onClose={() => { setShowForm(false); setEditReturn(null); }}
        />
      )}
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} />
    </div>
  );
};

export default GSTPage;
