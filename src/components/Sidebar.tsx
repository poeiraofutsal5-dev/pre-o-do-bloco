import React from 'react';
import { SectionId } from '../types';
import {
  Layers,
  Wallet,
  LayoutGrid,
  Sliders,
  Factory,
  BarChart3,
  CheckCircle2,
  RotateCcw,
  X,
} from 'lucide-react';
import { RichButton } from '@/registry/spell-ui/rich-button';

interface SidebarProps {
  currentSection: SectionId;
  onNavigate: (section: SectionId) => void;
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
}

const navItems: { id: SectionId; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
  { id: 'inicio', label: 'Simulador de venda', icon: Wallet },
  { id: 'produtos', label: 'Controle de custos', icon: LayoutGrid },
  { id: 'materiais', label: 'Materiais e custos', icon: Sliders },
  { id: 'producao', label: 'Simular produção', icon: Factory },
  { id: 'comparativo', label: 'Comparativo', icon: BarChart3 },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onNavigate,
  isOpen,
  onClose,
  onReset,
}) => {
  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Fechar menu"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onClose();
          }}
          className="fixed inset-0 z-40 bg-[#1a352a]/40 backdrop-blur-[2px] lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        id="sidebar"
        className={`fixed left-0 top-0 bottom-0 w-[265px] bg-white border-r border-[#e5ece8] p-6 flex flex-col z-50 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0 shadow-2xl lg:shadow-none' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between pb-7 mb-2 border-b border-[#f0f4f1]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0c755a] text-white flex items-center justify-center shadow-md shadow-[#0c755a]/20">
              <Layers size={22} className="stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[19px] tracking-tight text-[#152b2b] leading-tight">
                BlocoCerto
              </span>
              <span className="text-[9px] font-bold tracking-[1.4px] text-[#8b9993] uppercase">
                Gestão de Produção
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-[#688277] hover:bg-[#f2f6f3]"
            aria-label="Fechar menu lateral"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu Section */}
        <div className="text-[10px] font-extrabold tracking-[1.4px] text-[#94a29b] uppercase px-3 py-2">
          Menu Principal
        </div>

        <nav className="flex flex-col gap-1.5 mt-1" aria-label="Navegação Principal">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-[13px] font-semibold transition-all duration-150 text-left ${
                  isActive
                    ? 'bg-[#eaf6f0] text-[#096a4f] shadow-xs'
                    : 'text-[#5b6d67] hover:bg-[#f4f7f5] hover:text-[#174537]'
                }`}
              >
                <Icon
                  size={19}
                  className={isActive ? 'text-[#067455]' : 'text-[#7c9288]'}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto pt-4 flex flex-col gap-3">
          <div className="bg-[#f5f9f7] border border-[#e8f0eb] rounded-xl p-3.5 flex items-center gap-2.5 text-[#607b6d] text-[11px] leading-snug">
            <CheckCircle2 size={16} className="text-[#18835e] shrink-0" />
            <span>Salvamento automático neste navegador</span>
          </div>

          <RichButton
            size="sm"
            color="zinc"
            onClick={onReset}
            className="w-full text-xs font-medium justify-center rounded-lg mt-1"
          >
            <RotateCcw size={15} />
            <span>Restaurar padrões</span>
          </RichButton>
        </div>
      </aside>
    </>
  );
};
