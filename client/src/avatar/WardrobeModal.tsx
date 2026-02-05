import { X, Check, Loader2, Shirt } from 'lucide-react';
import { Button } from '../components/common/Button';
import type { AvatarConfig } from '../types/avatar.types';
// 👇 Importamos el componente visual para que se muevan también en la lista
import { AvatarSprite } from './AvatarSprite'; 

interface Props {
  isOpen: boolean;
  onClose: () => void;
  avatars: AvatarConfig[];
  selectedAvatar: AvatarConfig;
  onSelect: (avatar: AvatarConfig) => void;
  isLoading?: boolean; // Nuevo prop para manejar la espera
}

export const WardrobeModal = ({ 
  isOpen, 
  onClose, 
  avatars, 
  selectedAvatar, 
  onSelect, 
  isLoading = false 
}: Props) => {
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in duration-200 p-4 sm:p-0">
      <div 
        className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl border-t-4 sm:border-4 border-black p-6 shadow-2xl animate-in slide-in-from-bottom-10 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Modal */}
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Shirt className="text-brand-blue" size={24} />
            <h3 className="text-xl font-black italic">TU ARMARIO</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 border-2 border-transparent hover:border-black transition-all"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Cuerpo del Modal (Scrollable) */}
        <div className="flex-1 overflow-y-auto mb-4 min-h-[150px]">
          
          {/* CASO 1: CARGANDO */}
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3 py-10">
              <Loader2 className="animate-spin text-brand-blue" size={32} />
              <p className="text-xs font-bold uppercase tracking-widest">Buscando ropa...</p>
            </div>
          ) : avatars.length === 0 ? (
            
            /* CASO 2: VACÍO */
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2 py-10 text-center">
              <Shirt size={40} strokeWidth={1} />
              <p className="text-sm font-bold">¡Tu armario está vacío!</p>
              <p className="text-xs">Visita la tienda para conseguir skins.</p>
            </div>

          ) : (

            /* CASO 3: LISTA DE AVATARES */
            <div className="grid grid-cols-3 gap-3 pb-2">
              {avatars.map((avatar) => {
                const isSelected = selectedAvatar.id === avatar.id;
                
                return (
                  <button 
                    key={avatar.id}
                    onClick={() => onSelect(avatar)}
                    className={`
                      p-2 rounded-xl border-2 transition-all flex flex-col items-center gap-2 relative group
                      ${isSelected 
                        ? 'border-brand-blue bg-blue-50 shadow-retro-sm transform scale-[1.02]' 
                        : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                      }
                    `}
                  >
                    {/* Contenedor de la imagen (Usamos AvatarSprite para que se mueva) */}
                    <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
                       <AvatarSprite config={avatar} scale={0.8} /> 
                    </div>

                    <span className="text-[10px] font-bold text-center leading-tight truncate w-full text-gray-700">
                      {avatar.name}
                    </span>
                    
                    {/* Badge de seleccionado */}
                    {isSelected && (
                      <div className="absolute top-1 right-1 bg-brand-blue text-white rounded-full p-0.5 shadow-sm animate-in zoom-in">
                        <Check size={10} strokeWidth={4} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Footer (Botón Fijo) */}
        <div className="flex-shrink-0 pt-2 border-t border-gray-100">
          <Button className="w-full" onClick={onClose} variant="primary">
            LISTO
          </Button>
        </div>

      </div>
    </div>
  );
};