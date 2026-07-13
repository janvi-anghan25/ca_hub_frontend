import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, KeyRound, ArrowLeft, Check, X, ShieldCheck } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';
import { authApi } from '../../api/authApi';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

const schema = z
  .object({
    email: z.string().email('Enter a valid email'),
    newPassword: z
      .string()
      .min(8, 'Must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[a-z]/, 'Must contain a lowercase letter')
      .regex(/\d/, 'Must contain a number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const OTP_LENGTH = 6;

const PasswordRule = ({ met, label }) => (
  <div className={`flex items-center gap-1.5 text-xs transition-colors ${met ? 'text-emerald-600' : 'text-gray-400'}`}>
    {met ? <Check size={12} /> : <X size={12} />}
    <span>{label}</span>
  </div>
);

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const prefillEmail = location.state?.email || '';

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: prefillEmail },
  });

  const password = watch('newPassword', '');
  const pwdRules = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase (A–Z)', met: /[A-Z]/.test(password) },
    { label: 'One lowercase (a–z)', met: /[a-z]/.test(password) },
    { label: 'One number (0–9)', met: /\d/.test(password) },
  ];

  // OTP input handlers
  const handleOtpChange = (idx, value) => {
    const cleaned = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[idx] = cleaned;
    setOtp(next);
    if (cleaned && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace') {
      if (otp[idx]) {
        const next = [...otp];
        next[idx] = '';
        setOtp(next);
      } else if (idx > 0) {
        inputRefs.current[idx - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    } else if (e.key === 'ArrowRight' && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (pasted) {
      const next = Array(OTP_LENGTH).fill('');
      pasted.split('').forEach((ch, i) => { next[i] = ch; });
      setOtp(next);
      const lastIdx = Math.min(pasted.length, OTP_LENGTH - 1);
      inputRefs.current[lastIdx]?.focus();
    }
    e.preventDefault();
  };

  const otpValue = otp.join('');
  const isOtpComplete = otpValue.length === OTP_LENGTH;

  const onSubmit = async (data) => {
    if (!isOtpComplete) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const { data: res } = await authApi.resetPassword({
        email: data.email,
        otp: otpValue,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      localStorage.setItem('accessToken', res.data.accessToken);
      dispatch(setUser(res.data.user));
      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/'), 1800);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <ShieldCheck size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Your password has been updated successfully. Redirecting you to the dashboard…
          </p>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full animate-pulse" style={{ width: '100%' }} />
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8">
        <div className="mb-7">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
            <KeyRound size={24} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Reset password</h2>
          <p className="text-gray-500 text-sm">
            Enter the OTP from your email and choose a new password.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div className="form-group">
            <label className="label">Email address</label>
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              className={`input ${errors.email ? 'input-error' : ''}`}
              autoComplete="email"
              readOnly={!!prefillEmail}
            />
            {errors.email && <p className="error-text">{errors.email.message}</p>}
          </div>

          {/* OTP */}
          <div className="form-group">
            <label className="label">6-Digit OTP</label>
            <div className="flex gap-2 mt-1" onPaste={handleOtpPaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className={`
                    w-full aspect-square text-center text-xl font-bold rounded-xl border-2 transition-all outline-none
                    ${digit ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-gray-50 text-gray-700'}
                    focus:border-blue-500 focus:bg-blue-50 focus:ring-2 focus:ring-blue-100
                  `}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              Check your email for the OTP. Valid for 10 minutes.
            </p>
          </div>

          {/* New Password */}
          <div className="form-group">
            <label className="label">New Password</label>
            <div className="relative">
              <input
                {...register('newPassword')}
                type={showPwd ? 'text' : 'password'}
                placeholder="Create a strong password"
                className={`input pr-10 ${errors.newPassword ? 'input-error' : ''}`}
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
            {errors.newPassword && <p className="error-text">{errors.newPassword.message}</p>}

            {password.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-1 bg-gray-50 rounded-lg p-2.5">
                {pwdRules.map((rule) => (
                  <PasswordRule key={rule.label} met={rule.met} label={rule.label} />
                ))}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="label">Confirm New Password</label>
            <div className="relative">
              <input
                {...register('confirmPassword')}
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repeat your new password"
                className={`input pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="error-text">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary w-full btn-lg"
            disabled={loading || !isOtpComplete}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Resetting password...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <KeyRound size={16} />
                Reset Password
              </span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-500">
            Didn't get the OTP?{' '}
            <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800 font-medium">
              Resend OTP
            </Link>
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
