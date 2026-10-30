import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { systemApi } from '../../services/api';
import { ShieldCheck, Users, BookOpen, Layers, BrainCircuit, MessageSquareCode, Database } from 'lucide-react';

export const AdminMetricsPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['adminMetrics'],
    queryFn: () => systemApi.getAdminMetrics(),
  });

  const stats = data?.stats;
  const recentUsers = data?.recentUsers || [];
  const recentDocs = data?.recentDocuments || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-rose-500" />
          <span>Bảng Điều Khiển Quản Trị Hệ Thống (Admin Dashboard)</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Giám sát tài nguyên, số lượng người dùng, tài liệu học tập và các truy vấn AI/pgvector
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-xs text-slate-400">Đang tải số liệu hệ thống...</div>
      ) : (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] text-slate-400 font-medium">Tổng Người dùng</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{stats?.totalUsers || 0}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] text-slate-400 font-medium">Tài liệu</span>
              <p className="text-2xl font-extrabold text-indigo-600 mt-1">{stats?.totalDocuments || 0}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] text-slate-400 font-medium">Khóa học</span>
              <p className="text-2xl font-extrabold text-amber-500 mt-1">{stats?.totalCourses || 0}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] text-slate-400 font-medium">Bài Quiz</span>
              <p className="text-2xl font-extrabold text-emerald-500 mt-1">{stats?.totalQuizzes || 0}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] text-slate-400 font-medium">Lượt làm Quiz</span>
              <p className="text-2xl font-extrabold text-cyan-500 mt-1">{stats?.totalQuizAttempts || 0}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] text-slate-400 font-medium">Vector Chunks</span>
              <p className="text-2xl font-extrabold text-purple-600 mt-1">{stats?.totalChunks || 0}</p>
            </div>
          </div>

          {/* Two Tables: Recent Users & Recent Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Users */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Người dùng đăng ký gần đây</span>
              </h3>
              <div className="space-y-2">
                {recentUsers.map((u: any) => (
                  <div
                    key={u.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{u.fullName}</p>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Tài liệu mới tải lên</span>
              </h3>
              <div className="space-y-2">
                {recentDocs.map((d: any) => (
                  <div
                    key={d.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs"
                  >
                    <div className="truncate pr-2">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{d.title}</p>
                      <p className="text-[11px] text-slate-400">Bởi: {d.uploadedBy?.fullName || 'Giảng viên'}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                        d.status === 'READY'
                          ? 'bg-emerald-50 text-emerald-600'
                          : d.status === 'PROCESSING'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
