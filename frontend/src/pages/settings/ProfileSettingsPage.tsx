import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/api/client';
import { SettingsNav } from './SettingsNav';
import {
  User,
  CheckCircle2,
  AlertCircle,
  Save,
  Camera,
  Upload,
} from 'lucide-react';

export const ProfileSettingsPage: React.FC = () => {
  const { user } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clearNotifications = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Vui lòng chọn tệp định dạng hình ảnh (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Dung lượng ảnh không được vượt quá 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
        setSuccessMessage('Đã tải ảnh từ thiết bị thành công! Nhấn "Lưu thay đổi" để áp dụng.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    clearNotifications();

    try {
      setIsLoading(true);
      await apiClient.put('/auth/profile', { fullName, avatar });
      setSuccessMessage('Cập nhật thông tin cá nhân thành công!');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-7 pb-16">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5 sm:gap-3">
          <User className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600" />
          <span>Hồ Sơ & Thông Tin Cá Nhân</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-2">
          Quản lý ảnh đại diện, tên hiển thị và thông tin tài khoản người dùng
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

      {/* Profile Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-8 md:p-10 shadow-sm space-y-6 sm:space-y-8">
        <div className="flex flex-wrap items-center gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <img
              src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'User')}&background=2563eb&color=fff`}
              alt="Avatar"
              className="w-24 h-24 rounded-3xl object-cover ring-4 ring-indigo-50 dark:ring-slate-800 shadow-md"
            />
            <div className="absolute inset-0 bg-black/40 rounded-3xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition duration-200">
              <Camera className="w-6 h-6 mb-1" />
              <span className="text-xs font-bold">Đổi ảnh</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">{fullName || 'Họ và tên'}</h3>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-sm font-semibold flex items-center gap-2 transition"
              >
                <Upload className="w-4 h-4" />
                <span>Tải ảnh từ thiết bị</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageFileChange}
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
              />
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-xl">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Họ và tên hiển thị
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Địa chỉ Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-base text-slate-500 cursor-not-allowed"
            />
            <p className="text-xs text-slate-400 mt-1.5">Email được cố định để xác thực hệ thống và nhận mã OTP.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Hoặc nhập liên kết ảnh đại diện (Avatar URL)
            </label>
            <input
              type="text"
              value={avatar.startsWith('data:') ? '' : avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            />
            {avatar.startsWith('data:') && (
              <p className="text-xs text-emerald-600 mt-1.5">✓ Đang chọn ảnh từ thiết bị của bạn.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-base font-bold shadow-md shadow-indigo-100 flex items-center gap-2 transition"
          >
            <Save className="w-5 h-5" />
            <span>{isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
