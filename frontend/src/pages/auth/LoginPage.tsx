import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle, UserCheck, Eye, EyeOff, Home } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await login(data);
      navigate(redirect);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick 1-click test credentials
  const fillCredentials = (email: string, pass: string) => {
    setValue('email', email);
    setValue('password', pass);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <img src="/logo.png" alt="SmartDoc Logo" className="w-16 h-16 object-contain mb-2 drop-shadow-sm" />
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Đăng nhập vào SmartDoc</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Nền tảng học tập thông minh & Hỏi đáp RAG AI
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 flex items-center gap-2.5 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Địa chỉ Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                {...register('email')}
                placeholder="name@smartdoc.edu.vn"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
            </div>
            {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Mật khẩu</label>
              <Link
                to="/forgot-password"
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-[11px] text-rose-500 mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Đăng nhập</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Login Pills */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
            Chọn tài khoản demo nhanh
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('student@smartdoc.edu.vn', 'Student@123456')}
              className="py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition"
            >
              <UserCheck className="w-3 h-3" /> Sinh viên
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('teacher@smartdoc.edu.vn', 'Teacher@123456')}
              className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition"
            >
              <UserCheck className="w-3 h-3" /> Giảng viên
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('admin@smartdoc.edu.vn', 'Admin@123456')}
              className="py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition"
            >
              <UserCheck className="w-3 h-3" /> Admin
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-2 text-center text-xs text-slate-500">
          <p>
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
              Đăng ký ngay
            </Link>
          </p>
          <Link
            to="/dashboard"
            className="text-[11px] font-medium text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 transition mt-2"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Khám phá SmartDoc mà không cần đăng nhập</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
