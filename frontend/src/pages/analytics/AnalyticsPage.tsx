import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '../../services/api';
import {
  BarChart3,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  RefreshCw,
  BookOpen,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['analyticsPageData'],
    queryFn: () => aiApi.getAnalytics(),
  });

  const refreshMutation = useMutation({
    mutationFn: () => aiApi.refreshRecommendation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyticsPageData'] });
    },
  });

  const analytics = data?.analytics;
  const recentAttempts = data?.recentAttempts || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            <span>Phân Tích Tiến Độ & Lời Khuyên AI</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi sự tiến bộ, đánh giá điểm mạnh / điểm yếu và nhận gợi ý học tập cá nhân hóa
          </p>
        </div>
      </div>

      {/* AI Recommendation Spotlight */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-300">
              <Sparkles className="w-4 h-4" />
              <span>Cố vấn học tập AI (SmartDoc Pedagogical Advisor)</span>
            </div>
            <button
              onClick={() => refreshMutation.mutate()}
              disabled={refreshMutation.isPending}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold backdrop-blur-md border border-white/10 flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
              <span>Cập nhật lời khuyên</span>
            </button>
          </div>
          <p className="text-sm md:text-base leading-relaxed text-indigo-100 max-w-3xl">
            "{analytics?.aiRecommendation ||
              'Bạn đang thể hiện sự tiến bộ đều đặn! Hãy tiếp tục duy trì thói quen ôn bài mỗi ngày và tập trung hơn vào các chủ đề có điểm quiz chưa cao.'}"
          </p>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Tổng giờ học</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            {((analytics?.totalStudyMinutes || 0) / 60).toFixed(1)}{' '}
            <span className="text-xs font-medium text-slate-400">giờ</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Điểm Quiz TB</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            {analytics?.averageQuizScore || 0} <span className="text-xs font-medium text-slate-400">/ 10</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Bài Quiz đã làm</span>
            <Award className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            {analytics?.quizzesTaken || 0} <span className="text-xs font-medium text-slate-400">bài</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Thẻ Flashcard</span>
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            {analytics?.flashcardsReviewed || 0} <span className="text-xs font-medium text-slate-400">thẻ</span>
          </p>
        </div>
      </div>

      {/* Strong & Weak Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strong Topics */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Chủ đề bạn nắm rất vững (Điểm mạnh)</h3>
          </div>
          <div className="space-y-2">
            {((analytics?.strongTopics as string[]) || ['Cấu trúc mảng tĩnh', 'Danh sách liên kết đơn', 'Quick Sort']).map(
              (topic, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-between"
                >
                  <span>✓ {topic}</span>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded text-emerald-700 dark:text-emerald-300">
                    Nắm chắc
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Weak Topics */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Chủ đề cần cải thiện (Lỗ hổng kiến thức)</h3>
          </div>
          <div className="space-y-2">
            {((analytics?.weakTopics as string[]) || ['Cây tìm kiếm nhị phân cân bằng (AVL)', 'Thuật toán Dijkstra']).map(
              (topic, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-xs font-semibold text-rose-800 dark:text-rose-300 flex items-center justify-between"
                >
                  <span>⚠ {topic}</span>
                  <span className="text-[10px] bg-rose-100 dark:bg-rose-900/50 px-2 py-0.5 rounded text-rose-700 dark:text-rose-300">
                    Cần ôn lại
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Recent Quiz Attempts Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Lịch sử làm bài trắc nghiệm gần đây</h3>
        {recentAttempts.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">Chưa có lịch sử làm bài kiểm tra nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                <tr>
                  <th className="py-2.5">Bài thi</th>
                  <th className="py-2.5">Số câu đúng</th>
                  <th className="py-2.5">Điểm số</th>
                  <th className="py-2.5">Thời gian làm bài</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentAttempts.map((att: any) => (
                  <tr key={att.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{att.quiz.title}</td>
                    <td className="py-3 text-slate-500">
                      {att.correctAnswers} / {att.totalQuestions}
                    </td>
                    <td className="py-3 font-bold text-indigo-600">{att.score} / 10</td>
                    <td className="py-3 text-slate-400">
                      {new Date(att.completedAt).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
