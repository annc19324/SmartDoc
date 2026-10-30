import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { documentApi, aiApi } from '../../services/api';
import { SummaryType } from '../../types';
import { FileText, Sparkles, CheckCircle2, RefreshCw, BookOpen } from 'lucide-react';

export const SummaryPage: React.FC = () => {
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [summaryType, setSummaryType] = useState<SummaryType>('DETAILED');

  const { data: docsData } = useQuery({
    queryKey: ['documentsListForSummary'],
    queryFn: () => documentApi.list({ limit: 50, status: 'READY' }),
  });

  const documents = docsData?.documents || [];

  const {
    data: summaries = [],
    isLoading: loadingSummaries,
    refetch,
  } = useQuery({
    queryKey: ['summariesForDoc', selectedDocId],
    queryFn: () => aiApi.getDocumentSummaries(selectedDocId),
    enabled: !!selectedDocId,
  });

  const generateMutation = useMutation({
    mutationFn: () => aiApi.generateSummary(selectedDocId, summaryType),
    onSuccess: () => {
      refetch();
    },
  });

  const currentSummary = summaries.find((s) => s.type === summaryType) || summaries[0];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            <span>Tóm Tắt Tài Liệu Bằng AI</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Chọn tài liệu và loại tóm tắt mong muốn để AI đúc kết các luận điểm cốt lõi và thuật ngữ trọng tâm
          </p>
        </div>
      </div>

      {/* Control Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Chọn tài liệu học tập
            </label>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value="">-- Chọn tài liệu trong thư viện --</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Hình thức tóm tắt
            </label>
            <select
              value={summaryType}
              onChange={(e) => setSummaryType(e.target.value as SummaryType)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value="DETAILED">Tóm tắt toàn diện (Detailed)</option>
              <option value="SHORT">Tóm tắt ngắn gọn (Short)</option>
              <option value="KEY_POINTS">Luận điểm cốt lõi (Key Points)</option>
              <option value="IMPORTANT_TERMS">Thuật ngữ & Định nghĩa (Terms)</option>
              <option value="EXAM_REVIEW">Đề cương ôn thi trọng tâm (Exam Review)</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => generateMutation.mutate()}
          disabled={!selectedDocId || generateMutation.isPending}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow"
        >
          {generateMutation.isPending ? (
            <>
              <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Gemini AI đang phân tích văn bản và tạo bản tóm tắt...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Tạo tóm tắt AI ngay</span>
            </>
          )}
        </button>
      </div>

      {/* Summary Content View */}
      {!selectedDocId ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Chưa chọn tài liệu</p>
          <p className="text-[11px] text-slate-400 mt-1">Vui lòng chọn tài liệu ở danh sách trên để xem hoặc tạo tóm tắt.</p>
        </div>
      ) : loadingSummaries ? (
        <div className="py-16 text-center text-xs text-slate-400">Đang tải bản tóm tắt...</div>
      ) : !currentSummary ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <Sparkles className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Chưa có bản tóm tắt loại này</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Bấm nút "Tạo tóm tắt AI ngay" ở trên để hệ thống tự động sinh nội dung cho bạn.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
                {currentSummary.type}
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                Tóm tắt tài liệu thông minh
              </h2>
            </div>
            <button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Tạo lại</span>
            </button>
          </div>

          <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
            {currentSummary.content}
          </div>

          {currentSummary.keyPoints && currentSummary.keyPoints.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Luận điểm trọng tâm</h3>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {currentSummary.keyPoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {currentSummary.importantTerms && currentSummary.importantTerms.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-600">Thuật ngữ & Khái niệm</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentSummary.importantTerms.map((t, idx) => (
                  <div key={idx} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <p className="font-bold text-xs text-slate-900 dark:text-white">{t.term}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{t.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
