import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { itrApi } from '../../api/itrApi';
import { clientApi } from '../../api/clientApi';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const FORM_TYPES = ['ITR-1', 'ITR-2', 'ITR-3', 'ITR-4', 'ITR-5', 'ITR-6', 'ITR-7'];
const STATUSES = ['Pending', 'Data Received', 'In Progress', 'Filed', 'Late Filed', 'Revised'];
const REFUND_STATUSES = ['Not Applicable', 'Pending', 'Processed', 'Received'];

const ITRFormModal = ({ itrReturn, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const isEdit = !!itrReturn;

  useEffect(() => {
    clientApi.getClients({ limit: 200 }).then(({ data }) => setClients(data.data));
  }, []);

  const { register, handleSubmit } = useForm({
    defaultValues: itrReturn ? {
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
    } : { formType: 'ITR-1', status: 'Pending', refundStatus: 'Not Applicable', assessmentYear: '2024-25', financialYear: '2023-24' },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEdit) {
        await itrApi.updateReturn(itrReturn._id, data);
        toast.success('ITR updated');
      } else {
        await itrApi.createReturn(data);
        toast.success('ITR added');
      }
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={isEdit ? 'Edit ITR' : 'Add ITR Record'} size="lg"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit(onSubmit)} disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Add ITR'}
          </button>
        </>
      }
    >
      <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-group sm:col-span-2">
          <label className="label">Client *</label>
          <select {...register('client')} className="input">
            <option value="">Select client</option>
            {clients.map((c) => <option key={c._id} value={c._id}>{c.clientName} {c.firmName ? `(${c.firmName})` : ''}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="label">Form Type *</label>
          <select {...register('formType')} className="input">
            {FORM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="label">Status</label>
          <select {...register('status')} className="input">
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="label">Assessment Year *</label>
          <input {...register('assessmentYear')} className="input" placeholder="2024-25" />
        </div>
        <div className="form-group">
          <label className="label">Financial Year *</label>
          <input {...register('financialYear')} className="input" placeholder="2023-24" />
        </div>
        <div className="form-group">
          <label className="label">Due Date *</label>
          <input {...register('dueDate')} type="date" className="input" />
        </div>
        <div className="form-group">
          <label className="label">Filed Date</label>
          <input {...register('filedDate')} type="date" className="input" />
        </div>
        <div className="form-group">
          <label className="label">Refund Status</label>
          <select {...register('refundStatus')} className="input">
            {REFUND_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="label">Refund Amount (₹)</label>
          <input {...register('refundAmount', { valueAsNumber: true })} type="number" className="input" min="0" />
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
