import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const MainLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          isCollapsed ? 'md:ml-20' : 'md:ml-72'
        } ml-0`}
      >
        <Header onToggleMobileSidebar={() => setIsMobileOpen((prev) => !prev)} />
        <main className="flex-1 p-3.5 sm:p-5 md:p-8 lg:p-10 max-w-7xl w-full mx-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
