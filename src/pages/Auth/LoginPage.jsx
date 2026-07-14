import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, clearError } from '../../store/slices/authSlice';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const redirectAfterAuth = (user) => {
  if (user?.mustChangePassword) return '/change-password';
  if (user?.role === 'superadmin') return '/super-admin';
  return '/';
};

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useSelector((s) => s.auth);
  const [showPwd, setShowPwd] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(redirectAfterAuth(user), { replace: true });
    }
    return () => { dispatch(clearError()); };
  }, [isAuthenticated, user, navigate, dispatch]);

  const onSubmit = async (data) => {
    const result = await dispatch(login(data));
    if (login.fulfilled.match(result)) {
      const loggedInUser = result.payload.user;
      toast.success(loggedInUser?.mustChangePassword ? 'Please set a new password' : 'Welcome back!');
      navigate(redirectAfterAuth(loggedInUser), { replace: true });
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl shadow-card border border-forest-200 p-8">
        <div className="mb-7">
          <h2 className="font-display text-2xl text-forest mb-1">Welcome back</h2>
          <div className="page-title-rule mb-2" />
          <p className="text-gray-500 text-sm">Sign in to your account to continue</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-group">
            <label className="label">Email address</label>
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              className={`input ${errors.email ? 'input-error' : ''}`}
              autoComplete="email"
            />
            {errors.email && <p className="error-text">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <div className="flex items-center justify-between mb-1">
              <label className="label mb-0">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs text-forest-500 hover:text-forest font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                {...register('password')}
                type={showPwd ? 'text' : 'password'}
                placeholder="Enter your password"
                className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="error-text">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            className="btn-primary w-full btn-lg mt-2"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <LogIn size={16} />
                Sign In
              </span>
            )}
          </button>
        </form>

        {/* <p className="text-center text-sm text-gray-400 mt-6">
          Accounts are created by your Super Admin. Contact them if you need access.
        </p> */}
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
