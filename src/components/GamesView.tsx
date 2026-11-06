import React, { useState, useMemo } from 'react';
import { InteractiveGame, PRIMARY_SUBJECTS, PRIMARY_GRADES } from '../types';
import { Search, Gamepad2, Play, Plus, Filter, Sparkles, X, ExternalLink, Pencil, Trash2 } from 'lucide-react';

interface GamesViewProps {
  games: InteractiveGame[];
  onPlayGame: (game: InteractiveGame) => void;
  onOpenAddModal: () => void;
  onEditGame: (game: InteractiveGame) => void;
  onDeleteGame: (gameId: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const GamesView: React.FC<GamesViewProps> = ({
  games,
  onPlayGame,
  onOpenAddModal,
  onEditGame,
  onDeleteGame,
  searchQuery,
  onSearchChange
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const subjects = [
    { id: 'all', label: 'Tất cả môn học' },
    ...PRIMARY_SUBJECTS
  ];

  const filteredGames = useMemo(() => {
    return games.filter(game => {
      // Subject filter
      if (selectedSubject !== 'all' && game.subject !== selectedSubject) return false;

      // Grade filter
      if (selectedGrade !== 'all' && game.grade !== 'all' && game.grade !== selectedGrade) return false;

      // Type filter
      if (selectedType !== 'all' && game.gameType !== selectedType) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = game.title.toLowerCase().includes(q);
        const matchDesc = game.description.toLowerCase().includes(q);
        const matchSubject = game.subjectLabel.toLowerCase().includes(q);
        const matchSkills = game.targetSkills.some(s => s.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchSubject && !matchSkills) return false;
      }

      return true;
    });
  }, [games, selectedSubject, selectedGrade, selectedType, searchQuery]);

  const handleDeleteConfirm = (game: InteractiveGame) => {
    if (window.confirm(`Thầy cô có chắc chắn muốn xóa trò chơi "${game.title}" khỏi cơ sở dữ liệu Firebase không?`)) {
      onDeleteGame(game.id);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page Title & Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Học mà chơi - Chơi mà học (Đồng bộ Firestore)
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
            TRÒ CHƠI TƯƠNG TÁC
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Khám phá các trò chơi học tập hấp dẫn, giúp học sinh tích cực tham gia và hứng thú trong các hoạt động học tập.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:bg-amber-400 transition-all hover:scale-102"
        >
          <Plus className="h-4 w-4" />
          <span>Bổ sung trò chơi</span>
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Tìm trò chơi theo tên, môn học, kỹ năng (Vòng quay, Tính nhẩm, Từ vựng)..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-amber-500 focus:bg-white focus:outline-hidden transition-all"
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

        {/* Subject Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {subjects.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedSubject(s.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedSubject === s.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Secondary filters: Grade and Game Type */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Grade pills */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> Khối lớp:
            </span>
            <div className="flex flex-wrap gap-1">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'grade_1', label: 'Lớp 1' },
                { id: 'grade_2', label: 'Lớp 2' },
                { id: 'grade_3', label: 'Lớp 3' },
                { id: 'grade_4', label: 'Lớp 4' },
                { id: 'grade_5', label: 'Lớp 5' }
              ].map(g => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGrade(g.id)}
                  className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors ${
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

          {/* Game Type Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Dạng trò chơi:</span>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 focus:outline-hidden"
            >
              <option value="all">Tất cả định dạng</option>
              <option value="wheel">Vòng quay may mắn</option>
              <option value="quiz">Trắc nghiệm tính giờ</option>
              <option value="matching">Ghép thẻ thông thái</option>
              <option value="external">Minigame tương tác</option>
            </select>
          </div>
        </div>
      </div>

      {/* Games Cards Grid */}
      {filteredGames.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGames.map(game => (
            <div
              key={game.id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-all duration-300 hover:border-amber-400 hover:shadow-lg"
            >
              <div>
                {/* Header Badge with Edit/Delete */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {game.imageUrl ? (
                      <img
                        src={game.imageUrl}
                        alt={game.title}
                        className="h-12 w-12 shrink-0 rounded-xl object-cover border border-slate-200 shadow-sm"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 font-bold shadow-sm">
                        <Gamepad2 className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors leading-tight">
                        {game.title}
                      </h3>
                      <div className="mt-0.5 text-[11px] text-amber-700 font-semibold">
                        {game.gameTypeLabel}
                      </div>
                    </div>
                  </div>

                  {/* Actions Edit / Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditGame(game)}
                      title="Chỉnh sửa trò chơi"
                      className="rounded-md p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteConfirm(game)}
                      title="Xóa trò chơi"
                      className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Unboxed Metadata */}
                <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                  <span className="text-blue-600 font-semibold">{game.subjectLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>{game.gradeLabel}</span>
                </div>

                {/* Description */}
                <p className="mt-2.5 text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {game.description}
                </p>

                {/* Target Skills */}
                <div className="mt-3.5 flex flex-wrap gap-1.5 text-[11px]">
                  {game.targetSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-slate-500 text-[11px] flex items-center gap-1"
                    >
                      <Sparkles className="h-2.5 w-2.5 text-amber-500" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button: CHƠI NGAY */}
              <div className="mt-5 pt-3.5 border-t border-slate-100">
                <button
                  onClick={() => onPlayGame(game)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-orange-600 transition-all hover:scale-102"
                >
                  <Play className="h-4 w-4 fill-white" />
                  <span>CHƠI NGAY</span>
                  {game.playMode === 'external' && <ExternalLink className="h-3 w-3 opacity-80" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <Gamepad2 className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Không tìm thấy trò chơi phù hợp</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Hãy thử đổi môn học, khối lớp hoặc thêm trò chơi mới vào hệ thống.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button
              onClick={() => {
                setSelectedSubject('all');
                setSelectedGrade('all');
                setSelectedType('all');
                onSearchChange('');
              }}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Xóa bộ lọc
            </button>
            <button
              onClick={onOpenAddModal}
              className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
            >
              Thêm trò chơi mới
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
