import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { documentApi, systemApi } from '../../services/api';
import {
  BookOpen,
  Search,
  Filter,
  UploadCloud,
  FileText,
  Eye,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

export const DocumentListPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['documents', search, selectedCategory],
    queryFn: () =>
      documentApi.list({
        search: search || undefined,
        categoryId: selectedCategory || undefined,
        limit: 12,
      }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => systemApi.listCategories(),
  });

  const documents = data?.documents || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            <span>Kho Tài Liệu Học Tập</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tổng hợp giáo trình, bài giảng, tài liệu tham khảo được AI phân tích và số hóa
          </p>
        </div>
        <button
          onClick={() => navigate('/documents/upload')}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Tải lên tài liệu</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tiêu đề hoặc nội dung tài liệu..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
          />
        </div>

        <div className="relative sm:w-64">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition cursor-pointer appearance-none"
          >
            <option value="">Tất cả danh mục môn học</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Document Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-slate-400">Đang tải danh sách tài liệu...</div>
      ) : documents.length === 0 ? (
        <div className="py-16 text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Không tìm thấy tài liệu phù hợp</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Thử thay đổi bộ lọc hoặc tải lên tài liệu mới để bắt đầu học tập và tương tác AI.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => navigate(`/documents/${doc.id}`)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-indigo-500 hover:shadow-lg transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3 text-[11px]">
                  <span className="font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 uppercase">
                    {doc.fileType.split('/')[1] || 'DOC'}
                  </span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                      doc.status === 'READY'
                        ? 'bg-emerald-50 text-emerald-600'
                        : doc.status === 'PROCESSING'
                        ? 'bg-amber-50 text-amber-600 animate-pulse'
                        : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 transition line-clamp-2">
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                  {doc.description || 'Chưa có tóm tắt giới thiệu tài liệu.'}
                </p>

                {doc.category && (
                  <span className="inline-block mt-3 text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    🏷️ {doc.category.name}
                  </span>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  {doc.pageCount} trang
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {doc.viewCount} xem
                </span>
                <span className="flex items-center gap-1 text-indigo-600 font-medium">
                  <Sparkles className="w-3 h-3" />
                  AI RAG Ready
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
