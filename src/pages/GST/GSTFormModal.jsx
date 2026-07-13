import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { gstApi } from '../../api/gstApi';
import { clientApi } from '../../api/clientApi';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const schema = z.object({
  client: z.string().min(1, 'Client is required'),
  returnType: z.string().min(1, 'Return type required'),
  periodYear: z.number().min(2020).max(2035),
  periodMonth: z.number().min(1).max(12).optional(),
  dueDate: z.string().min(1, 'Due date required'),
  filedDate: z.string().optional(),
  status: z.string().min(1),
  lateFee: z.number().min(0).optional(),
  notes: z.string().optional(),
});

const RETURN_TYPES = ['GSTR-1', 'GSTR-3B', 'GSTR-9', 'GSTR-9C', 'CMP-08', 'Other'];
const STATUSES = ['Pending', 'Data Received', 'In Progress', 'Filed', 'Late Filed'];

const GSTFormModal = ({ gstReturn, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const isEdit = !!gstReturn;

  useEffect(() => {
    clientApi.getClients({ limit: 200 }).then(({ data }) => setClients(data.data));
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: gstReturn ? {
      client: gstReturn.client?._id || gstReturn.client,
      returnType: gstReturn.returnType,
      periodYear: gstReturn.period?.year,
      periodMonth: gstReturn.period?.month,
      dueDate: gstReturn.dueDate?.split('T')[0],
      filedDate: gstReturn.filedDate?.split('T')[0] || '',
      status: gstReturn.status,
      lateFee: gstReturn.lateFee || 0,
      notes: gstReturn.notes || '',
    } : { status: 'Pending', periodYear: new Date().getFullYear() },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        client: data.client,
        returnType: data.returnType,
        period: { year: Number(data.periodYear), month: data.periodMonth ? Number(data.periodMonth) : undefined },
        dueDate: data.dueDate,
        filedDate: data.filedDate || undefined,
        status: data.status,
        lateFee: data.lateFee || 0,
        notes: data.notes,
      };

      if (isEdit) {
        await gstApi.updateReturn(gstReturn._id, payload);
        toast.success('GST Return updated');
      } else {
        await gstApi.createReturn(payload);
        toast.success('GST Return added');
      }
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen onClose={onClose}
      title={isEdit ? 'Edit GST Return' : 'Add GST Return'}
      size="lg"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit(onSubmit)} disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Add Return'}
          </button>
        </>
      }
    >
      <form className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-group sm:col-span-2">
            <label className="label">Client *</label>
            <select {...register('client')} className={`input ${errors.client ? 'input-error' : ''}`}>
              <option value="">Select client</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>{c.clientName} {c.firmName ? `(${c.firmName})` : ''}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Return Type *</label>
            <select {...register('returnType')} className="input">
              {RETURN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Status</label>
            <select {...register('status')} className="input">
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Year *</label>
            <input {...register('periodYear', { valueAsNumber: true })} type="number" className="input" placeholder="2024" />
          </div>
          <div className="form-group">
            <label className="label">Month</label>
            <select {...register('periodMonth', { valueAsNumber: true })} className="input">
              <option value="">Not Applicable</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Due Date *</label>
            <input {...register('dueDate')} type="date" className={`input ${errors.dueDate ? 'input-error' : ''}`} />
          </div>
          <div className="form-group">
            <label className="label">Filed Date</label>
            <input {...register('filedDate')} type="date" className="input" />
          </div>
          <div className="form-group">
            <label className="label">Late Fee (₹)</label>
            <input {...register('lateFee', { valueAsNumber: true })} type="number" className="input" min="0" placeholder="0" />
          </div>
        </div>
        <div className="form-group">
          <label className="label">Notes</label>
          <textarea {...register('notes')} className="input" rows={2} />
        </div>
      </form>
    </Modal>
  );
};

export default GSTFormModal;
