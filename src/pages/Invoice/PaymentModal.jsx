import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Copy, Check, CheckCircle2 } from 'lucide-react';
import { invoiceApi } from '../../api/invoiceApi';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const PAYMENT_MODES = ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'NEFT', 'RTGS', 'Other'];

const schema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  paymentMode: z.enum(PAYMENT_MODES, { required_error: 'Payment mode is required' }),
  transactionId: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

const PaymentModal = ({ invoice, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: invoice.balanceDue,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode: 'UPI',
      transactionId: '',
      notes: '',
    },
  });

  const onSubmit = async (data) => {
    if (Number(data.amount) > Number(invoice.balanceDue)) {
      toast.error('Amount cannot exceed balance due');
      return;
    }
    setLoading(true);
    try {
      const { data: res } = await invoiceApi.recordPayment(invoice._id, {
        ...data,
        amount: Number(data.amount),
      });
      toast.success(
        res.data?.receiptNumber
          ? `Payment recorded — Receipt ${res.data.receiptNumber}`
          : 'Payment recorded'
      );
      setReceipt(res.data);
    } finally {
      setLoading(false);
    }
  };

  const copyReceipt = async () => {
    if (!receipt?.receiptNumber) return;
    await navigator.clipboard.writeText(receipt.receiptNumber);
    setCopied(true);
    toast.success('Receipt number copied');
    setTimeout(() => setCopied(false), 2000);
  };

  if (receipt) {
    return (
      <Modal
        isOpen
        onClose={onSuccess}
        title="Payment Recorded"
        size="sm"
        footer={<button className="btn-primary" onClick={onSuccess}>Done</button>}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <CheckCircle2 size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-forest">Payment saved successfully</p>
              <p className="text-xs text-forest-400">A receipt number has been generated.</p>
            </div>
          </div>

          <div className="rounded-xl border border-forest-100 bg-forest-50 p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-forest-500 uppercase tracking-wide">Receipt Number</p>
                <p className="text-base font-semibold font-mono text-forest mt-0.5 break-all">{receipt.receiptNumber || '—'}</p>
              </div>
              {receipt.receiptNumber && (
                <button
                  type="button"
                  onClick={copyReceipt}
                  className="btn-secondary btn-sm flex items-center gap-1.5 flex-shrink-0"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>
            <div className="flex justify-between text-sm pt-1 border-t border-forest-100">
              <span className="text-forest-400">Amount</span>
              <span className="font-mono font-semibold text-emerald-600">
                ₹{receipt.amount?.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-forest-400">Mode</span>
              <span className="text-forest">{receipt.paymentMode}</span>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Record Payment"
      size="sm"
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
          <p className="text-xs text-forest-500 mt-1">
            Balance Due:{' '}
            <strong className="font-mono">₹{invoice.balanceDue?.toLocaleString('en-IN')}</strong>
          </p>
        </div>
        <form className="space-y-3" noValidate>
          <div className="form-group">
            <label className="label">Amount (₹) *</label>
            <input
              {...register('amount')}
              type="number"
              className={`input ${errors.amount ? 'input-error' : ''}`}
              max={invoice.balanceDue}
              min="1"
              step="0.01"
            />
            {errors.amount && <p className="error-text">{errors.amount.message}</p>}
          </div>
          <div className="form-group">
            <label className="label">Payment Date *</label>
            <input
              {...register('paymentDate')}
              type="date"
              className={`input ${errors.paymentDate ? 'input-error' : ''}`}
            />
            {errors.paymentDate && <p className="error-text">{errors.paymentDate.message}</p>}
          </div>
          <div className="form-group">
            <label className="label">Payment Mode *</label>
            <select
              {...register('paymentMode')}
              className={`input ${errors.paymentMode ? 'input-error' : ''}`}
            >
              {PAYMENT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            {errors.paymentMode && <p className="error-text">{errors.paymentMode.message}</p>}
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
