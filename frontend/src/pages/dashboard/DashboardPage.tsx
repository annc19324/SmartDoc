import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { documentApi, chatApi, aiApi } from '../../services/api';
import {
  UploadCloud,
  MessageSquareCode,
  BrainCircuit,
  CreditCard,
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { formatFileType } from '../../utils/formatters';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Queries
  const { data: docsData, isLoading: docsLoading } = useQuery({
    queryKey: ['recentDocuments'],
    queryFn: () => documentApi.list({ limit: 4 }),
  });

  const { data: chatSessions = [] } = useQuery({
    queryKey: ['recentChats'],
    queryFn: () => chatApi.listSessions(),
  });

  const { data: analyticsData } = useQuery({
    queryKey: ['userAnalytics'],
    queryFn: () => aiApi.getAnalytics(),
  });

  // AI Recommendation mutation
  const refreshMutation = useMutation({
    mutationFn: () => aiApi.refreshRecommendation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userAnalytics'] });
    },
  });

  const analytics = analyticsData?.analytics;
  const recentDocs = docsData?.documents || [];

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-cyan-600 text-white p-4 sm:p-8 md:p-10 shadow-xl shadow-indigo-100 dark:shadow-none">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs sm:text-sm font-semibold text-cyan-200 mb-2 sm:mb-3 border border-white/10">
            <img src="/ai-logo.png" alt="SmartDoc AI" className="w-4 h-4 sm:w-5 sm:h-5 object-contain shrink-0" />
            <span>SmartDoc • Nền tảng Học tập Thông minh</span>
          </div>

          {/* Heading text with comfortable, readable font size */}
          <h1 className="hidden sm:block text-base sm:text-lg md:text-xl font-medium leading-relaxed max-w-2xl text-indigo-50">
            Hãy tải lên giáo trình hoặc đặt câu hỏi trực tiếp để SmartDoc AI trích dẫn và phân tích ngay.
          </h1>

          {/* Quick Action Buttons: 4 compact columns on phone, flex row on tablet/desktop */}
          <div className="mt-3 sm:mt-6 grid grid-cols-4 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3.5">
            <button
              onClick={() => navigate('/documents/upload')}
              className="px-1.5 py-2.5 sm:px-5 sm:py-3 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl sm:rounded-2xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2.5 shadow-md transition"
            >
              <UploadCloud className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
              <span className="text-[11px] sm:text-base whitespace-nowrap">
                <span className="sm:hidden">Tải lên</span>
                <span className="hidden sm:inline">Tải tài liệu</span>
              </span>
            </button>
            <button
              onClick={() => navigate('/chat')}
              className="px-1.5 py-2.5 sm:px-5 sm:py-3 bg-indigo-500/40 hover:bg-indigo-500/60 text-white rounded-xl sm:rounded-2xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2.5 backdrop-blur-md border border-white/20 transition"
            >
              <MessageSquareCode className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
              <span className="text-[11px] sm:text-base whitespace-nowrap">Hỏi AI</span>
            </button>
            <button
              onClick={() => navigate('/quiz')}
              className="px-1.5 py-2.5 sm:px-5 sm:py-3 bg-indigo-500/40 hover:bg-indigo-500/60 text-white rounded-xl sm:rounded-2xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2.5 backdrop-blur-md border border-white/20 transition"
            >
              <BrainCircuit className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
              <span className="text-[11px] sm:text-base whitespace-nowrap">
                <span className="sm:hidden">Quiz</span>
                <span className="hidden sm:inline">Làm Quiz</span>
              </span>
            </button>
            <button
              onClick={() => navigate('/flashcards')}
              className="px-1.5 py-2.5 sm:px-5 sm:py-3 bg-indigo-500/40 hover:bg-indigo-500/60 text-white rounded-xl sm:rounded-2xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2.5 backdrop-blur-md border border-white/20 transition"
            >
              <CreditCard className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
              <span className="text-[11px] sm:text-base whitespace-nowrap">Flashcard</span>
            </button>
          </div>
        </div>

        {/* Decorative blur circle */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none"></div>
      </div>

      {/* 2. Learning Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs sm:text-sm font-semibold">Thời gian học</span>
            <Clock className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-indigo-500" />
          </div>
          <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
            {analytics?.totalStudyMinutes || 120} <span className="text-xs sm:text-base font-semibold text-slate-400">phút</span>
          </p>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs sm:text-sm font-semibold">Điểm Quiz TB</span>
            <TrendingUp className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-emerald-500" />
          </div>
          <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
            {analytics?.averageQuizScore || 8.0} <span className="text-xs sm:text-base font-semibold text-slate-400">/ 10</span>
          </p>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs sm:text-sm font-semibold">Flashcards ôn</span>
            <CheckCircle2 className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-cyan-500" />
          </div>
          <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
            {analytics?.flashcardsReviewed || 25} <span className="text-xs sm:text-base font-semibold text-slate-400">thẻ</span>
          </p>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs sm:text-sm font-semibold">Tài liệu đã học</span>
            <BookOpen className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-amber-500" />
          </div>
          <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
            {analytics?.documentsViewed || 4} <span className="text-xs sm:text-base font-semibold text-slate-400">tài liệu</span>
          </p>
        </div>
      </div>

      {/* 4. Two Columns: Recent Documents & Weak/Strong Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Recent Documents (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>Tài liệu học tập gần đây</span>
            </h2>
            <button
              onClick={() => navigate('/documents')}
              className="text-sm font-semibold text-indigo-600 hover:underline flex items-center gap-1.5"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {docsLoading ? (
              <div className="col-span-2 py-10 text-center text-sm text-slate-400">Đang tải tài liệu...</div>
            ) : recentDocs.length === 0 ? (
              <div className="col-span-2 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <p className="text-sm text-slate-400 mb-3">Bạn chưa có tài liệu nào trong thư viện.</p>
                <button
                  onClick={() => navigate('/documents/upload')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold"
                >
                  Tải lên tài liệu đầu tiên
                </button>
              </div>
            ) : (
              recentDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => navigate(`/documents/${doc.id}`)}
                  className="p-5 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-2">
                      <span className="font-semibold text-indigo-600 uppercase bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
                        {formatFileType(doc.fileType)}
                      </span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded ${
                          doc.status === 'READY'
                            ? 'bg-emerald-50 text-emerald-600'
                            : doc.status === 'PROCESSING'
                            ? 'bg-amber-50 text-amber-600 animate-pulse'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 line-clamp-1">{doc.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {doc.description || 'Chưa có mô tả chi tiết cho tài liệu này.'}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{doc.pageCount} trang</span>
                    <span>{doc.viewCount} lượt xem</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Weak Topics & Recent Chats (1 col) */}
        <div className="space-y-6">
          {/* Weak Topics Box */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5 mb-3">
              <AlertTriangle className="w-4 h-4" />
              <span>Chủ đề cần cải thiện</span>
            </h3>
            <div className="space-y-2">
              {((analytics?.weakTopics as string[]) || ['Cây cân bằng AVL', 'Đồ thị Dijkstra']).map((t, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200">{t}</span>
                  <button
                    onClick={() => navigate('/quiz')}
                    className="text-[10px] font-bold text-rose-600 hover:underline"
                  >
                    Luyện Quiz
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Chats Box */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <MessageSquareCode className="w-4 h-4 text-indigo-500" />
                <span>Phiên hỏi đáp AI</span>
              </h3>
              <button
                onClick={() => navigate('/chat')}
                className="text-[11px] font-semibold text-indigo-600 hover:underline"
              >
                Mở Chat
              </button>
            </div>
            <div className="space-y-2">
              {chatSessions.slice(0, 3).map((s) => (
                <div
                  key={s.id}
                  onClick={() => navigate(`/chat?session=${s.id}`)}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/50 cursor-pointer transition text-xs font-medium text-slate-700 dark:text-slate-300 truncate"
                >
                  💬 {s.title}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
