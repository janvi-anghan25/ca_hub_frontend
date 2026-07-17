import { useState, useEffect, useCallback } from 'react';
import { Plus, Upload, Edit2, Trash2 } from 'lucide-react';
import { itrApi } from '../../api/itrApi';
import { SectionLoader } from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ImportModal from '../../components/common/ImportModal';
import ITRFormModal from './ITRFormModal';
import { format, isPast } from 'date-fns';
import toast from 'react-hot-toast';

const STATUSES = ['Pending', 'Data Received', 'In Progress', 'Filed', 'Late Filed', 'Revised'];

const ITR_IMPORT_COLUMNS = [
  { key: 'clientName', example: 'Ravi Kumar' },
  { key: 'mobile', example: '9876543210' },
  { key: 'panNumber', example: 'ABCDE1234F' },
  { key: 'businessType', example: 'Proprietorship' },
  { key: 'formType', required: true, example: 'ITR-3' },
  { key: 'assessmentYear', required: true, example: '2025-26' },
  { key: 'financialYear', required: true, example: '2024-25' },
  { key: 'dueDate', required: true, example: '2025-07-31' },
  { key: 'status', example: 'Pending' },
  { key: 'filedDate', example: '' },
  { key: 'refundStatus', example: 'Not Applicable' },
  { key: 'grossIncome', example: '800000' },
  { key: 'taxableIncome', example: '650000' },
  { key: 'taxPaid', example: '42000' },
  { key: 'taxLiability', example: '42000' },
  { key: 'refundAmount', example: '' },
  { key: 'lateFee', example: '' },
  { key: 'acknowledgementNumber', example: '' },
  { key: 'notes', example: '' },
];

const ITRPage = () => {
  const [returns, setReturns] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editReturn, setEditReturn] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [summary, setSummary] = useState({ pending: 0, overdue: 0, refundPending: 0 });
  const LIMIT = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [res, pendingRes, overdueRes, refundRes] = await Promise.all([
        itrApi.getReturns({ status: statusFilter || undefined, page, limit: LIMIT }),
        itrApi.getPending({ days: 30 }),
        itrApi.getOverdue(),
        itrApi.getRefundPending(),
      ]);
      setReturns(res.data.data);
      setTotal(res.data.meta.total);
      setSummary({
        pending: pendingRes.data.data?.length || 0,
        overdue: overdueRes.data.data?.length || 0,
        refundPending: refundRes.data.data?.length || 0,
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await itrApi.deleteReturn(deleteId);
      toast.success('ITR deleted');
      setDeleteId(null);
      load();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">ITR Returns</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="badge badge-yellow">{summary.pending} due soon</span>
            <span className="badge badge-red">{summary.overdue} overdue</span>
            <span className="badge badge-blue">{summary.refundPending} refund pending</span>
          </div>
        </div>
        <div className="page-header-actions">
          <button className="btn-secondary" onClick={() => setShowImport(true)}>
            <Upload size={16} /> Import
          </button>
          <button className="btn-primary" onClick={() => { setEditReturn(null); setShowForm(true); }}>
            <Plus size={16} /> Add ITR
          </button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="filter-bar">
          <select className="input sm:min-w-40" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="card p-0">
        {loading ? <SectionLoader /> : returns.length === 0 ? (
          <EmptyState title="No ITR records found" />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Form</th>
                  <th>Assessment Year</th>
                  <th>Due Date</th>
                  <th>Filed Date</th>
                  <th>Refund Status</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <p className="font-medium text-forest text-sm">{r.client?.clientName}</p>
                      <p className="text-xs text-forest-400 font-mono">{r.client?.panNumber}</p>
                    </td>
                    <td><span className="badge badge-purple">{r.formType}</span></td>
                    <td className="text-sm font-medium text-forest">AY {r.assessmentYear}</td>
                    <td className={`text-sm ${isPast(new Date(r.dueDate)) && !['Filed','Late Filed','Revised'].includes(r.status) ? 'text-red-600 font-semibold' : 'text-forest'}`}>
                      {format(new Date(r.dueDate), 'dd MMM yyyy')}
                    </td>
                    <td className="text-sm text-forest-400">
                      {r.filedDate ? format(new Date(r.filedDate), 'dd MMM yyyy') : '—'}
                    </td>
                    <td><StatusBadge status={r.refundStatus} /></td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditReturn(r); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600"><Edit2 size={14} /></button>
                        <button onClick={() => setDeleteId(r._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
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
        <ITRFormModal itrReturn={editReturn} onSuccess={() => { setShowForm(false); setEditReturn(null); load(); }} onClose={() => { setShowForm(false); setEditReturn(null); }} />
      )}
      {showImport && (
        <ImportModal
          title="Import ITR Records"
          columns={ITR_IMPORT_COLUMNS}
          templateName="itr-returns-template"
          onImport={itrApi.importReturns}
          onImported={load}
          onClose={() => setShowImport(false)}
        />
      )}
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} />
    </div>
  );
};

export default ITRPage;
