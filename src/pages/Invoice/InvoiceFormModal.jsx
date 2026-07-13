import { useForm, useFieldArray } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { invoiceApi } from '../../api/invoiceApi';
import { clientApi } from '../../api/clientApi';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const InvoiceFormModal = ({ invoice, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const isEdit = !!invoice;

  useEffect(() => {
    clientApi.getClients({ limit: 200 }).then(({ data }) => setClients(data.data));
  }, []);

  const { register, handleSubmit, watch, control, setValue } = useForm({
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
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      lineItems: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
      gstRate: 18,
      discountType: 'Percentage',
      discountValue: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'lineItems' });
  const lineItems = watch('lineItems');
  const gstRate = watch('gstRate');
  const discountValue = watch('discountValue');
  const discountType = watch('discountType');

  const subTotal = lineItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.rate) || 0), 0);
  const discountAmount = discountType === 'Percentage' ? (subTotal * discountValue) / 100 : Number(discountValue);
  const taxableAmount = subTotal - discountAmount;
  const gstAmount = (taxableAmount * gstRate) / 100;
  const total = taxableAmount + gstAmount;

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = { ...data, lineItems: data.lineItems.map((item) => ({ ...item, quantity: Number(item.quantity), rate: Number(item.rate), amount: Number(item.quantity) * Number(item.rate) })) };
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
    <Modal isOpen onClose={onClose} title={isEdit ? 'Edit Invoice' : 'Create Invoice'} size="xl"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit(onSubmit)} disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Invoice' : 'Create Invoice'}
          </button>
        </>
      }
    >
      <form className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="form-group sm:col-span-1">
            <label className="label">Client *</label>
            <select {...register('client')} className="input">
              <option value="">Select client</option>
              {clients.map((c) => <option key={c._id} value={c._id}>{c.clientName}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Invoice Date *</label>
            <input {...register('invoiceDate')} type="date" className="input" />
          </div>
          <div className="form-group">
            <label className="label">Due Date *</label>
            <input {...register('dueDate')} type="date" className="input" />
          </div>
        </div>

        {/* Line Items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 text-sm">Line Items</h3>
            <button type="button" className="btn-secondary btn-sm" onClick={() => append({ description: '', quantity: 1, rate: 0, amount: 0 })}>
              <Plus size={13} /> Add Item
            </button>
          </div>
          <div className="space-y-2">
            {fields.map((field, idx) => (
              <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-5">
                  <input {...register(`lineItems.${idx}.description`)} className="input" placeholder="Description" />
                </div>
                <div className="col-span-2">
                  <input {...register(`lineItems.${idx}.quantity`, { valueAsNumber: true })} type="number" className="input" placeholder="Qty" min="0" />
                </div>
                <div className="col-span-3">
                  <input {...register(`lineItems.${idx}.rate`, { valueAsNumber: true })} type="number" className="input" placeholder="Rate (₹)" min="0" />
                </div>
                <div className="col-span-1 pt-2 text-right text-sm font-medium text-gray-700">
                  ₹{((Number(lineItems[idx]?.quantity) * Number(lineItems[idx]?.rate)) || 0).toLocaleString('en-IN')}
                </div>
                <div className="col-span-1 flex justify-end">
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(idx)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tax & Totals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="label">GST Rate (%)</label>
              <select {...register('gstRate', { valueAsNumber: true })} className="input">
                {[0, 5, 12, 18, 28].map((r) => <option key={r} value={r}>{r}%</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Discount</label>
              <div className="flex gap-1">
                <select {...register('discountType')} className="input w-24">
                  <option value="Percentage">%</option>
                  <option value="Fixed">₹</option>
                </select>
                <input {...register('discountValue', { valueAsNumber: true })} type="number" className="input" min="0" />
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{subTotal.toLocaleString('en-IN')}</span></div>
            {discountAmount > 0 && <div className="flex justify-between text-gray-600"><span>Discount</span><span className="text-red-500">-₹{discountAmount.toLocaleString('en-IN')}</span></div>}
            <div className="flex justify-between text-gray-600"><span>GST ({gstRate}%)</span><span>₹{gstAmount.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2 text-base"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
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
