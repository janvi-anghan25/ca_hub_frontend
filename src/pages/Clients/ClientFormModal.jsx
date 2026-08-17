import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useRef } from 'react';
import { Camera, X } from 'lucide-react';
import { clientApi } from '../../api/clientApi';
import Modal from '../../components/common/Modal';
import ClientAvatar from '../../components/common/ClientAvatar';
import toast from 'react-hot-toast';

const CATEGORIES = ['GST', 'ITR', 'Company', 'LLP', 'Partnership', 'Audit', 'Other'];
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

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
  category: z
    .array(z.enum(CATEGORIES))
    .min(1, 'Select at least one service'),
});

const BUSINESS_TYPES = ['Proprietorship', 'Partnership', 'LLP', 'Private Limited', 'Public Limited', 'Trust', 'HUF', 'Other'];

const ClientFormModal = ({ client, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(client?.photo || null);
  const fileInputRef = useRef(null);
  const isEdit = !!client;

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
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
      category: client.category || [],
    } : {
      businessType: 'Proprietorship',
      status: 'Active',
      category: [],
    },
  });

  const selectedCategories = watch('category') || [];
  const clientNameVal = watch('clientName') || client?.clientName || '';

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      return toast.error('Only JPG, PNG or WebP images are allowed');
    }
    if (file.size > MAX_PHOTO_BYTES) {
      return toast.error('Image must be 5 MB or smaller');
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const toggleCategory = (cat) => {
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter((c) => c !== cat)
      : [...selectedCategories, cat];
    setValue('category', next, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let targetId = client?._id;
      if (isEdit) {
        await clientApi.updateClient(client._id, data);
        toast.success('Client updated');
      } else {
        const res = await clientApi.createClient(data);
        targetId = res.data.data?._id;
        toast.success('Client created');
      }

      if (photoFile && targetId) {
        try {
          const formData = new FormData();
          formData.append('photo', photoFile);
          await clientApi.uploadPhoto(targetId, formData);
        } catch {
          toast.error('Client saved, but photo upload failed');
        }
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
        {/* Photo uploader */}
        <div className="flex items-center gap-4 p-3 bg-forest-50/70 border border-forest-100 rounded-xl">
          <div className="relative group flex-shrink-0">
            <ClientAvatar
              name={clientNameVal}
              photo={photoPreview}
              size="lg"
              rounded="xl"
              variant="dark"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-white border border-forest-200 text-forest-500 hover:text-forest hover:border-forest-400 shadow-sm transition-colors"
              title="Upload photo"
            >
              <Camera size={14} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoSelect}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-forest">Client Profile Photo</p>
            <p className="text-[11px] text-forest-400 mt-0.5">JPG, PNG or WebP up to 5MB. Shown in client lists and details.</p>
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-medium text-forest-600 hover:text-forest underline"
              >
                {photoPreview ? 'Change Photo' : 'Upload Photo'}
              </button>
              {photoPreview && photoFile && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-xs font-medium text-red-500 hover:text-red-700 ml-2"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
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
            {errors.businessType && <p className="error-text">{errors.businessType.message}</p>}
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
          <label className="label">Services / Category *</label>
          <div
            className={`flex flex-wrap gap-2 mt-1 rounded-lg p-1 ${
              errors.category ? 'ring-2 ring-red-400' : ''
            }`}
            role="group"
            aria-required="true"
            aria-invalid={!!errors.category}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                aria-pressed={selectedCategories.includes(cat)}
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
          {errors.category && <p className="error-text">{errors.category.message}</p>}
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
