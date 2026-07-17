import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import api from '../../api/axiosInstance';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const createSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile'),
  email: z.string().email('Enter a valid email'),
  designation: z.string().optional().or(z.literal('')),
  department: z.string().optional().or(z.literal('')),
});

const updateSchema = createSchema.omit({ email: true }).extend({
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
});

const EmployeeFormModal = ({ employee, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [inviteCreds, setInviteCreds] = useState(null);
  const [copied, setCopied] = useState(false);
  const isEdit = !!employee;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(isEdit ? updateSchema : createSchema),
    defaultValues: employee
      ? {
          name: employee.name,
          mobile: employee.mobile,
          email: employee.email || '',
          designation: employee.designation || '',
          department: employee.department || '',
        }
      : {
          name: '',
          mobile: '',
          email: '',
          designation: '',
          department: '',
        },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEdit) {
        const { email, ...updateData } = data;
        await api.put(`/employees/${employee._id}`, updateData);
        toast.success('Employee updated');
        onSuccess();
      } else {
        const { data: res } = await api.post('/employees', data);
        const payload = res.data;
        toast.success('Employee created. Credentials sent by email.');
        setInviteCreds({
          loginId: payload.loginId || data.email,
          temporaryPassword: payload.temporaryPassword || null,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const copyCreds = async () => {
    if (!inviteCreds) return;
    const text = inviteCreds.temporaryPassword
      ? `Login ID: ${inviteCreds.loginId}\nPassword: ${inviteCreds.temporaryPassword}`
      : `Login ID: ${inviteCreds.loginId}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied');
    setTimeout(() => setCopied(false), 2000);
  };

  if (inviteCreds) {
    return (
      <Modal
        isOpen
        onClose={() => { setInviteCreds(null); onSuccess(); }}
        title="Employee login created"
        size="md"
        footer={
          <button
            className="btn-primary"
            onClick={() => { setInviteCreds(null); onSuccess(); }}
          >
            Done
          </button>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-forest-400">
            Login credentials have been emailed. The employee must change the temporary password on first login.
          </p>
          <div className="rounded-xl border border-forest-100 bg-forest-50 p-4 space-y-2">
            <div>
              <p className="text-xs font-medium text-forest-500 uppercase tracking-wide">Login ID (Email)</p>
              <p className="text-sm font-semibold font-mono text-forest mt-0.5 break-all">{inviteCreds.loginId}</p>
            </div>
            {inviteCreds.temporaryPassword && (
              <div>
                <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">
                  Temporary password (dev only)
                </p>
                <p className="text-sm font-mono font-semibold text-forest mt-0.5 break-all">
                  {inviteCreds.temporaryPassword}
                </p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={copyCreds}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy credentials'}
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? 'Edit Employee' : 'Add Employee'}
      size="md"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit(onSubmit)} disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Create & Send Login'}
          </button>
        </>
      }
    >
      <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" noValidate>
        {!isEdit && (
          <div className="sm:col-span-2 rounded-lg bg-forest-50 border border-forest-100 px-3 py-2.5 text-xs text-forest">
            An employee login will be created. Login ID (email) and a temporary password will be sent to their inbox.
          </div>
        )}
        <div className="form-group sm:col-span-2">
          <label className="label">Name *</label>
          <input
            {...register('name')}
            className={`input ${errors.name ? 'input-error' : ''}`}
            placeholder="Full name"
          />
          {errors.name && <p className="error-text">{errors.name.message}</p>}
        </div>
        <div className="form-group">
          <label className="label">Mobile *</label>
          <input
            {...register('mobile')}
            className={`input ${errors.mobile ? 'input-error' : ''}`}
            placeholder="9876543210"
          />
          {errors.mobile && <p className="error-text">{errors.mobile.message}</p>}
        </div>
        <div className="form-group">
          <label className="label">Email (Login ID) *</label>
          <input
            {...register('email')}
            type="email"
            className={`input ${errors.email ? 'input-error' : ''}`}
            placeholder="employee@office.com"
            disabled={isEdit}
          />
          {errors.email && <p className="error-text">{errors.email.message}</p>}
          {isEdit && (
            <p className="text-xs text-forest-400 mt-1">Login email cannot be changed here</p>
          )}
        </div>
        <div className="form-group">
          <label className="label">Designation</label>
          <input {...register('designation')} className="input" placeholder="CA, Accountant..." />
        </div>
        <div className="form-group">
          <label className="label">Department</label>
          <input {...register('department')} className="input" placeholder="GST / Audit..." />
        </div>
      </form>
    </Modal>
  );
};

export default EmployeeFormModal;
