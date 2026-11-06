import React, { useState } from 'react';
import { NavTab, EducationalApp, InteractiveGame, ScienceExperiment } from '../types';
import { ArrowRight, LayoutGrid, Gamepad2, FlaskConical, Sparkles, Play, Plus } from 'lucide-react';

interface HomeViewProps {
  onSelectTab: (tab: NavTab) => void;
  featuredApps: EducationalApp[];
  featuredGames: InteractiveGame[];
  featuredSimulations: ScienceExperiment[];
  onPlayGame: (game: InteractiveGame) => void;
  onExploreSimulation: (sim: ScienceExperiment) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectTab,
  featuredApps,
  featuredGames,
  featuredSimulations,
  onPlayGame,
  onExploreSimulation
}) => {
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [appImgFailed, setAppImgFailed] = useState(false);
  const [gameImgFailed, setGameImgFailed] = useState(false);
  const [simImgFailed, setSimImgFailed] = useState(false);

  const waterCycleSim = featuredSimulations.find(s => s.id === 'exp-water-cycle') || featuredSimulations[0];

  return (
    <div className="space-y-10 pb-8">
      {/* Hero Welcome Banner (Fresh Light Blue Theme) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-50/70 p-6 md:p-10 shadow-sm border border-sky-200/80">
        <div className="relative z-10 grid items-center gap-8 lg:grid-cols-12">
          {/* Exact Required Welcome & Title */}
          <div className="lg:col-span-7 space-y-4">
            <p className="text-sm md:text-base font-bold text-sky-700 tracking-wide">
              Chào mừng Quý thầy cô đến với Kho Học liệu số
            </p>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-sky-950 font-display drop-shadow-2xs">
              GIÁO VIÊN SÁNG TẠO
            </h1>

            {/* Quick overview metrics strip in fresh light tones */}
            <div className="pt-3 flex flex-wrap items-center gap-6 text-xs text-sky-800">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-200/80 text-sky-900 font-bold border border-sky-300">
                  3
                </span>
                <span>Danh mục học liệu trọng tâm</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800 font-bold border border-amber-300">
                  100%
                </span>
                <span>Tương thích cấp Tiểu học</span>
              </div>
            </div>
          </div>

          {/* 3D Education Hero Visual */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-sky-200 shadow-xl bg-white">
              {!heroImgFailed ? (
                <img
                  src="/src/assets/images/hero_education_hub_1793976780755.jpg"
                  alt="Không gian học liệu số sáng tạo dành cho giáo viên Tiểu học"
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImgFailed(true)}
                  className="h-56 md:h-64 w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              ) : (
                <div className="flex h-56 md:h-64 w-full flex-col items-center justify-center bg-gradient-to-br from-sky-100 to-blue-100 p-6 text-center text-sky-900">
                  <Sparkles className="h-12 w-12 text-amber-500 mb-2" />
                  <span className="text-sm font-bold">Kho Học Liệu Số Tiểu Học</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3 Main Categories Section */}
      <section className="space-y-4">
        {/* 3 Cards: Horizontal on desktop, auto-stack vertically on mobile */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1: KHO ỨNG DỤNG */}
          <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-lg">
            <div>
              {/* Thumbnail Container: Only clean illustration */}
              <div className="relative h-48 w-full overflow-hidden bg-sky-50">
                {!appImgFailed ? (
                  <img
                    src="/src/assets/images/card_apps_tools_1793976784275.jpg"
                    alt="Kho ứng dụng và công cụ số giảng dạy"
                    referrerPolicy="no-referrer"
                    onError={() => setAppImgFailed(true)}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-sky-50 text-sky-600">
                    <LayoutGrid className="h-12 w-12 mb-2" />
                    <span className="text-xs font-semibold">Công nghệ giảng dạy</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                  KHO ỨNG DỤNG
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-3">
                  Tổng hợp các ứng dụng và công cụ số hỗ trợ giáo viên trong giảng dạy, thiết kế bài học và tổ chức hoạt động giáo dục.
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="p-5 pt-0">
              <button
                onClick={() => onSelectTab('apps')}
                className="group/btn flex w-full items-center justify-center gap-2 rounded-xl bg-sky-50 py-3 text-xs font-bold text-sky-700 transition-all hover:bg-sky-600 hover:text-white"
              >
                <span>KHÁM PHÁ NGAY</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Card 2: TRÒ CHƠI TƯƠNG TÁC */}
          <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg">
            <div>
              {/* Thumbnail Container: Only clean illustration */}
              <div className="relative h-48 w-full overflow-hidden bg-amber-50/50">
                {!gameImgFailed ? (
                  <img
                    src="/src/assets/images/card_games_interactive_1793976783538.jpg"
                    alt="Trò chơi học tập tương tác tiểu học"
                    referrerPolicy="no-referrer"
                    onError={() => setGameImgFailed(true)}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-amber-50 text-amber-600">
                    <Gamepad2 className="h-12 w-12 mb-2" />
                    <span className="text-xs font-semibold">Trò chơi tương tác</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                  TRÒ CHƠI TƯƠNG TÁC
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-3">
                  Khám phá các trò chơi học tập hấp dẫn, giúp học sinh tích cực tham gia và hứng thú trong các hoạt động học tập.
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="p-5 pt-0">
              <button
                onClick={() => onSelectTab('games')}
                className="group/btn flex w-full items-center justify-center gap-2 rounded-xl bg-amber-50 py-3 text-xs font-bold text-amber-800 transition-all hover:bg-amber-500 hover:text-white"
              >
                <span>KHÁM PHÁ NGAY</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Card 3: THÍ NGHIỆM MÔ PHỎNG */}
          <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg">
            <div>
              {/* Thumbnail Container: Only clean illustration */}
              <div className="relative h-48 w-full overflow-hidden bg-emerald-50/50">
                {!simImgFailed ? (
                  <img
                    src="/src/assets/images/card_science_simulations_1793976783271.jpg"
                    alt="Thí nghiệm mô phỏng trực quan 3D"
                    referrerPolicy="no-referrer"
                    onError={() => setSimImgFailed(true)}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-emerald-50 text-emerald-600">
                    <FlaskConical className="h-12 w-12 mb-2" />
                    <span className="text-xs font-semibold">Khoa học mô phỏng</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  THÍ NGHIỆM MÔ PHỎNG
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-3">
                  Khám phá các thí nghiệm và mô hình mô phỏng trực quan, hỗ trợ giáo viên tổ chức hoạt động khám phá khoa học.
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="p-5 pt-0">
              <button
                onClick={() => onSelectTab('simulations')}
                className="group/btn flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 py-3 text-xs font-bold text-emerald-800 transition-all hover:bg-emerald-600 hover:text-white"
              >
                <span>KHÁM PHÁ NGAY</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Launchpad Highlights (Fresh Blue Styling) */}
      <section className="rounded-2xl border border-sky-200/80 bg-white p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-sky-950">
              Lối Tắt Khám Phá & Bổ Sung Học Liệu
            </h3>
            <p className="text-xs text-slate-500">
              Khởi động thí nghiệm Vòng tuần hoàn nước hoặc bắt đầu đóng góp học liệu mới
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {/* Quick Item 1: Vòng Tuần Hoàn Nước (Preserved) */}
          {waterCycleSim && (
            <div
              onClick={() => onExploreSimulation(waterCycleSim)}
              className="flex cursor-pointer items-center justify-between rounded-xl border border-sky-100 bg-sky-50/70 p-3.5 transition-all hover:border-sky-300 hover:bg-sky-100/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white shadow-xs">
                  <FlaskConical className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-sky-950">Vòng Tuần Hoàn Nước</div>
                  <div className="text-[11px] text-sky-700">Mô phỏng tương tác Khoa học</div>
                </div>
              </div>
              <Play className="h-4 w-4 text-sky-600" />
            </div>
          )}

          {/* Quick Item 2: Thêm ứng dụng mới */}
          <div
            onClick={() => onSelectTab('apps')}
            className="flex cursor-pointer items-center justify-between rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 transition-all hover:border-blue-300 hover:bg-blue-100/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
                <LayoutGrid className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Kho Ứng Dụng</div>
                <div className="text-[11px] text-slate-500">Bổ sung công cụ giảng dạy</div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-blue-600" />
          </div>

          {/* Quick Item 3: Thêm trò chơi mới */}
          <div
            onClick={() => onSelectTab('games')}
            className="flex cursor-pointer items-center justify-between rounded-xl border border-amber-100 bg-amber-50/50 p-3.5 transition-all hover:border-amber-300 hover:bg-amber-100/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white shadow-xs">
                <Gamepad2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Trò Chơi Tương Tác</div>
                <div className="text-[11px] text-slate-500">Thêm trò chơi lớp học</div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-amber-600" />
          </div>
        </div>
      </section>
    </div>
  );
};
