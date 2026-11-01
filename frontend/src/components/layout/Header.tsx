import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {
  Search,
  Bell,
  Sparkles,
  Upload,
  CheckCheck,
  Menu,
  User,
  Settings,
  Shield,
  LogOut,
  UploadCloud,
  BookOpen,
  ChevronDown,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { systemApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const { data: notifications = [], refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => systemApi.listNotifications(),
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleMarkAllRead = async () => {
    await systemApi.markAllNotificationsAsRead();
    refetch();
  };

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    navigate('/login');
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Quản trị viên';
      case 'TEACHER':
        return 'Giảng viên';
      case 'STUDENT':
      default:
        return 'Sinh viên';
    }
  };

  return (
    <header className="h-16 sm:h-18 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-5 md:px-8 flex items-center justify-between sticky top-0 z-30 gap-2 sm:gap-4 no-print">
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={onToggleMobileSidebar}
        title="Mở menu"
        className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 shrink-0"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Global Semantic Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative w-full max-w-lg">
        <Search className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-slate-400 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm ngữ nghĩa (vd: Quick Sort, BST, Dijkstra)..."
          className="w-full pl-9 sm:pl-11 pr-11 sm:pr-28 py-2 sm:py-2.5 bg-slate-100 dark:bg-slate-800 text-sm sm:text-base rounded-2xl border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
        />
        <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 dark:bg-slate-700 dark:text-indigo-400 px-2 sm:px-2.5 py-1 rounded-xl font-bold">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="hidden sm:inline">AI Search</span>
        </div>
      </form>

      {/* Action Items */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Upload Button */}
        <button
          onClick={() => navigate('/documents/upload')}
          className="hidden md:flex items-center gap-2.5 px-6 py-2.5 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-sm transition shrink-0"
        >
          <UploadCloud className="w-5 h-5 shrink-0" />
          <span>Tải tài liệu</span>
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => {
              setShowNotifications((prev) => !prev);
              setShowUserMenu(false);
            }}
            title="Thông báo"
            className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
            )}
          </button>

          {/* Notifications Panel */}
          {showNotifications && (
            <>
              {/* Mobile overlay backdrop */}
              <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs sm:hidden z-40 animate-in fade-in duration-150"
                onClick={() => setShowNotifications(false)}
              />

              <div className="fixed inset-x-3.5 top-17 sm:top-full sm:absolute sm:inset-auto sm:right-0 sm:mt-3 w-auto sm:w-96 max-w-[calc(100vw-1.75rem)] bg-white dark:bg-slate-900 rounded-3xl sm:rounded-2xl shadow-2xl sm:shadow-xl border border-slate-200 dark:border-slate-800 py-3.5 z-50 animate-in fade-in slide-in-from-top-3 sm:slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between px-4 sm:px-5 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                      Thông báo
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 text-xs font-bold">
                        {unreadCount} mới
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>Đã đọc hết</span>
                    </button>
                  )}
                </div>

                <div className="max-h-[68vh] sm:max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 overscroll-contain">
                  {notifications.length === 0 ? (
                    <div className="py-8 px-4 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-2 text-slate-400">
                        <Bell className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Không có thông báo mới</p>
                      <p className="text-xs text-slate-400 mt-1">Các cập nhật AI, đề thi và tài liệu sẽ xuất hiện tại đây.</p>
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (item.link) {
                            navigate(item.link);
                            setShowNotifications(false);
                          }
                        }}
                        className={`p-3.5 sm:p-4 text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer flex items-start gap-3 ${
                          !item.isRead ? 'bg-indigo-50/60 dark:bg-indigo-950/25' : ''
                        }`}
                      >
                        <div className="p-2 rounded-xl bg-indigo-100/70 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{item.title}</p>
                            {!item.isRead && (
                              <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"></span>
                            )}
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 line-clamp-2 leading-relaxed">
                            {item.message}
                          </p>
                          <span className="text-[11px] text-slate-400 mt-1.5 block">
                            {new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}{' '}
                            • {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Top Right User Profile Dropdown (Hidden on mobile phones, visible from tablet up) */}
        {user ? (
          <div className="hidden sm:block relative pl-3 border-l border-slate-200 dark:border-slate-800" ref={userMenuRef}>
            <button
              onClick={() => {
                setShowUserMenu((prev) => !prev);
                setShowNotifications(false);
              }}
              className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition group"
            >
              <img
                src={
                  user.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'User')}&background=2563eb&color=fff`
                }
                alt={user.fullName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-100 dark:ring-slate-700 shadow-2xs shrink-0"
              />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-base font-bold text-slate-800 dark:text-slate-200 leading-tight group-hover:text-indigo-600 transition truncate max-w-[150px]">
                  {user.fullName}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {getRoleLabel(user.role)}
                </span>
              </div>
              <ChevronDown className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-600 transition shrink-0" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header User Info */}
                <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3.5">
                  <img
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'User')}&background=2563eb&color=fff`
                    }
                    alt={user.fullName}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-100 shrink-0"
                  />
                  <div className="truncate">
                    <p className="text-base font-bold text-slate-900 dark:text-white truncate">{user.fullName}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2.5 space-y-1 text-base text-slate-700 dark:text-slate-300">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/settings/profile');
                    }}
                    className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left"
                  >
                    <User className="w-5 h-5 text-indigo-500" />
                    <span>Hồ sơ cá nhân</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/settings/security');
                    }}
                    className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left"
                  >
                    <Shield className="w-5 h-5 text-emerald-500" />
                    <span>Đổi mật khẩu & Bảo mật</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/documents');
                    }}
                    className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left"
                  >
                    <BookOpen className="w-5 h-5 text-cyan-500" />
                    <span>Kho tài liệu của tôi</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/documents/upload');
                    }}
                    className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left"
                  >
                    <UploadCloud className="w-5 h-5 text-amber-500" />
                    <span>Tải tài liệu mới</span>
                  </button>
                </div>

                {/* Logout Button */}
                <div className="pt-2 px-2.5 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-semibold transition text-left text-base"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Đăng xuất tài khoản</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-slate-800">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2.5 text-base font-semibold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Đăng nhập
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-4 py-2.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition"
            >
              Đăng ký
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
