import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div
      role="status"
      onClick={onClose}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#0d654c] text-white text-[12.5px] font-semibold rounded-xl shadow-xl shadow-[#08351b]/25 cursor-pointer animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      <CheckCircle2 size={18} className="text-[#64e3b7] shrink-0" />
      <span>{message}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="ml-2 text-white/70 hover:text-white p-0.5"
        aria-label="Fechar notificação"
      >
        <X size={14} />
      </button>
    </div>
  );
};
