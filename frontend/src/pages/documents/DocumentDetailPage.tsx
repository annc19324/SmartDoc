import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi, aiApi, chatApi } from '../../services/api';
import {
  FileText,
  Sparkles,
  MessageSquareCode,
  BrainCircuit,
  CreditCard,
  Network,
  Download,
  Calendar,
  Layers,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export const DocumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'summary' | 'tools'>('overview');

  const { data: document, isLoading } = useQuery({
    queryKey: ['document', id],
    queryFn: () => documentApi.getById(id!),
    enabled: !!id,
  });

  const { data: summaries = [], refetch: refetchSummaries } = useQuery({
    queryKey: ['summaries', id],
    queryFn: () => aiApi.getDocumentSummaries(id!),
    enabled: !!id,
  });

  // Summary generation mutation
  const generateSummaryMutation = useMutation({
    mutationFn: (type: any) => aiApi.generateSummary(id!, type),
    onSuccess: () => {
      refetchSummaries();
      setActiveTab('summary');
    },
  });

  // Start Chat with document mutation
  const startChatMutation = useMutation({
    mutationFn: () => chatApi.createSession(`Hỏi đáp về: ${document?.title}`, id),
    onSuccess: (session) => {
      navigate(`/chat?session=${session.id}`);
    },
  });

  if (isLoading) {
    return <div className="py-20 text-center text-xs text-slate-400">Đang tải thông tin tài liệu...</div>;
  }

  if (!document) {
    return <div className="py-20 text-center text-xs text-rose-500">Không tìm thấy tài liệu yêu cầu.</div>;
  }

  const latestSummary = summaries[0];

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/documents')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại Kho tài liệu</span>
      </button>

      {/* Document Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                {document.fileType.split('/')[1] || 'DOC'}
              </span>
              <span
                className={`font-semibold text-xs px-2.5 py-0.5 rounded-full ${
                  document.status === 'READY'
                    ? 'bg-emerald-50 text-emerald-600'
                    : document.status === 'PROCESSING'
                    ? 'bg-amber-50 text-amber-600 animate-pulse'
                    : 'bg-rose-50 text-rose-600'
                }`}
              >
                ● {document.status}
              </span>
              {document.category && (
                <span className="text-xs text-slate-400 font-medium">🏷️ {document.category.name}</span>
              )}
            </div>

            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{document.title}</h1>
            <p className="text-xs text-slate-500 max-w-2xl">{document.description || 'Chưa có mô tả chi tiết.'}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href={document.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xem / Tải file</span>
            </a>
            <button
              onClick={() => startChatMutation.mutate()}
              disabled={startChatMutation.isPending || document.status !== 'READY'}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition"
            >
              <MessageSquareCode className="w-3.5 h-3.5" />
              <span>Hỏi đáp RAG AI</span>
            </button>
          </div>
        </div>

        {/* Quick Tabs */}
        <div className="flex gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2 border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Tổng quan & Thống kê
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`pb-2 border-b-2 transition ${
              activeTab === 'summary'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Tóm tắt AI ({summaries.length})
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`pb-2 border-b-2 transition ${
              activeTab === 'tools'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Công cụ Học tập AI
          </button>
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Thông tin chi tiết</h2>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Số trang trích xuất:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{document.pageCount} trang</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Dung lượng tệp:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {(document.fileSize / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Người tải lên:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {document.uploadedBy?.fullName || 'Hệ thống'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Lượt xem & Luyện tập:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{document.viewCount} lượt</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-indigo-50/70 dark:bg-slate-900 rounded-3xl border border-indigo-100 dark:border-slate-800 p-6">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs mb-2">
                <Sparkles className="w-4 h-4" />
                <span>Tính năng AI Khả dụng</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Tài liệu này đã hoàn tất quá trình sinh embedding và sẵn sàng phục vụ các tác vụ học tập thông minh.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => generateSummaryMutation.mutate('DETAILED')}
                  disabled={generateSummaryMutation.isPending}
                  className="w-full py-2 px-3 bg-white dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:text-indigo-600 flex items-center justify-between transition"
                >
                  <span>Tạo bản tóm tắt chi tiết</span>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                </button>
                <button
                  onClick={() => navigate(`/quiz?documentId=${document.id}`)}
                  className="w-full py-2 px-3 bg-white dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:text-indigo-600 flex items-center justify-between transition"
                >
                  <span>Tạo đề trắc nghiệm AI</span>
                  <BrainCircuit className="w-3.5 h-3.5 text-emerald-500" />
                </button>
                <button
                  onClick={() => navigate(`/flashcards?documentId=${document.id}`)}
                  className="w-full py-2 px-3 bg-white dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:text-indigo-600 flex items-center justify-between transition"
                >
                  <span>Tạo bộ Flashcard</span>
                  <CreditCard className="w-3.5 h-3.5 text-cyan-500" />
                </button>
                <button
                  onClick={() => navigate(`/mindmap?documentId=${document.id}`)}
                  className="w-full py-2 px-3 bg-white dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:text-indigo-600 flex items-center justify-between transition"
                >
                  <span>Tạo Mindmap kiến thức</span>
                  <Network className="w-3.5 h-3.5 text-amber-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Summary */}
      {activeTab === 'summary' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Bản tóm tắt nội dung AI</span>
            </h2>
            <button
              onClick={() => generateSummaryMutation.mutate('DETAILED')}
              disabled={generateSummaryMutation.isPending}
              className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-indigo-100 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${generateSummaryMutation.isPending ? 'animate-spin' : ''}`} />
              <span>Tạo lại tóm tắt mới</span>
            </button>
          </div>

          {!latestSummary ? (
            <div className="text-center py-12">
              <p className="text-xs text-slate-400 mb-3">Tài liệu này chưa có bản tóm tắt nào.</p>
              <button
                onClick={() => generateSummaryMutation.mutate('DETAILED')}
                disabled={generateSummaryMutation.isPending}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
              >
                Bấm để AI tạo tóm tắt ngay
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {latestSummary.content}
              </div>

              {/* Key Points */}
              {latestSummary.keyPoints && latestSummary.keyPoints.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
                    Các luận điểm cốt lõi cần nhớ
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {latestSummary.keyPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Important Terms */}
              {latestSummary.importantTerms && latestSummary.importantTerms.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-600 mb-2">
                    Thuật ngữ quan trọng
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {latestSummary.importantTerms.map((t, idx) => (
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
      )}

      {/* Tab 3: Tools */}
      {activeTab === 'tools' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => navigate(`/quiz?documentId=${document.id}`)}
            className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 cursor-pointer transition shadow-sm"
          >
            <BrainCircuit className="w-8 h-8 text-emerald-500 mb-3" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Luyện tập trắc nghiệm</h3>
            <p className="text-xs text-slate-500 mt-1">
              AI phân tích tài liệu và sinh bộ câu hỏi trắc nghiệm kèm giải thích cặn kẽ.
            </p>
          </div>

          <div
            onClick={() => navigate(`/flashcards?documentId=${document.id}`)}
            className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 cursor-pointer transition shadow-sm"
          >
            <CreditCard className="w-8 h-8 text-cyan-500 mb-3" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Thẻ ghi nhớ Flashcards</h3>
            <p className="text-xs text-slate-500 mt-1">
              Ghi nhớ định nghĩa, công thức và bẫy thi cử với cơ chế lật thẻ 3D.
            </p>
          </div>

          <div
            onClick={() => navigate(`/mindmap?documentId=${document.id}`)}
            className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 cursor-pointer transition shadow-sm"
          >
            <Network className="w-8 h-8 text-amber-500 mb-3" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Sơ đồ tư duy (Mindmap)</h3>
            <p className="text-xs text-slate-500 mt-1">
              Khái quát cấu trúc kiến thức phân cấp dạng cây, trực quan, có thể phóng to thu nhỏ.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
