import { Eye, EyeOff, Trash2, Edit3 } from 'lucide-react';
import type { Product } from '../../../../types/admin.types';
import { ProductPreview } from './ProductPreview';

interface Props {
  product: Product;
  onEdit: (p: Product) => void;
  onDelete: (id: number) => void;
  onToggleActive: (p: Product) => void;
}

export const ProductCard = ({ product, onEdit, onDelete, onToggleActive }: Props) => {
  
  // Helpers para estilos de etiquetas
  const getBadgeStyle = (cat: string) => {
    switch(cat) {
      case 'instant': return 'bg-red-100 text-red-600';
      case 'inventory': return 'bg-blue-100 text-blue-600';
      case 'cosmetic': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className={`bg-white rounded-xl border-2 overflow-hidden shadow-sm hover:shadow-md transition-all group ${!product.active ? 'opacity-60 grayscale border-gray-200' : 'border-gray-100'}`}>
       
       {/* 1. VISUALIZADOR (Sprite, Gif o Img) */}
       <div className="relative">
          <ProductPreview product={product} />
          
          {/* Precio Flotante */}
          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm">
             💎 {product.cost_gems}
          </div>
       </div>

       {/* 2. INFORMACIÓN */}
       <div className="p-4">
          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${getBadgeStyle(product.category)}`}>
             {product.category}
          </span>
          
          <h3 className="font-bold text-gray-800 mt-1 mb-1 truncate">{product.name}</h3>
          <p className="text-xs text-gray-500 line-clamp-2 h-8 leading-tight">{product.description}</p>
          
          {/* Debug Metadata (Opcional, útil para admin) */}
          <div className="mt-2 text-[9px] font-mono text-gray-400 bg-gray-50 p-1 rounded truncate opacity-70">
             {product.type}
          </div>

          {/* 3. BOTONES DE ACCIÓN */}
          <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
             <button onClick={() => onEdit(product)} className="flex-1 py-1.5 bg-gray-100 hover:bg-purple-50 hover:text-purple-600 rounded text-xs font-bold transition-colors flex items-center justify-center gap-1">
               <Edit3 size={14} /> EDITAR
             </button>
             
             <button onClick={() => onToggleActive(product)} className="p-1.5 text-gray-400 hover:text-gray-800 rounded transition-colors" title={product.active ? "Ocultar" : "Mostrar"}>
               {product.active ? <Eye size={18}/> : <EyeOff size={18}/>}
             </button>
             
             <button onClick={() => onDelete(product.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors" title="Eliminar">
               <Trash2 size={18}/>
             </button>
          </div>
       </div>
    </div>
  );
};
