import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { invoiceApi } from '../../api/invoiceApi';
import { clientApi } from '../../api/clientApi';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.coerce.number().positive('Quantity must be greater than 0'),
  rate: z.coerce.number().nonnegative('Rate must be 0 or more'),
  amount: z.coerce.number().optional(),
});

const schema = z.object({
  client: z.string().min(1, 'Client is required'),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  lineItems: z.array(lineItemSchema).min(1, 'Add at least one line item'),
  gstRate: z.coerce.number().nonnegative(),
  discountType: z.enum(['Percentage', 'Fixed']),
  discountValue: z.coerce.number().nonnegative().optional(),
  notes: z.string().optional(),
});

const InvoiceFormModal = ({ invoice, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const isEdit = !!invoice;

  useEffect(() => {
    clientApi.getClients({ limit: 200 }).then(({ data }) => setClients(data.data));
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: invoice ? {
      client: invoice.client?._id || invoice.client,
      invoiceDate: invoice.invoiceDate?.split('T')[0],
      dueDate: invoice.dueDate?.split('T')[0],
      lineItems: invoice.lineItems || [{ description: '', quantity: 1, rate: 0, amount: 0 }],
      gstRate: invoice.gstRate || 18,
      discountType: invoice.discountType || 'Percentage',
      discountValue: invoice.discountValue || 0,
      notes: invoice.notes || '',
    } : {
      client: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      lineItems: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
      gstRate: 18,
      discountType: 'Percentage',
      discountValue: 0,
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'lineItems' });
  const lineItems = watch('lineItems');
  const gstRate = watch('gstRate');
  const discountValue = watch('discountValue');
  const discountType = watch('discountType');

  const subTotal = (lineItems || []).reduce((sum, item) => sum + (Number(item.quantity) * Number(item.rate) || 0), 0);
  const discountAmount = discountType === 'Percentage' ? (subTotal * (discountValue || 0)) / 100 : Number(discountValue || 0);
  const taxableAmount = subTotal - discountAmount;
  const gstAmount = (taxableAmount * (gstRate || 0)) / 100;
  const total = taxableAmount + gstAmount;

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        lineItems: data.lineItems.map((item) => ({
          ...item,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
          amount: Number(item.quantity) * Number(item.rate),
        })),
      };
      if (isEdit) {
        await invoiceApi.updateInvoice(invoice._id, payload);
        toast.success('Invoice updated');
      } else {
        await invoiceApi.createInvoice(payload);
        toast.success('Invoice created');
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
      title={isEdit ? 'Edit Invoice' : 'Create Invoice'}
      size="xl"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit(onSubmit)} disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Invoice' : 'Create Invoice'}
          </button>
        </>
      }
    >
      <form className="space-y-5" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="form-group sm:col-span-1">
            <label className="label">Client *</label>
            <select {...register('client')} className={`input ${errors.client ? 'input-error' : ''}`}>
              <option value="">Select client</option>
              {clients.map((c) => <option key={c._id} value={c._id}>{c.clientName}</option>)}
            </select>
            {errors.client && <p className="error-text">{errors.client.message}</p>}
          </div>
          <div className="form-group">
            <label className="label">Invoice Date *</label>
            <input {...register('invoiceDate')} type="date" className={`input ${errors.invoiceDate ? 'input-error' : ''}`} />
            {errors.invoiceDate && <p className="error-text">{errors.invoiceDate.message}</p>}
          </div>
          <div className="form-group">
            <label className="label">Due Date *</label>
            <input {...register('dueDate')} type="date" className={`input ${errors.dueDate ? 'input-error' : ''}`} />
            {errors.dueDate && <p className="error-text">{errors.dueDate.message}</p>}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3 gap-2">
            <h3 className="font-display font-semibold text-forest text-sm">Line Items</h3>
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={() => append({ description: '', quantity: 1, rate: 0, amount: 0 })}
            >
              <Plus size={13} /> Add Item
            </button>
          </div>
          <div className="space-y-3">
            {fields.map((field, idx) => (
              <div
                key={field.id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-start p-3 sm:p-0 rounded-xl sm:rounded-none border border-forest-100 sm:border-0"
              >
                <div className="sm:col-span-5">
                  <input
                    {...register(`lineItems.${idx}.description`)}
                    className={`input ${errors.lineItems?.[idx]?.description ? 'input-error' : ''}`}
                    placeholder="Description"
                  />
                  {errors.lineItems?.[idx]?.description && (
                    <p className="error-text">{errors.lineItems[idx].description.message}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <input
                    {...register(`lineItems.${idx}.quantity`)}
                    type="number"
                    className={`input ${errors.lineItems?.[idx]?.quantity ? 'input-error' : ''}`}
                    placeholder="Qty"
                    min="0"
                  />
                  {errors.lineItems?.[idx]?.quantity && (
                    <p className="error-text">{errors.lineItems[idx].quantity.message}</p>
                  )}
                </div>
                <div className="sm:col-span-3">
                  <input
                    {...register(`lineItems.${idx}.rate`)}
                    type="number"
                    className={`input ${errors.lineItems?.[idx]?.rate ? 'input-error' : ''}`}
                    placeholder="Rate (₹)"
                    min="0"
                  />
                  {errors.lineItems?.[idx]?.rate && (
                    <p className="error-text">{errors.lineItems[idx].rate.message}</p>
                  )}
                </div>
                <div className="sm:col-span-1 pt-2 text-right text-sm font-medium font-mono text-forest">
                  ₹{((Number(lineItems?.[idx]?.quantity) * Number(lineItems?.[idx]?.rate)) || 0).toLocaleString('en-IN')}
                </div>
                <div className="sm:col-span-1 flex justify-end">
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(idx)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      aria-label="Remove line item"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {errors.lineItems?.root && (
            <p className="error-text mt-1">{errors.lineItems.root.message}</p>
          )}
          {typeof errors.lineItems?.message === 'string' && (
            <p className="error-text mt-1">{errors.lineItems.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3">
            <div className="form-group">
              <label className="label">GST Rate (%)</label>
              <select {...register('gstRate')} className="input">
                {[0, 5, 12, 18, 28].map((r) => <option key={r} value={r}>{r}%</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Discount</label>
              <div className="flex gap-1">
                <select {...register('discountType')} className="input w-20 sm:w-24 flex-shrink-0">
                  <option value="Percentage">%</option>
                  <option value="Fixed">₹</option>
                </select>
                <input {...register('discountValue')} type="number" className="input min-w-0" min="0" />
              </div>
            </div>
          </div>
          <div className="bg-forest-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between text-forest-400"><span>Subtotal</span><span className="font-mono">₹{subTotal.toLocaleString('en-IN')}</span></div>
            {discountAmount > 0 && <div className="flex justify-between text-forest-400"><span>Discount</span><span className="font-mono text-red-500">-₹{discountAmount.toLocaleString('en-IN')}</span></div>}
            <div className="flex justify-between text-forest-400"><span>GST ({gstRate}%)</span><span className="font-mono">₹{gstAmount.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between font-bold text-forest border-t border-forest-200 pt-2 text-base"><span>Total</span><span className="font-mono">₹{total.toLocaleString('en-IN')}</span></div>
          </div>
        </div>

        <div className="form-group">
          <label className="label">Notes</label>
          <textarea {...register('notes')} className="input" rows={2} placeholder="Terms, notes..." />
        </div>
      </form>
    </Modal>
  );
};

export default InvoiceFormModal;
