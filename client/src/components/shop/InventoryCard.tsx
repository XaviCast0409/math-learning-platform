import { Check } from 'lucide-react';
import type { UserItem } from '../../types';
import { ProductVisual } from './ProductVisual';

interface Props {
  item: UserItem;
  onEquip: (item: UserItem) => void;
  onUse: (item: UserItem) => void;
  isProcessing?: boolean;
}

export const InventoryCard = ({ item, onEquip, onUse, isProcessing = false }: Props) => {
  const { Product: product, is_equipped, is_used } = item;
  
  // Usamos constantes para evitar strings mágicos repetidos
  const isCosmetic = product.category === 'cosmetic';
  const isConsumable = product.category === 'inventory';

  return (
    <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-colors hover:border-gray-200">
      
      {/* Visualizador tamaño pequeño (sm) */}
      <ProductVisual product={product} size="sm" />

      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-800 text-sm truncate">{product.name}</h3>
        <p className="text-[10px] text-gray-500 mb-2 truncate">{product.description}</p>
        
        <div className="flex items-center gap-2">
          
          {/* Lógica de botones */}
          {isCosmetic && (
            is_equipped ? (
              <span className="text-xs font-bold text-green-600 flex items-center bg-green-50 px-3 py-1 rounded-full border border-green-100 select-none">
                <Check size={12} className="mr-1" /> Equipado
              </span>
            ) : (
              <button 
                onClick={() => onEquip(item)}
                disabled={isProcessing}
                className="text-xs font-bold text-white bg-brand-blue hover:bg-blue-600 disabled:opacity-50 px-4 py-1.5 rounded-full shadow-sm transition-colors"
              >
                Equipar
              </button>
            )
          )}

          {isConsumable && !is_used && (
            <button 
              onClick={() => onUse(item)} 
              disabled={isProcessing}
              className="text-xs font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 disabled:opacity-50 px-4 py-1.5 rounded-full transition-colors border border-purple-200"
            >
               Usar
            </button>
          )}

        </div>
      </div>
    </div>
  );
};