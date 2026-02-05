import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md border-4 border-black rounded-3xl shadow-retro relative animate-in zoom-in-95 duration-200">
        
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between p-4 border-b-4 border-black bg-brand-light rounded-t-[20px]">
          <h2 className="text-xl font-black uppercase">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 bg-brand-red text-white border-2 border-black rounded-lg hover:bg-red-600 transition-colors shadow-retro-sm active:translate-y-1 active:shadow-none"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>

      </div>
    </div>
  );
};