import React, { useState, useMemo } from 'react';
import { EducationalApp } from '../types';
import { Search, ExternalLink, BookOpen, Plus, Filter, X, Pencil, Trash2 } from 'lucide-react';

interface AppsViewProps {
  apps: EducationalApp[];
  onOpenAddModal: () => void;
  onEditApp: (app: EducationalApp) => void;
  onDeleteApp: (appId: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const AppsView: React.FC<AppsViewProps> = ({
  apps,
  onOpenAddModal,
  onEditApp,
  onDeleteApp,
  searchQuery,
  onSearchChange
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [guideApp, setGuideApp] = useState<EducationalApp | null>(null);

  const categories = [
    { id: 'all', label: 'Tất cả ứng dụng' },
    { id: 'lesson_design', label: 'Soạn giảng & Trình chiếu' },
    { id: 'assessment', label: 'Kiểm tra & Đánh giá' },
    { id: 'classroom_mgmt', label: 'Quản lý lớp & Tương tác' },
    { id: 'stem_math', label: 'Toán & STEM số' },
    { id: 'ai_assistant', label: 'Trợ lý AI giáo viên' }
  ];

  const filteredApps = useMemo(() => {
    return apps.filter(app => {
      // Category filter
      if (selectedCategory !== 'all' && app.category !== selectedCategory) return false;

      // Grade filter
      if (selectedGrade !== 'all' && app.gradeLevel !== 'all' && app.gradeLevel !== selectedGrade) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = app.title.toLowerCase().includes(q);
        const matchDesc = app.description.toLowerCase().includes(q);
        const matchDev = app.developer.toLowerCase().includes(q);
        const matchTags = app.tags.some(t => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchDev && !matchTags) return false;
      }

      return true;
    });
  }, [apps, selectedCategory, selectedGrade, searchQuery]);

  const handleDeleteConfirm = (app: EducationalApp) => {
    if (window.confirm(`Thầy cô có chắc chắn muốn xóa ứng dụng "${app.title}" khỏi cơ sở dữ liệu Firebase không?`)) {
      onDeleteApp(app.id);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page Title & Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Học liệu công nghệ số (Đồng bộ Firestore)
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
            KHO ỨNG DỤNG
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Tổng hợp các ứng dụng và công cụ số hỗ trợ giáo viên trong giảng dạy, thiết kế bài học và tổ chức hoạt động giáo dục.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all hover:scale-102"
        >
          <Plus className="h-4 w-4" />
          <span>Bổ sung ứng dụng</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
        {/* Search input on mobile / tablet */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên ứng dụng, từ khóa (ví dụ: Canva, Quizizz, Toán, AI)..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-hidden transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grade Filter Pill */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Khối lớp:
          </span>
          <div className="flex gap-1.5">
            {[
              { id: 'all', label: 'Mọi khối lớp' },
              { id: 'grade_1_2', label: 'Khối 1 - 2' },
              { id: 'grade_3_5', label: 'Khối 3 - 5' }
            ].map(g => (
              <button
                key={g.id}
                onClick={() => setSelectedGrade(g.id)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  selectedGrade === g.id
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Apps Grid */}
      {filteredApps.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredApps.map(app => (
            <div
              key={app.id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-all duration-300 hover:border-blue-300 hover:shadow-lg"
            >
              <div>
                {/* Header card info with Edit/Delete */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {app.imageUrl ? (
                      <img
                        src={app.imageUrl}
                        alt={app.title}
                        className="h-12 w-12 shrink-0 rounded-xl object-cover border border-slate-200 shadow-sm"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-lg shadow-sm">
                        {app.title.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                        {app.title}
                      </h3>
                      <div className="mt-0.5 text-[11px] text-slate-400">
                        {app.developer}
                      </div>
                    </div>
                  </div>

                  {/* Edit and Delete Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditApp(app)}
                      title="Chỉnh sửa học liệu"
                      className="rounded-md p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteConfirm(app)}
                      title="Xóa học liệu"
                      className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Unboxed Metadata (Zero-Pill Discipline) */}
                <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                  <span className="text-blue-600 font-semibold">{app.categoryLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>{app.gradeLabel}</span>
                </div>

                {/* Description */}
                <p className="mt-2.5 text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {app.description}
                </p>

                {/* Key features */}
                <div className="mt-3.5 space-y-1 text-[11px] text-slate-500">
                  {app.features.slice(0, 2).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setGuideApp(app)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <BookOpen className="h-3.5 w-3.5 text-slate-500" />
                  <span>Cách áp dụng</span>
                </button>

                <a
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-all shadow-xs"
                >
                  <span>Truy cập</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Search className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Không tìm thấy ứng dụng phù hợp</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Hãy thử tìm kiếm với từ khóa khác hoặc bấm nút bên dưới để đóng góp thêm ứng dụng mới vào kho.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedGrade('all');
                onSearchChange('');
              }}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Xóa bộ lọc
            </button>
            <button
              onClick={onOpenAddModal}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
            >
              Thêm ứng dụng mới
            </button>
          </div>
        </div>
      )}

      {/* Guide & Application Modal */}
      {guideApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="relative max-w-lg w-full rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase">
                  Hướng dẫn sư phạm
                </span>
                <h3 className="text-lg font-bold text-slate-900">{guideApp.title}</h3>
              </div>
              <button
                onClick={() => setGuideApp(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600">
              <div className="rounded-xl bg-blue-50 p-3.5 border border-blue-100">
                <div className="font-bold text-blue-900 mb-1">Mẹo triển khai vào tiết dạy Tiểu học:</div>
                <p className="leading-relaxed">
                  {guideApp.guideTips || 'Sử dụng máy chiếu hoặc bảng tương tác để hướng dẫn các em học sinh tham gia học tập chủ động.'}
                </p>
              </div>

              <div>
                <div className="font-bold text-slate-800 mb-1">Tính năng nổi bật:</div>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  {guideApp.features.map((f, idx) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setGuideApp(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Đóng
              </button>
              <a
                href={guideApp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
              >
                <span>Mở trang ứng dụng</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
