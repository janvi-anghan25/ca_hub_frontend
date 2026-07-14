import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { clientApi } from '../../api/clientApi';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const schema = z.object({
  clientName: z.string().min(2, 'Required'),
  firmName: z.string().optional(),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  gstNumber: z.string().optional().or(z.literal('')),
  panNumber: z.string().optional().or(z.literal('')),
  businessType: z.string().min(1, 'Required'),
  state: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
});

const BUSINESS_TYPES = ['Proprietorship', 'Partnership', 'LLP', 'Private Limited', 'Public Limited', 'Trust', 'HUF', 'Other'];
const CATEGORIES = ['GST', 'ITR', 'Company', 'LLP', 'Partnership', 'Audit', 'Other'];

const ClientFormModal = ({ client, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const isEdit = !!client;

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    resolver: zodResolver(schema),
    defaultValues: client ? {
      clientName: client.clientName,
      firmName: client.firmName || '',
      mobile: client.mobile,
      email: client.email || '',
      gstNumber: client.gstNumber || '',
      panNumber: client.panNumber || '',
      businessType: client.businessType,
      state: client.state || '',
      status: client.status || 'Active',
      notes: client.notes || '',
    } : { businessType: 'Proprietorship', status: 'Active' },
  });

  const [selectedCategories, setSelectedCategories] = useState(client?.category || []);

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = { ...data, category: selectedCategories };
      if (isEdit) {
        await clientApi.updateClient(client._id, payload);
        toast.success('Client updated');
      } else {
        await clientApi.createClient(payload);
        toast.success('Client created');
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
      title={isEdit ? 'Edit Client' : 'Add New Client'}
      size="lg"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit(onSubmit)} disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Client' : 'Add Client'}
          </button>
        </>
      }
    >
      <form className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="label">Client Name *</label>
            <input {...register('clientName')} className={`input ${errors.clientName ? 'input-error' : ''}`} placeholder="Full name" />
            {errors.clientName && <p className="error-text">{errors.clientName.message}</p>}
          </div>
          <div className="form-group">
            <label className="label">Firm / Business Name</label>
            <input {...register('firmName')} className="input" placeholder="Firm name (optional)" />
          </div>
          <div className="form-group">
            <label className="label">Mobile Number *</label>
            <input {...register('mobile')} className={`input ${errors.mobile ? 'input-error' : ''}`} placeholder="10-digit mobile" />
            {errors.mobile && <p className="error-text">{errors.mobile.message}</p>}
          </div>
          <div className="form-group">
            <label className="label">Email</label>
            <input {...register('email')} type="email" className="input" placeholder="email@example.com" />
          </div>
          <div className="form-group">
            <label className="label">GST Number</label>
            <input {...register('gstNumber')} className="input font-mono" placeholder="22AAAAA0000A1Z5" />
          </div>
          <div className="form-group">
            <label className="label">PAN Number</label>
            <input {...register('panNumber')} className="input font-mono" placeholder="AAAAA9999A" />
          </div>
          <div className="form-group">
            <label className="label">Business Type *</label>
            <select {...register('businessType')} className={`input ${errors.businessType ? 'input-error' : ''}`}>
              {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">State</label>
            <input {...register('state')} className="input" placeholder="Gujarat" />
          </div>
          <div className="form-group">
            <label className="label">Status</label>
            <select {...register('status')} className="input">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="label">Services / Category</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  selectedCategories.includes(cat)
                    ? 'bg-forest text-parchment border-forest'
                    : 'bg-white text-forest-400 border-forest-200 hover:border-forest-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="label">Notes</label>
          <textarea {...register('notes')} className="input" rows={3} placeholder="Any additional notes..." />
        </div>
      </form>
    </Modal>
  );
};

export default ClientFormModal;
