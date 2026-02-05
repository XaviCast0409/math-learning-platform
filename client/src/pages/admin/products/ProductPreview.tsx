import { ShoppingBag } from 'lucide-react';
import type { Product } from '../../../types/admin.types';

interface Props {
  product: Product;
}

export const ProductPreview = ({ product }: Props) => {
  const { image_url, type, effect_metadata } = product;

  // Si no hay imagen, mostramos placeholder
  if (!image_url) {
    return (
      <div className="h-32 bg-gray-50 flex items-center justify-center text-gray-300">
        <ShoppingBag size={40} />
      </div>
    );
  }

  // A. LÓGICA PARA SPRITE SHEET (Animación CSS)
  // Verificamos si es avatar y si el metadata dice que es 'sprite'
  if (type === 'cosmetic_avatar' && effect_metadata?.sprite_type === 'sprite') {
    const fw = effect_metadata.frame_width || 64;
    const fh = effect_metadata.frame_height || 64;
    const frames = effect_metadata.total_frames || 4;
    
    // Calculamos el desplazamiento final para la animación
    const finalPos = -1 * fw * frames;
    const uniqueAnimId = `anim-${product.id}`; // ID único para keyframes

    return (
      <div className="h-32 bg-gray-50 flex items-center justify-center overflow-hidden relative group-hover:bg-purple-50 transition-colors">
        <div 
          style={{
            width: fw,
            height: fh,
            backgroundImage: `url(${image_url})`,
            backgroundRepeat: 'no-repeat',
            // backgroundPosition se anima vía CSS
            imageRendering: 'pixelated',
            animation: `${uniqueAnimId} 1s steps(${frames}) infinite`
          }}
          className="transform scale-125" // Hacemos zoom para verlo mejor
        />
        {/* Inyectamos estilos locales dinámicos */}
        <style>{`
          @keyframes ${uniqueAnimId} {
            from { background-position-x: 0px; }
            to { background-position-x: ${finalPos}px; }
          }
        `}</style>
      </div>
    );
  }

  // B. LÓGICA PARA GIF O IMAGEN ESTÁTICA
  // Si es 'gif' o cualquier otro producto normal, usamos <img>
  return (
    <div className="h-32 bg-gray-50 flex items-center justify-center p-2 group-hover:bg-purple-50 transition-colors">
      <img 
        src={image_url} 
        alt={product.name} 
        className={`object-contain max-h-full ${type === 'cosmetic_avatar' ? 'pixelated scale-125' : ''}`}
        onError={(e) => (e.currentTarget.src = 'https://placehold.co/100?text=Error')} 
      />
    </div>
  );
};