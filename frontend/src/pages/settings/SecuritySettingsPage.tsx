import React, { useState } from 'react';
import { apiClient } from '../../services/api/client';
import { SettingsNav } from './SettingsNav';
import {
  KeyRound,
  Shield,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const SecuritySettingsPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clearNotifications = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearNotifications();

    if (!currentPassword) {
      setErrorMessage('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Mật khẩu mới và mật khẩu xác nhận không trùng khớp.');
      return;
    }

    try {
      setIsLoading(true);
      await apiClient.put('/auth/change-password', { currentPassword, newPassword });
      setSuccessMessage('Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới của bạn.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-7 pb-16">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5 sm:gap-3">
          <KeyRound className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600" />
          <span>Đổi Mật Khẩu & Bảo Mật</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-2">
          Cập nhật mật khẩu định kỳ để nâng cao tính bảo mật và bảo vệ dữ liệu học tập
        </p>
      </div>

      {/* Shared Navigation Tabs */}
      <SettingsNav />

      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm text-emerald-800">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm text-rose-800">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Security Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-8 md:p-10 shadow-sm space-y-6 sm:space-y-8">
        <div className="max-w-xl space-y-6">
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              <span>Thay đổi mật khẩu đăng nhập</span>
            </h3>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              Mật khẩu mạnh nên có độ dài từ 6 ký tự trở lên, kết hợp giữa chữ hoa, chữ thường, số và ký hiệu đặc biệt.
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Mật khẩu hiện tại
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại của bạn"
                  className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Mật khẩu mới
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Xác nhận lại mật khẩu mới
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại chính xác mật khẩu mới"
                  className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-base font-bold shadow-md shadow-indigo-100 flex items-center gap-2 transition"
            >
              <KeyRound className="w-5 h-5" />
              <span>{isLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
