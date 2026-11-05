import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { documentApi, aiApi } from '../../services/api';
import { SummaryType } from '../../types';
import { FileText, Sparkles, CheckCircle2, RefreshCw, BookOpen, Printer, Share2 } from 'lucide-react';
import { FormattedText, cleanMarkdownText } from '../../components/common/FormattedText';
import { ShareModal } from '../../components/common/ShareModal';
import { useToast } from '../../context/ToastContext';

export const SummaryPage: React.FC = () => {
  const { copyAndNotify } = useToast();
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [summaryType, setSummaryType] = useState<SummaryType>('DETAILED');
  const [showShareModal, setShowShareModal] = useState(false);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-indigo-600" />
            <span>Tóm Tắt Tài Liệu Bằng AI</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Chọn tài liệu và loại tóm tắt mong muốn để AI đúc kết các luận điểm cốt lõi và thuật ngữ trọng tâm
          </p>
        </div>
      </div>

      {/* Control Box */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm space-y-4 no-print">
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
        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-10">
          <BookOpen className="w-14 h-14 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-700 dark:text-slate-300">Chưa chọn tài liệu</p>
          <p className="text-sm text-slate-400 mt-2">Vui lòng chọn tài liệu ở danh sách trên để xem hoặc tạo tóm tắt.</p>
        </div>
      ) : loadingSummaries ? (
        <div className="py-20 text-center text-base text-slate-400">Đang tải bản tóm tắt...</div>
      ) : !currentSummary ? (
        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-10">
          <img src="/ai-logo.png" alt="SmartDoc AI" className="w-12 h-12 object-contain mx-auto mb-3" />
          <p className="text-base font-bold text-slate-700 dark:text-slate-300">Chưa có bản tóm tắt loại này</p>
          <p className="text-sm text-slate-400 mt-2">
            Bấm nút "Tạo tóm tắt AI ngay" ở trên để hệ thống tự động sinh nội dung cho bạn.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-8 md:p-10 shadow-sm space-y-6 sm:space-y-7">
          {/* Header visible ONLY when printing / exporting to PDF */}
          <div className="hidden print:block border-b-2 border-slate-800 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
              SMARTDOC AI • BẢN TÓM TẮT & ĐỀ CƯƠNG ÔN TẬP
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Tài liệu: <strong>{documents.find((d) => d.id === selectedDocId)?.title || 'Tài liệu học tập'}</strong> • Loại tóm tắt: {currentSummary.type} • Ngày xuất: {new Date().toLocaleDateString('vi-VN')}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5 gap-3 no-print">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-400 px-3 py-1.5 rounded-xl">
                {currentSummary.type}
              </span>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-2">
                Tóm tắt tài liệu thông minh
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (selectedDocId) {
                    const docTitle =
                      documents.find((d) => d.id === selectedDocId)?.title || 'Bản tóm tắt tài liệu';
                    copyAndNotify(`/summary?documentId=${selectedDocId}`, docTitle);
                  }
                  setShowShareModal(true);
                }}
                className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition"
                title="Sao chép link & chia sẻ bản tóm tắt học tập"
              >
                <Share2 className="w-4 h-4 text-indigo-600" />
                <span>Chia sẻ</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition"
                title="Xuất file PDF hoặc In ra giấy để học offline"
              >
                <Printer className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline">Xuất PDF / In</span>
                <span className="sm:hidden">In</span>
              </button>
              <button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
                className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Tạo lại</span>
              </button>
            </div>
          </div>

          <div className="text-base md:text-lg leading-relaxed text-slate-700 dark:text-slate-300">
            <FormattedText content={currentSummary.content} />
          </div>

          {currentSummary.keyPoints && currentSummary.keyPoints.length > 0 && (
            <div className="p-6 md:p-7 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
              <h3 className="text-base md:text-lg font-bold uppercase tracking-wider text-indigo-600">Luận điểm trọng tâm</h3>
              <ul className="space-y-3 text-base text-slate-700 dark:text-slate-300">
                {currentSummary.keyPoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-3 leading-relaxed">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{cleanMarkdownText(pt)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {currentSummary.importantTerms && currentSummary.importantTerms.length > 0 && (
            <div className="p-6 md:p-7 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
              <h3 className="text-base md:text-lg font-bold uppercase tracking-wider text-cyan-600">Thuật ngữ & Khái niệm</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentSummary.importantTerms.map((t, idx) => (
                  <div key={idx} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="font-bold text-base text-slate-900 dark:text-white">{t.term}</p>
                    <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{t.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Share Modal */}
      {selectedDocId && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title="Bản tóm tắt học tập"
          itemTitle={documents.find((d) => d.id === selectedDocId)?.title || 'Tóm tắt tài liệu'}
          url={`/summary?documentId=${selectedDocId}`}
          type="summary"
          description="Bản tóm tắt và hệ thống luận điểm ôn tập tạo bởi SmartDoc AI"
        />
      )}
    </div>
  );
};
