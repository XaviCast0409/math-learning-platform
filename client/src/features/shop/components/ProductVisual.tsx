import { clsx } from 'clsx';
import type { Product } from '../../../types';

interface Props {
  product: Product;
  size?: 'sm' | 'md' | 'lg';
}

export const ProductVisual = ({ product, size = 'md' }: Props) => {
  const { image_url, type, effect_metadata } = product;

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-24 h-24',
  };

  const containerClass = clsx(
    sizeClasses[size],
    "rounded-xl flex items-center justify-center overflow-hidden relative shrink-0",
    image_url ? "bg-white border border-gray-100" : "bg-blue-50 border border-blue-100"
  );

  // CASO A: SPRITE SHEET ANIMADO (Corregido para TypeScript y Performance)
  if (type === 'cosmetic_avatar' && effect_metadata?.sprite_type === 'sprite') {
    const fw = effect_metadata.frame_width || 64;
    const fh = effect_metadata.frame_height || 64;
    const frames = effect_metadata.total_frames || 4;
    const animId = `sprite-${product.id}`;

    return (
      <div className={clsx(containerClass, "bg-purple-50 border-purple-100")}>
        {/* Usamos CSS nativo para evitar conflictos de tipos con Framer Motion en 'steps()' */}
        <style>
          {`
            @keyframes ${animId} {
              from { background-position-x: 0px; }
              to { background-position-x: -${fw * frames}px; }
            }
          `}
        </style>
        <div
          className={size === 'sm' ? '' : 'scale-125'}
          style={{
            width: fw,
            height: fh,
            backgroundImage: `url(${image_url})`,
            backgroundRepeat: 'no-repeat',
            imageRendering: 'pixelated',
            // Aplicamos la animación aquí directamente
            animation: `${animId} 1s steps(${frames}) infinite`
          }}
        />
      </div>
    );
  }

  // CASO B: IMAGEN ESTÁTICA
  if (image_url) {
    return (
      <div className={containerClass}>
        <img
          src={image_url}
          alt={product.name}
          className={clsx(
            "object-contain max-h-full",
            type === 'cosmetic_avatar' && "pixelated scale-125"
          )}
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
      </div>
    );
  }

  // CASO C: FALLBACK
  const getFallbackEmoji = () => {
    if (type.includes('life')) return '❤️';
    if (type.includes('shield')) return '🛡️';
    if (type.includes('xp')) return '⚡';
    if (type.includes('avatar')) return '👤';
    return '🎒';
  };

  return (
    <div className={containerClass}>
      <span className={size === 'sm' ? 'text-2xl' : 'text-4xl'}>
        {getFallbackEmoji()}
      </span>
    </div>
  );
};