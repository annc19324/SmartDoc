import React, { useState } from 'react';
import { apiClient } from '../../services/api/client';
import { SettingsNav } from './SettingsNav';
import {
  Laptop,
  Smartphone,
  LogOut,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Clock,
  MapPin,
} from 'lucide-react';

export const SessionsSettingsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clearNotifications = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleLogoutAll = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi tất cả các thiết bị khác không?')) return;
    clearNotifications();

    try {
      setIsLoading(true);
      await apiClient.post('/auth/logout-all');
      setSuccessMessage('Đã đăng xuất tài khoản khỏi tất cả các thiết bị khác thành công.');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Có lỗi xảy ra khi đăng xuất thiết bị.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-7 pb-16">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5 sm:gap-3">
          <Laptop className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600" />
          <span>Phiên Đăng Nhập & Thiết Bị</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-2">
          Theo dõi và kiểm soát các thiết bị đang đăng nhập vào tài khoản của bạn để phòng ngừa rủi ro
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

      {/* Sessions Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-8 md:p-10 shadow-sm space-y-6 sm:space-y-8">
        <div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <span>Thiết bị đang hoạt động</span>
          </h3>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            Nếu phát hiện thiết bị hoặc vị trí bất thường, bạn nên đăng xuất ngay và đổi lại mật khẩu.
          </p>
        </div>

        <div className="space-y-4">
          {/* Current Device Session */}
          <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Laptop className="w-6 h-6" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                  Trình duyệt hiện tại (Windows / Chrome)
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Đang hoạt động
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    Hà Nội, Việt Nam (IP này)
                  </span>
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 px-3 py-1.5 rounded-xl shrink-0">
              Thiết bị này
            </span>
          </div>

          {/* Other Session */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
                  Thiết bị di động (SmartDoc Mobile / Safari)
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Hoạt động 2 ngày trước
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    Hà Nội, Việt Nam
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
          <p className="text-sm text-slate-500">
            Đăng xuất trên tất cả các trình duyệt và thiết bị khác ngoại trừ phiên làm việc này.
          </p>
          <button
            onClick={handleLogoutAll}
            disabled={isLoading}
            className="py-3 px-5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl text-base font-bold flex items-center gap-2.5 transition"
          >
            <LogOut className="w-5 h-5" />
            <span>{isLoading ? 'Đang xử lý...' : 'Đăng xuất tất cả thiết bị khác'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
