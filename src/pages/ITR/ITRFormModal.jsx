import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { itrApi } from '../../api/itrApi';
import { clientApi } from '../../api/clientApi';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const FORM_TYPES = ['ITR-1', 'ITR-2', 'ITR-3', 'ITR-4', 'ITR-5', 'ITR-6', 'ITR-7'];
const STATUSES = ['Pending', 'Data Received', 'In Progress', 'Filed', 'Late Filed', 'Revised'];
const REFUND_STATUSES = ['Not Applicable', 'Pending', 'Processed', 'Received'];

const yearFormat = /^\d{4}-\d{2}$/;

const optionalNonNegNumber = z.preprocess(
  (val) => {
    if (val === '' || val === null || val === undefined || Number.isNaN(val)) return undefined;
    return Number(val);
  },
  z.number().min(0).optional()
);

const schema = z.object({
  client: z.string().min(1, 'Client is required'),
  formType: z.enum(FORM_TYPES, { required_error: 'Form type is required' }),
  status: z.enum(STATUSES),
  assessmentYear: z
    .string()
    .min(1, 'Assessment year is required')
    .regex(yearFormat, 'Format should be YYYY-YY e.g. 2024-25'),
  financialYear: z
    .string()
    .min(1, 'Financial year is required')
    .regex(yearFormat, 'Format should be YYYY-YY e.g. 2023-24'),
  dueDate: z.string().min(1, 'Due date is required'),
  filedDate: z.string().optional().or(z.literal('')),
  refundStatus: z.enum(REFUND_STATUSES),
  refundAmount: optionalNonNegNumber,
  acknowledgementNumber: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

const ITRFormModal = ({ itrReturn, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const isEdit = !!itrReturn;

  useEffect(() => {
    clientApi.getClients({ limit: 200 }).then(({ data }) => setClients(data.data));
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: itrReturn
      ? {
          client: itrReturn.client?._id || itrReturn.client,
          formType: itrReturn.formType,
          assessmentYear: itrReturn.assessmentYear,
          financialYear: itrReturn.financialYear,
          dueDate: itrReturn.dueDate?.split('T')[0],
          filedDate: itrReturn.filedDate?.split('T')[0] || '',
          status: itrReturn.status,
          refundStatus: itrReturn.refundStatus,
          refundAmount: itrReturn.refundAmount || 0,
          acknowledgementNumber: itrReturn.acknowledgementNumber || '',
          notes: itrReturn.notes || '',
        }
      : {
          client: '',
          formType: 'ITR-1',
          status: 'Pending',
          refundStatus: 'Not Applicable',
          assessmentYear: '2024-25',
          financialYear: '2023-24',
          dueDate: '',
          filedDate: '',
          refundAmount: 0,
          acknowledgementNumber: '',
          notes: '',
        },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        filedDate: data.filedDate || undefined,
        refundAmount: data.refundAmount ?? 0,
      };

      if (isEdit) {
        await itrApi.updateReturn(itrReturn._id, payload);
        toast.success('ITR updated');
      } else {
        await itrApi.createReturn(payload);
        toast.success('ITR added');
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
      title={isEdit ? 'Edit ITR' : 'Add ITR Record'}
      size="lg"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSubmit(onSubmit)} disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Add ITR'}
          </button>
        </>
      }
    >
      <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" noValidate>
        <div className="form-group sm:col-span-2">
          <label className="label">Client *</label>
          <select
            {...register('client')}
            className={`input ${errors.client ? 'input-error' : ''}`}
            aria-invalid={!!errors.client}
          >
            <option value="">Select client</option>
            {clients.map((c) => (
              <option key={c._id} value={c._id}>
                {c.clientName} {c.firmName ? `(${c.firmName})` : ''}
              </option>
            ))}
          </select>
          {errors.client && <p className="error-text">{errors.client.message}</p>}
        </div>
        <div className="form-group">
          <label className="label">Form Type *</label>
          <select
            {...register('formType')}
            className={`input ${errors.formType ? 'input-error' : ''}`}
          >
            {FORM_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errors.formType && <p className="error-text">{errors.formType.message}</p>}
        </div>
        <div className="form-group">
          <label className="label">Status</label>
          <select {...register('status')} className="input">
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="label">Assessment Year *</label>
          <input
            {...register('assessmentYear')}
            className={`input ${errors.assessmentYear ? 'input-error' : ''}`}
            placeholder="2024-25"
          />
          {errors.assessmentYear && (
            <p className="error-text">{errors.assessmentYear.message}</p>
          )}
        </div>
        <div className="form-group">
          <label className="label">Financial Year *</label>
          <input
            {...register('financialYear')}
            className={`input ${errors.financialYear ? 'input-error' : ''}`}
            placeholder="2023-24"
          />
          {errors.financialYear && (
            <p className="error-text">{errors.financialYear.message}</p>
          )}
        </div>
        <div className="form-group">
          <label className="label">Due Date *</label>
          <input
            {...register('dueDate')}
            type="date"
            className={`input ${errors.dueDate ? 'input-error' : ''}`}
          />
          {errors.dueDate && <p className="error-text">{errors.dueDate.message}</p>}
        </div>
        <div className="form-group">
          <label className="label">Filed Date</label>
          <input {...register('filedDate')} type="date" className="input" />
        </div>
        <div className="form-group">
          <label className="label">Refund Status</label>
          <select {...register('refundStatus')} className="input">
            {REFUND_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="label">Refund Amount (₹)</label>
          <input {...register('refundAmount')} type="number" className="input" min="0" />
        </div>
        <div className="form-group sm:col-span-2">
          <label className="label">Acknowledgement Number</label>
          <input {...register('acknowledgementNumber')} className="input font-mono" />
        </div>
        <div className="form-group sm:col-span-2">
          <label className="label">Notes</label>
          <textarea {...register('notes')} className="input" rows={2} />
        </div>
      </form>
    </Modal>
  );
};

export default ITRFormModal;
