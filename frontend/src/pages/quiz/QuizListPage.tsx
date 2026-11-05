import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi, documentApi } from '../../services/api';
import { BrainCircuit, Sparkles, Plus, Play, BookOpen, Layers, CheckCircle2, Share2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const QuizListPage: React.FC = () => {
  const navigate = useNavigate();
  const { copyAndNotify } = useToast();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const docIdParam = searchParams.get('documentId') || '';

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState(docIdParam);
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [questionCount, setQuestionCount] = useState(5);
  const [chapter, setChapter] = useState('');

  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ['quizzes', docIdParam],
    queryFn: () => aiApi.listQuizzes({ documentId: docIdParam || undefined }),
  });

  const { data: docsData } = useQuery({
    queryKey: ['documentsListForQuiz'],
    queryFn: () => documentApi.list({ limit: 50, status: 'READY' }),
  });

  const availableDocs = docsData?.documents || [];

  const createQuizMutation = useMutation({
    mutationFn: () =>
      aiApi.generateQuiz({
        documentId: selectedDocId,
        title: title || undefined,
        difficulty,
        questionCount,
        chapter: chapter || undefined,
      }),
    onSuccess: (newQuiz) => {
      setShowCreateModal(false);
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      navigate(`/quiz/${newQuiz.id}`);
    },
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-emerald-600" />
            <span>Luyện Tập Trắc Nghiệm AI</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Đánh giá kiến thức với các bài kiểm tra được tạo tự động từ tài liệu học tập
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>Tạo Đề Trắc Nghiệm Bằng AI</span>
        </button>
      </div>

      {/* Quiz Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-slate-400">Đang tải danh sách Quiz...</div>
      ) : quizzes.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <BrainCircuit className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Chưa có bài kiểm tra trắc nghiệm nào</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
            Bấm nút tạo đề thi bằng AI bên trên để hệ thống quét tài liệu và sinh bộ câu hỏi cho bạn.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
          >
            Tạo Quiz đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-emerald-500 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] mb-2">
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                      quiz.difficulty === 'EASY'
                        ? 'bg-emerald-50 text-emerald-600'
                        : quiz.difficulty === 'HARD'
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    {quiz.difficulty}
                  </span>
                  <span className="text-slate-400 font-medium">
                    {quiz._count?.questions || 0} câu hỏi
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">{quiz.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{quiz.description}</p>

                {quiz.document && (
                  <p className="text-[11px] text-indigo-600 font-semibold mt-3 truncate flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span>{quiz.document.title}</span>
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  {quiz._count?.attempts || 0} lượt làm
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      copyAndNotify(`/quiz/${quiz.id}`, quiz.title);
                    }}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                    title="Sao chép liên kết chia sẻ bài thi"
                  >
                    <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="hidden sm:inline">Chia sẻ</span>
                  </button>
                  <button
                    onClick={() => navigate(`/quiz/${quiz.id}`)}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Bắt đầu thi</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Quiz with AI */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tạo Quiz Trắc Nghiệm Bằng AI</h3>
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
                  Chọn tài liệu nguồn <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Chọn tài liệu trong thư viện --</option>
                  {availableDocs.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tên đề thi (tùy chọn)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Kiểm tra 15 phút Cấu trúc dữ liệu"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Độ khó</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="EASY">Dễ (Nhận biết)</option>
                    <option value="MEDIUM">Trung bình (Vận dụng)</option>
                    <option value="HARD">Khó (Phân tích sâu)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Số câu hỏi
                  </label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value={3}>3 câu</option>
                    <option value={5}>5 câu</option>
                    <option value={10}>10 câu</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Chương / Chủ đề trọng tâm (tùy chọn)
                </label>
                <input
                  type="text"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  placeholder="Ví dụ: Cây tìm kiếm nhị phân BST"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => createQuizMutation.mutate()}
                disabled={!selectedDocId || createQuizMutation.isPending}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow"
              >
                {createQuizMutation.isPending ? (
                  <>
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>AI đang phân tích và ra đề...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Tạo đề thi ngay</span>
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
