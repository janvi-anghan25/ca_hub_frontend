import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { invoiceApi } from '../../api/invoiceApi';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const PAYMENT_MODES = ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'NEFT', 'RTGS', 'Other'];

const PaymentModal = ({ invoice, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: {
      amount: invoice.balanceDue,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode: 'UPI',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await invoiceApi.recordPayment(invoice._id, { ...data, amount: Number(data.amount) });
      toast.success('Payment recorded');
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Record Payment" size="sm"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn-success" onClick={handleSubmit(onSubmit)} disabled={loading}>
            {loading ? 'Recording...' : 'Record Payment'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="p-3 bg-forest-50 rounded-xl border border-forest-100">
          <p className="text-xs text-forest-500 mb-0.5 font-mono">Invoice #{invoice.invoiceNumber}</p>
          <p className="text-sm font-semibold text-forest">{invoice.client?.clientName}</p>
          <p className="text-xs text-forest-500 mt-1">Balance Due: <strong className="font-mono">₹{invoice.balanceDue?.toLocaleString('en-IN')}</strong></p>
        </div>
        <form className="space-y-3">
          <div className="form-group">
            <label className="label">Amount (₹) *</label>
            <input {...register('amount', { valueAsNumber: true })} type="number" className="input" max={invoice.balanceDue} />
          </div>
          <div className="form-group">
            <label className="label">Payment Date *</label>
            <input {...register('paymentDate')} type="date" className="input" />
          </div>
          <div className="form-group">
            <label className="label">Payment Mode *</label>
            <select {...register('paymentMode')} className="input">
              {PAYMENT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Transaction ID / Reference</label>
            <input {...register('transactionId')} className="input" placeholder="Optional" />
          </div>
          <div className="form-group">
            <label className="label">Notes</label>
            <input {...register('notes')} className="input" />
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default PaymentModal;
