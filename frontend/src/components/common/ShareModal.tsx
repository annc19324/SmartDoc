import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  Mail,
  X,
  FileText,
  BrainCircuit,
  Network,
  BookOpen,
  Sparkles,
  Download,
} from 'lucide-react';

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  itemTitle?: string;
  url: string; // Relative like "/documents/123" or absolute URL
  type?: 'document' | 'quiz' | 'mindmap' | 'summary' | 'flashcard';
  description?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  itemTitle,
  url,
  type = 'document',
  description,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'qr'>('link');

  if (!isOpen) return null;

  // Resolve absolute URL
  const getFullUrl = () => {
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const fullUrl = getFullUrl();
  const displayTitle = itemTitle || title;

  // Handle Copy to Clipboard
  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = fullUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Không thể sao chép liên kết:', err);
    }
  };

  // Native Web Share API (Mobile / Tablet browsers)
  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;
  const handleNativeShare = async () => {
    if (!canNativeShare) return;
    try {
      await navigator.share({
        title: displayTitle,
        text: description || `Xem ${displayTitle} trên SmartDoc AI`,
        url: fullUrl,
      });
    } catch {
      // User cancelled
    }
  };

  // QR Code URL (high resolution)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    fullUrl
  )}&margin=10`;

  // Download QR Code image
  const handleDownloadQR = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `smartdoc-qr-${(itemTitle || 'share').toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Lỗi khi tải mã QR:', err);
    }
  };

  // Icon by Type
  const renderTypeIcon = () => {
    switch (type) {
      case 'quiz':
        return <BrainCircuit className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'mindmap':
        return <Network className="w-5 h-5 text-purple-600 shrink-0" />;
      case 'summary':
        return <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />;
      case 'flashcard':
        return <BookOpen className="w-5 h-5 text-cyan-600 shrink-0" />;
      default:
        return <FileText className="w-5 h-5 text-indigo-600 shrink-0" />;
    }
  };

  const getTypeNameVi = () => {
    switch (type) {
      case 'quiz':
        return 'Bài tập / Bài thi Quiz';
      case 'mindmap':
        return 'Sơ đồ tư duy';
      case 'summary':
        return 'Bản tóm tắt kiến thức';
      case 'flashcard':
        return 'Bộ Flashcards';
      default:
        return 'Tài liệu học tập';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 max-w-lg w-full shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0">
              {renderTypeIcon()}
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                {getTypeNameVi()}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                {displayTitle}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch: Link vs QR Code */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition ${
              activeTab === 'link'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Liên kết chia sẻ</span>
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition ${
              activeTab === 'qr'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Mã QR quét trên điện thoại</span>
          </button>
        </div>

        {/* Tab 1: Direct Link & Copy */}
        {activeTab === 'link' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                Đường dẫn liên kết trực tiếp
              </label>
              <div className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl">
                <input
                  type="text"
                  readOnly
                  value={fullUrl}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 w-full outline-none font-mono"
                />
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition shadow-xs ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Đã chép!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Share Platforms */}
            <div>
              <span className="block text-xs font-semibold text-slate-500 mb-2">
                Chia sẻ nhanh qua nền tảng
              </span>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition flex flex-col items-center gap-1 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                    f
                  </div>
                  <span className="font-semibold text-[11px] text-slate-600 dark:text-slate-300">Facebook</span>
                </a>

                {/* Zalo (Direct share prompt) */}
                <button
                  onClick={() => {
                    handleCopy();
                    window.open(`https://chat.zalo.me/`, '_blank');
                  }}
                  className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 transition flex flex-col items-center gap-1 group"
                  title="Sao chép link và mở Zalo"
                >
                  <div className="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    Zalo
                  </div>
                  <span className="font-semibold text-[11px] text-slate-600 dark:text-slate-300">Zalo</span>
                </button>

                {/* Telegram */}
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(displayTitle)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/30 transition flex flex-col items-center gap-1 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-[11px] text-slate-600 dark:text-slate-300">Telegram</span>
                </a>

                {/* Email */}
                <a
                  href={`mailto:?subject=${encodeURIComponent(displayTitle)}&body=${encodeURIComponent(
                    `Chào bạn,\n\nHãy xem nội dung trên SmartDoc AI tại liên kết sau:\n${fullUrl}\n\nTrân trọng!`
                  )}`}
                  className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition flex flex-col items-center gap-1 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-[11px] text-slate-600 dark:text-slate-300">Email</span>
                </a>
              </div>
            </div>

            {/* Native Mobile Share Sheet button */}
            {canNativeShare && (
              <button
                onClick={handleNativeShare}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <Share2 className="w-4 h-4 text-indigo-600" />
                <span>Mở menu chia sẻ của thiết bị (AirDrop, Bluetooth, App...)</span>
              </button>
            )}
          </div>
        )}

        {/* Tab 2: QR Code view */}
        {activeTab === 'qr' && (
          <div className="flex flex-col items-center text-center space-y-4 py-2">
            <div className="p-3 bg-white rounded-2xl border-2 border-dashed border-indigo-200 shadow-md">
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-xl"
              />
            </div>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Dùng camera điện thoại hoặc Zalo quét mã QR trên để mở ngay trên điện thoại hoặc trình chiếu cho sinh viên trong lớp học.
            </p>
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={handleDownloadQR}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4" />
                <span>Tải ảnh mã QR</span>
              </button>
              <button
                onClick={handleCopy}
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Đã chép link!' : 'Chép liên kết'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Người nhận mở link có thể xem và thực hành trực tiếp</span>
          <button
            onClick={onClose}
            className="font-bold text-slate-600 dark:text-slate-300 hover:underline"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
