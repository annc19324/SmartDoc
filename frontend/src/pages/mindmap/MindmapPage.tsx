import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi, documentApi } from '../../services/api';
import { MindmapNode, Mindmap } from '../../types';
import {
  Network,
  Sparkles,
  Plus,
  ChevronRight,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

// Recursive Mindmap Node Component
const TreeNode: React.FC<{
  node: MindmapNode;
  level?: number;
}> = ({ node, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const levelColors = [
    'bg-indigo-600 text-white font-bold text-sm shadow-md',
    'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 font-semibold border-indigo-200 text-xs shadow-xs',
    'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 text-xs',
    'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 text-[11px]',
  ];

  return (
    <div className="flex items-start gap-4 my-2">
      {/* Node Pill */}
      <div className="flex items-center">
        <div
          onClick={() => hasChildren && setIsOpen(!isOpen)}
          className={`px-3.5 py-2 rounded-2xl border transition flex items-center gap-2 cursor-pointer select-none ${
            levelColors[Math.min(level, levelColors.length - 1)]
          } hover:scale-102`}
        >
          {hasChildren && (
            <span className="p-0.5 rounded-full hover:bg-black/10">
              {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </span>
          )}
          <span>{node.label}</span>
        </div>
      </div>

      {/* Children branches */}
      {hasChildren && isOpen && (
        <div className="pl-4 border-l-2 border-indigo-200 dark:border-slate-700 space-y-1">
          {node.children!.map((child) => (
            <TreeNode key={child.id} node={child} level={level + 1} />
          ))}
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
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Network className="w-6 h-6 text-amber-500" />
            <span>Sơ Đồ Tư Duy Kiến Thức (Mindmap)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Trực quan hóa cấu trúc kiến thức phân cấp từ tài liệu, cho phép đóng/mở nhánh và phóng to/thu nhỏ
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>Tạo Mindmap Bằng AI</span>
        </button>
      </div>

      {/* Main Canvas View */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-slate-400">Đang tải sơ đồ tư duy...</div>
      ) : !currentMindmap ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <Network className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Chưa có sơ đồ tư duy nào</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
            Chọn tài liệu để AI tự động phân tích và tạo cây sơ đồ tư duy trực quan cho bạn.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-semibold"
          >
            Tạo sơ đồ đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{currentMindmap.title}</span>
              {currentMindmap.document && (
                <span className="text-[11px] text-slate-400">({currentMindmap.document.title})</span>
              )}
            </div>

            <div className="flex items-center gap-1 text-slate-500">
              <button
                onClick={() => setScale((s) => Math.max(s - 0.1, 0.6))}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Thu nhỏ"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold w-12 text-center">{(scale * 100).toFixed(0)}%</span>
              <button
                onClick={() => setScale((s) => Math.min(s + 0.1, 1.6))}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Phóng to"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setScale(1)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ml-1"
                title="Đặt lại"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Mindmap Tree Container */}
          <div className="bg-slate-50/50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 min-h-[500px] overflow-auto shadow-inner">
            <div
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
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tạo Mindmap Bằng AI</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Chọn tài liệu nguồn <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
              >
                <option value="">-- Chọn tài liệu trong thư viện --</option>
                {availableDocs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <button
                onClick={() => generateMutation.mutate()}
                disabled={!selectedDocId || generateMutation.isPending}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow"
              >
                {generateMutation.isPending ? (
                  <>
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>AI đang phân cấp sơ đồ tư duy...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Khởi tạo Mindmap</span>
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
