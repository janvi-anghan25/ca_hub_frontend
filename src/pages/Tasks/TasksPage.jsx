import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Edit2, Trash2, CheckCircle, Search, LayoutGrid, List, Eye } from 'lucide-react';
import { taskApi } from '../../api/taskApi';
import { SectionLoader } from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import TaskFormModal from './TaskFormModal';
import TaskDetailModal from './TaskDetailModal';
import TaskKanbanView from './TaskKanbanView';
import { format, isPast } from 'date-fns';
import toast from 'react-hot-toast';

const STATUSES = ['Todo', 'In Progress', 'Review', 'Done', 'Cancelled'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const CATEGORIES = ['GST', 'ITR', 'Audit', 'ROC', 'TDS', 'General', 'Other'];

const TasksPage = () => {
  const location = useLocation();
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'kanban'

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [quickTab, setQuickTab] = useState('all'); // 'all' | 'today' | 'overdue'

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [detailTaskId, setDetailTaskId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (location.state?.taskId) {
      setDetailTaskId(location.state.taskId);
    }
  }, [location.state]);

  const LIMIT = viewMode === 'kanban' ? 100 : 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (quickTab === 'today') {
        const res = await taskApi.getTodaysTasks();
        setTasks(res.data.data);
        setTotal(res.data.data.length);
      } else if (quickTab === 'overdue') {
        const res = await taskApi.getOverdue();
        setTasks(res.data.data);
        setTotal(res.data.data.length);
      } else {
        const res = await taskApi.getTasks({
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
          category: categoryFilter || undefined,
          search: search || undefined,
          page,
          limit: LIMIT,
        });
        setTasks(res.data.data);
        setTotal(res.data.meta?.total || res.data.data.length);
      }
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, categoryFilter, search, quickTab, page, LIMIT]);

  useEffect(() => {
    const timer = setTimeout(() => { load(); }, 250);
    return () => clearTimeout(timer);
  }, [load]);

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

  const markDone = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await taskApi.updateTask(id, { status: 'Done' });
      toast.success('Task completed!');
      load();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await taskApi.updateTask(id, { status: newStatus });
      toast.success(`Task moved to ${newStatus}`);
      load();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const PRIORITY_COLORS = { Low: 'badge-green', Medium: 'badge-yellow', High: 'badge-red', Urgent: 'badge-red' };

  return (
    <div className="space-y-4">
      {/* Header & Main Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-forest">Task Management</h1>
          <p className="text-xs text-forest-400">Track compliance tasks, deadlines, and staff assignments.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-forest-100 p-1 rounded-lg border border-forest-200">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'list' ? 'bg-forest text-parchment shadow-sm' : 'text-forest hover:bg-forest-50'
              }`}
            >
              <List size={14} /> List View
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'kanban' ? 'bg-forest text-parchment shadow-sm' : 'text-forest hover:bg-forest-50'
              }`}
            >
              <LayoutGrid size={14} /> Kanban Board
            </button>
          </div>

          <button className="btn-primary text-xs py-2" onClick={() => { setEditTask(null); setShowForm(true); }}>
            <Plus size={15} /> Add Task
          </button>
        </div>
      </div>

      {/* Quick Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-forest-200 pb-2">
        <button
          onClick={() => { setQuickTab('all'); setPage(1); }}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
            quickTab === 'all'
              ? 'bg-forest text-parchment shadow-sm'
              : 'bg-white text-forest hover:bg-forest-50 border border-forest-200'
          }`}
        >
          All Tasks
        </button>
        <button
          onClick={() => { setQuickTab('today'); setPage(1); }}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
            quickTab === 'today'
              ? 'bg-forest text-parchment shadow-sm'
              : 'bg-white text-forest hover:bg-forest-50 border border-forest-200'
          }`}
        >
          Today's Due
        </button>
        <button
          onClick={() => { setQuickTab('overdue'); setPage(1); }}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
            quickTab === 'overdue'
              ? 'bg-red-700 text-white shadow-sm'
              : 'bg-white text-red-700 hover:bg-red-50 border border-red-200'
          }`}
        >
          Overdue Tasks
        </button>
      </div>

      {/* Filter & Search Bar */}
      {quickTab === 'all' && (
        <div className="card p-3.5">
          <div className="filter-bar">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400" />
              <input
                type="text"
                placeholder="Search tasks by title or instructions..."
                className="input pl-9 text-sm"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <select className="input sm:min-w-36 text-sm" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="input sm:min-w-36 text-sm" value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}>
              <option value="">All Priority</option>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select className="input sm:min-w-36 text-sm" value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
              <option value="">All Category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Content Rendering: List View vs Kanban View */}
      {loading ? (
        <SectionLoader />
      ) : tasks.length === 0 ? (
        <EmptyState title="No tasks found" message="Click '+ Add Task' above to create your first compliance task." />
      ) : viewMode === 'kanban' ? (
        <TaskKanbanView
          tasks={tasks}
          onSelectTask={(id) => setDetailTaskId(id)}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <div className="card p-0">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Task Title</th>
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
                  <tr
                    key={t._id}
                    className="hover:bg-forest-50 cursor-pointer"
                    onClick={() => setDetailTaskId(t._id)}
                  >
                    <td>
                      <p className="font-semibold text-forest text-sm flex items-center gap-1.5">
                        {t.title}
                      </p>
                      {t.category && <span className="text-[11px] text-forest-400 font-medium">{t.category}</span>}
                    </td>
                    <td className="text-sm text-forest-500">{t.client?.clientName || '—'}</td>
                    <td className="text-sm text-forest-500">{t.assignedTo?.name || 'Unassigned'}</td>
                    <td className={`text-sm ${t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'Done' ? 'text-red-600 font-bold' : 'text-forest'}`}>
                      {t.dueDate ? format(new Date(t.dueDate), 'dd MMM yyyy') : '—'}
                    </td>
                    <td><span className={`badge ${PRIORITY_COLORS[t.priority] || 'badge-gray'}`}>{t.priority}</span></td>
                    <td><StatusBadge status={t.status} /></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setDetailTaskId(t._id)}
                          className="p-1.5 rounded-lg hover:bg-forest-100 text-forest-400 hover:text-forest"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        {t.status !== 'Done' && (
                          <button
                            onClick={(e) => markDone(t._id, e)}
                            className="p-1.5 rounded-lg hover:bg-emerald-50 text-forest-400 hover:text-emerald-600"
                            title="Mark Done"
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => { setEditTask(t); setShowForm(true); }}
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-forest-400 hover:text-amber-600"
                          title="Edit Task"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(t._id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-forest-400 hover:text-red-600"
                          title="Delete Task"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {viewMode === 'list' && quickTab === 'all' && (
            <div className="px-5 pb-4 pt-2">
              <Pagination page={page} totalPages={Math.ceil(total / LIMIT)} onPageChange={setPage} total={total} limit={LIMIT} />
            </div>
          )}
        </div>
      )}

      {/* Form Modal (Add / Edit) */}
      {showForm && (
        <TaskFormModal
          task={editTask}
          onSuccess={() => { setShowForm(false); setEditTask(null); load(); }}
          onClose={() => { setShowForm(false); setEditTask(null); }}
        />
      )}

      {/* Task Details Drawer Modal */}
      {detailTaskId && (
        <TaskDetailModal
          taskId={detailTaskId}
          onClose={() => setDetailTaskId(null)}
          onRefresh={load}
        />
      )}

      {/* Delete Dialog */}
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} />
    </div>
  );
};

export default TasksPage;
