import React from 'react';
import { Navigate, Outlet, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const sanitizeRedirectPath = (rawRedirect: string | null): string => {
  if (!rawRedirect) return '/dashboard';
  const trimmed = rawRedirect.trim();
  // Prevent open redirects and infinite auth-page redirect loops
  if (
    !trimmed.startsWith('/') ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('/login') ||
    trimmed.startsWith('/register') ||
    trimmed.startsWith('/forgot-password')
  ) {
    return '/dashboard';
  }
  return trimmed;
};

export const GuestRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
          <span className="text-xs text-slate-400 font-medium">Đang kiểm tra phiên đăng nhập...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    const target = sanitizeRedirectPath(searchParams.get('redirect'));
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
};
