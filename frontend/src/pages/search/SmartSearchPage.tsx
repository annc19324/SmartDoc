import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { documentApi } from '../../services/api';
import { Search, Sparkles, BookOpen, Layers, ArrowRight, ExternalLink } from 'lucide-react';

export const SmartSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryParam = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(queryParam);

  useEffect(() => {
    setInputValue(queryParam);
  }, [queryParam]);

  const { data: results = [], isLoading, isFetching } = useQuery({
    queryKey: ['smartSearch', queryParam],
    queryFn: () => documentApi.smartSearch(queryParam),
    enabled: !!queryParam.trim(),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Vector Similarity • Neon pgvector</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
          Tìm Kiếm Ngữ Nghĩa Thông Minh (Smart Search)
        </h1>
        <p className="text-xs text-slate-500 max-w-lg mx-auto">
          Không chỉ tìm kiếm theo từ khóa cứng nhắc. Hệ thống hiểu ý định câu hỏi của bạn và tìm chính xác các đoạn trích
          liên quan trong tài liệu học tập.
        </p>
      </div>

      {/* Big Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ví dụ: thuật toán sắp xếp nhanh quick sort, cấu trúc dữ liệu cây nhị phân, thuật toán dijkstra..."
          className="w-full pl-12 pr-28 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs md:text-sm shadow-md focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
        />
        <button
          type="submit"
          disabled={isLoading || isFetching}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
        >
          {isLoading || isFetching ? (
            <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <span>Tìm kiếm</span>
          )}
        </button>
      </form>

      {/* Suggested Search Prompts */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400">Gợi ý tìm kiếm:</span>
        {[
          'Quick Sort hoạt động như thế nào?',
          'Cây tìm kiếm nhị phân BST',
          'Độ phức tạp thuật toán Dijkstra',
          'Đặc điểm cấu trúc Stack và Queue',
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInputValue(item);
              setSearchParams({ q: item });
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-medium transition"
          >
            {item}
          </button>
        ))}
      </div>

      {/* Search Results */}
      {queryParam && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Tìm thấy <strong className="text-slate-900 dark:text-white">{results.length}</strong> tài liệu phù hợp với
              ngữ cảnh
            </span>
          </div>

          {isLoading || isFetching ? (
            <div className="py-16 text-center text-xs text-slate-400">Đang quét vector database pgvector...</div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Không tìm thấy tài liệu phù hợp</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Hãy thử diễn đạt lại câu hỏi hoặc tải thêm tài liệu mới lên thư viện.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((doc: any) => (
                <div
                  key={doc.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-indigo-400 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-bold text-[10px] px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 uppercase">
                          {doc.fileType.split('/')[1] || 'PDF'}
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          Độ tương đồng: {(doc.topSimilarity * 100).toFixed(1)}%
                        </span>
                      </div>
                      <h3
                        onClick={() => navigate(`/documents/${doc.id}`)}
                        className="font-bold text-sm text-slate-900 dark:text-white hover:text-indigo-600 cursor-pointer transition flex items-center gap-1.5"
                      >
                        <span>{doc.title}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">{doc.description}</p>
                    </div>

                    <button
                      onClick={() => navigate(`/documents/${doc.id}`)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold shrink-0 transition"
                    >
                      Mở tài liệu
                    </button>
                  </div>

                  {/* Matched Snippets from Vector Search */}
                  {doc.matchedSnippets && doc.matchedSnippets.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Đoạn trích dẫn khớp nhất trong tài liệu:
                      </p>
                      {doc.matchedSnippets.map((snippet: any, sIdx: number) => (
                        <div
                          key={sIdx}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
                        >
                          <div className="flex items-center gap-2 mb-1 text-[11px] font-semibold text-indigo-600">
                            <Layers className="w-3 h-3" />
                            <span>Trang {snippet.pageNumber}</span>
                            <span className="text-slate-400 font-normal">
                              (Khớp {(snippet.similarity * 100).toFixed(0)}%)
                            </span>
                          </div>
                          <p className="italic">"{snippet.snippet}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
