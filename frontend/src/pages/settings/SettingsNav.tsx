import React from 'react';
import { NavLink } from 'react-router-dom';
import { User, KeyRound, Laptop } from 'lucide-react';

export const SettingsNav: React.FC = () => {
  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `pb-3 border-b-2 flex items-center gap-2 sm:gap-2.5 text-sm sm:text-base font-semibold transition shrink-0 ${
      isActive
        ? 'border-indigo-600 text-indigo-600'
        : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
    }`;

  return (
    <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 sm:gap-8 overflow-x-auto no-scrollbar whitespace-nowrap">
      <NavLink to="/settings/profile" className={tabClass}>
        <User className="w-4.5 h-4.5 sm:w-5 sm:h-5 shrink-0" />
        <span>Thông tin cá nhân</span>
      </NavLink>

      <NavLink to="/settings/security" className={tabClass}>
        <KeyRound className="w-4.5 h-4.5 sm:w-5 sm:h-5 shrink-0" />
        <span className="hidden sm:inline">Đổi mật khẩu & Bảo mật</span>
        <span className="sm:hidden">Đổi mật khẩu</span>
      </NavLink>

      <NavLink to="/settings/sessions" className={tabClass}>
        <Laptop className="w-4.5 h-4.5 sm:w-5 sm:h-5 shrink-0" />
        <span className="hidden sm:inline">Phiên đăng nhập & Thiết bị</span>
        <span className="sm:hidden">Thiết bị</span>
      </NavLink>
    </div>
  );
};
