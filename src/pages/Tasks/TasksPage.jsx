import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, MessageSquare, CheckCircle } from 'lucide-react';
import { taskApi } from '../../api/taskApi';
import { SectionLoader } from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import TaskFormModal from './TaskFormModal';
import { format, isPast } from 'date-fns';
import toast from 'react-hot-toast';

const STATUSES = ['Todo', 'In Progress', 'Review', 'Done', 'Cancelled'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const LIMIT = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await taskApi.getTasks({ status: statusFilter || undefined, priority: priorityFilter || undefined, page, limit: LIMIT });
      setTasks(res.data.data);
      setTotal(res.data.meta.total);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, page]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await taskApi.deleteTask(deleteId);
      toast.success('Task deleted');
      setDeleteId(null);
      load();
    } finally {
      setDeleting(false);
    }
  };

  const markDone = async (id) => {
    await taskApi.updateTask(id, { status: 'Done' });
    toast.success('Task completed!');
    load();
  };

  const PRIORITY_COLORS = { Low: 'badge-green', Medium: 'badge-yellow', High: 'badge-red', Urgent: 'badge-red' };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Tasks</h1>
        <button className="btn-primary" onClick={() => { setEditTask(null); setShowForm(true); }}>
          <Plus size={16} /> Add Task
        </button>
      </div>

      <div className="card mb-4">
        <div className="filter-bar">
          <select className="input sm:min-w-32" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="input sm:min-w-32" value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}>
            <option value="">All Priority</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="card p-0">
        {loading ? <SectionLoader /> : tasks.length === 0 ? (
          <EmptyState title="No tasks found" />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Client</th>
                  <th>Assigned To</th>
                  <th>Due Date</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <p className="font-medium text-forest text-sm">{t.title}</p>
                      {t.category && <p className="text-xs text-forest-400">{t.category}</p>}
                    </td>
                    <td className="text-sm text-forest-400">{t.client?.clientName || '—'}</td>
                    <td className="text-sm text-forest-400">{t.assignedTo?.name || '—'}</td>
                    <td className={`text-sm ${t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'Done' ? 'text-red-600 font-semibold' : 'text-forest'}`}>
                      {t.dueDate ? format(new Date(t.dueDate), 'dd MMM yyyy') : '—'}
                    </td>
                    <td><span className={`badge ${PRIORITY_COLORS[t.priority] || 'badge-gray'}`}>{t.priority}</span></td>
                    <td><StatusBadge status={t.status} /></td>
                    <td>
                      <div className="flex items-center gap-1">
                        {t.status !== 'Done' && (
                          <button onClick={() => markDone(t._id)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600" title="Mark Done">
                            <CheckCircle size={14} />
                          </button>
                        )}
                        <button onClick={() => { setEditTask(t); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteId(t._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600">
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
        {!loading && tasks.length > 0 && (
          <div className="px-5 pb-4 pt-2">
            <Pagination page={page} totalPages={Math.ceil(total / LIMIT)} onPageChange={setPage} total={total} limit={LIMIT} />
          </div>
        )}
      </div>

      {showForm && (
        <TaskFormModal task={editTask} onSuccess={() => { setShowForm(false); setEditTask(null); load(); }} onClose={() => { setShowForm(false); setEditTask(null); }} />
      )}
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} />
    </div>
  );
};

export default TasksPage;
