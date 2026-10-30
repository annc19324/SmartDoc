import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { systemApi } from '../../services/api';
import { GraduationCap, Plus, BookOpen, Layers, Users, Sparkles } from 'lucide-react';

export const TeacherCoursesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['teacherCourses'],
    queryFn: () => systemApi.listCourses(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => systemApi.listCategories(),
  });

  const createCourseMutation = useMutation({
    mutationFn: () =>
      systemApi.createCourse({
        title,
        code,
        description,
        categoryId: categoryId || undefined,
      }),
    onSuccess: () => {
      setShowModal(false);
      setTitle('');
      setCode('');
      setDescription('');
      queryClient.invalidateQueries({ queryKey: ['teacherCourses'] });
    },
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-amber-500" />
            <span>Quản Lý Khóa Học & Lớp Giảng Dạy</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tạo khóa học, phân loại tài liệu học tập và theo dõi bài tập trắc nghiệm của sinh viên
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Khóa Học Mới</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-xs text-slate-400">Đang tải danh sách khóa học...</div>
      ) : courses.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Chưa có khóa học nào</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">Hãy tạo khóa học đầu tiên để liên kết các tài liệu và đề thi.</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-semibold"
          >
            Tạo khóa học
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 hover:border-amber-400 transition"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                  {course.code}
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-2 line-clamp-1">{course.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{course.description}</p>
                {course.category && (
                  <span className="inline-block mt-3 text-[10px] font-semibold text-slate-400">
                    🏷️ {course.category.name}
                  </span>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  {course._count?.documents || 0} tài liệu
                </span>
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  {course._count?.quizzes || 0} bài quiz
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Course */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tạo Khóa Học Mới</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xs">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tên khóa học <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Cấu trúc dữ liệu & Giải thuật nâng cao"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mã khóa học (Course Code) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Ví dụ: CS201-DSA"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mô tả khóa học
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Giới thiệu nội dung trọng tâm của khóa học..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Danh mục môn học
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => createCourseMutation.mutate()}
                disabled={!title || !code || createCourseMutation.isPending}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow"
              >
                {createCourseMutation.isPending ? 'Đang tạo...' : 'Lưu khóa học'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
