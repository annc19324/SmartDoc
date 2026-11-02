import React, { useState, useMemo } from 'react';
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
  BookOpen,
  Search,
  Copy,
  Check,
  Eye,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { FormattedText, cleanMarkdownText } from '../../components/common/FormattedText';
import { formatFileType, formatFileSize } from '../../utils/formatters';

export const DocumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Tabs: default to 'content' (Đọc nội dung) so students immediately see the document
  const [activeTab, setActiveTab] = useState<'content' | 'overview' | 'summary' | 'tools'>('content');
  const [contentViewMode, setContentViewMode] = useState<'text' | 'original'>('text');
  const [contentSearch, setContentSearch] = useState('');
  const [pageFilter, setPageFilter] = useState<number | 'ALL'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  // Copy text chunk helper
  const handleCopyChunk = (text: string, chunkId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(chunkId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Direct download handler ensuring correct binary download with .docx or .pdf extension
  const handleDownloadFile = () => {
    if (!document) return;
    let ext = 'pdf';
    const ft = (document.fileType || '').toLowerCase();
    if (ft.includes('word') || ft.includes('docx') || ft.includes('officedocument')) ext = 'docx';
    else if (ft.includes('msword') || ft.includes('doc')) ext = 'doc';
    else if (ft.includes('txt') || ft.includes('plain')) ext = 'txt';
    else if (ft.includes('png')) ext = 'png';
    else if (ft.includes('jpeg') || ft.includes('jpg')) ext = 'jpg';

    const safeTitle = (document.title || 'tai_lieu')
      .replace(/[\\/:*?"<>|]/g, '_')
      .replace(/\.[^/.]+$/, '');
    const filename = `${safeTitle}.${ext}`;

    const downloadApiUrl = `/api/documents/${document.id}/download`;

    // Fetch binary blob to force browser to save with exact file extension
    fetch(downloadApiUrl)
      .then((res) => {
        if (!res.ok) throw new Error('Download failed');
        return res.blob();
      })
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = window.document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        window.document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(blobUrl);
        window.document.body.removeChild(link);
      })
      .catch(() => {
        window.open(downloadApiUrl, '_blank');
      });
  };

  // Smart formatting function to structure run-together textbook text
  const renderFormattedChunk = (raw: string) => {
    if (!raw) return null;

    // Auto insert line breaks before numbered points and key labels if crammed together
    let cleaned = raw
      .replace(/([.!?])\s+([0-9]+\.\s+)/g, '$1\n\n$2')
      .replace(/(Quy tắc [^\n:]+:?)/g, '\n$1\n\n')
      .replace(
        /([.!?])\s+(Động từ:|Danh từ & Tính từ:|Danh từ:|Tính từ:|Từ "lưỡng tính"[^:]*:|Từ lưỡng tính[^:]*:|Ngoại lệ:|Hậu tố[^:]*:)/g,
        '$1\n\n• $2'
      )
      .replace(/([.!?])\s+(Ví dụ:)/g, '$1\n   ↳ $2');

    const blocks = cleaned
      .split(/\r?\n+/)
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    return (
      <div className="space-y-2.5">
        {blocks.map((block, idx) => {
          // Check if block is a section header (e.g. "1. Từ có 2 âm tiết" or "Quy tắc...")
          const isSectionHeader = /^[0-9]+\.\s+/.test(block) || block.startsWith('Quy tắc');
          if (isSectionHeader) {
            return (
              <div key={idx} className="pt-2 pb-1 border-b border-indigo-100/70 dark:border-slate-800">
                <h4 className="font-bold text-sm sm:text-base text-indigo-700 dark:text-indigo-400">
                  {block}
                </h4>
              </div>
            );
          }

          // Check if line is an example
          if (block.startsWith('↳') || block.startsWith('Ví dụ:')) {
            return (
              <div
                key={idx}
                className="pl-4 py-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium italic bg-slate-50 dark:bg-slate-800/40 rounded-lg"
              >
                {block}
              </div>
            );
          }

          // Bullet item
          if (block.startsWith('•')) {
            return (
              <div
                key={idx}
                className="flex items-start gap-2 pl-1 text-xs sm:text-sm md:text-base leading-relaxed text-slate-800 dark:text-slate-200"
              >
                <span className="text-indigo-500 font-bold shrink-0 mt-0.5">•</span>
                <span>{block.replace(/^•\s*/, '')}</span>
              </div>
            );
          }

          return (
            <p key={idx} className="text-xs sm:text-sm md:text-base leading-relaxed text-slate-800 dark:text-slate-200">
              {block}
            </p>
          );
        })}
      </div>
    );
  };

  // Extract unique page numbers from chunks
  const availablePages = useMemo(() => {
    if (!document?.chunks) return [];
    const pages = Array.from(new Set(document.chunks.map((c) => c.pageNumber))).sort((a, b) => a - b);
    return pages;
  }, [document?.chunks]);

  // Filter chunks based on search query and page filter
  const filteredChunks = useMemo(() => {
    if (!document?.chunks) return [];
    return document.chunks.filter((c) => {
      const matchPage = pageFilter === 'ALL' || c.pageNumber === pageFilter;
      const matchSearch =
        !contentSearch.trim() || c.content.toLowerCase().includes(contentSearch.toLowerCase().trim());
      return matchPage && matchSearch;
    });
  }, [document?.chunks, pageFilter, contentSearch]);

  if (isLoading) {
    return <div className="py-20 text-center text-sm text-slate-400">Đang tải thông tin tài liệu...</div>;
  }

  if (!document) {
    return <div className="py-20 text-center text-sm text-rose-500 font-semibold">Không tìm thấy tài liệu yêu cầu.</div>;
  }

  const latestSummary = summaries[0];
  const isPdf = document.fileType?.toLowerCase().includes('pdf') || document.fileUrl?.endsWith('.pdf');

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/documents')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại Kho tài liệu</span>
      </button>

      {/* Document Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-bold text-xs uppercase px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                {formatFileType(document.fileType)}
              </span>
              <span
                className={`font-semibold text-xs px-3 py-1 rounded-lg ${
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
                <span className="text-xs text-slate-500 font-semibold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                  🏷️ {document.category.name}
                </span>
              )}
            </div>

            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              {document.title}
            </h1>
            <p className="text-sm md:text-base text-slate-500 max-w-3xl leading-relaxed">
              {document.description || 'Chưa có mô tả chi tiết cho giáo trình này.'}
            </p>
          </div>

          {/* Action Buttons: Clear distinction between Xem & Tải */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* 1. Xem nội dung (switch to content tab) */}
            <button
              onClick={() => setActiveTab('content')}
              className={`px-6 py-3 rounded-2xl text-sm sm:text-base font-semibold flex items-center gap-2.5 shadow-xs transition ${
                activeTab === 'content'
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-950/60 dark:border-indigo-800'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
              }`}
            >
              <Eye className="w-5 h-5 text-indigo-600 shrink-0" />
              <span>Xem tài liệu</span>
            </button>

            {/* 2. Tải về máy */}
            <button
              onClick={handleDownloadFile}
              title="Tải tệp gốc về máy tính"
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-sm sm:text-base font-semibold flex items-center gap-2.5 shadow-xs transition"
            >
              <Download className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Tải về máy</span>
            </button>

            {/* 3. Hỏi AI */}
            <button
              onClick={() => startChatMutation.mutate()}
              disabled={startChatMutation.isPending || document.status !== 'READY'}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl text-sm font-bold flex items-center gap-2 shadow-sm transition"
            >
              <MessageSquareCode className="w-4.5 h-4.5" />
              <span>Hỏi đáp RAG AI</span>
            </button>
          </div>
        </div>

        {/* Quick Tabs */}
        <div className="flex gap-6 sm:gap-8 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-sm sm:text-base font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('content')}
            className={`pb-2.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'content'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Nội dung tài liệu</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Tổng quan & Thống kê</span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`pb-2.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'summary'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Tóm tắt AI ({summaries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`pb-2.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'tools'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Công cụ Học tập AI</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Nội dung tài liệu (Document Content / Reader) */}
      {activeTab === 'content' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 space-y-6">
          {/* Reader Sub-Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <span>Nội dung tài liệu học tập</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {document.chunks && document.chunks.length > 0
                  ? `Đã phân tích ${document.chunks.length} đoạn văn bản qua ${document.pageCount || availablePages.length || 1} trang.`
                  : 'Đang hiển thị tệp tài liệu.'}
              </p>
            </div>

            {/* Mode Switcher (if PDF) */}
            {isPdf && (
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs sm:text-sm font-bold">
                <button
                  onClick={() => setContentViewMode('text')}
                  className={`px-3.5 py-1.5 rounded-xl transition ${
                    contentViewMode === 'text'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  📄 Văn bản trích xuất
                </button>
                <button
                  onClick={() => setContentViewMode('original')}
                  className={`px-3.5 py-1.5 rounded-xl transition ${
                    contentViewMode === 'original'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  📑 Xem tệp gốc (PDF)
                </button>
              </div>
            )}
          </div>

          {/* Mode 1: Extracted Text / Chunks Reader */}
          {contentViewMode === 'text' && (
            <div className="space-y-5">
              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={contentSearch}
                    onChange={(e) => setContentSearch(e.target.value)}
                    placeholder="Tìm kiếm từ khóa trong nội dung bài học..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                {availablePages.length > 1 && (
                  <select
                    value={pageFilter}
                    onChange={(e) =>
                      setPageFilter(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value, 10))
                    }
                    className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="ALL">Tất cả các trang ({availablePages.length} trang)</option>
                    {availablePages.map((pg) => (
                      <option key={pg} value={pg}>
                        Trang {pg}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Chunks List */}
              {filteredChunks.length > 0 ? (
                <div className="space-y-4">
                  {filteredChunks.map((chunk) => (
                    <div
                      key={chunk.id}
                      className="p-5 md:p-6 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 hover:border-indigo-200 transition space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                        <span className="font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg">
                          Trang {chunk.pageNumber} • Đoạn {chunk.chunkIndex + 1}
                        </span>
                        <button
                          onClick={() => handleCopyChunk(chunk.content, chunk.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 transition"
                          title="Sao chép đoạn trích dẫn này"
                        >
                          {copiedId === chunk.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600 font-semibold">Đã chép</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Sao chép</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="text-xs sm:text-sm md:text-base leading-relaxed text-slate-800 dark:text-slate-200 font-normal">
                        {renderFormattedChunk(chunk.content)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : document.status === 'PROCESSING' ? (
                <div className="py-16 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Hệ thống đang tiến hành trích xuất nội dung văn bản & vector hóa AI...
                  </p>
                  <p className="text-xs text-slate-400">Vui lòng tải lại trang sau giây lát để xem nội dung.</p>
                </div>
              ) : (
                <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {contentSearch
                      ? 'Không tìm thấy đoạn văn nào chứa từ khóa tìm kiếm.'
                      : 'Chưa có dữ liệu trích xuất văn bản cho tài liệu này.'}
                  </p>
                  {isPdf && (
                    <button
                      onClick={() => setContentViewMode('original')}
                      className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Chuyển sang xem tệp PDF trực tiếp</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Mode 2: Original PDF Viewer Embed */}
          {contentViewMode === 'original' && isPdf && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Trình xem tài liệu PDF tích hợp</span>
                <a
                  href={document.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Mở trong cửa sổ mới</span>
                </a>
              </div>
              <iframe
                src={document.fileUrl}
                title={document.title}
                className="w-full h-[700px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100"
              />
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 mb-4">
                Thông tin chi tiết tài liệu
              </h2>
              <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-400 block mb-1">Số trang trích xuất:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {document.pageCount} trang
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Dung lượng tệp:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatFileSize(document.fileSize)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Người tải lên:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {document.uploadedBy?.fullName || 'Hệ thống SmartDoc'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Lượt xem & Luyện tập:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {document.viewCount} lượt
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Lượt tải về máy:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {document.downloadCount || 0} lượt
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Ngày cập nhật:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(document.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-indigo-50/70 dark:bg-slate-900 rounded-3xl border border-indigo-100 dark:border-slate-800 p-6">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs sm:text-sm mb-2">
                <Sparkles className="w-4 h-4" />
                <span>Tính năng AI Khả dụng</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Tài liệu này đã hoàn tất quá trình sinh embedding và sẵn sàng phục vụ các tác vụ học tập thông minh.
              </p>
              <div className="space-y-2.5">
                <button
                  onClick={() => generateSummaryMutation.mutate('DETAILED')}
                  disabled={generateSummaryMutation.isPending}
                  className="w-full py-2.5 px-3.5 bg-white dark:bg-slate-800 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:text-indigo-600 flex items-center justify-between transition"
                >
                  <span>Tạo bản tóm tắt chi tiết</span>
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                </button>
                <button
                  onClick={() => navigate(`/quiz?documentId=${document.id}`)}
                  className="w-full py-2.5 px-3.5 bg-white dark:bg-slate-800 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:text-indigo-600 flex items-center justify-between transition"
                >
                  <span>Tạo đề trắc nghiệm AI</span>
                  <BrainCircuit className="w-4 h-4 text-emerald-500" />
                </button>
                <button
                  onClick={() => navigate(`/flashcards?documentId=${document.id}`)}
                  className="w-full py-2.5 px-3.5 bg-white dark:bg-slate-800 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:text-indigo-600 flex items-center justify-between transition"
                >
                  <span>Tạo bộ Flashcard</span>
                  <CreditCard className="w-4 h-4 text-cyan-500" />
                </button>
                <button
                  onClick={() => navigate(`/mindmap?documentId=${document.id}`)}
                  className="w-full py-2.5 px-3.5 bg-white dark:bg-slate-800 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:text-indigo-600 flex items-center justify-between transition"
                >
                  <span>Tạo Mindmap kiến thức</span>
                  <Network className="w-4 h-4 text-amber-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Summary */}
      {activeTab === 'summary' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <img src="/logo.png" alt="SmartDoc" className="w-5 h-5 rounded-xs object-contain" />
              <span>Bản tóm tắt nội dung học tập</span>
            </h2>
            <button
              onClick={() => generateSummaryMutation.mutate('DETAILED')}
              disabled={generateSummaryMutation.isPending}
              className="px-3.5 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 hover:bg-indigo-100 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${generateSummaryMutation.isPending ? 'animate-spin' : ''}`} />
              <span>Tạo lại tóm tắt mới</span>
            </button>
          </div>

          {!latestSummary ? (
            <div className="text-center py-12">
              <p className="text-xs sm:text-sm text-slate-400 mb-3">Tài liệu này chưa có bản tóm tắt nào.</p>
              <button
                onClick={() => generateSummaryMutation.mutate('DETAILED')}
                disabled={generateSummaryMutation.isPending}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-semibold shadow-sm transition"
              >
                Bấm để AI tạo tóm tắt ngay
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                <FormattedText content={latestSummary.content} />
              </div>

              {/* Key Points */}
              {latestSummary.keyPoints && latestSummary.keyPoints.length > 0 && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-indigo-600 mb-2">
                    Các luận điểm cốt lõi cần nhớ
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    {latestSummary.keyPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{cleanMarkdownText(point)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Important Terms */}
              {latestSummary.importantTerms && latestSummary.importantTerms.length > 0 && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-cyan-600 mb-3">
                    Thuật ngữ quan trọng
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {latestSummary.importantTerms.map((t, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
                      >
                        <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{t.term}</p>
                        <p className="text-xs text-slate-500 mt-1">{t.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Tools */}
      {activeTab === 'tools' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => navigate(`/quiz?documentId=${document.id}`)}
            className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 cursor-pointer transition shadow-sm"
          >
            <BrainCircuit className="w-8 h-8 text-emerald-500 mb-3" />
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Luyện tập trắc nghiệm</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              AI phân tích tài liệu và sinh bộ câu hỏi trắc nghiệm kèm giải thích cặn kẽ.
            </p>
          </div>

          <div
            onClick={() => navigate(`/flashcards?documentId=${document.id}`)}
            className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 cursor-pointer transition shadow-sm"
          >
            <CreditCard className="w-8 h-8 text-cyan-500 mb-3" />
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Thẻ ghi nhớ Flashcards</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Ghi nhớ định nghĩa, công thức và bẫy thi cử với cơ chế lật thẻ 3D.
            </p>
          </div>

          <div
            onClick={() => navigate(`/mindmap?documentId=${document.id}`)}
            className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 cursor-pointer transition shadow-sm"
          >
            <Network className="w-8 h-8 text-amber-500 mb-3" />
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Sơ đồ tư duy (Mindmap)</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Khái quát cấu trúc kiến thức phân cấp dạng cây, trực quan, có thể phóng to thu nhỏ.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
