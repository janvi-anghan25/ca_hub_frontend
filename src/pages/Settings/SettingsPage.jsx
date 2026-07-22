import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Building2, Shield, Save, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { settingsApi } from '../../api/settingsApi';
import { authApi } from '../../api/authApi';
import { getProfile } from '../../store/slices/authSlice';
import { SectionLoader } from '../../components/common/LoadingSpinner';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'office', label: 'Office', icon: Building2, adminOnly: true },
  { id: 'security', label: 'Security', icon: Shield },
];

const InputField = ({ label, name, value, onChange, type = 'text', placeholder, disabled, hint }) => (
  <div>
    <label className="block text-xs font-medium text-forest-500 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`input w-full ${disabled ? 'bg-forest-50 text-forest-400 cursor-not-allowed' : ''}`}
    />
    {hint && <p className="text-xs text-forest-400 mt-1">{hint}</p>}
  </div>
);

// ── Profile Tab ───────────────────────────────────────────────────────────────
const ProfileTab = ({ user, onSaved }) => {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: user?.name || '', mobile: user?.mobile || '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({ name: user?.name || '', mobile: user?.mobile || '' });
  }, [user]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');

    setSaving(true);
    try {
      await settingsApi.updateProfile({ name: form.name.trim(), mobile: form.mobile });
      dispatch(getProfile());
      toast.success('Profile updated successfully');
      onSaved?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
      <InputField
        label="Full Name"
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Your full name"
      />
      <InputField
        label="Email Address"
        name="email"
        value={user?.email || ''}
        disabled
        hint="Email cannot be changed. Contact Super Admin if needed."
      />
      <InputField
        label="Mobile Number"
        name="mobile"
        value={form.mobile}
        onChange={handleChange}
        placeholder="10-digit mobile number"
        type="tel"
      />
      <div>
        <label className="block text-xs font-medium text-forest-500 mb-1">Role</label>
        <div className="input bg-forest-50 text-forest-400 capitalize cursor-not-allowed">
          {user?.role || '—'}
        </div>
      </div>

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Saving…
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Save size={14} /> Save Profile
          </span>
        )}
      </button>
    </form>
  );
};

// ── Office Tab ────────────────────────────────────────────────────────────────
const OfficeTab = () => {
  const [office, setOffice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await settingsApi.getMyOffice();
        setOffice(data.data);
        setForm({
          name: data.data?.name || '',
          mobile: data.data?.mobile || '',
          email: data.data?.email || '',
          gstNumber: data.data?.gstNumber || '',
          panNumber: data.data?.panNumber || '',
          invoicePrefix: data.data?.invoicePrefix || 'INV',
          addressLine1: data.data?.address?.line1 || '',
          addressCity: data.data?.address?.city || '',
          addressState: data.data?.address?.state || '',
          addressPincode: data.data?.address?.pincode || '',
        });
      } catch {
        toast.error('Could not load office settings');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Office name is required');

    setSaving(true);
    try {
      await settingsApi.updateMyOffice({
        name: form.name.trim(),
        mobile: form.mobile,
        email: form.email,
        gstNumber: form.gstNumber.toUpperCase(),
        panNumber: form.panNumber.toUpperCase(),
        invoicePrefix: form.invoicePrefix.trim() || 'INV',
        address: {
          line1: form.addressLine1,
          city: form.addressCity,
          state: form.addressState,
          pincode: form.addressPincode,
        },
      });
      toast.success('Office settings saved');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save office settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <SectionLoader />;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      {/* Basic details */}
      <div>
        <h4 className="text-xs font-semibold text-forest-400 uppercase tracking-wide mb-3">
          Basic Details
        </h4>
        <div className="space-y-4">
          <InputField
            label="Office / Firm Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Sharma & Associates"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Contact Mobile"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              placeholder="9876543210"
            />
            <InputField
              label="Contact Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="office@example.com"
            />
          </div>
        </div>
      </div>

      {/* Tax details */}
      <div>
        <h4 className="text-xs font-semibold text-forest-400 uppercase tracking-wide mb-3">
          Tax Identifiers
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="GST Number"
            name="gstNumber"
            value={form.gstNumber}
            onChange={handleChange}
            placeholder="22AAAAA0000A1Z5"
          />
          <InputField
            label="PAN Number"
            name="panNumber"
            value={form.panNumber}
            onChange={handleChange}
            placeholder="AAAAA0000A"
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <h4 className="text-xs font-semibold text-forest-400 uppercase tracking-wide mb-3">
          Address
        </h4>
        <div className="space-y-4">
          <InputField
            label="Address Line"
            name="addressLine1"
            value={form.addressLine1}
            onChange={handleChange}
            placeholder="Building / Street / Area"
          />
          <div className="grid grid-cols-3 gap-4">
            <InputField
              label="City"
              name="addressCity"
              value={form.addressCity}
              onChange={handleChange}
              placeholder="Mumbai"
            />
            <InputField
              label="State"
              name="addressState"
              value={form.addressState}
              onChange={handleChange}
              placeholder="Maharashtra"
            />
            <InputField
              label="Pincode"
              name="addressPincode"
              value={form.addressPincode}
              onChange={handleChange}
              placeholder="400001"
            />
          </div>
        </div>
      </div>

      {/* Billing */}
      <div>
        <h4 className="text-xs font-semibold text-forest-400 uppercase tracking-wide mb-3">
          Billing
        </h4>
        <div className="max-w-xs">
          <InputField
            label="Invoice Prefix"
            name="invoicePrefix"
            value={form.invoicePrefix}
            onChange={handleChange}
            placeholder="INV"
            hint="Prefix used in invoice numbers, e.g. INV-2024-001"
          />
        </div>
      </div>

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Saving…
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Save size={14} /> Save Office Settings
          </span>
        )}
      </button>
    </form>
  );
};

// ── Security Tab ──────────────────────────────────────────────────────────────
const SecurityTab = () => {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.currentPassword) return toast.error('Current password is required');
    if (form.newPassword.length < 8) return toast.error('New password must be at least 8 characters');
    if (!/[A-Z]/.test(form.newPassword) || !/[a-z]/.test(form.newPassword) || !/\d/.test(form.newPassword)) {
      return toast.error('Password must include uppercase, lowercase, and a number');
    }
    if (form.newPassword !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.currentPassword === form.newPassword) {
      return toast.error('New password must be different from current password');
    }

    setSaving(true);
    try {
      await authApi.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      toast.success('Password updated successfully');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      // toast handled by axios interceptor
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md space-y-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-forest mb-1">Change Password</p>
          <p className="text-xs text-forest-400 mb-4">
            Update your password regularly to keep your account secure. New password must be at
            least 8 characters and include uppercase, lowercase, and a number.
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-forest-500 mb-1">Current password</label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              autoComplete="current-password"
              className="input w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-400"
              aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
            >
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-forest-500 mb-1">New password</label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              autoComplete="new-password"
              className="input w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-400"
              aria-label={showNew ? 'Hide new password' : 'Show new password'}
            >
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-forest-500 mb-1">Confirm new password</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            className="input w-full"
          />
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Updating…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Shield size={14} /> Update Password
            </span>
          )}
        </button>
      </form>

      {/* <div className="card bg-amber-50 border border-amber-100">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0 mt-0.5">
            <CheckCircle2 size={16} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-forest">Session Security</p>
            <p className="text-xs text-forest-400 mt-0.5">
              Your sessions are secured with JWT tokens and automatic expiry. All API calls are
              validated server-side with role-based access control.
            </p>
          </div>
        </div>
      </div> */}
    </div>
  );
};

// ── Main SettingsPage ─────────────────────────────────────────────────────────
const SettingsPage = () => {
  const { user } = useSelector((s) => s.auth);
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState('profile');

  const visibleTabs = TABS.filter((t) => !t.adminOnly || isAdmin);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      <div className="card p-0 overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-forest-100 bg-forest-50/50 overflow-x-auto">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={[
                  'flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  activeTab === tab.id
                    ? 'border-forest text-forest bg-white'
                    : 'border-transparent text-forest-400 hover:text-forest-600 hover:bg-forest-50',
                ].join(' ')}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="p-6">
          {activeTab === 'profile' && <ProfileTab user={user} />}
          {activeTab === 'office' && isAdmin && <OfficeTab />}
          {activeTab === 'security' && <SecurityTab />}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
