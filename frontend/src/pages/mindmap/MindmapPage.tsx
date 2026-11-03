import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toPng } from 'html-to-image';
import { aiApi, documentApi } from '../../services/api';
import { MindmapNode, Mindmap } from '../../types';
import {
  Network,
  Plus,
  ChevronRight,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FolderTree,
  Maximize2,
  Minimize2,
  Download,
  Move,
  Loader2,
  X,
} from 'lucide-react';

// Color themes for Level 1 branches
const branchThemes = [
  {
    border: 'border-blue-400 dark:border-blue-500',
    text: 'text-blue-800 dark:text-blue-200',
    bg: 'bg-blue-50/90 dark:bg-blue-950/50',
    badge: 'bg-blue-500',
    line: 'bg-blue-400 dark:bg-blue-600',
  },
  {
    border: 'border-emerald-400 dark:border-emerald-500',
    text: 'text-emerald-800 dark:text-emerald-200',
    bg: 'bg-emerald-50/90 dark:bg-emerald-950/50',
    badge: 'bg-emerald-500',
    line: 'bg-emerald-400 dark:bg-emerald-600',
  },
  {
    border: 'border-purple-400 dark:border-purple-500',
    text: 'text-purple-800 dark:text-purple-200',
    bg: 'bg-purple-50/90 dark:bg-purple-950/50',
    badge: 'bg-purple-500',
    line: 'bg-purple-400 dark:bg-purple-600',
  },
  {
    border: 'border-amber-400 dark:border-amber-500',
    text: 'text-amber-800 dark:text-amber-200',
    bg: 'bg-amber-50/90 dark:bg-amber-950/50',
    badge: 'bg-amber-500',
    line: 'bg-amber-400 dark:bg-amber-600',
  },
  {
    border: 'border-rose-400 dark:border-rose-500',
    text: 'text-rose-800 dark:text-rose-200',
    bg: 'bg-rose-50/90 dark:bg-rose-950/50',
    badge: 'bg-rose-500',
    line: 'bg-rose-400 dark:bg-rose-600',
  },
  {
    border: 'border-cyan-400 dark:border-cyan-500',
    text: 'text-cyan-800 dark:text-cyan-200',
    bg: 'bg-cyan-50/90 dark:bg-cyan-950/50',
    badge: 'bg-cyan-500',
    line: 'bg-cyan-400 dark:bg-cyan-600',
  },
];

// Recursive Symmetrically-Centered Mindmap Node Component
const TreeNode: React.FC<{
  node: MindmapNode;
  level?: number;
  branchIndex?: number;
}> = ({ node, level = 0, branchIndex = 0 }) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const theme = branchThemes[branchIndex % branchThemes.length];

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="flex items-center my-3 relative group">
      {/* Node Card */}
      <div className="shrink-0 z-10">
        <div
          onClick={handleToggle}
          className={`transition-all duration-200 select-none flex items-center gap-2.5 cursor-pointer shadow-xs ${
            level === 0
              ? 'px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 text-white font-bold text-sm sm:text-base shadow-md ring-4 ring-indigo-100 dark:ring-indigo-950/60'
              : level === 1
              ? `px-4 py-2.5 rounded-2xl border-2 font-bold text-xs sm:text-sm shadow-xs ${theme.border} ${theme.bg} ${theme.text} hover:shadow-md`
              : 'px-3.5 py-2 rounded-xl border font-medium text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
          } hover:scale-[1.02]`}
        >
          {level === 0 && (
            <img src="/ai-logo.png" alt="Root" className="w-4 h-4 sm:w-5 sm:h-5 object-contain shrink-0" />
          )}
          {level === 1 && <span className={`w-2.5 h-2.5 rounded-full ${theme.badge} shrink-0`} />}
          {level > 1 && <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />}

          <span className="whitespace-nowrap max-w-xs sm:max-w-md truncate">{node.label}</span>

          {hasChildren && (
            <button
              type="button"
              onClick={handleToggle}
              className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition shrink-0 ml-0.5"
            >
              {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Children Branches with Balanced Horizontal Connector Tree */}
      {hasChildren && isOpen && (
        <div className="flex items-center">
          {/* Stem from parent into the branch spine */}
          <div className="w-8 h-0.5 bg-slate-300 dark:bg-slate-700 shrink-0" />

          {/* Children Column */}
          <div className="flex flex-col justify-center space-y-4 relative py-2">
            {/* Vertical connector spine */}
            {node.children!.length > 1 && (
              <div
                className="absolute left-0 w-0.5 bg-slate-300 dark:bg-slate-700"
                style={{
                  top: '1.4rem',
                  bottom: '1.4rem',
                }}
              />
            )}

            {node.children!.map((child, idx) => (
              <div key={child.id} className="flex items-center relative">
                {/* Horizontal line entering this child */}
                <div className="w-6 h-0.5 bg-slate-300 dark:bg-slate-700 shrink-0" />
                <TreeNode
                  node={child}
                  level={level + 1}
                  branchIndex={level === 0 ? idx : branchIndex}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const MindmapPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const docIdParam = searchParams.get('documentId') || '';

  const [selectedDocId, setSelectedDocId] = useState(docIdParam);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Canvas Viewport Pan & Zoom State
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 60, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showHelpPill, setShowHelpPill] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, panX: 0, panY: 0 });

  const { data: mindmaps = [], isLoading } = useQuery({
    queryKey: ['mindmaps', docIdParam],
    queryFn: () => aiApi.listMindmaps(docIdParam || undefined),
  });

  const { data: docsData } = useQuery({
    queryKey: ['documentsForMindmap'],
    queryFn: () => documentApi.list({ limit: 50, status: 'READY' }),
  });

  const availableDocs = docsData?.documents || [];
  const currentMindmap = mindmaps[0];

  const generateMutation = useMutation({
    mutationFn: () => aiApi.generateMindmap(selectedDocId),
    onSuccess: () => {
      setShowCreateModal(false);
      queryClient.invalidateQueries({ queryKey: ['mindmaps'] });
    },
  });

  // 1. Mouse Drag to Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left-click
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('select') || target.closest('input')) {
      return;
    }

    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;
      setPan({
        x: dragStartRef.current.panX + dx,
        y: dragStartRef.current.panY + dy,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // 2. Touch Drag Support for Mobile/Tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      dragStartRef.current = {
        mouseX: touch.clientX,
        mouseY: touch.clientY,
        panX: pan.x,
        panY: pan.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStartRef.current.mouseX;
    const dy = touch.clientY - dragStartRef.current.mouseY;
    setPan({
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // 3. Mouse Wheel to Zoom (Focal-point smooth zoom)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;

      setScale((prevScale) => {
        const newScale = Math.min(Math.max(prevScale * zoomFactor, 0.35), 2.5);
        const actualFactor = newScale / prevScale;

        setPan((prevPan) => ({
          x: mouseX - (mouseX - prevPan.x) * actualFactor,
          y: mouseY - (mouseY - prevPan.y) * actualFactor,
        }));

        return Math.round(newScale * 100) / 100;
      });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // 4. Keyboard Shortcuts (Escape to exit fullscreen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // 5. Reset View
  const handleResetView = () => {
    setScale(1);
    setPan({ x: 60, y: 100 });
  };

  // 6. Download Mindmap as PNG Image
  const handleDownloadImage = async () => {
    if (!treeRef.current) return;
    setIsDownloading(true);
    try {
      const node = treeRef.current;
      const width = node.scrollWidth + 100;
      const height = node.scrollHeight + 100;
      const isDark = document.documentElement.classList.contains('dark');

      const dataUrl = await toPng(node, {
        quality: 0.98,
        pixelRatio: 2,
        width,
        height,
        backgroundColor: isDark ? '#090d16' : '#ffffff',
        style: {
          transform: 'none',
          transformOrigin: 'top left',
          margin: '0',
          padding: '40px',
        },
      });

      const safeTitle = (currentMindmap?.title || 'so-do-tu-duy')
        .toLowerCase()
        .replace(/[^a-z0-9à-ỹ]+/gi, '-')
        .replace(/^-+|-+$/g, '');

      const link = document.createElement('a');
      link.download = `smartdoc-mindmap-${safeTitle}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Lỗi khi xuất hình ảnh sơ đồ tư duy:', err);
      alert('Không thể xuất file hình ảnh. Vui lòng thử lại!');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={`space-y-3 sm:space-y-4 max-w-7xl mx-auto ${isFullscreen ? '' : 'pb-4'}`}>
      {/* Header (Hidden in fullscreen mode for distraction-free view) */}
      {!isFullscreen && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <img src="/ai-logo.png" alt="SmartDoc AI" className="w-5 h-5 sm:w-6 sm:h-6 object-contain shrink-0" />
              <span>Sơ Đồ Tư Duy Kiến Thức (Mindmap)</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Khám phá cây kiến thức tương tác: lăn chuột phóng to/thu nhỏ, kéo chuột di chuyển tự do và tải ảnh về máy.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 sm:px-5 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <span>Tạo sơ đồ tư duy</span>
          </button>
        </div>
      )}

      {/* Main Canvas View */}
      {isLoading ? (
        <div className="py-20 text-center text-sm text-slate-400">Đang tải sơ đồ tư duy...</div>
      ) : !currentMindmap ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <Network className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Chưa có sơ đồ tư duy nào</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto mb-4">
            Chọn tài liệu để hệ thống tự động phân tích và tạo cây sơ đồ tư duy trực quan cho bạn.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold"
          >
            Tạo sơ đồ đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2.5 sm:p-3 shadow-xs">
            <div className="flex items-center gap-2 truncate min-w-0">
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                {currentMindmap.title}
              </span>
              {currentMindmap.document && (
                <span className="text-[11px] sm:text-xs text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-lg truncate max-w-[160px] sm:max-w-xs">
                  {currentMindmap.document.title}
                </span>
              )}
            </div>

            {/* Quick Actions & View Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Download Image Button */}
              <button
                onClick={handleDownloadImage}
                disabled={isDownloading}
                className="px-2.5 sm:px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/70 dark:hover:bg-indigo-900/60 dark:text-indigo-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs disabled:opacity-50"
                title="Tải hình ảnh sơ đồ tư duy chất lượng cao (PNG)"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span className="hidden sm:inline">Đang xuất ảnh...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải ảnh sơ đồ</span>
                  </>
                )}
              </button>

              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block mx-0.5" />

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 text-slate-600 dark:text-slate-300">
                <button
                  onClick={() => setScale((s) => Math.max(Math.round((s - 0.1) * 10) / 10, 0.35))}
                  className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition"
                  title="Thu nhỏ"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold w-11 text-center select-none">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={() => setScale((s) => Math.min(Math.round((s + 0.1) * 10) / 10, 2.5))}
                  className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition"
                  title="Phóng to"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Reset Viewport */}
              <button
                onClick={handleResetView}
                className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Đặt lại góc nhìn chuẩn (100%)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Toàn màn hình'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Fixed-Size Interactive Mindmap Canvas (User never needs to scroll the outer page) */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`${
              isFullscreen
                ? 'fixed inset-0 z-50 w-screen h-screen rounded-none border-0'
                : 'relative h-[calc(100vh-215px)] min-h-[480px] max-h-[820px] rounded-3xl border border-slate-200 dark:border-slate-800'
            } bg-slate-50 dark:bg-slate-950 bg-[radial-gradient(#cbd5e1_1.2px,transparent_1.2px)] [background-size:24px_24px] dark:bg-[radial-gradient(#334155_1.2px,transparent_1.2px)] overflow-hidden shadow-inner select-none cursor-grab active:cursor-grabbing transition-all duration-150`}
          >
            {/* Top Fullscreen Exit Header (if in fullscreen mode) */}
            {isFullscreen && (
              <div className="absolute top-4 right-4 z-40 flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Chế độ toàn màn hình</span>
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Thoát toàn màn hình (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Floating Navigation Hint Pill */}
            {showHelpPill && (
              <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm text-xs text-slate-600 dark:text-slate-300">
                <Move className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Lăn chuột để phóng to/thu nhỏ • Giữ chuột kéo để di chuyển</span>
                <button
                  onClick={() => setShowHelpPill(false)}
                  className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="Ẩn hướng dẫn"
                >
                  ×
                </button>
              </div>
            )}

            {/* Draggable & Zoomable Canvas Content Layer */}
            <div
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                transformOrigin: 'top left',
                transition: isDragging ? 'none' : 'transform 0.05s ease-out',
              }}
              className="inline-block min-w-max p-12 will-change-transform"
            >
              <div ref={treeRef} className="p-8 inline-block bg-transparent rounded-3xl">
                <TreeNode node={currentMindmap.treeData} level={0} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Mindmap */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <img src="/ai-logo.png" alt="SmartDoc AI" className="w-5 h-5 object-contain shrink-0" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Tạo Sơ Đồ Tư Duy Kiến Thức</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 py-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Chọn tài liệu phân tích <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">-- Chọn tài liệu trong thư viện --</option>
                  {availableDocs.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                Hệ thống sẽ tự động quét toàn bộ cây khái niệm và phân cấp các luận điểm thành sơ đồ nhánh cân đối.
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => generateMutation.mutate()}
                disabled={!selectedDocId || generateMutation.isPending}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition"
              >
                {generateMutation.isPending ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Đang trích xuất cây kiến thức...</span>
                  </>
                ) : (
                  <>
                    <FolderTree className="w-4.5 h-4.5" />
                    <span>Khởi tạo sơ đồ tư duy</span>
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
