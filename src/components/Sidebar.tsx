import React from 'react';
import { Home, LayoutGrid, Gamepad2, FlaskConical, ChevronLeft, ChevronRight, GraduationCap, X } from 'lucide-react';
import { NavTab } from '../types';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  counts: {
    apps: number;
    games: number;
    simulations: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  counts
}) => {
  const menuItems = [
    {
      id: 'home' as NavTab,
      label: 'Trang chủ',
      icon: Home,
      count: null,
      desc: 'Tổng quan & Lối tắt'
    },
    {
      id: 'apps' as NavTab,
      label: 'Kho ứng dụng',
      icon: LayoutGrid,
      count: counts.apps,
      desc: 'Công cụ số giảng dạy'
    },
    {
      id: 'games' as NavTab,
      label: 'Trò chơi tương tác',
      icon: Gamepad2,
      count: counts.games,
      desc: 'Minigame & Vòng quay'
    },
    {
      id: 'simulations' as NavTab,
      label: 'Thí nghiệm mô phỏng',
      icon: FlaskConical,
      count: counts.simulations,
      desc: 'Mô hình khoa học 3D'
    }
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between overflow-y-auto">
      {/* Top Brand Section */}
      <div>
        <div className={`flex items-center gap-3 border-b border-sky-400/30 px-4 py-5 transition-all ${isCollapsed ? 'justify-center px-2' : ''}`}>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-300 via-amber-400 to-orange-400 text-sky-950 shadow-md shadow-sky-900/20">
            <GraduationCap className="h-6 w-6 stroke-[2.2]" />
          </div>

          {!isCollapsed && (
            <div className="overflow-hidden">
              <span className="block text-sm font-extrabold tracking-wide text-white font-display">
                GIÁO VIÊN SÁNG TẠO
              </span>
              <span className="block text-[11px] font-medium text-sky-100">
                Kho Học Liệu Số Tiểu Học
              </span>
            </div>
          )}

          {/* Close button on mobile */}
          <button
            onClick={onCloseMobile}
            className="ml-auto rounded-lg p-1.5 text-sky-200 hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Đóng thanh điều hướng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="mt-5 space-y-1.5 px-3">
          <div className={`mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-sky-200/90 ${isCollapsed ? 'sr-only' : 'block'}`}>
            Danh mục học liệu
          </div>

          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`group relative flex w-full items-center gap-3.5 rounded-xl px-3.5 py-3 text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-white/20 text-white shadow-sm border border-white/20 font-bold backdrop-blur-xs'
                    : 'text-sky-100 hover:bg-white/10 hover:text-white font-medium'
                } ${isCollapsed ? 'justify-center px-2' : ''}`}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1.5 rounded-r-full bg-amber-300" />
                )}

                <div className={`flex h-6 w-6 shrink-0 items-center justify-center transition-transform group-hover:scale-110 ${isActive ? 'text-amber-300' : 'text-sky-200 group-hover:text-white'}`}>
                  <Icon className="h-5 w-5" />
                </div>

                {!isCollapsed && (
                  <div className="flex flex-1 items-center justify-between overflow-hidden">
                    <span className="truncate text-sm">{item.label}</span>
                    {item.count !== null && (
                      <span className={`rounded-full px-2 py-0.5 text-[11px] tabular-nums font-bold ${isActive ? 'bg-amber-400 text-sky-950' : 'bg-sky-800/80 text-sky-100 group-hover:bg-sky-700'}`}>
                        {item.count}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Teacher Profile & Collapse Toggle */}
      <div className="border-t border-sky-400/30 p-3">
        {!isCollapsed && (
          <div className="mb-3 rounded-xl bg-sky-900/40 p-3 border border-sky-400/30 backdrop-blur-xs">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white text-xs font-bold border border-white/30">
                ĐVL
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-bold text-white">Đào Văn Lợi</div>
                <div className="truncate text-[10px] text-sky-200">Trường TH&THCS Tân Khánh Trung</div>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className={`hidden w-full items-center gap-2 rounded-lg py-2 text-xs font-semibold text-sky-200 hover:bg-white/10 hover:text-white md:flex transition-colors ${
            isCollapsed ? 'justify-center' : 'px-3'
          }`}
          title={isCollapsed ? 'Mở rộng thanh menu' : 'Thu gọn thanh menu'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Thu gọn menu</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed) with fresh bright blue theme */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-30 hidden border-r border-sky-300/40 bg-gradient-to-b from-[#0284c7] via-[#0369a1] to-[#075985] text-white shadow-xl transition-all duration-300 md:block ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Sliding Menu) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-sky-950/60 backdrop-blur-xs transition-opacity"
          />
          {/* Drawer */}
          <aside className="fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] border-r border-sky-300/40 bg-gradient-to-b from-[#0284c7] via-[#0369a1] to-[#075985] text-white shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
