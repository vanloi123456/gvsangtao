import React from 'react';

interface FooterProps {
  isSidebarCollapsed?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ isSidebarCollapsed = false }) => {
  return (
    <footer
      className={`fixed bottom-0 right-0 z-20 border-t border-sky-200/80 bg-white/95 backdrop-blur-md px-6 py-2.5 text-slate-600 shadow-md transition-all duration-300 ${
        isSidebarCollapsed ? 'left-0 md:left-20' : 'left-0 md:left-64'
      }`}
    >
      <div className="mx-auto flex flex-col items-center justify-between gap-1 text-[11px] sm:text-xs md:flex-row md:gap-6">
        {/* Bên trái */}
        <div className="text-center font-bold text-sky-900 md:text-left">
          Kho Học liệu số Giáo viên sáng tạo
        </div>

        {/* Bên phải */}
        <div className="text-center text-slate-500 md:text-right">
          Thiết kế bởi Đào Văn Lợi - Trường TH&THCS Tân Khánh Trung, tỉnh Đồng Tháp.
        </div>
      </div>
    </footer>
  );
};
