import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { taskApi } from '../../api/taskApi';
import { clientApi } from '../../api/clientApi';
import { employeeApi } from '../../api/employeeApi';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const CATEGORIES = ['GST', 'ITR', 'Audit', 'ROC', 'TDS', 'General', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const STATUSES = ['Todo', 'In Progress', 'Review', 'Done', 'Cancelled'];

const schema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional().or(z.literal('')),
  client: z.string().optional().or(z.literal('')),
  assignedTo: z.string().optional().or(z.literal('')),
  category: z.enum(CATEGORIES),
  priority: z.enum(PRIORITIES),
  status: z.enum(STATUSES),
  dueDate: z.string().optional().or(z.literal('')),
  estimatedHours: z.coerce.number().optional().or(z.literal('')),
});

const TaskFormModal = ({ task, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [subtasks, setSubtasks] = useState(task?.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const isEdit = !!task;

  useEffect(() => {
    clientApi.getClients({ limit: 200 }).then(({ data }) => setClients(data.data)).catch(() => {});
    employeeApi.getAll({ limit: 200 }).then(({ data }) => setEmployees(data.data)).catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: task ? {
      title: task.title,
      description: task.description || '',
      client: task.client?._id || task.client || '',
      assignedTo: task.assignedTo?._id || task.assignedTo || '',
      category: task.category,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate?.split('T')[0] || '',
      estimatedHours: task.estimatedHours || '',
    } : {
      title: '',
      description: '',
      client: '',
      assignedTo: '',
      priority: 'Medium',
      status: 'Todo',
      category: 'General',
      dueDate: '',
      estimatedHours: '',
    },
  });

  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([...subtasks, { title: newSubtaskTitle.trim(), isCompleted: false }]);
    setNewSubtaskTitle('');
  };

  const removeSubtask = (index) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        client: data.client || undefined,
        assignedTo: data.assignedTo || undefined,
        dueDate: data.dueDate || undefined,
        estimatedHours: data.estimatedHours ? Number(data.estimatedHours) : undefined,
        subtasks,
      };
      if (isEdit) {
        await taskApi.updateTask(task._id, payload);
        toast.success('Task updated');
      } else {
        await taskApi.createTask(payload);
        toast.success('Task created');
      }
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? 'Edit Task' : 'Add Task'}
      size="lg"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit(onSubmit)} disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Task' : 'Add Task'}
          </button>
        </>
      }
    >
      <form className="space-y-4" noValidate>
        <div className="form-group">
          <label className="label">Title *</label>
          <input
            {...register('title')}
            className={`input ${errors.title ? 'input-error' : ''}`}
            placeholder="Task title (e.g. File GSTR-3B for June)"
          />
          {errors.title && <p className="error-text">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="form-group">
            <label className="label">Category</label>
            <select {...register('category')} className="input">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Priority</label>
            <select {...register('priority')} className="input">
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Status</label>
            <select {...register('status')} className="input">
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="form-group">
            <label className="label">Due Date</label>
            <input {...register('dueDate')} type="date" className="input" />
          </div>
          <div className="form-group">
            <label className="label">Client</label>
            <select {...register('client')} className="input">
              <option value="">No client (general task)</option>
              {clients.map((c) => <option key={c._id} value={c._id}>{c.clientName}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Assigned Employee</label>
            <select {...register('assignedTo')} className="input">
              <option value="">Unassigned</option>
              {employees.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="label">Estimated Hours</label>
          <input {...register('estimatedHours')} type="number" step="0.5" className="input" placeholder="e.g. 4" />
        </div>

        {/* Subtask Checklist Creator */}
        <div className="form-group border-t border-forest-100 pt-3">
          <label className="label">Subtasks Checklist</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              className="input flex-1"
              placeholder="Add step (e.g. 1. Collect bank statement)"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubtask(); } }}
            />
            <button type="button" onClick={addSubtask} className="btn-secondary whitespace-nowrap">
              Add Step
            </button>
          </div>
          {subtasks.length > 0 && (
            <ul className="space-y-1.5 max-h-36 overflow-y-auto">
              {subtasks.map((st, i) => (
                <li key={i} className="flex items-center justify-between bg-forest-50/50 dark:bg-forest-900/30 px-3 py-1.5 rounded-lg text-sm">
                  <span className="text-forest">{st.title}</span>
                  <button type="button" onClick={() => removeSubtask(i)} className="text-red-500 hover:text-red-700 text-xs font-semibold">
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="form-group">
          <label className="label">Description</label>
          <textarea {...register('description')} className="input" rows={2} placeholder="Add additional instructions..." />
        </div>
      </form>
    </Modal>
  );
};

export default TaskFormModal;
