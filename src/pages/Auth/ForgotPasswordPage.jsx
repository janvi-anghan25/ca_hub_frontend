import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';
import { authApi } from '../../api/authApi';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setSubmittedEmail(email);
      setSent(true);
      toast.success('OTP sent! Check your email.');
    } catch {
      // Error toast shown by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigate('/reset-password', { state: { email: submittedEmail } });
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8">
        {!sent ? (
          <>
            {/* Form state */}
            <div className="mb-7">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                <Mail size={24} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Forgot your password?</h2>
              <p className="text-gray-500 text-sm">
                Enter your registered email and we'll send you a 6-digit OTP to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="form-group">
                <label className="label">Email address</label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className={`input ${errors.email ? 'input-error' : ''}`}
                  autoComplete="email"
                  autoFocus
                />
                {errors.email && <p className="error-text">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                className="btn-primary w-full btn-lg"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending OTP...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Send size={16} />
                    Send Reset OTP
                  </span>
                )}
              </button>
            </form>
          </>
        ) : (
          <>
            {/* Success state */}
            <div className="text-center mb-7">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail size={32} className="text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-500 text-sm">
                We've sent a 6-digit OTP to{' '}
                <strong className="text-gray-700">{submittedEmail}</strong>.
                <br />
                Please check your inbox (and spam folder).
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
              <p className="text-xs text-blue-700 font-medium">💡 Tip</p>
              <p className="text-xs text-blue-600 mt-1">
                The OTP is valid for <strong>10 minutes</strong>. If you don't see the email, check your spam folder or try again.
              </p>
            </div>

            <button onClick={handleContinue} className="btn-primary w-full btn-lg mb-3">
              Enter OTP & Reset Password
            </button>

            <button
              onClick={() => setSent(false)}
              className="btn-secondary w-full"
            >
              Use a different email
            </button>
          </>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
