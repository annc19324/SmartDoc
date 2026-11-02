import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  BookOpen,
  FolderTree,
  Eye,
  Maximize2,
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

  return (
    <div className="flex items-center my-3 relative group">
      {/* Node Card */}
      <div className="shrink-0 z-10">
        <div
          onClick={() => hasChildren && setIsOpen(!isOpen)}
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
  const [scale, setScale] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <img src="/ai-logo.png" alt="SmartDoc AI" className="w-5 h-5 sm:w-6 sm:h-6 object-contain shrink-0" />
            <span>Sơ Đồ Tư Duy Kiến Thức (Mindmap)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Trực quan hóa cấu trúc kiến thức phân cấp cân đối, cho phép thu phóng và đóng/mở nhánh học tập
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Tạo sơ đồ tư duy</span>
        </button>
      </div>

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
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-xs">
            <div className="flex items-center gap-2.5 truncate">
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                {currentMindmap.title}
              </span>
              {currentMindmap.document && (
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-lg truncate max-w-xs">
                  {currentMindmap.document.title}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-slate-500">
              <button
                onClick={() => setScale((s) => Math.max(s - 0.1, 0.5))}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Thu nhỏ"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold w-12 text-center text-slate-700 dark:text-slate-300">
                {(scale * 100).toFixed(0)}%
              </span>
              <button
                onClick={() => setScale((s) => Math.min(s + 0.1, 1.6))}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Phóng to"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setScale(1)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 ml-1 transition"
                title="Đặt lại 100%"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Mindmap Tree Container */}
          <div className="bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 min-h-[550px] overflow-auto shadow-inner relative">
            <div
              className="inline-block min-w-max p-4"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                transition: 'transform 0.15s ease-out',
              }}
            >
              <TreeNode node={currentMindmap.treeData} level={0} />
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
