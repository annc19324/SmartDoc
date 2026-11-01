import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/api/client';
import {
  User,
  Shield,
  KeyRound,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Laptop,
  Smartphone,
  Save,
  Lock,
  Camera,
  Upload,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'sessions'>('profile');

  // Profile Form state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Status states
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

  // Update Profile
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

  // Change Password
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
      setSuccessMessage('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout All Sessions
  const handleLogoutAll = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi tất cả các thiết bị khác không?')) return;
    clearNotifications();

    try {
      setIsLoading(true);
      await apiClient.post('/auth/logout-all');
      setSuccessMessage('Đã đăng xuất tài khoản khỏi tất cả các thiết bị khác thành công.');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Shield className="w-7 h-7 text-indigo-600" />
          <span>Cài Đặt & Trung Tâm Bảo Mật</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1.5">
          Quản lý thông tin tài khoản, đổi mật khẩu và giám sát các phiên đăng nhập
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-sm font-semibold gap-6">
        <button
          onClick={() => {
            setActiveTab('profile');
            clearNotifications();
          }}
          className={`pb-3 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'profile'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4.5 h-4.5" />
          <span>Thông tin cá nhân</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('security');
            clearNotifications();
          }}
          className={`pb-3 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'security'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <KeyRound className="w-4.5 h-4.5" />
          <span>Đổi mật khẩu & Bảo mật</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('sessions');
            clearNotifications();
          }}
          className={`pb-3 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'sessions'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Laptop className="w-4.5 h-4.5" />
          <span>Phiên đăng nhập & Thiết bị</span>
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-700">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tab 1: Profile Information */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center gap-5 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <img
                src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'User')}&background=2563eb&color=fff`}
                alt="Avatar"
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-50 dark:ring-slate-800 shadow"
              />
              <div className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition duration-200">
                <Camera className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-bold">Đổi ảnh</span>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{fullName || 'Họ và tên'}</h3>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Tải ảnh từ thiết bị</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Họ và tên hiển thị
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Địa chỉ Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500 cursor-not-allowed"
              />
              <p className="text-[11px] text-slate-400 mt-1">Email được cố định để xác thực và nhận OTP.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Hoặc nhập URL Ảnh đại diện (Avatar Link)
              </label>
              <input
                type="text"
                value={avatar.startsWith('data:') ? '' : avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
              {avatar.startsWith('data:') && (
                <p className="text-[11px] text-emerald-600 mt-1">✓ Đang chọn ảnh từ thiết bị của bạn.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 flex items-center gap-1.5 transition"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Security & Password */}
      {activeTab === 'security' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="max-w-lg space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Thay đổi mật khẩu</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Để bảo vệ tài khoản, nên đặt mật khẩu dài tối thiểu 6 ký tự gồm chữ, số và ký tự đặc biệt.
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 flex items-center gap-1.5 transition"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: Active Sessions & Devices */}
      {activeTab === 'sessions' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Thiết bị & Phiên đăng nhập</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Danh sách các phiên làm việc đang duy trì đăng nhập trên tài khoản của bạn.
            </p>
          </div>

          <div className="space-y-3">
            {/* Current Device */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Laptop className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Trình duyệt hiện tại (Windows / Chrome)
                  </p>
                  <p className="text-[11px] text-slate-400">Đang hoạt động • Phiên làm việc này</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                Hiện tại
              </span>
            </div>

            {/* Other mock session */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    SmartDoc Mobile App / Safari
                  </p>
                  <p className="text-[11px] text-slate-400">Hoạt động lần cuối 2 ngày trước</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleLogoutAll}
              disabled={isLoading}
              className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-2 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất khỏi tất cả các thiết bị khác</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
