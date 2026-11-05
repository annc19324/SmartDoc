import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '../../services/api';
import { QuizAttemptResult } from '../../types';
import { BrainCircuit, CheckCircle2, XCircle, ArrowLeft, RotateCcw, Award, HelpCircle, Printer, Share2 } from 'lucide-react';
import { ShareModal } from '../../components/common/ShareModal';
import { useToast } from '../../context/ToastContext';

export const QuizDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { copyAndNotify } = useToast();

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quizDetail', id],
    queryFn: () => aiApi.getQuizById(id!),
    enabled: !!id,
  });

  const submitMutation = useMutation({
    mutationFn: () => aiApi.submitQuiz(id!, selectedAnswers),
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ['userAnalytics'] });
    },
  });

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (result) return; // Prevent changing answers after submit
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setResult(null);
  };

  if (isLoading) {
    return <div className="py-20 text-center text-xs text-slate-400">Đang tải đề thi...</div>;
  }

  if (!quiz) {
    return <div className="py-20 text-center text-xs text-rose-500">Không tìm thấy bài Quiz.</div>;
  }

  const questions = quiz.questions || [];
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6 pb-12">
      <button
        onClick={() => navigate('/quiz')}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 transition no-print"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại Danh sách Quiz</span>
      </button>

      {/* Print only header for offline study worksheet */}
      <div className="hidden print:block border-b-2 border-slate-800 pb-4 mb-4">
        <h1 className="text-2xl font-bold text-slate-900">
          SMARTDOC AI • BÀI THI TRẮC NGHIỆM & KẾT QUẢ ÔN TẬP
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Đề thi: <strong>{quiz.title}</strong> • Độ khó: {quiz.difficulty} • Số câu: {questions.length} {result && `• Điểm số: ${result.score}/10 (${result.correctCount}/${result.totalQuestions} câu đúng)`} • Ngày in: {new Date().toLocaleDateString('vi-VN')}
        </p>
      </div>

      {/* Quiz Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs">
            <span className="font-bold px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 uppercase">
              {quiz.difficulty}
            </span>
            <span className="text-slate-400 font-medium">{questions.length} câu hỏi trắc nghiệm</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{quiz.title}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">{quiz.description}</p>
        </div>

        {result ? (
          <div className="flex items-center gap-2 no-print shrink-0">
            <button
              onClick={() => {
                if (quiz) {
                  copyAndNotify(
                    `/quiz/${quiz.id}`,
                    quiz.title,
                    `Kết quả bài Quiz: ${result.score}/10 (${result.correctCount}/${result.totalQuestions} câu đúng)`
                  );
                }
                setShowShareModal(true);
              }}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition"
              title="Sao chép link & chia sẻ kết quả"
            >
              <Share2 className="w-4 h-4 text-indigo-600" />
              <span>Chia sẻ</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition"
              title="Xuất file PDF hoặc in kết quả ôn tập"
            >
              <Printer className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Xuất PDF / In</span>
              <span className="sm:hidden">In</span>
            </button>
            <button
              onClick={handleRestart}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Làm lại</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                if (quiz) {
                  copyAndNotify(`/quiz/${quiz.id}`, quiz.title);
                }
                setShowShareModal(true);
              }}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition no-print"
              title="Sao chép link & chia sẻ bài thi này"
            >
              <Share2 className="w-4 h-4 text-indigo-600" />
              <span>Chia sẻ</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition no-print"
              title="In đề thi ra giấy để làm offline"
            >
              <Printer className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">In đề thi</span>
            </button>
            <div className="text-xs sm:text-sm font-semibold text-slate-500 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
              Đã làm: <strong className="text-indigo-600">{answeredCount}</strong> / {questions.length}
            </div>
          </div>
        )}
      </div>

      {/* Result Card after submission */}
      {result && (
        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-amber-300" />
              <div>
                <h2 className="text-base sm:text-lg font-bold">Kết quả bài làm</h2>
                <p className="text-xs sm:text-sm text-emerald-100">
                  Bạn trả lời đúng {result.correctCount} / {result.totalQuestions} câu
                </p>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold">{result.score} / 10</div>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((q, qIdx) => {
          const userAnswer = selectedAnswers[q.id];
          const isSubmitted = !!result;
          const resultQuestion = result?.questionsWithAnswers?.find((r) => r.id === q.id);

          return (
            <div
              key={q.id}
              className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm space-y-4 break-inside-avoid"
            >
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {qIdx + 1}
                </span>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-relaxed">{q.question}</h3>
              </div>

              {/* 4 Options */}
              <div className="space-y-2.5 pl-0 sm:pl-10">
                {(q.options as string[]).map((opt, optIdx) => {
                  const isSelected = userAnswer === optIdx;
                  let optionStyle =
                    'border-slate-200 dark:border-slate-700 hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300';

                  if (isSubmitted) {
                    if (optIdx === q.correctAnswer) {
                      optionStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 font-semibold';
                    } else if (isSelected && !resultQuestion?.isCorrect) {
                      optionStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-700 line-through';
                    }
                  } else if (isSelected) {
                    optionStyle = 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 font-semibold shadow-xs';
                  }

                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border text-sm sm:text-base cursor-pointer transition flex items-center justify-between ${optionStyle}`}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <span className="w-6 h-6 rounded-full border border-current text-xs font-bold flex items-center justify-center shrink-0">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="leading-relaxed">{opt}</span>
                      </div>
                      {isSubmitted && optIdx === q.correctAnswer && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      )}
                      {isSubmitted && isSelected && optIdx !== q.correctAnswer && (
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanation Box */}
              {isSubmitted && (
                <div className="mt-3.5 ml-0 sm:ml-10 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm space-y-1.5">
                  <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs uppercase tracking-wider text-indigo-600">
                    <HelpCircle className="w-4 h-4" />
                    <span>Giải thích đáp án:</span>
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
                    {q.explanation || 'Đáp án chính xác được đối chiếu theo nội dung tài liệu học tập.'}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Submit Button */}
      {!result && (
        <div className="pt-4 flex justify-end no-print">
          <button
            onClick={() => submitMutation.mutate()}
            disabled={answeredCount === 0 || submitMutation.isPending}
            className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition"
          >
            {submitMutation.isPending ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Đang chấm điểm...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Nộp bài & Xem kết quả</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Share Modal */}
      {quiz && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title="Bài thi trắc nghiệm"
          itemTitle={quiz.title}
          url={`/quiz/${quiz.id}`}
          type="quiz"
          description={
            result
              ? `Kết quả ôn tập bài thi ${quiz.title}: ${result.score}/10 (${result.correctCount}/${result.totalQuestions} câu đúng). Hãy thử làm bài kiểm tra!`
              : quiz.description
          }
        />
      )}
    </div>
  );
};
