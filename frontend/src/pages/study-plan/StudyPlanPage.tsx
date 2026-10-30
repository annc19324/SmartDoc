import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '../../services/api';
import { StudyPlan, StudyPlanDay } from '../../types';
import { CalendarCheck, Sparkles, Plus, Clock, Target, CheckCircle2, Circle, ArrowRight } from 'lucide-react';

export const StudyPlanPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [subject, setSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [targetScore, setTargetScore] = useState('Điểm A (8.5 - 10.0)');
  const [availableHours, setAvailableHours] = useState(2.5);
  const [currentLevel, setCurrentLevel] = useState('Trung bình');

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['studyPlans'],
    queryFn: () => aiApi.getStudyPlans(),
  });

  const createPlanMutation = useMutation({
    mutationFn: () =>
      aiApi.generateStudyPlan({
        subject,
        examDate,
        targetScore,
        availableHoursPerDay: availableHours,
        currentLevel,
      }),
    onSuccess: () => {
      setShowCreateModal(false);
      queryClient.invalidateQueries({ queryKey: ['studyPlans'] });
    },
  });

  const activePlan = plans[0];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-indigo-600" />
            <span>Kế Hoạch Học Tập AI (Study Plan)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Lộ trình ôn tập tối ưu theo từng ngày dựa trên mục tiêu điểm số và thời gian khả dụng của bạn
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>Lập Kế Hoạch Bằng AI</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-xs text-slate-400">Đang tải kế hoạch học tập...</div>
      ) : !activePlan ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Bạn chưa có kế hoạch học tập nào</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
            Nhập môn thi, ngày thi và số giờ học mỗi ngày để AI thiết lập lộ trình ôn thi khoa học cho bạn.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
          >
            Tạo kế hoạch học tập ngay
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Plan Overview */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  Kế hoạch đang thực hiện
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{activePlan.subject}</h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                  <span className="flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Mục tiêu: {activePlan.targetScore}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-500" />
                    <span>{activePlan.availableHoursPerDay} giờ/ngày</span>
                  </span>
                  <span>Ngày thi: {new Date(activePlan.examDate).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline of Days */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Lộ trình ôn tập theo từng ngày</h3>
            <div className="space-y-3">
              {(activePlan.planData as StudyPlanDay[]).map((dayItem, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-bold text-xs">
                        Ngày {dayItem.day}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{dayItem.topic}</h4>
                    </div>
                    <span className="text-xs text-slate-400">{dayItem.estimatedHours} giờ</span>
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-2 pl-2">
                    {dayItem.tasks.map((task, tIdx) => (
                      <div key={tIdx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                        <Circle className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                        <span>{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Study Plan */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Lập Lộ Trình Học Tập AI</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Môn học / Kỳ thi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ví dụ: Thi cuối kỳ Cấu trúc dữ liệu & Giải thuật"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ngày thi dự kiến <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mục tiêu điểm số
                  </label>
                  <select
                    value={targetScore}
                    onChange={(e) => setTargetScore(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Điểm A (8.5 - 10.0)">Điểm A (8.5 - 10)</option>
                    <option value="Điểm B (7.0 - 8.4)">Điểm B (7.0 - 8.4)</option>
                    <option value="Điểm C (5.5 - 6.9)">Điểm C (Qua môn)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Số giờ/ngày
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="10"
                    value={availableHours}
                    onChange={(e) => setAvailableHours(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Trình độ hiện tại
                </label>
                <select
                  value={currentLevel}
                  onChange={(e) => setCurrentLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Mất gốc / Mới bắt đầu">Mới bắt đầu / Cần ôn từ đầu</option>
                  <option value="Trung bình">Trung bình (Nắm lý thuyết cơ bản)</option>
                  <option value="Khá giỏi">Khá giỏi (Cần luyện bài tập khó)</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => createPlanMutation.mutate()}
                disabled={!subject || !examDate || createPlanMutation.isPending}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow"
              >
                {createPlanMutation.isPending ? (
                  <>
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>AI đang phân bổ lộ trình ôn thi...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Lập kế hoạch</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
