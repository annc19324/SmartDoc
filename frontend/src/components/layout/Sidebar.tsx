import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Search,
  MessageSquareCode,
  FileText,
  BrainCircuit,
  CreditCard,
  Network,
  CalendarCheck,
  BarChart3,
  GraduationCap,
  ShieldCheck,
  LogOut,
  UploadCloud,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
      isActive
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
    }`;

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Logo */}
      <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <NavLink to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-100 dark:shadow-none">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              SmartDoc
            </h1>
            <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">AI Learning & RAG</p>
          </div>
        </NavLink>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
        {/* Core Learning Module */}
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Học tập thông minh</p>
          <div className="space-y-1">
            <NavLink to="/dashboard" className={navItemClass}>
              <LayoutDashboard className="w-4 h-4" />
              <span>Tổng quan</span>
            </NavLink>
            <NavLink to="/documents" className={navItemClass}>
              <BookOpen className="w-4 h-4" />
              <span>Kho tài liệu</span>
            </NavLink>
            <NavLink to="/search" className={navItemClass}>
              <Search className="w-4 h-4" />
              <span>Tìm kiếm Semantic</span>
            </NavLink>
            <NavLink to="/chat" className={navItemClass}>
              <MessageSquareCode className="w-4 h-4" />
              <span>Hỏi đáp AI RAG</span>
            </NavLink>
          </div>
        </div>

        {/* AI Study Tools */}
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Công cụ AI</p>
          <div className="space-y-1">
            <NavLink to="/summary" className={navItemClass}>
              <FileText className="w-4 h-4" />
              <span>Tóm tắt AI</span>
            </NavLink>
            <NavLink to="/quiz" className={navItemClass}>
              <BrainCircuit className="w-4 h-4" />
              <span>Luyện tập Trắc nghiệm</span>
            </NavLink>
            <NavLink to="/flashcards" className={navItemClass}>
              <CreditCard className="w-4 h-4" />
              <span>Thẻ Flashcards</span>
            </NavLink>
            <NavLink to="/mindmap" className={navItemClass}>
              <Network className="w-4 h-4" />
              <span>Sơ đồ tư duy (Mindmap)</span>
            </NavLink>
            <NavLink to="/study-plan" className={navItemClass}>
              <CalendarCheck className="w-4 h-4" />
              <span>Kế hoạch học tập AI</span>
            </NavLink>
            <NavLink to="/analytics" className={navItemClass}>
              <BarChart3 className="w-4 h-4" />
              <span>Tiến độ & Đề xuất AI</span>
            </NavLink>
          </div>
        </div>

        {/* Teacher Section */}
        {hasRole(['TEACHER', 'ADMIN']) && (
          <div>
            <p className="px-3 text-[11px] font-bold text-amber-500 uppercase tracking-wider mb-2">Giảng viên</p>
            <div className="space-y-1">
              <NavLink to="/teacher/courses" className={navItemClass}>
                <GraduationCap className="w-4 h-4" />
                <span>Quản lý Khóa học</span>
              </NavLink>
            </div>
          </div>
        )}

        {/* Admin Section */}
        {hasRole(['ADMIN']) && (
          <div>
            <p className="px-3 text-[11px] font-bold text-rose-500 uppercase tracking-wider mb-2">Quản trị viên</p>
            <div className="space-y-1">
              <NavLink to="/admin/metrics" className={navItemClass}>
                <ShieldCheck className="w-4 h-4" />
                <span>Thống kê Admin</span>
              </NavLink>
              <NavLink to="/admin/users" className={navItemClass}>
                <LayoutDashboard className="w-4 h-4" />
                <span>Quản lý Người dùng</span>
              </NavLink>
            </div>
          </div>
        )}
      </div>

      {/* Quick Upload CTA */}
      <div className="px-3.5 py-2">
        <NavLink
          to="/documents/upload"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 transition dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-sm"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Tải lên tài liệu mới</span>
        </NavLink>
      </div>

      {/* User Footer Profile */}
      <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=6366f1&color=fff`}
            alt={user?.fullName}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-100 dark:ring-slate-700"
          />
          <div className="truncate">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.fullName}</p>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-[10px] font-medium text-slate-400 capitalize">{user?.role.toLowerCase()}</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Đăng xuất"
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
