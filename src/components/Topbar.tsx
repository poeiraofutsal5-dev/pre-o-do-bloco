import React from 'react';
import { SectionId } from '../types';
import { Menu, ChevronRight, Layers } from 'lucide-react';

interface TopbarProps {
  currentSection: SectionId;
  sectionTitle: string;
  onOpenSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  sectionTitle,
  onOpenSidebar,
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 lg:h-[72px] bg-white/90 backdrop-blur-md border-b border-[#ebefed] px-4 sm:px-8 flex items-center justify-between transition-all">
      {/* Left side: Mobile menu toggle or desktop breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          aria-label="Abrir menu de navegação"
          className="lg:hidden p-2 -ml-2 rounded-lg text-[#3a5949] hover:bg-[#f0f4f2] transition-colors"
        >
          <Menu size={22} />
        </button>

        <div className="flex lg:hidden items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#0c755a] text-white flex items-center justify-center">
            <Layers size={16} />
          </div>
          <span className="font-extrabold text-[15px] text-[#152b2b]">
            BlocoCerto
          </span>
        </div>

        <nav
          aria-label="Breadcrumb"
          className="hidden lg:flex items-center gap-2 text-[11px] font-bold tracking-wider text-[#9ca9a3] uppercase"
        >
          <span>FÁBRICA DE BLOCOS</span>
          <ChevronRight size={14} className="text-[#b2bfb9]" />
          <strong className="text-[#3d594b] font-extrabold normal-case text-[12.5px] tracking-normal">
            {sectionTitle}
          </strong>
        </nav>
      </div>

      {/* Right side: Auto-save status */}
      <div className="flex items-center gap-2 text-[#719283] font-semibold text-[11px] sm:text-[12px]">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25a66d] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25a66d]"></span>
        </span>
        <span>Dados salvos</span>
      </div>
    </header>
  );
};
