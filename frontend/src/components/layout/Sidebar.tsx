import React, { useState } from 'react';
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
  Settings,
  LogIn,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  // Collapsible section states
  const [sections, setSections] = useState({
    learning: true,
    aiTools: true,
    teacher: true,
    admin: true,
  });

  const toggleSection = (key: keyof typeof sections) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center ${isCollapsed ? 'justify-center px-2.5' : 'gap-3.5 px-4'} py-3 rounded-xl font-medium text-base transition-all duration-150 ${
      isActive
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
    }`;

  const sidebarContent = (
    <aside
      className={`${
        isCollapsed ? 'w-20' : 'w-72 max-w-[85vw]'
      } bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-40 select-none transition-all duration-300 ${
        isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
      }`}
    >
      {/* Brand Logo & Collapse Toggle */}
      <div className="px-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 h-18">
        <NavLink
          to="/dashboard"
          onClick={onCloseMobile}
          className="flex items-center gap-3 overflow-hidden"
          title="SmartDoc AI"
        >
          <img src="/logo.png" alt="SmartDoc Logo" className="w-10 h-10 object-contain rounded-xl shrink-0" />
          {!isCollapsed && (
            <div className="truncate">
              <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                SmartDoc
              </h1>
              <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">AI Learning & RAG</p>
            </div>
          )}
        </NavLink>

        <div className="flex items-center">
          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
            className="hidden md:flex p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5 custom-scrollbar">
        {/* Core Learning Section */}
        <div>
          {!isCollapsed ? (
            <button
              onClick={() => toggleSection('learning')}
              className="w-full px-3 flex items-center justify-between text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 uppercase tracking-wider mb-2.5 transition"
            >
              <span>Học tập thông minh</span>
              {sections.learning ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <div className="w-full border-t border-slate-200 dark:border-slate-800 my-2" />
          )}

          {(sections.learning || isCollapsed) && (
            <div className="space-y-1.5">
              <NavLink to="/dashboard" onClick={onCloseMobile} className={navItemClass} title="Tổng quan">
                <LayoutDashboard className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>Tổng quan</span>}
              </NavLink>
              <NavLink to="/documents" onClick={onCloseMobile} className={navItemClass} title="Kho tài liệu">
                <BookOpen className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>Kho tài liệu</span>}
              </NavLink>
              <NavLink to="/search" onClick={onCloseMobile} className={navItemClass} title="Tìm kiếm Semantic">
                <Search className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>Tìm kiếm Semantic</span>}
              </NavLink>
              <NavLink to="/chat" onClick={onCloseMobile} className={navItemClass} title="Hỏi đáp AI RAG">
                <MessageSquareCode className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>Hỏi đáp AI RAG</span>}
              </NavLink>
            </div>
          )}
        </div>

        {/* AI Study Tools Section */}
        <div>
          {!isCollapsed ? (
            <button
              onClick={() => toggleSection('aiTools')}
              className="w-full px-3 flex items-center justify-between text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 uppercase tracking-wider mb-2.5 transition"
            >
              <span>Công cụ AI</span>
              {sections.aiTools ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <div className="w-full border-t border-slate-200 dark:border-slate-800 my-2" />
          )}

          {(sections.aiTools || isCollapsed) && (
            <div className="space-y-1.5">
              <NavLink to="/summary" onClick={onCloseMobile} className={navItemClass} title="Tóm tắt AI">
                <FileText className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>Tóm tắt AI</span>}
              </NavLink>
              <NavLink to="/quiz" onClick={onCloseMobile} className={navItemClass} title="Luyện tập Trắc nghiệm">
                <BrainCircuit className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>Luyện tập Trắc nghiệm</span>}
              </NavLink>
              <NavLink to="/flashcards" onClick={onCloseMobile} className={navItemClass} title="Thẻ Flashcards">
                <CreditCard className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>Thẻ Flashcards</span>}
              </NavLink>
              <NavLink to="/mindmap" onClick={onCloseMobile} className={navItemClass} title="Sơ đồ tư duy">
                <Network className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>Sơ đồ tư duy</span>}
              </NavLink>
              <NavLink to="/study-plan" onClick={onCloseMobile} className={navItemClass} title="Kế hoạch học tập AI">
                <CalendarCheck className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>Kế hoạch học tập AI</span>}
              </NavLink>
              <NavLink to="/analytics" onClick={onCloseMobile} className={navItemClass} title="Tiến độ & Đề xuất AI">
                <BarChart3 className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>Tiến độ & Đề xuất AI</span>}
              </NavLink>
              <NavLink to="/settings/profile" onClick={onCloseMobile} className={navItemClass} title="Cài đặt & Bảo mật">
                <Settings className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>Cài đặt & Bảo mật</span>}
              </NavLink>
            </div>
          )}
        </div>

        {/* Teacher Section */}
        {hasRole(['TEACHER', 'ADMIN']) && (
          <div>
            {!isCollapsed ? (
              <button
                onClick={() => toggleSection('teacher')}
                className="w-full px-3 flex items-center justify-between text-xs font-bold text-amber-500 uppercase tracking-wider mb-2.5 transition"
              >
                <span>Giảng viên</span>
                {sections.teacher ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <div className="w-full border-t border-slate-200 dark:border-slate-800 my-2" />
            )}

            {(sections.teacher || isCollapsed) && (
              <div className="space-y-1.5">
                <NavLink to="/teacher/courses" onClick={onCloseMobile} className={navItemClass} title="Quản lý Khóa học">
                  <GraduationCap className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span>Quản lý Khóa học</span>}
                </NavLink>
              </div>
            )}
          </div>
        )}

        {/* Admin Section */}
        {hasRole(['ADMIN']) && (
          <div>
            {!isCollapsed ? (
              <button
                onClick={() => toggleSection('admin')}
                className="w-full px-3 flex items-center justify-between text-xs font-bold text-rose-500 uppercase tracking-wider mb-2.5 transition"
              >
                <span>Quản trị viên</span>
                {sections.admin ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <div className="w-full border-t border-slate-200 dark:border-slate-800 my-2" />
            )}

            {(sections.admin || isCollapsed) && (
              <div className="space-y-1.5">
                <NavLink to="/admin/metrics" onClick={onCloseMobile} className={navItemClass} title="Thống kê Admin">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span>Thống kê Admin</span>}
                </NavLink>
                <NavLink to="/admin/users" onClick={onCloseMobile} className={navItemClass} title="Quản lý Người dùng">
                  <LayoutDashboard className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span>Quản lý Người dùng</span>}
                </NavLink>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Upload CTA */}
      <div className="p-4">
        <NavLink
          to="/documents/upload"
          onClick={onCloseMobile}
          title="Tải lên tài liệu mới"
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center p-3' : 'justify-center gap-3 px-5 py-3.5'
          } rounded-2xl bg-indigo-600 text-white font-bold text-base hover:bg-indigo-700 transition shadow-md shadow-indigo-100 dark:shadow-none`}
        >
          <UploadCloud className="w-5.5 h-5.5 shrink-0" />
          {!isCollapsed && <span>Tải tài liệu</span>}
        </NavLink>
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        {user ? (
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            <NavLink
              to="/settings/profile"
              onClick={onCloseMobile}
              className="flex items-center gap-3 overflow-hidden group"
              title={user.fullName}
            >
              <img
                src={
                  user.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'User')}&background=2563eb&color=fff`
                }
                alt={user.fullName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-100 dark:ring-slate-700 shrink-0"
              />
              {!isCollapsed && (
                <div className="truncate text-left">
                  <p className="text-base font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 transition">
                    {user.fullName}
                  </p>
                  <span className="text-xs text-slate-400 capitalize">{user.role.toLowerCase()}</span>
                </div>
              )}
            </NavLink>

            {!isCollapsed && (
              <button
                onClick={handleLogout}
                title="Đăng xuất"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <NavLink
              to="/login"
              onClick={onCloseMobile}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center' : 'justify-center gap-2.5'
              } py-2.5 px-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-sm transition`}
              title="Đăng nhập"
            >
              <LogIn className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span>Đăng nhập</span>}
            </NavLink>
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 md:hidden transition-opacity"
        />
      )}
      {sidebarContent}
    </>
  );
};
