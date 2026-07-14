import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import api from '../../api/axiosInstance';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const EmployeeFormModal = ({ employee, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [inviteCreds, setInviteCreds] = useState(null);
  const [copied, setCopied] = useState(false);
  const isEdit = !!employee;

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: employee
      ? {
          name: employee.name,
          mobile: employee.mobile,
          email: employee.email || '',
          designation: employee.designation || '',
          department: employee.department || '',
        }
      : {},
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
        // Show credentials panel (esp. useful in local/dev when SMTP is skipped)
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
              <p className="text-sm font-semibold font-mono text-forest mt-0.5">{inviteCreds.loginId}</p>
            </div>
            {inviteCreds.temporaryPassword && (
              <div>
                <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">
                  Temporary password (dev only)
                </p>
                <p className="text-sm font-mono font-semibold text-forest mt-0.5">
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
      <form className="grid grid-cols-2 gap-4">
        {!isEdit && (
          <div className="col-span-2 rounded-lg bg-forest-50 border border-forest-100 px-3 py-2.5 text-xs text-forest">
            An employee login will be created. Login ID (email) and a temporary password will be sent to their inbox.
          </div>
        )}
        <div className="form-group col-span-2">
          <label className="label">Name *</label>
          <input {...register('name', { required: 'Name is required', minLength: 2 })} className="input" placeholder="Full name" />
          {errors.name && <p className="error-text">{errors.name.message}</p>}
        </div>
        <div className="form-group">
          <label className="label">Mobile *</label>
          <input
            {...register('mobile', {
              required: 'Mobile is required',
              pattern: { value: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit mobile' },
            })}
            className="input"
            placeholder="9876543210"
          />
          {errors.mobile && <p className="error-text">{errors.mobile.message}</p>}
        </div>
        <div className="form-group">
          <label className="label">Email (Login ID) *</label>
          <input
            {...register('email', {
              required: !isEdit ? 'Email is required for login' : false,
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
            })}
            type="email"
            className="input"
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
