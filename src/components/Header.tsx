import React from 'react';
import { Menu, Plus, Search, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { NavTab } from '../types';
import { User } from 'firebase/auth';

interface HeaderProps {
  currentTab: NavTab;
  currentUser: User | null;
  onOpenMobileMenu: () => void;
  onOpenAddModal: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  currentUser,
  onOpenMobileMenu,
  onOpenAddModal,
  onSignIn,
  onSignOut,
  searchQuery,
  onSearchChange
}) => {
  const getTabTitle = () => {
    switch (currentTab) {
      case 'apps':
        return 'Kho Ứng Dụng Giảng Dạy';
      case 'games':
        return 'Trò Chơi Tương Tác Lớp Học';
      case 'simulations':
        return 'Thí Nghiệm Mô Phỏng Khoa Học';
      case 'home':
      default:
        return 'Không Gian Học Liệu Số';
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 md:px-8 backdrop-blur-md">
      {/* Left: Mobile trigger & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 md:hidden"
          aria-label="Mở menu điều hướng"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider hidden sm:inline">
            Học liệu số Tiểu học
          </span>
          <h2 className="text-sm md:text-base font-bold text-slate-900 leading-none">
            {getTabTitle()}
          </h2>
        </div>
      </div>

      {/* Center/Right: Quick Search & Add Resource Button & Firebase Auth */}
      <div className="flex items-center gap-3">
        {/* Search input */}
        <div className="relative hidden lg:block w-52 xl:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Tìm học liệu, bài học..."
            className="w-full rounded-full border border-slate-200 bg-slate-50/80 pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-hidden transition-all"
          />
        </div>

        {/* Add Resource Primary Action */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all hover:scale-102"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Thêm Học Liệu</span>
          <span className="sm:hidden">Thêm</span>
        </button>

        {/* Firebase Authentication Button / Profile */}
        {currentUser ? (
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName || 'Giáo viên'}
                className="h-8 w-8 rounded-full border border-slate-200 object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                {currentUser.displayName ? currentUser.displayName.charAt(0) : 'GV'}
              </div>
            )}
            <div className="hidden xl:block text-left">
              <div className="truncate max-w-[120px] text-xs font-bold text-slate-800">
                {currentUser.displayName || 'Giáo viên'}
              </div>
              <div className="text-[10px] text-slate-400">Đã đăng nhập</div>
            </div>
            <button
              onClick={onSignOut}
              title="Đăng xuất khỏi tài khoản"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="border-l border-slate-200 pl-3">
            <button
              onClick={onSignIn}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <LogIn className="h-3.5 w-3.5 text-blue-600" />
              <span className="hidden sm:inline">Đăng nhập Google</span>
              <span className="sm:hidden">Đăng nhập</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
