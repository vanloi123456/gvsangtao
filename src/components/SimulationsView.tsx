import React, { useState, useMemo } from 'react';
import { ScienceExperiment, PRIMARY_SUBJECTS, PRIMARY_GRADES } from '../types';
import { Search, FlaskConical, Play, Plus, Sparkles, GraduationCap, BookOpen, X, ExternalLink, Pencil, Trash2 } from 'lucide-react';

interface SimulationsViewProps {
  simulations: ScienceExperiment[];
  onExploreSimulation: (sim: ScienceExperiment) => void;
  onOpenAddModal: () => void;
  onEditSimulation: (sim: ScienceExperiment) => void;
  onDeleteSimulation: (simId: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const SimulationsView: React.FC<SimulationsViewProps> = ({
  simulations,
  onExploreSimulation,
  onOpenAddModal,
  onEditSimulation,
  onDeleteSimulation,
  searchQuery,
  onSearchChange
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');

  const subjectOptions = [
    { id: 'all', label: 'Tất cả môn học' },
    ...PRIMARY_SUBJECTS
  ];

  const gradeOptions = [
    { id: 'all', label: 'Tất cả các lớp' },
    ...PRIMARY_GRADES
  ];

  const filteredSimulations = useMemo(() => {
    return simulations.filter(sim => {
      // Subject filter
      if (selectedSubject !== 'all') {
        const simSub = sim.subject?.toLowerCase() || '';
        // Backwards compatibility with initial 'science' identifier for Khoa học
        const isMatch =
          simSub === selectedSubject ||
          (selectedSubject === 'khoa_hoc' && (simSub === 'science' || sim.subjectLabel?.toLowerCase().includes('khoa học'))) ||
          (selectedSubject === 'tu_nhien_xa_hoi' && (simSub === 'nature_society' || sim.subjectLabel?.toLowerCase().includes('tự nhiên')));
        if (!isMatch) return false;
      }

      // Grade filter
      if (selectedGrade !== 'all') {
        const simGrade = sim.grade || '';
        const gradeNumber = selectedGrade.replace('grade_', '');
        const isGradeMatch =
          simGrade === selectedGrade ||
          simGrade === 'all' ||
          simGrade.toLowerCase().includes('toàn cấp') ||
          simGrade.includes(gradeNumber);
        if (!isGradeMatch) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = sim.title.toLowerCase().includes(q);
        const matchDesc = sim.description.toLowerCase().includes(q);
        const matchSubject = sim.subjectLabel?.toLowerCase().includes(q) || false;
        const matchGoals = Array.isArray(sim.learningGoals)
          ? sim.learningGoals.some(g => g.toLowerCase().includes(q))
          : false;
        if (!matchTitle && !matchDesc && !matchSubject && !matchGoals) return false;
      }

      return true;
    });
  }, [simulations, selectedSubject, selectedGrade, searchQuery]);

  const handleDeleteConfirm = (sim: ScienceExperiment) => {
    if (window.confirm(`Thầy cô có chắc chắn muốn xóa mô phỏng "${sim.title}" khỏi cơ sở dữ liệu Firebase không?`)) {
      onDeleteSimulation(sim.id);
    }
  };

  const getDisplayGrade = (sim: ScienceExperiment) => {
    if (sim.gradeLabel) return sim.gradeLabel;
    if (sim.grade === 'all') return 'Toàn cấp Tiểu học';
    if (sim.grade.startsWith('grade_')) return `Lớp ${sim.grade.replace('grade_', '')}`;
    return sim.grade || 'Tiểu học';
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page Title & Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Phòng thí nghiệm mô phỏng Tiểu học (Đồng bộ Firestore)
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
            THÍ NGHIỆM MÔ PHỎNG
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Khám phá các thí nghiệm và mô hình mô phỏng trực quan, hỗ trợ giáo viên tổ chức hoạt động khám phá khoa học.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition-all hover:scale-102"
        >
          <Plus className="h-4 w-4" />
          <span>Bổ sung mô phỏng</span>
        </button>
      </div>

      {/* Filter and Search Bar: Môn học & Khối lớp cấp Tiểu học */}
      <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-2xs space-y-3.5">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm mô phỏng theo tên bài, môn học, kỹ năng khám phá..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-hidden transition-all"
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

        {/* 1. Môn học cấp Tiểu học Filter */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
            <span>Môn học cấp Tiểu học:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {subjectOptions.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSubject(s.id)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                  selectedSubject === s.id
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Khối lớp cấp Tiểu học Filter */}
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <GraduationCap className="h-3.5 w-3.5 text-sky-600" />
            <span>Khối lớp cấp Tiểu học:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {gradeOptions.map(g => (
              <button
                key={g.id}
                onClick={() => setSelectedGrade(g.id)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  selectedGrade === g.id
                    ? 'bg-sky-700 text-white font-bold'
                    : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Simulations Grid */}
      {filteredSimulations.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
          {filteredSimulations.map(sim => (
            <div
              key={sim.id}
              className="group flex flex-col justify-between rounded-2xl border border-sky-100 bg-white p-5 shadow-2xs transition-all duration-300 hover:border-emerald-400 hover:shadow-lg"
            >
              <div>
                {/* Header with Title and Edit/Delete */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {sim.imageUrl ? (
                      <img
                        src={sim.imageUrl}
                        alt={sim.title}
                        className="h-12 w-12 shrink-0 rounded-xl object-cover border border-slate-200 shadow-sm"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-bold shadow-sm">
                        <FlaskConical className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors leading-tight">
                        {sim.title}
                      </h3>
                      {/* Subject and Grade Badges */}
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/60">
                          {sim.subjectLabel || 'Khoa học'}
                        </span>
                        <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700 border border-sky-200/60">
                          {getDisplayGrade(sim)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Edit / Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditSimulation(sim)}
                      title="Chỉnh sửa mô phỏng"
                      className="rounded-md p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteConfirm(sim)}
                      title="Xóa mô phỏng"
                      className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                  {sim.description}
                </p>

                {/* Learning Goals */}
                {Array.isArray(sim.learningGoals) && sim.learningGoals.length > 0 && (
                  <div className="mt-4 rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <div className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-emerald-500" />
                      <span>Mục tiêu bài học khám phá:</span>
                    </div>
                    <ul className="space-y-1 text-[11px] text-slate-600">
                      {sim.learningGoals.map((goal, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 mt-0.5">•</span>
                          <span>{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Button: KHÁM PHÁ */}
              <div className="mt-5 pt-3.5 border-t border-slate-100">
                <button
                  onClick={() => onExploreSimulation(sim)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 transition-all hover:scale-102"
                >
                  <Play className="h-4 w-4 fill-white" />
                  <span>KHÁM PHÁ</span>
                  {sim.simMode === 'external' && <ExternalLink className="h-3 w-3 opacity-80" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-sky-200 bg-white p-12 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <FlaskConical className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Không tìm thấy mô phỏng phù hợp</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Hãy thử chọn môn học hoặc khối lớp khác, hoặc bổ sung mô phỏng mới vào kho học liệu số.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button
              onClick={() => {
                setSelectedSubject('all');
                setSelectedGrade('all');
                onSearchChange('');
              }}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Xóa bộ lọc
            </button>
            <button
              onClick={onOpenAddModal}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
            >
              Thêm mô phỏng mới
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
