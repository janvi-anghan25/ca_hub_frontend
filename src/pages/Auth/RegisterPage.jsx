import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { Eye, EyeOff, UserPlus, Check, X } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  email: z.string().email('Enter a valid email address'),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number')
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(8, 'Must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/\d/, 'Must contain a number'),
    role: z.enum(['admin', 'superadmin']).optional(),
});

const PasswordRule = ({ met, label }) => (
  <div className={`flex items-center gap-1.5 text-xs transition-colors ${met ? 'text-forest-500' : 'text-gray-400'}`}>
    {met ? <Check size={12} /> : <X size={12} />}
    <span>{label}</span>
  </div>
);

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((s) => s.auth);
  const [showPwd, setShowPwd] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const password = watch('password', '');

  const pwdRules = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter (A–Z)', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter (a–z)', met: /[a-z]/.test(password) },
    { label: 'One number (0–9)', met: /\d/.test(password) },
  ];

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
    return () => { dispatch(clearError()); };
  }, [isAuthenticated, navigate, dispatch]);

  const onSubmit = async (data) => {
    const result = await dispatch(registerUser(data));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/');
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl shadow-card border border-forest-200 p-8">
        <div className="mb-7">
          <h2 className="font-display text-2xl text-forest mb-1">Create your account</h2>
          <div className="page-title-rule mb-2" />
          <p className="text-gray-500 text-sm">Set up your CA Management account</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="form-group">
            <label className="label">Full Name *</label>
            <input
              {...register('name')}
              type="text"
              placeholder="Rajesh Sharma"
              className={`input ${errors.name ? 'input-error' : ''}`}
              autoComplete="name"
            />
            {errors.name && <p className="error-text">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="label">Email Address *</label>
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              className={`input ${errors.email ? 'input-error' : ''}`}
              autoComplete="email"
            />
            {errors.email && <p className="error-text">{errors.email.message}</p>}
          </div>

          {/* Mobile */}
          <div className="form-group">
            <label className="label">Mobile Number</label>
            <input
              {...register('mobile')}
              type="tel"
              placeholder="9876543210"
              className={`input ${errors.mobile ? 'input-error' : ''}`}
              autoComplete="tel"
              maxLength={10}
            />
            {errors.mobile && <p className="error-text">{errors.mobile.message}</p>}
          </div>

          {/* Role */}
          <div className="form-group">
            <label className="label">Role</label>
            <select {...register('role')} className="input">
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="label">Password *</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPwd ? 'text' : 'password'}
                placeholder="Create a strong password"
                className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="error-text">{errors.password.message}</p>}

            {/* Password strength rules */}
            {password.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-1 bg-gray-50 rounded-lg p-2.5">
                {pwdRules.map((rule) => (
                  <PasswordRule key={rule.label} met={rule.met} label={rule.label} />
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary w-full btn-lg mt-2"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <UserPlus size={16} />
                Create Account
              </span>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-forest-500 hover:text-forest font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
